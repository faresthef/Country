from flask import Flask, request, jsonify
from fuzzywuzzy import process
import os

app = Flask(__name__)

# Liste des pays traduits en français
countries = {
    "Germany": "Allemagne", "Spain": "Espagne", "France": "France", "Qatar": "Québec",
    "China": "Chine", "Canada": "Canada", "Mexico": "Mexique", "Japan": "Japon", "India": "Inde",
    "Russia": "Fédération de Russie", "Brazil": "Brésil", "Turkey": "Turquie", "Ukraine": "Ukraine",
    "South Africa": "Afrique du Sud", "Morocco": "Maroc", "Portugal": "Portugal", "Norway": "Norvège",
    "Romania": "Roumanie", "Sweden": "Suède", "Pakistan": "Pakistan", "Argentina": "Argentine",
    "Tunisia": "Tunisie", "Saudi Arabia": "Arabie Saoudite", "Washington": "Washington", "Xiamen": "Xiamen"
}

def detect_and_translate(country_name):
    """Détecte et corrige le pays mal écrit, puis le traduit en français."""
    match, score = process.extractOne(country_name, countries.keys())
    detected_country = match if score > 80 else "Pays inconnu"
    
    # Exclure Israël
    if detected_country.lower() == "israel":
        return "Pays inconnu"

    return countries.get(detected_country, "Pays inconnu")

def generate_country_list(translated_country):
    """Génère une liste de pays où chaque pays commence par une lettre du pays traduit."""
    letters = [char.upper() for char in translated_country if char.isalpha()]
    unique_countries = []
    used_letters = set()

    for letter in letters:
        if letter in used_letters:
            continue  # Évite les doublons
        used_letters.add(letter)

        if letter == "W":
            unique_countries.append("Washington")
        elif letter == "X":
            unique_countries.append("Xiamen")
        else:
            for country in countries.values():
                if country[0].upper() == letter and country not in unique_countries:
                    unique_countries.append(country)
                    break

    return unique_countries

@app.route('/mentalism', methods=['POST'])
def mentalism():
    """API permettant de détecter le pays et générer une liste basée sur ses lettres."""
    data = request.get_json()
    if not data or "country" not in data:
        return jsonify({"error": "Invalid JSON format"}), 400

    country_input = data.get("country", "")
    translated_country = detect_and_translate(country_input)
    generated_list = generate_country_list(translated_country)

    # Convertir la liste en texte pour MysterySmith
    list_as_text = ", ".join(generated_list)

    return jsonify({
        "translated_country": translated_country,
        "generated_list": generated_list,
        "formatted_list": list_as_text  # Ajout pour MysterySmith
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
