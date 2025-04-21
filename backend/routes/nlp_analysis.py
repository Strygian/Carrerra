import sys
import json
import spacy
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer

nlp = spacy.load("en_core_web_sm")

def extract_keywords(text):
    """Extracts important keywords using NLP and TF-IDF."""
    doc = nlp(text)
    words = [token.text.lower() for token in doc if token.is_alpha and not token.is_stop]
    
    # TF-IDF Ranking
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform([" ".join(words)])
    feature_names = vectorizer.get_feature_names_out()

    scores = tfidf_matrix.toarray()[0]
    ranked_keywords = sorted(zip(feature_names, scores), key=lambda x: x[1], reverse=True)

    return [kw[0] for kw in ranked_keywords[:10]]  # Top 10 keywords

def evaluate_structure(text):
    """Scores the resume based on detected sections."""
    sections = ["Summary", "Skills", "Experience", "Education"]
    found_sections = [section for section in sections if section.lower() in text.lower()]
    return (len(found_sections) / len(sections)) * 10  # Score out of 10

def check_missing_sections(text):
    """Detects missing sections using NLP."""
    sections = ["Summary", "Skills", "Experience", "Education"]
    return [section for section in sections if section.lower() not in text.lower()]

def analyze_resume(text):
    """Runs full analysis on the resume text."""
    keywords = extract_keywords(text)
    structure_score = evaluate_structure(text)
    missing_sections = check_missing_sections(text)

    return json.dumps({
        "keywords": keywords,
        "structureScore": structure_score,
        "missingSections": missing_sections
    })

if __name__ == "__main__":
    import sys
    text_input = sys.stdin.read()  # Read text from stdin
    print(analyze_resume(text_input))
