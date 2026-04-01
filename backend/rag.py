"""
RAG retrieval engine — FAISS-powered Indian food knowledge base.
"""
import os
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

INDEX_DIR = os.path.join(os.path.dirname(__file__), "diet_index")

_db = None
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
    return _embeddings

def load_db():
    """Load or return cached FAISS index."""
    global _db
    if _db is None:
        _db = FAISS.load_local(
            INDEX_DIR,
            get_embeddings(),
            allow_dangerous_deserialization=True
        )
    return _db

def retrieve_context(query: str, k: int = 5) -> list[dict]:
    """
    Retrieve top-k relevant food documents for a query.
    Returns list of dicts with text + metadata.
    """
    db = load_db()
    docs = db.similarity_search_with_score(query, k=k)

    results = []
    for doc, score in docs:
        results.append({
            "text": doc.page_content,
            "metadata": doc.metadata,
            "relevance_score": round(float(1 / (1 + score)), 3),  # normalize
        })
    return results
