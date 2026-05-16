import requests
from services.interaction_service import normalize_drug_name

def get_drug_info(drug_name: str) -> dict:
    norm_name = normalize_drug_name(drug_name)
    url = f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:{norm_name}+brand_name:{norm_name}&limit=1"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if 'results' in data and len(data['results']) > 0:
                result = data['results'][0]
                uses = result.get('indications_and_usage', ['Information not available'])[0]
                side_effects = result.get('adverse_reactions', ['Information not available'])[0]
                warnings = result.get('warnings', ['Information not available'])[0]
                return {
                    "uses": uses,
                    "side_effects": side_effects,
                    "warnings": warnings,
                    "source": "OpenFDA"
                }
    except Exception as e:
        pass
    
    return None
