# Laurus - Pharma Intelligence Agent

Laurus is a high-performance, AI-powered pharmaceutical intelligence agent designed to provide instant information on drug uses, side effects, and complex interactions.

## 🚀 Features

- **Drug Information**: Real-time data from OpenFDA.
- **Interaction Analysis**: Advanced analysis using Kaggle DDI datasets.
- **AI Summary**: Clean, professional summaries of medical data.
- **Secure History**: JWT-based authentication with personal query history.
- **Premium UI**: Modern, glassmorphic design with auto-scrolling and custom interaction modals.

## 🛠️ Tech Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite, LangChain, Google Gemini API.
- **Frontend**: React, Tailwind CSS, Lucide React, Framer Motion.

## 📦 Installation

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Configure your `.env` with `GEMINI_API_KEY`.
4. `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## ⚖️ Disclaimer
*Informational use only. Always consult a healthcare professional before making medical decisions.*
