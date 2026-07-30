from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
import models
from routes import auth, chat

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Pharma Intelligence Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Authentication"])
app.include_router(chat.router, tags=["Chat"])

@app.get("/")
def root():
    return {"message": "Welcome to the Pharma Intelligence API"}
