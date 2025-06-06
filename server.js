const express = require('express');
const cors = require('cors');
const stringSimilarity = require('string-similarity');

const app = express();
const PORT = 3000;

app.use(cors());

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
  "qatar": "Qatar", "romania": "Roumanie", "russia": "Russie", "rwanda": "Rwanda",
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

const colors = ["noire", "blanche", "rouge", "bleu", "jaune", "verte", "grise", "violette", "orange", "emeraude"];
const animals = ["chat", "chien", "éléphant", "lion", "tigre", "singe", "poisson", "oiseau", "serpent", "grenouille"];
const objects = ["voiture", "maison", "livre", "stylo", "ordinateur", "chaise", "table", "montre", "lampe", "téléphone"];

let lastResult = "";

function shuffleArray(arr) {
  for (let i = arr.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

app.get('/pays', (req, res) => {
  const input = req.query.input?.toLowerCase()?.trim();
  if (!input) {
    return res.status(400).send("Paramètre 'input' manquant");
  }

  const keys = Object.keys(countryMap);
  const { bestMatch } = stringSimilarity.findBestMatch(input, keys);
  let detected = countryMap[bestMatch.target] || null;

  // Exclure Israël
  if (detected && detected.toLowerCase().includes("israël")) {
    detected = null;
  }
  if (!detected) {
    return res.status(404).send("Pays non trouvé");
  }

  // Lettre initiale
  const firstLetter = detected[0].toLowerCase();

  // Filtrer pays par initiale (exclure Israël)
  const countriesByLetter = Object.values(countryMap).filter(c => 
    c.toLowerCase().startsWith(firstLetter) && !c.toLowerCase().includes("israël")
  );

  // Filtrer couleurs, animaux et objets par initiale (si possible)
  const filteredColors = colors.filter(w => w[0].toLowerCase() === firstLetter);
  const filteredAnimals = animals.filter(w => w[0].toLowerCase() === firstLetter);
  const filteredObjects = objects.filter(w => w[0].toLowerCase() === firstLetter);

  // S'il n'y a pas assez de mots pour le mélange, on complète avec des mots aléatoires
  function takeOrRandom(arr, n) {
    if (arr.length >= n) return arr.slice(0, n);
    const copy = [...arr];
    while (copy.length < n) {
      copy.push(arr[Math.floor(Math.random() * arr.length)]);
    }
    return copy;
  }

  const mixCountries = takeOrRandom(countriesByLetter, 3);
  const mixColors = takeOrRandom(filteredColors.length ? filteredColors : colors, 2);
  const mixAnimals = takeOrRandom(filteredAnimals.length ? filteredAnimals : animals, 2);
  const mixObjects = takeOrRandom(filteredObjects.length ? filteredObjects : objects, 2);

  // Créer la liste finale et mélanger
  let finalList = [...mixCountries, ...mixColors, ...mixAnimals, ...mixObjects];
  finalList = shuffleArray(finalList);

  // On s'assure que le pays détecté soit dans la liste
  if (!finalList.includes(detected)) {
    finalList[0] = detected;
  }

  lastResult = `${detected} : ${finalList.join(", ")}`;

  res.json({
    detected,
    list: finalList
  });
});

app.get('/final', (req, res) => {
  if (!lastResult) {
    return res.status(404).send("Aucun résultat généré pour l'instant");
  }
  res.type('text/plain').send(lastResult);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
