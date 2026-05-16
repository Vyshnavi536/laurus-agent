from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
import models
from routes import auth, chat

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Pharma Intelligence Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Authentication"])
app.include_router(chat.router, tags=["Chat"])

@app.get("/")
def root():
    return {"message": "Welcome to the Pharma Intelligence API"}
