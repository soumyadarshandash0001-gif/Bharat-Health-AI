# 🥗 Bharat Health AI — Cognitive Indian Diet Coach
> AI-powered nutrition companion for Indian food. Track calories, get personalized meal plans, manage diabetes, and calculate **multi-food macros instantly** — all powered by a local RAG engine with 8,000+ Indian food entries.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/soumyadarshandash0001-gif/Bharat-Health-AI)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 📌 Repository Link
**⭐ Source Code on GitHub:** [https://github.com/soumyadarshandash0001-gif/Bharat-Health-AI](https://github.com/soumyadarshandash0001-gif/Bharat-Health-AI)
**🚀 Live Demo (Chatbot):** [https://soumyadarshandash0001-gif.github.io/Bharat-Health-AI/](https://soumyadarshandash0001-gif.github.io/Bharat-Health-AI/)

## 🏗️ Architecture

```
Frontend (React + Vite)  →  FastAPI Backend  →  FAISS RAG + Ollama LLM
     ↓                          ↓                      ↓
  Vercel/GH Pages         Railway/Render         Local/Cloud GPU
```

## 🚀 Quick Start

### Frontend Only (Works Immediately)
```bash
cd desical-web
npm install
npm run dev
```
> Frontend includes smart mock responses — no backend needed for demo!

### Full Stack (Backend + RAG)
```bash
# 1. Install Python deps
cd backend
pip install -r requirements.txt

# 2. Build FAISS index from CSV
python build_index.py

# 3. Start API server
uvicorn main:app --reload --port 8000

# 4. (Optional) Start Ollama for LLM
ollama run qwen2.5:7b
```

## 📁 Project Structure
```
Health_web/
├── backend/
│   ├── main.py              # FastAPI server (5 endpoints)
│   ├── rag.py               # FAISS retrieval engine
│   ├── llm.py               # Ollama LLM + fallback
│   ├── utils.py             # BMI, food search, meal plans
│   ├── build_index.py       # CSV → FAISS index builder
│   └── requirements.txt
├── desical-web/             # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main app with freemium logic
│   │   ├── components/
│   │   │   ├── Sidebar.jsx  # Navigation + language switcher
│   │   │   ├── ChatFeed.jsx # Messages + nutrition cards
│   │   │   └── ChatInput.jsx# Input + voice recognition
│   │   ├── utils/
│   │   │   ├── i18n.js      # 4 languages (EN/HI/TA/OR)
│   │   │   └── api.js       # Backend client + mock fallback
│   │   └── index.css        # Premium dark theme
│   └── .github/workflows/deploy.yml
├── data/
│   └── food_summary.json    # Generated food data for frontend
└── indian_food_dataset_final.csv  # 8,068 entries
```

## 🌍 Supported Languages
| Language | Code | Interface | AI Responses |
|----------|------|-----------|-------------|
| English  | en   | ✅        | ✅          |
| Hindi    | hi   | ✅        | ✅          |
| Tamil    | ta   | ✅        | ✅          |
| Odia     | or   | ✅        | ✅          |

## 📊 API Endpoints
| Method | Endpoint  | Description                    |
|--------|-----------|--------------------------------|
| POST   | /chat     | RAG-powered diet advice        |
| POST   | /search   | Search food database           |
| POST   | /bmi      | BMI calculator + advice        |
| POST   | /plan     | Generate daily meal plan       |
| GET    | /foods    | All food entries (autocomplete)|

## 🎤 Features
- **Multi-Food Macro Calculator**: Automatically parses mixed queries like *"calculate macros for 2 idli and 1 dosa"* and returns a perfect mathematical sum.
- **Symptom & Wellness Flow**: Detects 30+ symptoms (cold, fever, acidity) and provides home remedies.
- **State Food Searching**: Ask *"What do people eat in Odisha?"* to get regional suggestions graded by GI health ratings.
- **RAG Engine**: FAISS vector search over 8,068 Indian food entries.
- **Multi-language**: Full UI + AI responses in English, Hindi, Tamil, and Odia.
- **Voice Input**: Browser speech recognition built-in.

## 🚀 Elite Cognitive Upgrades (New!)
- **Dynamic Suggested Prompts**: Smart follow-up questions after every AI response for easier navigation.
- **Climate-Aware Recommendations**: Integrated **wttr.in** API to provide food advice based on live weather (e.g., cooling drinks for heatwaves, warm soups for rainy days).
- **Health Reminders**: Built-in system for water and meal timing notifications.
- **Full State Search**: Search functionality expanded across all Indian states with GI-based healthy vs. unhealthy grading.

## ☁️ Deployment

### Frontend → GitHub Pages
Push to `main` branch. GitHub Actions handles the rest.

### Backend → Railway/Render
```bash
# Railway
railway init
railway up

# Or Render
# Connect repo → Auto-deploy on push
```

## ⚖️ License
This project is licensed under the **MIT License**.

📝 **Full License terms:** Contains all permissions for commercial use, modification, distribution, and private use. See the `LICENSE` file for the full text.
