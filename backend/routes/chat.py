from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import get_db
from models import User, ChatHistory
from routes.auth import get_current_user
from services.langchain_service import process_query

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

class HistoryResponse(BaseModel):
    id: int
    message: str
    is_user: bool
    timestamp: str

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_query = request.message
    
    user_chat = ChatHistory(user_id=current_user.id, message=user_query, is_user=True)
    db.add(user_chat)
    db.commit()
    db.refresh(user_chat)

    try:
        response_text = process_query(user_query)
    except Exception as e:
        print(f"Error processing query: {e}")
        response_text = "Sorry, I encountered an error while processing your request."

    ai_chat = ChatHistory(user_id=current_user.id, message=response_text, is_user=False, parent_id=user_chat.id)
    db.add(ai_chat)
    db.commit()

    return {"response": response_text}

@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chats = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.timestamp.asc()).all()
    return [{"id": c.id, "message": c.message, "is_user": c.is_user, "timestamp": str(c.timestamp)} for c in chats]

@router.delete("/history/clear")
def clear_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).update({ChatHistory.parent_id: None})
        db.commit()
        
        db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete(synchronize_session=False)
        db.commit()
        return {"message": "History cleared"}
    except Exception as e:
        db.rollback()
        print(f"Error clearing history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        chat = db.query(ChatHistory).filter(ChatHistory.id == chat_id, ChatHistory.user_id == current_user.id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        if chat.is_user:
            db.query(ChatHistory).filter(ChatHistory.parent_id == chat.id).delete(synchronize_session=False)
        else:
            if chat.parent_id:
                db.query(ChatHistory).filter(ChatHistory.id == chat.parent_id).delete(synchronize_session=False)

        db.delete(chat)
        db.commit()
        return {"message": "Chat and its counterpart deleted"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
