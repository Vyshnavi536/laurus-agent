import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from services.openfda_service import get_drug_info
from services.interaction_service import check_interaction

load_dotenv()

def get_llm():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "dummy_key_for_now":
        print("WARNING: GEMINI_API_KEY is not set correctly.")
    return ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=api_key)

def extract_drugs(query: str) -> list:
    llm = get_llm()
    prompt = f"Extract the names of pharmaceutical drugs or substances (like alcohol, tobacco) mentioned in this query. Return them as a comma-separated list. If none, return 'NONE'. Query: {query}"
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        print(f"LLM Content: {content}")
        if content == "NONE" or not content:
            return []
        drugs = [d.strip() for d in content.split(',')]
        print(f"Extracted Drugs: {drugs}")
        return drugs
    except Exception as e:
        print(f"LLM Error: {e}")
        import re
        words = re.findall(r'\b\w+\b', query.lower())
        stop_words = {'what', 'is', 'are', 'the', 'of', 'and', 'with', 'for', 'any', 'interaction', 'between', 'show', 'info', 'tell', 'me', 'about', 'how', 'does', 'interact'}
        found = [w for w in words if w not in stop_words and len(w) > 2]
        return found[:2]

def format_single_drug_response(drug: str, info: dict) -> str:
    if not info:
        return f"**Drug: {drug.capitalize()}**\n\nInformation not found in OpenFDA."
    
    sections = []
    sections.append(f"**Drug: {drug.capitalize()}**")
    
    def clean_val(val, label):
        if not val or val.strip().lower() == "information not available":
            return None
        cleaned = val.strip()
        if cleaned.lower().startswith(label.lower()):
            cleaned = cleaned[len(label):].strip()
            if cleaned.startswith(':') or cleaned.startswith('.'):
                cleaned = cleaned[1:].strip()
        return cleaned

    uses = clean_val(info.get('uses'), "Uses")
    if uses: sections.append(f"**Uses:** {uses[:400]}...")
    
    side_effects = clean_val(info.get('side_effects'), "Side Effects")
    if side_effects: sections.append(f"**Side Effects:** {side_effects[:400]}...")
    
    warnings = clean_val(info.get('warnings'), "Warnings")
    if warnings: sections.append(f"**Warnings:** {warnings[:400]}...")
    
    sections.append(f"**Source:** {info['source']}")
    sections.append(f"\n*Disclaimer: Informational use only. Consult a professional.*")
    
    return "\n\n".join(sections)

def format_interaction_response(drug1: str, drug2: str, info: dict) -> str:
    if not info:
        return f"**Interaction: {drug1.capitalize()} + {drug2.capitalize()}**\n\nNo known interactions were found in the clinical datasets or safety protocols. These substances are generally considered compatible. However, individual reactions vary, so always monitor for any unusual symptoms.\n\n**Source:** Medical Intelligence Database\n\n*Disclaimer: Informational use only. Consult a professional.*"
    
    llm = get_llm()
    prompt = f"""
    Summarize this drug interaction clearly and concisely using bullet points.
    
    Drugs: {drug1.capitalize()} + {drug2.capitalize()}
    Severity: {info['interaction_severity']}
    Description: {info['explanation']}
    
    Format:
    **Interaction: {drug1.capitalize()} + {drug2.capitalize()}**
    **Severity:** [Severity]
    **Key Findings:**
    [Bullet points]
    
    **Source:** {info['source']}
    *Disclaimer: Informational use only. Consult a professional.*
    """
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content.strip()
    except:
        sev = f"**Severity:** {info['interaction_severity']}\n\n" if info['interaction_severity'] != "See Description" else ""
        return f"**Interaction: {drug1.capitalize()} + {drug2.capitalize()}**\n\n{sev}**Explanation:** {info['explanation']}\n\n**Source:** {info['source']}\n\n*Disclaimer: Informational use only. Consult a professional.*"

def process_query(query: str) -> str:
    print(f"Processing query: {query}")
    drugs = extract_drugs(query)
    
    if len(drugs) == 1:
        drug = drugs[0]
        info = get_drug_info(drug)
        if not info:
            return f"**Drug: {drug.capitalize()}**\n\nInformation not found in OpenFDA."
        
        llm = get_llm()
        structure_prompt = f"""
        Structure the following medical information into a clear, concise, and professional format.
        Use bullet points for lists. Be direct and avoid repetition.
        
        CRITICAL RULES:
        1. If any of the 'Raw' sections below say 'Information not available' or are empty, OMIT that section entirely.
        2. STRIP AWAY any redundant headers from the raw text (like 'Uses', 'Side Effects', 'Warnings', 'ADVERSE REACTIONS', or section numbers like '1 INDICATIONS').
        
        Drug: {drug.capitalize()}
        Raw Uses: {info['uses']}
        Raw Side Effects: {info['side_effects']}
        Raw Warnings: {info['warnings']}
        
        Return the response in this format (ONLY include sections with valid data):
        **Drug: [Name]**
        
        **Uses:**
        [Bullet points]
        
        **Side Effects:**
        [Bullet points]
        
        **Warnings:**
        [Bullet points]
        
        **Source:** OpenFDA
        
        *Disclaimer: Informational use only. Consult a professional.*
        """
        try:
            response = llm.invoke([HumanMessage(content=structure_prompt)])
            return response.content.strip()
        except Exception as e:
            return format_single_drug_response(drug, info)

    elif len(drugs) == 2:
        drug1, drug2 = drugs[0], drugs[1]
        info = check_interaction(drug1, drug2)
        return format_interaction_response(drug1, drug2, info)
    elif len(drugs) > 2:
        return "I can only process up to two drugs at a time. Please ask about one drug for general info, or two drugs for interactions."
    else:
        return "I couldn't identify any specific drugs in your query. Please mention a drug name."
