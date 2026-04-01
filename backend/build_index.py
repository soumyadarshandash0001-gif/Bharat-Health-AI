"""
Build FAISS vector index from the Indian food dataset CSV.
Run this once: python build_index.py
"""
import pandas as pd
import os
import json
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "indian_food_dataset_final.csv")
INDEX_DIR = os.path.join(os.path.dirname(__file__), "diet_index")

def build():
    print("📂 Loading CSV...")
    df = pd.read_csv(CSV_PATH)
    print(f"   {len(df)} rows loaded")

    # Aggregate: compute avg nutrition per unique food_name
    agg = df.groupby(["food_name", "state", "food_class", "is_veg", "cooking_method"]).agg({
        "portion_size_g": "mean",
        "calories": "mean",
        "protein_g": "mean",
        "carbs_g": "mean",
        "fat_g": "mean",
    }).reset_index()

    print(f"   {len(agg)} unique food entries after aggregation")

    documents = []
    for _, row in agg.iterrows():
        name = row["food_name"].replace("_", " ").title()
        text = (
            f"{name} is a {'vegetarian' if row['is_veg'] == 'veg' else 'non-vegetarian'} "
            f"{row['food_class']} dish from {row['state']}, India. "
            f"Cooking method: {row['cooking_method']}. "
            f"Average portion: {row['portion_size_g']:.0f}g. "
            f"Nutrition per serving: {row['calories']:.0f} kcal, "
            f"{row['protein_g']:.1f}g protein, "
            f"{row['carbs_g']:.1f}g carbs, "
            f"{row['fat_g']:.1f}g fat."
        )
        metadata = {
            "food_name": name,
            "state": row["state"],
            "food_class": row["food_class"],
            "is_veg": row["is_veg"],
            "cooking_method": row["cooking_method"],
            "calories": round(row["calories"], 1),
            "protein_g": round(row["protein_g"], 1),
            "carbs_g": round(row["carbs_g"], 1),
            "fat_g": round(row["fat_g"], 1),
            "portion_g": round(row["portion_size_g"], 0),
        }
        documents.append(Document(page_content=text, metadata=metadata))

    print("🧠 Generating embeddings (sentence-transformers/all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    print("📦 Building FAISS index...")
    db = FAISS.from_documents(documents, embeddings)
    db.save_local(INDEX_DIR)
    print(f"✅ Index saved to {INDEX_DIR}")

    # Also save a compact JSON summary for frontend use
    summary = []
    for _, row in agg.iterrows():
        summary.append({
            "name": row["food_name"].replace("_", " ").title(),
            "state": row["state"],
            "food_class": row["food_class"],
            "is_veg": row["is_veg"] == "veg",
            "cooking_method": row["cooking_method"],
            "calories": round(row["calories"], 1),
            "protein_g": round(row["protein_g"], 1),
            "carbs_g": round(row["carbs_g"], 1),
            "fat_g": round(row["fat_g"], 1),
            "portion_g": round(row["portion_size_g"], 0),
        })

    summary_path = os.path.join(os.path.dirname(__file__), "..", "data", "food_summary.json")
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"✅ Frontend summary saved to {summary_path}")

if __name__ == "__main__":
    build()
