const express = require('express');
const cors = require('cors');
const stringSimilarity = require('string-similarity');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- Data ---

// Country dictionary (key: English lowercase, value: French name)
const countryMap = {
  "afghanistan": "Afghanistan", "albania": "Albanie", "algeria": "Algérie", "andorra": "Andorre", "angola": "Angola",
  "argentina": "Argentine", "armenia": "Arménie", "australia": "Australie", "austria": "Autriche", "azerbaijan": "Azerbaïdjan",
  "bahamas": "Bahamas", "bahrain": "Bahreïn", "bangladesh": "Bangladesh", "barbados": "Barbade", "belarus": "Biélorussie",
  "belgium": "Belgique", "belize": "Belize", "benin": "Bénin", "bhutan": "Bhoutan", "bolivia": "Bolivie",
  "bosnia": "Bosnie-Herzégovine", "botswana": "Botswana", "brazil": "Brésil", "brunei": "Brunei", "bulgaria": "Bulgarie",
  "burkina faso": "Burkina Faso", "burundi": "Burundi", "cambodia": "Cambodge", "cameroon": "Cameroun", "canada": "Canada",
  "cape verde": "Cap-Vert", "central african republic": "République centrafricaine", "chad": "Tchad", "chile": "Chili",
  "china": "Chine", "colombia": "Colombie", "comoros": "Comores", "congo": "Congo", "costa rica": "Costa Rica",
  "croatia": "Croatie", "cuba": "Cuba", "cyprus": "Chypre", "czech republic": "République tchèque",
  "denmark": "Danemark", "djibouti": "Djibouti", "dominica": "Dominique", "dominican republic": "République dominicaine",
  "ecuador": "Équateur", "egypt": "Égypte", "el salvador": "Salvador", "equatorial guinea": "Guinée équatoriale",
  "eritrea": "Érythrée", "estonia": "Estonie", "eswatini": "Eswatini", "ethiopia": "Éthiopie", "fiji": "Fidji",
  "finland": "Finlande", "france": "France", "gabon": "Gabon", "gambia": "Gambie", "georgia": "Géorgie",
  "germany": "Allemagne", "ghana": "Ghana", "greece": "Grèce", "grenada": "Grenade", "guatemala": "Guatemala",
  "guinea": "Guinée", "guinea-bissau": "Guinée-Bissau", "guyana": "Guyana", "haiti": "Haïti", "honduras": "Honduras",
  "hungary": "Hongrie", "iceland": "Islande", "india": "Inde", "indonesia": "Indonésie", "iran": "Iran", "iraq": "Irak",
  "ireland": "Irlande", "israel": "Israël", "italy": "Italie", "jamaica": "Jamaïque", "japan": "Japon", "jordan": "Jordanie",
  "kazakhstan": "Kazakhstan", "kenya": "Kenya", "kiribati": "Kiribati", "kuwait": "Koweït", "kyrgyzstan": "Kirghizistan",
  "laos": "Laos", "latvia": "Lettonie", "lebanon": "Liban", "lesotho": "Lesotho", "liberia": "Libéria", "libya": "Libye",
  "liechtenstein": "Liechtenstein", "lithuania": "Lituanie", "luxembourg": "Luxembourg", "madagascar": "Madagascar",
  "malawi": "Malawi", "malaysia": "Malaisie", "maldives": "Maldives", "mali": "Mali", "malta": "Malte",
  "marshall islands": "Îles Marshall", "mauritania": "Mauritanie", "mauritius": "Maurice", "mexico": "Mexique",
  "micronesia": "Micronésie", "moldova": "Moldavie", "monaco": "Monaco", "mongolia": "Mongolie", "montenegro": "Monténégro",
  "morocco": "Maroc", "mozambique": "Mozambique", "myanmar": "Myanmar", "namibia": "Namibie", "nepal": "Népal",
  "netherlands": "Pays-Bas", "new zealand": "Nouvelle-Zélande", "nicaragua": "Nicaragua", "niger": "Niger", "nigeria": "Nigéria",
  "north korea": "Corée du Nord", "north macedonia": "Macédoine du Nord", "norway": "Norvège", "oman": "Oman",
  "pakistan": "Pakistan", "palau": "Palaos", "panama": "Panama", "papua new guinea": "Papouasie-Nouvelle-Guinée",
  "paraguay": "Paraguay", "peru": "Pérou", "philippines": "Philippines", "poland": "Pologne", "portugal": "Portugal",
  "qatar": "Qatar", "québec": "Québec", "romania": "Roumanie", "russia": "Russie", "rwanda": "Rwanda",
  "saint kitts and nevis": "Saint-Christophe-et-Niévès", "saint lucia": "Sainte-Lucie",
  "saint vincent and the grenadines": "Saint-Vincent-et-les-Grenadines", "samoa": "Samoa", "san marino": "Saint-Marin",
  "sao tome and principe": "Sao Tomé-et-Principe", "saudi arabia": "Arabie saoudite", "senegal": "Sénégal", "serbia": "Serbie",
  "seychelles": "Seychelles", "sierra leone": "Sierra Leone", "singapore": "Singapour", "slovakia": "Slovaquie",
  "slovenia": "Slovénie", "solomon islands": "Îles Salomon", "somalia": "Somalie", "south africa": "Afrique du Sud",
  "south korea": "Corée du Sud", "south sudan": "Soudan du Sud", "spain": "Espagne", "sri lanka": "Sri Lanka",
  "sudan": "Soudan", "suriname": "Suriname", "sweden": "Suède", "switzerland": "Suisse", "syria": "Syrie",
  "taiwan": "Taïwan", "tajikistan": "Tadjikistan", "tanzania": "Tanzanie", "thailand": "Thaïlande",
  "timor-leste": "Timor oriental", "togo": "Togo", "tonga": "Tonga", "trinidad and tobago": "Trinité-et-Tobago",
  "tunisia": "Tunisie", "turkey": "Turquie", "turkmenistan": "Turkménistan", "tuvalu": "Tuvalu", "uganda": "Ouganda",
  "ukraine": "Ukraine", "united arab emirates": "Émirats arabes unis", "united kingdom": "Royaume-Uni",
  "united states": "États-Unis", "uruguay": "Uruguay", "uzbekistan": "Ouzbékistan", "vanuatu": "Vanuatu",
  "vatican city": "Vatican", "venezuela": "Venezuela", "vietnam": "Viêt Nam", "yemen": "Yémen", "zambia": "Zambie",
  "zimbabwe": "Zimbabwe"
};

// Colors, animals and objects mapped by first letter (French)
const wordCategories = {
  // Countries, Colors, Animals, Objects - mixed by letter
  A: ["Algérie", "Ananas", "Autruche", "Ambre"], // Exemple, tu ajoutes d'autres
  B: ["Belgique", "Bleu", "Baleine", "Boussole"],
  C: ["Canada", "Cyan", "Chat", "Clé"],
  D: ["Danemark", "Doré", "Dauphin", "Dé"],
  E: ["Espagne", "Émeraude", "Éléphant", "Écharpe"],
  F: ["France", "Fuchsia", "Faucon", "Fleur"],
  G: ["Grèce", "Gris", "Girafe", "Guitare"],
  H: ["Hongrie", "Héliotrope", "Hérisson", "Hamac"],
  I: ["Inde", "Ivoire", "Impala", "Igloo"],
  J: ["Japon", "Jade", "Jaguar", "Jumelles"],
  K: ["Kenya", "Kaki", "Koala", "Klaxon"],
  L: ["Liban", "Lavande", "Lézard", "Lampe"],
  M: ["Maroc", "Mauve", "Manchot", "Miroir"],
  N: ["Niger", "Noir", "Narval", "Nappe"],
  O: ["Oman", "Orange", "Ours", "Oreille"],
  P: ["Portugal", "Pourpre", "Panda", "Parapluie"],
  Q: ["Québec", "Quartz", "Quetzal", "Queue"],
  R: ["Roumanie", "Rouge", "Renard", "Robe"],
  S: ["Suède", "Sable", "Serpent", "Soleil"],
  T: ["Tunisie", "Turquoise", "Tortue", "Table"], // On exclut Tunisie lors de la génération
  U: ["Ukraine", "Ultramarine", "Urubu", "Urne"],
  V: ["Vietnam", "Violet", "Vautour", "Voiture"],
  W: ["Washington", "Wasabi", "Wapiti", "Wagon"],
  X: ["Xiamen", "Xérès", "Xérus", "Xylophone"],
  Y: ["Yémen", "Yaourt", "Yack", "Yoyo"],
  Z: ["Zambie", "Zinnia", "Zèbre", "Zéro"]
};

// To exclude detected country and "Tunisie"
const excludeWords = ["Tunisie", "tunisie"];

// Memory for last generated list
let lastGeneratedList = "";

// Helper: find best country match (fuzzy)
function detectCountry(input) {
  if (!input) return null;
  const inputLower = input.toLowerCase();

  // Try exact match first
  if (countryMap[inputLower]) return countryMap[inputLower];

  // Try fuzzy match by similarity
  const keys = Object.keys(countryMap);
  let bestMatch = null;
  let bestScore = 0;

  for (const key of keys) {
    const score = stringSimilarity.compareTwoStrings(inputLower, key);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  // Threshold to accept match
  if (bestScore > 0.5) return countryMap[bestMatch];

  return null;
}

// Helper: choose one unique word from category by letter excluding banned words and used words
function pickUniqueWord(letter, usedWords, detectedCountry) {
  const uppercaseLetter = letter.toUpperCase();

  const possibleWords = wordCategories[uppercaseLetter]?.filter(w =>
    !excludeWords.includes(w) &&
    w.toLowerCase() !== detectedCountry.toLowerCase() &&
    !usedWords.includes(w)
  );

  if (!possibleWords || possibleWords.length === 0) {
    // fallback: return letter itself if no word found
    return letter;
  }

  // Pick random word from possibleWords
  const choice = possibleWords[Math.floor(Math.random() * possibleWords.length)];
  return choice;
}

// API endpoint to receive input country (plain text param "input")
app.get('/pays', (req, res) => {
  const input = req.query.input;

  if (!input) {
    return res.status(400).send("Missing 'input' query parameter");
  }

  // Detect and translate country
  let detectedCountry = detectCountry(input);

  if (!detectedCountry) {
    return res.status(404).send("Pays non reconnu");
  }

  // Special rule for Qatar => Québec as first letter
  if (detectedCountry.toLowerCase() === "qatar") {
    detectedCountry = "Qatar"; // Keep normal for now
  }

  // Generate list based on detected country letters
  const letters = detectedCountry.normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(""); // remove accents for matching keys

  let usedWords = [];
  let resultList = [];

  // If country is Qatar, first letter "Q" must be Québec
  if (detectedCountry.toLowerCase() === "qatar") {
    resultList.push("Québec");
    usedWords.push("Québec");
    letters.shift(); // remove first Q from letters since Québec added
  }

  for (const letter of letters) {
    // Special letters rules
    if (letter.toUpperCase() === "W") {
      resultList.push("Washington");
      usedWords.push("Washington");
      continue;
    }
    if (letter.toUpperCase() === "X") {
      resultList.push("Xiamen");
      usedWords.push("Xiamen");
      continue;
    }

    // Pick unique word for letter
    const word = pickUniqueWord(letter, usedWords, detectedCountry);
    resultList.push(word);
    usedWords.push(word);
  }

  // Save last generated list (join with commas)
  lastGeneratedList = resultList.join(", ");

  // Respond 204 No Content
  return res.status(204).send();
});

// Endpoint to get the last generated list as plain text
app.get('/final', (req, res) => {
  if (!lastGeneratedList) {
    return res.status(204).send("No data generated yet");
  }
  res.type('text/plain');
  return res.send(lastGeneratedList);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
