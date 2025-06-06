const express = require('express');
const cors = require('cors');
const stringSimilarity = require('string-similarity');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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

let lastResult = null;

app.use(cors());
app.use(express.json());

// Endpoint GET qui calcule et stocke le résultat (ne renvoie rien)
app.get('/api/calc-result', (req, res) => {
  const total = parseInt(req.query.total, 10);
  if (isNaN(total)) {
    return res.status(400).send('Paramètre total manquant ou non valide');
  }

  // Exemple : chercher un pays dont la longueur du nom correspond au total
  const found = Object.entries(countryMap)
    .filter(([key]) => key !== 'israel')  // exclure israel
    .find(([_, name]) => name.length === total);

  if (!found) {
    lastResult = `Aucun pays trouvé avec une longueur de nom égale à ${total}.`;
  } else {
    const [key, name] = found;
    lastResult = `Résultat pour total ${total} : pays trouvé - ${name}`;
  }

  return res.status(204).send();
});

// Endpoint GET qui renvoie le dernier résultat stocké
app.get('/api/get-result', (req, res) => {
  if (!lastResult) {
    return res.status(404).send('Aucun résultat calculé pour le moment.');
  }
  res.set('Content-Type', 'text/plain');
  return res.send(lastResult);
});

app.listen(PORT, () => {
  console.log(`API listening at http://localhost:${PORT}`);
});
