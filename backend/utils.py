"""
Utility helpers — BMI, food search, nutrition analysis.
"""
import pandas as pd
import os
import json

SUMMARY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "food_summary.json")

def calculate_bmi(weight_kg: float, height_cm: float) -> dict:
    """Calculate BMI and return category."""
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)

    if bmi < 18.5:
        category = "Underweight"
        advice = "Increase calorie intake with nutrient-dense foods like paneer, nuts, and ghee."
    elif bmi < 25:
        category = "Normal"
        advice = "Maintain current diet. Focus on balanced meals with adequate protein."
    elif bmi < 30:
        category = "Overweight"
        advice = "Reduce fried foods (samosa, pakora). Choose steamed/boiled options like idli, dalma."
    else:
        category = "Obese"
        advice = "Consult a doctor. Focus on high-protein, low-carb Indian meals. Avoid sweets."

    return {
        "bmi": round(bmi, 1),
        "category": category,
        "advice": advice
    }

def search_foods(query: str, is_veg: bool = None) -> list[dict]:
    """Search food database by name/state/class."""
    if not os.path.exists(SUMMARY_PATH):
        return []

    with open(SUMMARY_PATH) as f:
        foods = json.load(f)

    query_lower = query.lower()
    results = []

    for food in foods:
        name_match = query_lower in food["name"].lower()
        state_match = query_lower in food["state"].lower()
        class_match = query_lower in food["food_class"].lower()

        if name_match or state_match or class_match:
            if is_veg is not None and food["is_veg"] != is_veg:
                continue
            results.append(food)

    return results

def get_daily_plan(target_calories: int = 1800, is_veg: bool = True) -> dict:
    """Generate a simple daily meal plan."""
    if not os.path.exists(SUMMARY_PATH):
        return {"error": "Food database not built yet"}

    with open(SUMMARY_PATH) as f:
        foods = json.load(f)

    veg_foods = [f for f in foods if f["is_veg"] == is_veg]

    # Simple plan: breakfast(steamed) + lunch(varied) + dinner(boiled/gravy)
    breakfast = [f for f in veg_foods if f["cooking_method"] in ["steamed", "fermented"]]
    lunch = [f for f in veg_foods if f["cooking_method"] in ["fried", "gravy"]]
    dinner = [f for f in veg_foods if f["cooking_method"] in ["boiled", "gravy"]]

    plan = {
        "target_calories": target_calories,
        "breakfast": breakfast[:2] if breakfast else [],
        "lunch": lunch[:2] if lunch else [],
        "dinner": dinner[:2] if dinner else [],
    }

    total = sum(
        m["calories"]
        for meals in [plan["breakfast"], plan["lunch"], plan["dinner"]]
        for m in meals
    )
    plan["total_calories"] = round(total, 0)

    return plan
