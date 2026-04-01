"""
BHARAT HEALTH AI — Super Intelligence Engine v2
Router → Food DB → Prompt Builder → LLaMA 3.2 → Cache → Response

Architecture:
1. Expanded intelligent router (food lookup, state search, symptoms, general)
2. Embedded Indian food database for instant lookups
3. Category-specific expert prompts with full context injection
4. MD5 cache for instant repeat answers
5. LLaMA 3.2 full-potential with contextual prompts
"""
import requests
import json
import hashlib
import csv
import os

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2"

# ═══════════════════════════════════════
# 💾 INTELLIGENT CACHE
# ═══════════════════════════════════════
_cache = {}

def get_cache(key):
    h = hashlib.md5(key.lower().strip().encode()).hexdigest()
    return _cache.get(h)

def set_cache(key, value):
    if len(_cache) > 2000:
        keys = list(_cache.keys())[:500]
        for k in keys:
            del _cache[k]
    h = hashlib.md5(key.lower().strip().encode()).hexdigest()
    _cache[h] = value


# ═══════════════════════════════════════
# 🗃️ EMBEDDED FOOD DATABASE
# ═══════════════════════════════════════
FOOD_DB = {}

def load_food_db():
    """Load Indian food database from CSV at startup."""
    global FOOD_DB
    csv_path = os.path.join(os.path.dirname(__file__), "..", "indian_food_dataset_final.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(os.path.dirname(__file__), "indian_food_dataset_final.csv")
    if not os.path.exists(csv_path):
        print("[Bharat AI] ⚠️ Food CSV not found, using built-in data")
        return

    try:
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row.get('food_name', '').strip().lower()
                if not name:
                    continue
                state = row.get('state', 'India').strip()
                cal = float(row.get('calories', 0))
                protein = float(row.get('protein_g', 0))
                carbs = float(row.get('carbs_g', 0))
                fat = float(row.get('fat_g', 0))
                is_veg = row.get('is_veg', 'veg').strip()
                method = row.get('cooking_method', '').strip()
                portion = float(row.get('portion_size_g', 0))

                if name not in FOOD_DB:
                    FOOD_DB[name] = {
                        "name": name.replace('_', ' ').title(),
                        "state": state,
                        "cal": round(cal, 1),
                        "protein": round(protein, 1),
                        "carbs": round(carbs, 1),
                        "fat": round(fat, 1),
                        "is_veg": is_veg,
                        "method": method,
                        "portion": round(portion),
                        "samples": 1,
                        "total_cal": cal,
                        "total_protein": protein,
                        "total_carbs": carbs,
                        "total_fat": fat,
                    }
                else:
                    # Average across samples
                    entry = FOOD_DB[name]
                    entry["samples"] += 1
                    entry["total_cal"] += cal
                    entry["total_protein"] += protein
                    entry["total_carbs"] += carbs
                    entry["total_fat"] += fat
                    entry["cal"] = round(entry["total_cal"] / entry["samples"], 1)
                    entry["protein"] = round(entry["total_protein"] / entry["samples"], 1)
                    entry["carbs"] = round(entry["total_carbs"] / entry["samples"], 1)
                    entry["fat"] = round(entry["total_fat"] / entry["samples"], 1)

        print(f"[Bharat AI] ✅ Food DB loaded: {len(FOOD_DB)} unique foods")
    except Exception as e:
        print(f"[Bharat AI] ⚠️ Food DB load error: {e}")

# Load on import
load_food_db()

# Built-in essentials (always available)
BUILTIN_FOODS = {
    "idli": {"name": "Idli", "state": "Tamil Nadu", "cal": 156, "protein": 4.5, "carbs": 33.5, "fat": 1.5, "is_veg": "veg", "method": "steamed", "portion": 130, "gi": 35},
    "masala_dosa": {"name": "Masala Dosa", "state": "Tamil Nadu", "cal": 305, "protein": 7.0, "carbs": 52.0, "fat": 10.5, "is_veg": "veg", "method": "fried", "portion": 180, "gi": 55},
    "chicken_biryani": {"name": "Chicken Biryani", "state": "Telangana", "cal": 495, "protein": 19.0, "carbs": 68.0, "fat": 21.5, "is_veg": "nonveg", "method": "fried", "portion": 300, "gi": 65},
    "veg_biryani": {"name": "Veg Biryani", "state": "Telangana", "cal": 400, "protein": 13.0, "carbs": 72.0, "fat": 13.0, "is_veg": "veg", "method": "fried", "portion": 280, "gi": 60},
    "paneer_butter_masala": {"name": "Paneer Butter Masala", "state": "Punjab", "cal": 480, "protein": 17.5, "carbs": 22.0, "fat": 38.0, "is_veg": "veg", "method": "gravy", "portion": 250, "gi": 45},
    "butter_chicken": {"name": "Butter Chicken", "state": "Punjab", "cal": 520, "protein": 32.0, "carbs": 13.0, "fat": 38.0, "is_veg": "nonveg", "method": "gravy", "portion": 230, "gi": 40},
    "samosa": {"name": "Samosa", "state": "Maharashtra", "cal": 262, "protein": 5.0, "carbs": 30.0, "fat": 14.0, "is_veg": "veg", "method": "fried", "portion": 65, "gi": 78},
    "rasgulla": {"name": "Rasgulla", "state": "West Bengal", "cal": 230, "protein": 5.0, "carbs": 45.0, "fat": 2.5, "is_veg": "veg", "method": "syrup", "portion": 140, "gi": 80},
    "dalma": {"name": "Dalma", "state": "Odisha", "cal": 210, "protein": 9.0, "carbs": 32.0, "fat": 5.5, "is_veg": "veg", "method": "boiled", "portion": 235, "gi": 42},
    "pakhala": {"name": "Pakhala", "state": "Odisha", "cal": 190, "protein": 4.5, "carbs": 43.0, "fat": 1.1, "is_veg": "veg", "method": "fermented", "portion": 155, "gi": 30},
    "chhena_poda": {"name": "Chhena Poda", "state": "Odisha", "cal": 380, "protein": 9.5, "carbs": 47.0, "fat": 14.0, "is_veg": "veg", "method": "baked", "portion": 150, "gi": 70},
    "dal_rice": {"name": "Dal + Rice", "state": "Pan India", "cal": 340, "protein": 12.0, "carbs": 55.0, "fat": 6.0, "is_veg": "veg", "method": "boiled", "portion": 300, "gi": 50},
    "egg_bhurji": {"name": "Egg Bhurji (3 eggs)", "state": "Pan India", "cal": 280, "protein": 21.0, "carbs": 3.0, "fat": 20.0, "is_veg": "nonveg", "method": "fried", "portion": 180, "gi": 0},
    "chana_roti": {"name": "Chana + 2 Roti", "state": "Pan India", "cal": 380, "protein": 15.0, "carbs": 52.0, "fat": 8.0, "is_veg": "veg", "method": "boiled", "portion": 250, "gi": 38},
    "paneer_bhurji": {"name": "Paneer Bhurji (150g)", "state": "Pan India", "cal": 350, "protein": 22.0, "carbs": 6.0, "fat": 26.0, "is_veg": "veg", "method": "fried", "portion": 150, "gi": 0},
    "moong_dal": {"name": "Moong Dal Khichdi", "state": "Pan India", "cal": 250, "protein": 10.0, "carbs": 40.0, "fat": 4.0, "is_veg": "veg", "method": "boiled", "portion": 250, "gi": 35},
    "peanut_chikki": {"name": "Peanut Chikki (50g)", "state": "Maharashtra", "cal": 230, "protein": 8.0, "carbs": 22.0, "fat": 14.0, "is_veg": "veg", "method": "raw", "portion": 50, "gi": 42},
    "poha": {"name": "Poha", "state": "Maharashtra", "cal": 244, "protein": 5.0, "carbs": 40.0, "fat": 8.0, "is_veg": "veg", "method": "fried", "portion": 200, "gi": 50},
    "upma": {"name": "Upma", "state": "Tamil Nadu", "cal": 210, "protein": 5.0, "carbs": 35.0, "fat": 7.0, "is_veg": "veg", "method": "boiled", "portion": 200, "gi": 55},
    "curd_rice": {"name": "Curd Rice", "state": "Tamil Nadu", "cal": 220, "protein": 6.0, "carbs": 38.0, "fat": 5.0, "is_veg": "veg", "method": "mixed", "portion": 250, "gi": 45},
    "rajma_chawal": {"name": "Rajma Chawal", "state": "Punjab", "cal": 380, "protein": 14.0, "carbs": 60.0, "fat": 7.0, "is_veg": "veg", "method": "boiled", "portion": 300, "gi": 50},
    "aloo_paratha": {"name": "Aloo Paratha", "state": "Punjab", "cal": 320, "protein": 7.0, "carbs": 45.0, "fat": 14.0, "is_veg": "veg", "method": "fried", "portion": 150, "gi": 60},
    "fish_curry": {"name": "Fish Curry", "state": "Odisha", "cal": 280, "protein": 25.0, "carbs": 8.0, "fat": 16.0, "is_veg": "nonveg", "method": "gravy", "portion": 200, "gi": 0},
    "rasam_rice": {"name": "Rasam Rice", "state": "Tamil Nadu", "cal": 200, "protein": 4.0, "carbs": 42.0, "fat": 2.0, "is_veg": "veg", "method": "boiled", "portion": 300, "gi": 48},
    "vada": {"name": "Medu Vada", "state": "Tamil Nadu", "cal": 170, "protein": 6.0, "carbs": 15.0, "fat": 10.0, "is_veg": "veg", "method": "fried", "portion": 60, "gi": 55},
    "lassi": {"name": "Lassi (Sweet)", "state": "Punjab", "cal": 180, "protein": 5.0, "carbs": 30.0, "fat": 5.0, "is_veg": "veg", "method": "mixed", "portion": 250, "gi": 55},
    "thali": {"name": "Full Thali (Veg)", "state": "Pan India", "cal": 650, "protein": 20.0, "carbs": 90.0, "fat": 22.0, "is_veg": "veg", "method": "mixed", "portion": 500, "gi": 55},
    "santula": {"name": "Santula (Mixed Veg)", "state": "Odisha", "cal": 120, "protein": 4.0, "carbs": 18.0, "fat": 3.5, "is_veg": "veg", "method": "boiled", "portion": 200, "gi": 30},
    "dahi_bara": {"name": "Dahi Bara", "state": "Odisha", "cal": 250, "protein": 7.0, "carbs": 38.0, "fat": 8.0, "is_veg": "veg", "method": "fried", "portion": 150, "gi": 55},
}

def get_all_foods():
    """Merge CSV DB + built-in, preferring CSV data."""
    merged = {**BUILTIN_FOODS}
    for k, v in FOOD_DB.items():
        merged[k] = v
    return merged


# ═══════════════════════════════════════
# 🔍 FOOD SEARCH FUNCTIONS
# ═══════════════════════════════════════
INDIAN_STATES = [
    "odisha", "odia", "orissa", "tamil nadu", "tamilnadu", "telangana",
    "punjab", "punjabi", "maharashtra", "marathi", "west bengal", "bengali",
    "karnataka", "kannada", "kerala", "mallu", "rajasthan", "rajasthani",
    "gujarat", "gujarati", "andhra", "andhra pradesh", "bihar", "bihari",
    "uttar pradesh", "up", "jharkhand", "assam", "assamese", "goa", "goan",
    "madhya pradesh", "chhattisgarh", "haryana", "pan india",
]

STATE_MAP = {
    "odisha": "Odisha", "odia": "Odisha", "orissa": "Odisha",
    "tamil nadu": "Tamil Nadu", "tamilnadu": "Tamil Nadu", "south indian": "Tamil Nadu",
    "telangana": "Telangana", "hyderabad": "Telangana", "hyderabadi": "Telangana",
    "punjab": "Punjab", "punjabi": "Punjab", "north indian": "Punjab",
    "maharashtra": "Maharashtra", "marathi": "Maharashtra", "mumbai": "Maharashtra",
    "west bengal": "West Bengal", "bengali": "West Bengal", "kolkata": "West Bengal",
    "karnataka": "Karnataka", "kannada": "Karnataka", "bangalore": "Karnataka",
    "kerala": "Kerala", "mallu": "Kerala", "rajasthan": "Rajasthan",
    "rajasthani": "Rajasthan", "gujarat": "Gujarat", "gujarati": "Gujarat",
    "andhra": "Andhra Pradesh", "andhra pradesh": "Andhra Pradesh",
    "bihar": "Bihar", "bihari": "Bihar", "goa": "Goa", "goan": "Goa",
    "pan india": "Pan India",
}

def search_food_by_name(query):
    """Find foods matching a name query."""
    q = query.lower().replace(' ', '_')
    all_foods = get_all_foods()
    results = []
    for key, food in all_foods.items():
        if q in key or q.replace('_', ' ') in food["name"].lower():
            results.append(food)
    return results[:5]

def search_food_by_state(state_query):
    """Find foods from a specific state."""
    q = state_query.lower()
    mapped_state = None
    for alias, state in STATE_MAP.items():
        if alias in q:
            mapped_state = state
            break

    if not mapped_state:
        return []

    all_foods = get_all_foods()
    return [f for f in all_foods.values() if f["state"] == mapped_state][:8]

def detect_state_in_query(query):
    """Check if user is asking about a specific state's food."""
    q = query.lower()
    for alias, state in STATE_MAP.items():
        if alias in q:
            return state
    return None

def detect_food_in_query(query):
    """Check if user mentioned a specific food name."""
    q = query.lower().strip()
    all_foods = get_all_foods()

    # Direct match
    for key, food in all_foods.items():
        food_name = food["name"].lower()
        clean_key = key.replace('_', ' ')
        if clean_key in q or food_name in q:
            return food

    # Partial match
    for key, food in all_foods.items():
        clean_key = key.replace('_', ' ')
        parts = clean_key.split()
        for part in parts:
            if len(part) > 3 and part in q:
                return food
    return None

def detect_multiple_foods(query):
    """Detect multiple foods and their quantities for macro calculation."""
    import re
    q = query.lower().strip()
    all_foods = get_all_foods()
    
    # E.g., "2 idli and 1 dosa" -> [('2', 'idli'), ...]
    matches = re.finditer(r'(\d+)\s*([a-zA-Z]+)', q)
    found_foods = []
    
    for match in matches:
        qty = int(match.group(1))
        word = match.group(2)
        
        # Find food for this word
        for key, food in all_foods.items():
            if word in key.replace('_', ' ') or word in food["name"].lower():
                found_foods.append((qty, food))
                break
                
    # If no numbers used, just find all unique foods mentioned
    if not found_foods:
        for key, food in all_foods.items():
            if key.replace('_', ' ') in q or food["name"].lower() in q:
                found_foods.append((1, food))
                
    return found_foods


# ═══════════════════════════════════════
# 🧠 LLAMA CALL (Core)
# ═══════════════════════════════════════
def llama_call(prompt, max_tokens=800, temperature=0.7):
    try:
        res = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "top_p": 0.9,
                    "num_predict": max_tokens,
                }
            },
            timeout=15
        )
        if res.status_code == 200:
            return res.json().get("response", "").strip()
    except Exception as e:
        print(f"[Bharat AI] Ollama error: {e}")
    return None


# ═══════════════════════════════════════
# 🧠 INTELLIGENT ROUTER v2
# ═══════════════════════════════════════
CATEGORY_KEYWORDS = {
    "diet_plan": ["diet plan", "meal plan", "what to eat", "plan", "schedule", "प्लान", "खाना", "food plan", "day plan"],
    "calories": ["calorie", "kcal", "macro", "how many", "kitna", "कैलोरी", "analyze"],
    "protein": ["protein", "प्रोटीन", "muscle", "gym", "bulk", "bodybuilding", "workout"],
    "diabetes": ["diabetes", "sugar", "शुगर", "glucose", "hba1c", "insulin", "glycemic", "gi"],
    "weight_loss": ["weight loss", "fat loss", "lose weight", "slim", "वजन", "reduce", "belly", "deficit"],
    "disease_diet": ["thyroid", "pcos", "bp", "cholesterol", "kidney", "heart", "anemia", "uric acid"],
    "food_lookup": ["tell me about", "details of", "nutrition of", "info about", "what is", "how healthy is"],
    "state_food": ["food from", "foods of", "cuisine", "dishes from", "what do people eat in"],
    "symptom": ["feeling", "cold", "fever", "headache", "tired", "nausea", "acidity", "bloat",
                "gas", "constipation", "diarrhea", "cough", "sore throat", "weak", "dizzy",
                "pain", "cramp", "inflammation", "allergy", "skin", "hair fall",
                "ठंड", "बुखार", "सिरदर्द", "थकान", "गैस", "कब्ज", "बालों का झड़ना"],
    "food_analysis": ["healthy", "good for", "bad for", "should i eat", "is it ok", "junk", "safe to eat"],
    "behavior": ["motivation", "lazy", "skip", "consistency", "habit", "stress", "sleep", "craving", "bored"],
    "bmi": ["bmi", "body mass", "overweight", "obese"],
}

def classify_query(user_input):
    """Smart classification: DB detection → keyword match → LLaMA fallback."""
    q = user_input.lower()

    # 1. State food search detection
    state = detect_state_in_query(q)
    if state and any(w in q for w in ["food", "dish", "cuisine", "eat", "खाना", "what", "show", "list"]):
        return "state_food"

    # 2. Food name lookup detection
    food = detect_food_in_query(q)
    if food and any(w in q for w in ["about", "detail", "nutrition", "calorie", "tell", "info", "what", "is", "how"]):
        return "food_lookup"

    # 3. Symptom detection (before general)
    symptom_words = CATEGORY_KEYWORDS["symptom"]
    if any(w in q for w in symptom_words):
        return "symptom"

    # 4. Fast keyword match
    best_cat = "general"
    best_score = 0
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if cat in ("symptom", "state_food", "food_lookup"):
            continue  # already handled above
        score = sum(1 for kw in keywords if kw in q)
        if score > best_score:
            best_score = score
            best_cat = cat

    if best_score >= 1:
        return best_cat

    # 5. Check if it's a multi-food macro calculation
    multi = detect_multiple_foods(q)
    if multi and len(multi) > 1 and any(w in q for w in ["calculate", "macros", "total", "sum", "add", "all"]):
        return "multi_food_calc"

    # 6. Check if it's a bare food name
    if food:
        return "food_lookup"

    # 7. Check if it's a bare state name
    if state:
        return "state_food"

    # 8. LLaMA classification fallback
    result = llama_call(
        f"Classify this health query into exactly ONE category: "
        f"diet_plan, calories, protein, diabetes, weight_loss, disease_diet, "
        f"food_lookup, state_food, symptom, food_analysis, behavior, general\n"
        f"Query: {user_input}\nCategory:",
        max_tokens=10,
        temperature=0.1
    )
    if result:
        r = result.strip().lower().replace('"', '').replace("'", "")
        for cat in CATEGORY_KEYWORDS:
            if cat in r:
                return cat
    return "general"


# ═══════════════════════════════════════
# ⚡ SUPER-INTELLIGENCE PROMPT ENGINE v2
# ═══════════════════════════════════════

PERSONA_SYSTEM = """You are Bharat Health AI — an elite-level AI health expert system for Indian users.

You function as a fusion of:
🩺 Dr. Sharma (Endocrinologist, AIIMS) — diabetes, medical conditions, symptoms
🥗 Priya Patel (Clinical Dietician, 15 yrs) — nutrition, meal plans, weight loss
💪 Coach Arjun (NSCA Fitness Nutritionist) — protein, gym, muscle building
🧠 Coach Meera (Behavioral Scientist) — habits, motivation, mindset

ABSOLUTE RULES:
1. ONLY recommend Indian foods (dal, roti, rice, paneer, idli, dosa, eggs, chicken, sabzi)
2. Include SPECIFIC numbers (calories, protein grams, GI values)
3. Regional awareness — suggest Odia food for Odisha users, South Indian for Tamil users
4. Budget-aware: ₹100/day = dal + chana + eggs; ₹300/day = paneer + chicken
5. Be SHARP — 3-5 lines for simple queries, structured plan for complex ones
6. Sound like a real expert friend, not a robot
7. Think step-by-step INTERNALLY but show only clean output
8. Never repeat same foods across meals
9. Always end with ONE follow-up question
10. Flag dangerous advice (crash diets, zero carb, detox juice scams)

SYMPTOM HANDLING:
- When user reports symptoms (cold, fever, headache, tired, etc.), respond with:
  a) Home remedies using Indian kitchen ingredients
  b) Foods to eat and foods to avoid
  c) When to see a doctor (red flags)
  d) Be empathetic and caring, not dismissive

FOOD LOOKUP:
- When asked about a specific food, give COMPLETE analysis:
  a) Calories, protein, carbs, fat per serving
  b) Health benefits and drawbacks
  c) Best time to eat it
  d) Healthier alternatives
  e) Regional context

MEDICAL SAFETY:
- No diagnosis — say "consult your doctor" for serious symptoms
- No medication advice
- Never recommend below 1200 kcal
"""

def build_prompt(category, user_input, context=None, history=""):
    """Build category-specific expert prompt with full context."""

    # Extract user profile
    user_note = ""
    food_context = ""
    if context:
        try:
            ctx = json.loads(context) if isinstance(context, str) else context
            p = ctx.get("user_profile", {})
            if p.get("name"):
                user_note = (
                    f"\nUSER PROFILE: {p.get('name')}, {p.get('age', '?')}y, "
                    f"{p.get('weight', '?')}kg, {p.get('height', '?')}cm, "
                    f"Goal: {p.get('goal', '?')}, Diet: {p.get('diet', '?')}, "
                    f"From: {p.get('location', '?')}, Budget: {p.get('budget', '?')}, "
                    f"Lifestyle: {p.get('lifestyle', '?')}"
                )
            last = ctx.get("last_responses", [])
            if last:
                user_note += f"\n\nDO NOT REPEAT THESE PREVIOUS RESPONSES:\n" + "\n".join(last[:3])
            recurring = ctx.get("recurring_issues", [])
            if recurring:
                user_note += f"\nRECURRING ISSUES: " + ", ".join(
                    [f"{i['issue']} (asked {i['count']}x)" for i in recurring[:3]]
                )
        except Exception:
            pass

    # Inject food database context
    q = user_input.lower()

    # State food context
    state = detect_state_in_query(q)
    if state:
        state_foods = search_food_by_state(q)
        if state_foods:
            food_context = f"\n\nFOOD DATABASE — {state} Foods:\n"
            for f in state_foods:
                food_context += (
                    f"• {f['name']} — {f['cal']} kcal, {f['protein']}g P, "
                    f"{f['carbs']}g C, {f['fat']}g F, {f['method']}, "
                    f"{'Veg' if f.get('is_veg') == 'veg' else 'Non-Veg'}\n"
                )

    # Specific food context
    food = detect_food_in_query(q)
    if food:
        food_context += (
            f"\n\nFOOD DATA — {food['name']}:\n"
            f"• State: {food.get('state', 'India')}\n"
            f"• Calories: {food['cal']} kcal (per {food.get('portion', '?')}g serving)\n"
            f"• Protein: {food['protein']}g\n"
            f"• Carbs: {food['carbs']}g\n"
            f"• Fat: {food['fat']}g\n"
            f"• Cooking: {food.get('method', '?')}\n"
            f"• Type: {'Vegetarian' if food.get('is_veg') == 'veg' else 'Non-Vegetarian'}\n"
            f"• GI: {food.get('gi', 'N/A')}\n"
        )

    # Multiple food context
    multi_calc = ""
    if category == "multi_food_calc":
        multi = detect_multiple_foods(q)
        if multi:
            total_cal = total_pro = total_car = total_fat = 0
            food_context += "\n\n🧮 EXACT TOTAL MACROS DONE BY SYSTEM (USE THESE EXACT NUMBERS):\n"
            for qty, f in multi:
                cal = qty * f['cal']
                pro = qty * f['protein']
                car = qty * f['carbs']
                fat = qty * f['fat']
                total_cal += cal; total_pro += pro; total_car += car; total_fat += fat
                food_context += f"• {qty}x {f['name']} = {cal} kcal, {pro}g P, {car}g C, {fat}g F\n"
            food_context += f"\n🎯 GRAND TOTAL: {total_cal} kcal, {total_pro}g Protein, {total_car}g Carbs, {total_fat}g Fat\n"
            multi_calc = food_context

    base = PERSONA_SYSTEM + user_note + food_context

    if history:
        base += f"\n\nCONVERSATION HISTORY:\n{history[-500:]}"

    prompts = {
        "diet_plan": (
            f"{base}\n\n"
            f"🥗 MODE: DIET PLAN CREATION\n"
            f"Create a complete, personalized Indian diet plan.\n\n"
            f"User: {user_input}\n\n"
            f"Format:\n"
            f"🌅 Breakfast (time): [food] — [cal] kcal, [protein]g P\n"
            f"🌞 Lunch (time): [food] — [cal] kcal, [protein]g P\n"
            f"🫖 Snack (time): [food] — [cal] kcal\n"
            f"🌙 Dinner (time): [food] — [cal] kcal, [protein]g P\n"
            f"🎯 Total: [cal] kcal | [protein]g protein\n\n"
            f"Response:"
        ),

        "multi_food_calc": (
            f"{base}\n\n"
            f"📊 MODE: MULTI-FOOD MACRO CALCULATOR\n"
            f"You are given the exact total macros calculated by the system. Just present them beautifully to the user.\n\n"
            f"User: {user_input}\n\n"
            f"Present the breakdown clearly, line by line for each food, and then the Grand Total.\n"
            f"Give a short 1-line verdict on if this is a heavy meal or not.\n\n"
            f"Response:"
        ),

        "calories": (
            f"{base}\n\n"
            f"📊 MODE: CALORIE & MACRO ANALYSIS\n"
            f"Calculate exact nutritional values.\n\n"
            f"User: {user_input}\n\n"
            f"Give: Calories, Protein, Carbs, Fat, GI value, and verdict.\n\n"
            f"Response:"
        ),

        "protein": (
            f"{base}\n\n"
            f"💪 MODE: FITNESS & PROTEIN EXPERT\n"
            f"Calculate protein needs and suggest Indian sources.\n\n"
            f"User: {user_input}\n\n"
            f"Include: daily protein target, top 5 Indian protein sources with grams, "
            f"pre/post workout meal, budget-friendly options.\n\n"
            f"Response:"
        ),

        "diabetes": (
            f"{base}\n\n"
            f"🩺 MODE: DIABETES MANAGEMENT EXPERT\n"
            f"Provide GI-aware dietary guidance.\n\n"
            f"User: {user_input}\n\n"
            f"Include: safe foods (GI ≤ 45), foods to avoid (GI ≥ 70), "
            f"meal timing advice, carb limits per meal.\n"
            f"⚠️ Always recommend HbA1c checks.\n\n"
            f"Response:"
        ),

        "weight_loss": (
            f"{base}\n\n"
            f"⚖️ MODE: WEIGHT LOSS EXPERT\n"
            f"Create calorie-deficit plan with Indian foods.\n\n"
            f"User: {user_input}\n\n"
            f"Include: TDEE estimate, recommended deficit (500 kcal), "
            f"low-calorie Indian foods with portions, walking/exercise.\n"
            f"⚠️ Never below 1200 kcal.\n\n"
            f"Response:"
        ),

        "disease_diet": (
            f"{base}\n\n"
            f"🏥 MODE: MEDICAL-AWARE DIET\n"
            f"Suggest safe dietary modifications for health conditions.\n\n"
            f"User: {user_input}\n\n"
            f"Include: foods to eat, foods to avoid, meal timing, supplements.\n"
            f"⚠️ Say 'consult your doctor' for serious conditions.\n\n"
            f"Response:"
        ),

        "food_lookup": (
            f"{base}\n\n"
            f"🔍 MODE: FOOD DETAIL ANALYSIS\n"
            f"Give COMPLETE nutritional analysis of the food.\n"
            f"USE THE FOOD DATA PROVIDED ABOVE as your source.\n\n"
            f"User: {user_input}\n\n"
            f"Include:\n"
            f"1. Full nutrition (cal, protein, carbs, fat, GI)\n"
            f"2. Health benefits\n"
            f"3. Health drawbacks (if any)\n"
            f"4. Best time to eat\n"
            f"5. Who should eat it / avoid it\n"
            f"6. Healthier alternatives\n"
            f"7. Regional significance\n\n"
            f"Response:"
        ),

        "state_food": (
            f"{base}\n\n"
            f"🗺️ MODE: REGIONAL FOOD EXPLORER\n"
            f"USE THE FOOD DATABASE PROVIDED ABOVE to list foods from this region.\n"
            f"For EACH food, include: calories, protein, carbs, fat, cooking method.\n"
            f"Also rate each food as: ✅ Healthy, ⚠️ Moderate, ❌ Avoid frequently\n\n"
            f"User: {user_input}\n\n"
            f"Give detailed analysis of each food from the region with nutritional data.\n"
            f"Then suggest the BEST combination for a healthy meal from this region.\n\n"
            f"Response:"
        ),

        "symptom": (
            f"{base}\n\n"
            f"🩺 MODE: SYMPTOM & WELLNESS ADVISOR\n"
            f"The user is reporting a health symptom or feeling.\n"
            f"Respond with EMPATHY and CARE. This is NOT just a food query.\n\n"
            f"User: {user_input}\n\n"
            f"Structure your response as:\n"
            f"1. 🤗 Acknowledge how they're feeling (empathetic)\n"
            f"2. 🏠 Home remedies using Indian kitchen ingredients (haldi, adrak, tulsi, etc.)\n"
            f"3. 🍽️ Foods to eat NOW that will help\n"
            f"4. ❌ Foods to AVOID right now\n"
            f"5. ⚠️ When to see a doctor (red flags)\n"
            f"6. 💡 One practical tip\n\n"
            f"Be warm, not clinical. Like a caring Indian mom + doctor.\n\n"
            f"Response:"
        ),

        "food_analysis": (
            f"{base}\n\n"
            f"🔍 MODE: FOOD ANALYSIS\n"
            f"Analyze if the food is healthy.\n\n"
            f"User: {user_input}\n\n"
            f"Include: calorie estimate, protein/carb/fat, GI, healthier alternatives.\n\n"
            f"Response:"
        ),

        "behavior": (
            f"{base}\n\n"
            f"🧠 MODE: BEHAVIORAL COACHING\n"
            f"Help with motivation, habits, and consistency.\n\n"
            f"User: {user_input}\n\n"
            f"Use psychology (2-minute rule, habit stacking, environment design). "
            f"Be empathetic but direct. Give 3 actionable micro-steps.\n\n"
            f"Response:"
        ),

        "bmi": (
            f"{base}\n\n"
            f"🧮 MODE: BMI & BODY COMPOSITION\n"
            f"Help user understand BMI.\n\n"
            f"User: {user_input}\n\n"
            f"Direct them to the BMI Calculator in the sidebar.\n\n"
            f"Response:"
        ),
    }

    return prompts.get(category, (
        f"{base}\n\n"
        f"🌿 MODE: GENERAL HEALTH GUIDANCE\n"
        f"Answer the health query with Indian food context.\n"
        f"Be helpful, specific, and actionable.\n\n"
        f"User: {user_input}\n\n"
        f"Response:"
    ))


# ═══════════════════════════════════════
# 🚀 MAIN GENERATE FUNCTION
# ═══════════════════════════════════════
def generate(question, context=None, intent=None, mode=None):
    """Full pipeline: Cache → Classify → DB Search → Prompt → LLaMA → Cache."""

    # 1. Check cache
    cache_key = f"{question}_{intent or ''}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    # 2. Classify
    category = classify_query(question)

    # Override with frontend intent if it's more specific
    if intent and intent in CATEGORY_KEYWORDS and category == "general":
        category = intent

    # 3. Build prompt with injected food data
    prompt = build_prompt(category, question, context)

    # 4. Call LLaMA
    response = llama_call(prompt)

    if response:
        result = {"text": response, "category": category}
        set_cache(cache_key, response)
        return response

    # 5. Fallback
    return fallback_response(question, context, category)


# ═══════════════════════════════════════
# 🛡️ SMART FALLBACK v2
# ═══════════════════════════════════════
def fallback_response(question, context=None, category=None):
    """Expert fallback when Ollama is unavailable."""
    q = question.lower()
    name = "friend"

    if context:
        try:
            ctx = json.loads(context) if isinstance(context, str) else context
            name = ctx.get("user_profile", {}).get("name", "friend")
        except Exception:
            pass

    # Multi-food calc fallback
    if category == "multi_food_calc":
        multi = detect_multiple_foods(q)
        if multi:
            total_cal = total_pro = total_car = total_fat = 0
            lines = []
            for qty, f in multi:
                cal = qty * f['cal']
                pro = qty * f['protein']
                car = qty * f['carbs']
                fat = qty * f['fat']
                total_cal += cal; total_pro += pro; total_car += car; total_fat += fat
                lines.append(f"• **{qty}x {f['name']}** — {cal} kcal | {pro}g P | {car}g C | {fat}g F")
            
            verdict = "✅ Balanced meal" if total_cal <= 600 else "⚠️ Heavy meal"
            return (
                f"🧮 **Here is the total calculation:**\n\n"
                f"{chr(10).join(lines)}\n\n"
                f"🎯 **GRAND TOTAL:**\n"
                f"🔥 **{total_cal} kcal**\n🥚 **{total_pro}g Protein**\n"
                f"🍚 **{total_car}g Carbs**\n🧈 **{total_fat}g Fat**\n\n"
                f"💡 Verdict: {verdict}"
            )

    # Food lookup fallback
    if category == "food_lookup":
        food = detect_food_in_query(q)
        if food:
            return (
                f"🔍 **{food['name']} — Full Analysis:**\n\n"
                f"📍 Region: {food.get('state', 'India')}\n"
                f"🔥 Calories: {food['cal']} kcal\n"
                f"🥚 Protein: {food['protein']}g\n"
                f"🍚 Carbs: {food['carbs']}g\n"
                f"🧈 Fat: {food['fat']}g\n"
                f"👨‍🍳 Method: {food.get('method', '?')}\n"
                f"{'🌱 Vegetarian' if food.get('is_veg') == 'veg' else '🍗 Non-Vegetarian'}\n\n"
                f"💡 Ask me 'Is this good for diabetes?' or 'Best time to eat this?'"
            )

    # State food fallback
    if category == "state_food":
        state = detect_state_in_query(q)
        if state:
            foods = search_food_by_state(q)
            if foods:
                lines = "\n".join([
                    f"• {f['name']} — {f['cal']} kcal, {f['protein']}g P, {f.get('method', '')}"
                    for f in foods
                ])
                return (
                    f"🗺️ **Foods from {state}:**\n\n{lines}\n\n"
                    f"💡 Ask me about any food for detailed analysis!"
                )

    # Symptom fallback
    if category == "symptom":
        return (
            f"🤗 {name}, I understand you're not feeling well.\n\n"
            f"🏠 **Quick Home Remedies:**\n"
            f"• Haldi + adrak + honey wali chai — anti-inflammatory\n"
            f"• Tulsi ka paani — immunity boost\n"
            f"• Warm dal + khichdi — easy to digest\n"
            f"• Rest + hydration = fastest recovery\n\n"
            f"🍽️ **Eat:** Khichdi, dalma, curd rice, warm soups\n"
            f"❌ **Avoid:** Fried food, cold drinks, heavy meals\n\n"
            f"⚠️ If symptoms persist >2 days, please consult a doctor.\n"
            f"💡 Tell me your exact symptom for specific advice!"
        )

    responses = {
        "diabetes": (
            f"🩺 **Dr. Sharma:**\n\n{name}, diabetes ke liye:\n\n"
            "✅ **Safe (Low GI):** Dalma (210 kcal, GI:42), Moong Khichdi (250 kcal, GI:35), Pakhala (190 kcal, GI:30)\n"
            "❌ **Avoid:** Samosa (GI:78), Rasgulla (GI:80), White rice (GI:73)\n\n"
            "📋 Carbs < 45g/meal | Protein saath mein | Dinner before 8 PM\n"
            "⚠️ Regular HbA1c check karvaayein."
        ),
        "protein": (
            f"💪 **Coach Arjun:**\n\n{name}, top Indian protein sources:\n\n"
            "🥚 Egg Bhurji (3 eggs) — **21g protein**, 280 kcal\n"
            "🧀 Paneer Bhurji (150g) — **22g protein**, 350 kcal\n"
            "🫘 Chana + 2 Roti — **15g protein**, 380 kcal\n"
            "🥜 Peanut Chikki (50g) — **8g protein**, 230 kcal\n\n"
            "🎯 Daily target: Body weight (kg) × 1.6 = grams protein needed"
        ),
        "weight_loss": (
            f"🥗 **Priya Patel:**\n\n{name}, sustainable fat loss:\n\n"
            "📋 **1,200 kcal Plan (₹100/day):**\n"
            "🌅 Idli (3) — 234 kcal | 🌞 Dalma + Rice — 350 kcal\n"
            "🫖 Green tea + almonds — 50 kcal | 🌙 Khichdi — 250 kcal\n\n"
            "💡 30 min walk daily = game changer!"
        ),
        "diet_plan": (
            f"🥗 **Priya Patel:**\n\n{name}, balanced Indian diet:\n\n"
            "🌅 **8 AM:** Moong Khichdi — 250 kcal, 10g P\n"
            "🌞 **1 PM:** Dalma + Rice + Sabzi — 380 kcal, 13g P\n"
            "🫖 **5 PM:** Roasted chana + chai — 90 kcal, 4g P\n"
            "🌙 **8 PM:** Dal + 2 Roti — 340 kcal, 12g P\n\n"
            "🎯 Total: ~1,060 kcal | ~39g protein"
        ),
        "behavior": (
            f"🧠 **Coach Meera:**\n\n{name}, consistency ke 3 rules:\n\n"
            "1️⃣ **2-Minute Rule** — Bas 2 min exercise se start karo\n"
            "2️⃣ **Environment Design** — Healthy food saamne, junk door\n"
            "3️⃣ **Habit Stack** — Chai ke baad → 5 min stretch\n\n"
            "💡 Small daily step >> big step kabhi-kabhi!"
        ),
    }

    return responses.get(category, (
        f"🌿 **Bharat Health AI:**\n\n{name}, main help karta hoon!\n\n"
        "📋 **Try asking:**\n"
        "• \"Diabetes ke liye diet plan\"\n"
        "• \"Tell me about paneer\"\n"
        "• \"Odisha food list\"\n"
        "• \"I'm feeling cold\"\n"
        "• \"Is samosa healthy?\"\n\n"
        "💡 BMI Calculator aur Meal Planner sidebar mein hain!"
    ))
