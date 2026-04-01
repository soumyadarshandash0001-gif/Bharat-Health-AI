"""
Bharat Health AI — FastAPI Production Server
Super-intelligence routing with LLaMA 3.2 + cache + RAG

Pipeline: Cache → Router → Prompt Builder → LLaMA → Cache → Response
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os

app = FastAPI(
    title="Bharat Health AI",
    version="2.1.0",
    description="Super-intelligence health AI with routing, caching, and multi-expert personas"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──
class ChatQuery(BaseModel):
    question: str
    language: str = "en"
    context: Optional[str] = None
    intent: Optional[str] = None
    mode: Optional[str] = None
    history: str = ""

class BMIQuery(BaseModel):
    weight_kg: float
    height_cm: float

class SearchQuery(BaseModel):
    query: str
    is_veg: Optional[bool] = None

class PlanQuery(BaseModel):
    target_calories: int = 1800
    is_veg: bool = True

# ── Lazy RAG ──
_rag_loaded = False

def ensure_rag():
    global _rag_loaded
    if not _rag_loaded:
        try:
            from rag import load_db
            load_db()
            _rag_loaded = True
        except Exception as e:
            print(f"⚠️ RAG not loaded: {e}")

# ── Routes ──

@app.get("/")
def root():
    return {
        "service": "Bharat Health AI",
        "version": "2.1.0",
        "status": "running",
        "engine": "LLaMA 3.2 + Router + Cache",
        "endpoints": ["/chat", "/search", "/bmi", "/plan", "/foods", "/health"]
    }

@app.post("/chat")
def chat(q: ChatQuery):
    """Main chat — Super-intelligence pipeline: Cache → Route → Prompt → LLaMA → Cache."""
    ensure_rag()

    try:
        from llm import generate, classify_query

        # Get category for response metadata
        category = classify_query(q.question)

        # RAG sources (if available)
        sources = []
        try:
            from rag import retrieve_context
            rag_results = retrieve_context(q.question, k=5)
            for r in rag_results:
                sources.append({
                    "food": r["metadata"].get("food_name", "Unknown"),
                    "calories": r["metadata"].get("calories", 0),
                    "protein": r["metadata"].get("protein", 0),
                    "carbs": r["metadata"].get("carbs", 0),
                    "fat": r["metadata"].get("fat", 0),
                })
        except Exception:
            pass

        # Generate response (cache-aware)
        response = generate(
            question=q.question,
            context=q.context,
            intent=q.intent,
            mode=q.mode,
        )

        return {
            "response": response,
            "sources": sources[:3],
            "category": category,
            "language": q.language,
            "model": "llama3.2"
        }

    except Exception as e:
        from llm import fallback_response
        return {
            "response": fallback_response(q.question, q.context),
            "sources": [],
            "category": "fallback",
            "language": q.language,
            "model": "expert-fallback"
        }

@app.post("/search")
def search(q: SearchQuery):
    from utils import search_foods
    results = search_foods(q.query, q.is_veg)
    return {"results": results, "count": len(results)}

@app.post("/bmi")
def bmi(q: BMIQuery):
    from utils import calculate_bmi
    return calculate_bmi(q.weight_kg, q.height_cm)

@app.post("/plan")
def plan(q: PlanQuery):
    from utils import get_daily_plan
    return get_daily_plan(q.target_calories, q.is_veg)

@app.get("/foods")
def foods():
    summary_path = os.path.join(os.path.dirname(__file__), "..", "data", "food_summary.json")
    if os.path.exists(summary_path):
        with open(summary_path) as f:
            return json.load(f)
    return []

@app.get("/health")
def health():
    return {"status": "ok", "engine": "super-intelligence"}
