import pandas as pd
import os

DRUG_NAME_MAP = {
    "paracetamol": "acetaminophen",
    "alcohol": "ethanol",
    "tylenol": "acetaminophen",
    "advil": "ibuprofen",
    "motrin": "ibuprofen",
    "aspirin": "acetylsalicylic acid",
    "panadol": "acetaminophen",
    "antacid": "antacids",
    "antacids": "antacids",
}

def normalize_drug_name(name: str) -> str:
    name = name.lower().strip()
    return DRUG_NAME_MAP.get(name, name)

def check_interaction(drug1: str, drug2: str) -> dict:
    d1 = drug1.lower().strip()
    d2 = drug2.lower().strip()

    if 'alcohol' in [d1, d2] or 'ethanol' in [d1, d2]:
        other = d1 if d1 not in ['alcohol', 'ethanol'] else d2
        return {
            "interaction_severity": "Moderate to Major",
            "explanation": f"Alcohol can significantly increase the side effects of many medications. For {other}, combining it with alcohol may cause increased dizziness, drowsiness, or in some cases, severe liver toxicity or reduced effectiveness. Avoid alcohol while on this medication.",
            "source": "General Medical Safety Protocol"
        }

    if 'antacid' in d1 or 'antacid' in d2:
        other = d1 if 'antacid' not in d1 else d2
        return {
            "interaction_severity": "Moderate",
            "explanation": f"Antacids (containing aluminum, magnesium, or calcium) can bind to medications like {other} in the digestive tract. This significantly reduces the amount of medicine absorbed by your body, making it less effective. Space these at least 2-4 hours apart.",
            "source": "Pharmacological Guidelines"
        }

    try:
        csv_path = os.path.join(os.path.dirname(__file__), "..", "kaggle_interactions.csv")
        df = pd.read_csv(csv_path)
        
        drug1_norm = normalize_drug_name(drug1)
        drug2_norm = normalize_drug_name(drug2)
        
        if 'Drug 1' in df.columns:
            match = df[((df['Drug 1'].str.lower() == drug1_norm) & (df['Drug 2'].str.lower() == drug2_norm)) |
                       ((df['Drug 1'].str.lower() == drug2_norm) & (df['Drug 2'].str.lower() == drug1_norm))]
            
            if not match.empty:
                row = match.iloc[0]
                return {
                    "interaction_severity": "See Description",
                    "explanation": row['Interaction Description'],
                    "source": "Kaggle DDI Dataset"
                }
        else:
            match = df[((df['drug_a'].str.lower() == drug1_norm) & (df['drug_b'].str.lower() == drug2_norm)) |
                       ((df['drug_a'].str.lower() == drug2_norm) & (df['drug_b'].str.lower() == drug1_norm))]
            
            if not match.empty:
                row = match.iloc[0]
                return {
                    "interaction_severity": row['severity'],
                    "explanation": row['explanation'],
                    "source": "Mock Dataset"
                }
    except Exception as e:
        print(f"Error reading dataset: {e}")
    
    return None

