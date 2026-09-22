import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Home, Gift, Link2, HandHeart, User, Search, MapPin, Sparkles, Check,
  X, BarChart3, Compass, ArrowRight, ArrowLeft, Mail,
  Phone, Lock, Globe2, CalendarClock, Settings, LogOut, ChevronRight,
  Eye, EyeOff, RefreshCw, PartyPopper, Bell, DollarSign, Clock, Package,
  Heart, ShieldCheck, ChevronDown, Sun, Moon, Users, UserPlus,
} from "lucide-react";
import { EXTRA_ORGS } from "./organizations.js";
import { US_CITIES_BY_STATE, US_STATES } from "./usCities.js";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase.js";

/*
  ShareCompass v2, a worldwide giving platform.

  HONESTY / BACKEND NOTES
   - Orgs with real:true are real, verifiable nonprofits (focus & domains accurate;
     figures illustrative). demo:true entries are illustrative individual requests.
   - Verification, payments, and persistence are SIMULATED in-file. Real builds call
     an auth provider (Firebase/Twilio), a processor (Stripe), and a DB. Every seam is
     marked "// BACKEND:". No browser storage is used; state lives for the session.
   - Real organizations use a preview of their official website plus the site's logo.
     Generated artwork remains available as a resilient fallback if a remote asset fails.
*/

// ---------- Palette: deep, warm, moody (more depth than the bright v3) ----------
const C = {
  bg:     "var(--sc-bg)",
  paper:  "var(--sc-paper)",
  paper2: "var(--sc-paper-2)",
  card:   "var(--sc-card)",
  line:   "var(--sc-line)",
  line2:  "var(--sc-line-2)",
  cream:  "var(--sc-text)",
  mute:   "var(--sc-muted)",
  faint:  "var(--sc-faint)",
  rust:   "#D2683C",   // urgent / primary accent (warmer, richer)
  ember:  "#E08A4B",   // accent light
  pine:   "#6BA88C",   // positive / give
  gold:   "#D9A441",   // matches / highlight
  slate:  "#6E92AC",   // info
};

const THEMES = {
  dark: { "--sc-bg": "#191512", "--sc-paper": "#211C18", "--sc-paper-2": "#2B2420", "--sc-card": "#2F2823", "--sc-line": "#3D342D", "--sc-line-2": "#4A3F37", "--sc-text": "#EFE7DA", "--sc-muted": "#A99C8D", "--sc-faint": "#7C7064", outer: "#14100D", shadow: "rgba(0,0,0,.6)" },
  light: { "--sc-bg": "#F4EFE7", "--sc-paper": "#FBF8F2", "--sc-paper-2": "#F0E8DC", "--sc-card": "#FFFDF9", "--sc-line": "#DED2C3", "--sc-line-2": "#CDBEAD", "--sc-text": "#2A211B", "--sc-muted": "#6E6257", "--sc-faint": "#918477", outer: "#E9DFD2", shadow: "rgba(78,55,38,.2)" },
};

// Cause -> accent + a two-color scene gradient for generated cover art
const CAUSE = {
  Disaster:  { c: C.rust,  g: ["#7A2E1A", "#D2683C"], tag: "Emergency response", image: "https://image.thum.io/get/width/700/crop/420/noanimate/https://teamrubiconusa.org" },
  Hunger:    { c: C.pine,  g: ["#274237", "#6BA88C"], tag: "Food and nutrition", image: "https://image.thum.io/get/width/700/crop/420/noanimate/https://feedingamerica.org" },
  Housing:   { c: C.slate, g: ["#2A3E4C", "#6E92AC"], tag: "Housing support", image: "https://image.thum.io/get/width/700/crop/420/noanimate/https://habitat.org" },
  Health:    { c: C.pine,  g: ["#26433A", "#5FA88E"], tag: "Medical care", image: "https://image.thum.io/get/width/700/crop/420/noanimate/https://directrelief.org" },
  Water:     { c: C.slate, g: ["#233A44", "#5C8FA6"], tag: "Clean water", image: "https://image.thum.io/get/width/700/crop/420/noanimate/https://water.org" },
  Children:  { c: C.rust,  g: ["#6E3320", "#E08A4B"], tag: "Children and families", image: "https://image.thum.io/get/width/700/crop/420/noanimate/https://savethechildren.org" },
  Refugees:  { c: C.gold,  g: ["#6B4E1C", "#D9A441"], tag: "Refugee support", image: "https://image.thum.io/get/width/700/crop/420/noanimate/https://rescue.org" },
  Education: { c: C.gold,  g: ["#5A4A22", "#D9A441"], tag: "Schools and learning", image: "https://image.thum.io/get/width/700/crop/420/noanimate/https://roomtoread.org" },
};
const GEO = {
  US: { name: "United States", dial: "+1", regions: US_STATES, cities: [] },
  CA: { name: "Canada", dial: "+1", regions: ["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Nova Scotia","Ontario","Prince Edward Island","Quebec","Saskatchewan","Northwest Territories","Nunavut","Yukon"], cities: ["Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa","Winnipeg","Quebec City","Hamilton","Halifax"] },
  GB: { name: "United Kingdom", dial: "+44", regions: ["England","Scotland","Wales","Northern Ireland"], cities: ["London","Manchester","Birmingham","Leeds","Glasgow","Liverpool","Bristol","Edinburgh","Cardiff","Belfast","Sheffield","Newcastle"] },
  IE: { name: "Ireland", dial: "+353", regions: ["Leinster","Munster","Connacht","Ulster"], cities: ["Dublin","Cork","Limerick","Galway","Waterford"] },
  FR: { name: "France", dial: "+33", regions: ["Île-de-France","Provence-Alpes-Côte d'Azur","Auvergne-Rhône-Alpes","Nouvelle-Aquitaine","Occitanie","Hauts-de-France","Grand Est","Brittany","Normandy","Pays de la Loire"], cities: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Bordeaux","Lille"] },
  DE: { name: "Germany", dial: "+49", regions: ["Baden-Württemberg","Bavaria","Berlin","Brandenburg","Bremen","Hamburg","Hesse","Lower Saxony","Mecklenburg-Vorpommern","North Rhine-Westphalia","Rhineland-Palatinate","Saarland","Saxony","Saxony-Anhalt","Schleswig-Holstein","Thuringia"], cities: ["Berlin","Munich","Hamburg","Cologne","Frankfurt","Stuttgart","Düsseldorf","Leipzig","Dortmund"] },
  ES: { name: "Spain", dial: "+34", regions: ["Andalusia","Catalonia","Madrid","Valencia","Galicia","Castile and León","Basque Country","Canary Islands","Castilla-La Mancha","Aragon"], cities: ["Madrid","Barcelona","Valencia","Seville","Zaragoza","Málaga","Bilbao","Granada"] },
  IT: { name: "Italy", dial: "+39", regions: ["Lombardy","Lazio","Campania","Sicily","Veneto","Piedmont","Emilia-Romagna","Tuscany","Apulia","Calabria"], cities: ["Rome","Milan","Naples","Turin","Palermo","Genoa","Bologna","Florence","Venice"] },
  PT: { name: "Portugal", dial: "+351", regions: ["Lisbon","Porto","Braga","Faro","Coimbra","Aveiro","Madeira","Azores"], cities: ["Lisbon","Porto","Braga","Coimbra","Faro","Funchal"] },
  NL: { name: "Netherlands", dial: "+31", regions: ["North Holland","South Holland","Utrecht","North Brabant","Gelderland","Overijssel","Limburg","Friesland"], cities: ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Groningen"] },
  BE: { name: "Belgium", dial: "+32", regions: ["Flanders","Wallonia","Brussels"], cities: ["Brussels","Antwerp","Ghent","Bruges","Liège"] },
  CH: { name: "Switzerland", dial: "+41", regions: ["Zurich","Geneva","Bern","Vaud","Basel","Ticino","Lucerne"], cities: ["Zurich","Geneva","Basel","Bern","Lausanne","Lucerne"] },
  SE: { name: "Sweden", dial: "+46", regions: ["Stockholm","Västra Götaland","Skåne","Uppsala","Östergötland"], cities: ["Stockholm","Gothenburg","Malmö","Uppsala","Västerås"] },
  NO: { name: "Norway", dial: "+47", regions: ["Oslo","Vestland","Rogaland","Trøndelag","Viken"], cities: ["Oslo","Bergen","Stavanger","Trondheim","Drammen"] },
  DK: { name: "Denmark", dial: "+45", regions: ["Capital Region","Central Denmark","Southern Denmark","Zealand","North Denmark"], cities: ["Copenhagen","Aarhus","Odense","Aalborg","Esbjerg"] },
  FI: { name: "Finland", dial: "+358", regions: ["Uusimaa","Pirkanmaa","Southwest Finland","North Ostrobothnia"], cities: ["Helsinki","Espoo","Tampere","Vantaa","Turku","Oulu"] },
  PL: { name: "Poland", dial: "+48", regions: ["Masovia","Lesser Poland","Silesia","Greater Poland","Lower Silesia","Pomerania"], cities: ["Warsaw","Kraków","Łódź","Wrocław","Poznań","Gdańsk"] },
  GR: { name: "Greece", dial: "+30", regions: ["Attica","Central Macedonia","Crete","Thessaly","Peloponnese"], cities: ["Athens","Thessaloniki","Patras","Heraklion","Larissa"] },
  RU: { name: "Russia", dial: "+7", regions: ["Moscow","Saint Petersburg","Novosibirsk Oblast","Sverdlovsk Oblast","Tatarstan"], cities: ["Moscow","Saint Petersburg","Novosibirsk","Yekaterinburg","Kazan"] },
  UA: { name: "Ukraine", dial: "+380", regions: ["Kyiv","Lviv","Kharkiv","Odesa","Dnipropetrovsk"], cities: ["Kyiv","Kharkiv","Odesa","Dnipro","Lviv"] },
  TR: { name: "Türkiye", dial: "+90", regions: ["Istanbul","Ankara","Izmir","Bursa","Antalya"], cities: ["Istanbul","Ankara","Izmir","Bursa","Antalya","Adana"] },
  NG: { name: "Nigeria", dial: "+234", regions: ["Lagos","Federal Capital Territory","Kano","Rivers","Oyo","Kaduna","Enugu","Anambra","Delta","Edo","Ogun","Borno"], cities: ["Lagos","Abuja","Kano","Ibadan","Port Harcourt","Benin City","Kaduna","Enugu","Onitsha"] },
  GH: { name: "Ghana", dial: "+233", regions: ["Greater Accra","Ashanti","Western","Central","Eastern","Northern"], cities: ["Accra","Kumasi","Tamale","Takoradi","Cape Coast"] },
  KE: { name: "Kenya", dial: "+254", regions: ["Nairobi","Mombasa","Kisumu","Nakuru","Uasin Gishu","Kiambu"], cities: ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika"] },
  ZA: { name: "South Africa", dial: "+27", regions: ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Free State","Limpopo","Mpumalanga","North West","Northern Cape"], cities: ["Johannesburg","Cape Town","Durban","Pretoria","Port Elizabeth","Bloemfontein"] },
  EG: { name: "Egypt", dial: "+20", regions: ["Cairo","Giza","Alexandria","Dakahlia","Sharqia"], cities: ["Cairo","Alexandria","Giza","Shubra El Kheima","Port Said"] },
  ET: { name: "Ethiopia", dial: "+251", regions: ["Addis Ababa","Oromia","Amhara","Tigray","SNNPR"], cities: ["Addis Ababa","Dire Dawa","Mekelle","Gondar","Bahir Dar"] },
  TZ: { name: "Tanzania", dial: "+255", regions: ["Dar es Salaam","Mwanza","Arusha","Dodoma","Mbeya"], cities: ["Dar es Salaam","Mwanza","Arusha","Dodoma","Zanzibar City"] },
  UG: { name: "Uganda", dial: "+256", regions: ["Central","Eastern","Northern","Western"], cities: ["Kampala","Gulu","Lira","Mbarara","Jinja"] },
  MA: { name: "Morocco", dial: "+212", regions: ["Casablanca-Settat","Rabat-Salé-Kénitra","Marrakesh-Safi","Fès-Meknès","Tangier-Tetouan"], cities: ["Casablanca","Rabat","Marrakesh","Fès","Tangier","Agadir"] },
  DZ: { name: "Algeria", dial: "+213", regions: ["Algiers","Oran","Constantine","Annaba","Blida"], cities: ["Algiers","Oran","Constantine","Annaba","Batna"] },
  SN: { name: "Senegal", dial: "+221", regions: ["Dakar","Thiès","Saint-Louis","Diourbel","Kaolack"], cities: ["Dakar","Thiès","Touba","Saint-Louis","Kaolack"] },
  CD: { name: "DR Congo", dial: "+243", regions: ["Kinshasa","Haut-Katanga","Nord-Kivu","Sud-Kivu","Kongo Central"], cities: ["Kinshasa","Lubumbashi","Goma","Bukavu","Kisangani"] },
  CN: { name: "China", dial: "+86", regions: ["Beijing","Shanghai","Guangdong","Sichuan","Zhejiang","Jiangsu","Hubei","Shandong"], cities: ["Shanghai","Beijing","Guangzhou","Shenzhen","Chengdu","Wuhan","Hangzhou"] },
  IN: { name: "India", dial: "+91", regions: ["Maharashtra","Delhi","Karnataka","Tamil Nadu","West Bengal","Uttar Pradesh","Gujarat","Rajasthan","Telangana","Kerala","Punjab","Bihar","Madhya Pradesh"], cities: ["Mumbai","Delhi","Bengaluru","Chennai","Kolkata","Hyderabad","Pune","Ahmedabad","Jaipur","Surat"] },
  PK: { name: "Pakistan", dial: "+92", regions: ["Punjab","Sindh","Khyber Pakhtunkhwa","Balochistan","Islamabad"], cities: ["Karachi","Lahore","Faisalabad","Rawalpindi","Islamabad","Peshawar"] },
  BD: { name: "Bangladesh", dial: "+880", regions: ["Dhaka","Chittagong","Khulna","Rajshahi","Sylhet"], cities: ["Dhaka","Chittagong","Khulna","Rajshahi","Sylhet"] },
  JP: { name: "Japan", dial: "+81", regions: ["Tokyo","Osaka","Kanagawa","Aichi","Hokkaido","Fukuoka","Kyoto"], cities: ["Tokyo","Yokohama","Osaka","Nagoya","Sapporo","Fukuoka","Kyoto"] },
  KR: { name: "South Korea", dial: "+82", regions: ["Seoul","Busan","Incheon","Gyeonggi","Daegu"], cities: ["Seoul","Busan","Incheon","Daegu","Daejeon","Gwangju"] },
  ID: { name: "Indonesia", dial: "+62", regions: ["Jakarta","West Java","East Java","Central Java","Bali","North Sumatra"], cities: ["Jakarta","Surabaya","Bandung","Medan","Semarang","Denpasar"] },
  PH: { name: "Philippines", dial: "+63", regions: ["Metro Manila","Cebu","Davao","Iloilo","Pampanga","Laguna"], cities: ["Manila","Quezon City","Cebu City","Davao City","Makati","Iloilo City"] },
  TH: { name: "Thailand", dial: "+66", regions: ["Bangkok","Chiang Mai","Phuket","Chon Buri","Nonthaburi"], cities: ["Bangkok","Nonthaburi","Chiang Mai","Phuket","Pattaya"] },
  VN: { name: "Vietnam", dial: "+84", regions: ["Hanoi","Ho Chi Minh City","Da Nang","Hai Phong","Can Tho"], cities: ["Ho Chi Minh City","Hanoi","Da Nang","Hai Phong","Can Tho"] },
  MY: { name: "Malaysia", dial: "+60", regions: ["Kuala Lumpur","Selangor","Johor","Penang","Sabah","Sarawak"], cities: ["Kuala Lumpur","George Town","Johor Bahru","Ipoh","Kuching","Kota Kinabalu"] },
  SG: { name: "Singapore", dial: "+65", regions: ["Central","East","North","North-East","West"], cities: ["Singapore"] },
  SA: { name: "Saudi Arabia", dial: "+966", regions: ["Riyadh","Makkah","Eastern Province","Madinah","Asir"], cities: ["Riyadh","Jeddah","Mecca","Medina","Dammam"] },
  AE: { name: "United Arab Emirates", dial: "+971", regions: ["Abu Dhabi","Dubai","Sharjah","Ajman","Ras Al Khaimah"], cities: ["Dubai","Abu Dhabi","Sharjah","Al Ain","Ajman"] },
  IL: { name: "Israel", dial: "+972", regions: ["Tel Aviv","Jerusalem","Haifa","Central","Southern"], cities: ["Jerusalem","Tel Aviv","Haifa","Rishon LeZion","Be'er Sheva"] },
  IR: { name: "Iran", dial: "+98", regions: ["Tehran","Isfahan","Fars","Khorasan Razavi","East Azerbaijan"], cities: ["Tehran","Mashhad","Isfahan","Shiraz","Tabriz"] },
  IQ: { name: "Iraq", dial: "+964", regions: ["Baghdad","Basra","Nineveh","Erbil","Najaf"], cities: ["Baghdad","Basra","Mosul","Erbil","Najaf"] },
  AU: { name: "Australia", dial: "+61", regions: ["New South Wales","Victoria","Queensland","Western Australia","South Australia","Tasmania","Australian Capital Territory","Northern Territory"], cities: ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Canberra","Hobart","Darwin"] },
  NZ: { name: "New Zealand", dial: "+64", regions: ["Auckland","Wellington","Canterbury","Waikato","Otago"], cities: ["Auckland","Wellington","Christchurch","Hamilton","Dunedin"] },
  BR: { name: "Brazil", dial: "+55", regions: ["São Paulo","Rio de Janeiro","Minas Gerais","Bahia","Paraná","Rio Grande do Sul","Pernambuco","Ceará"], cities: ["São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Recife","Curitiba"] },
  MX: { name: "Mexico", dial: "+52", regions: ["Mexico City","Jalisco","Nuevo León","Puebla","Guanajuato","Veracruz"], cities: ["Mexico City","Guadalajara","Monterrey","Puebla","Tijuana","León"] },
  AR: { name: "Argentina", dial: "+54", regions: ["Buenos Aires","Córdoba","Santa Fe","Mendoza","Tucumán"], cities: ["Buenos Aires","Córdoba","Rosario","Mendoza","La Plata"] },
  CO: { name: "Colombia", dial: "+57", regions: ["Bogotá","Antioquia","Valle del Cauca","Atlántico","Santander"], cities: ["Bogotá","Medellín","Cali","Barranquilla","Cartagena"] },
  CL: { name: "Chile", dial: "+56", regions: ["Santiago Metropolitan","Valparaíso","Biobío","Araucanía","Antofagasta"], cities: ["Santiago","Valparaíso","Concepción","Antofagasta","Viña del Mar"] },
  PE: { name: "Peru", dial: "+51", regions: ["Lima","Arequipa","La Libertad","Piura","Cusco"], cities: ["Lima","Arequipa","Trujillo","Chiclayo","Cusco"] },
  VE: { name: "Venezuela", dial: "+58", regions: ["Capital District","Zulia","Miranda","Carabobo","Lara"], cities: ["Caracas","Maracaibo","Valencia","Barquisimeto","Maracay"] },
  JM: { name: "Jamaica", dial: "+1", regions: ["Kingston","St. Andrew","St. Catherine","Clarendon","Manchester"], cities: ["Kingston","Montego Bay","Spanish Town","Portmore","May Pen"] },
};

const COUNTRY_CODES = Object.keys(GEO);

// ---------- Orgs (real, worldwide). org.image left null -> generated cover art. ----------
const CORE_ORGS = [
  { id: 1, real: true, name: "Direct Relief", handle: "directrelief.org", loc: "Global", region: "global", country: "US",
    cause: "Health", urgent: true, types: ["Money", "Goods"], following: 24800, need: 95, image: null,
    blurb: "Delivers emergency medical aid and supplies to communities affected by disasters and poverty, without regard to ability to pay." },
  { id: 2, real: true, name: "World Central Kitchen", handle: "wck.org", loc: "Global", region: "global", country: "US",
    cause: "Hunger", urgent: true, types: ["Money", "Time"], following: 31200, need: 90, image: null,
    blurb: "Serves fresh meals to communities in the wake of natural disasters and humanitarian crises, on the front lines within hours." },
  { id: 3, real: true, name: "Habitat for Humanity", handle: "habitat.org", loc: "USA · Global", region: "national", country: "US",
    cause: "Housing", urgent: false, types: ["Money", "Time", "Goods"], following: 18900, need: 60, image: null,
    blurb: "Builds and repairs affordable homes alongside families, creating long-term stability and stronger communities." },
  { id: 4, real: true, name: "Feeding America", handle: "feedingamerica.org", loc: "USA", region: "national", country: "US",
    cause: "Hunger", urgent: false, types: ["Money", "Time"], following: 22100, need: 68, image: null,
    blurb: "The largest US hunger-relief network, supplying food banks and pantries that reach tens of millions of people each year." },
  { id: 5, real: true, name: "Americares", handle: "americares.org", loc: "Global", region: "global", country: "US",
    cause: "Disaster", urgent: true, types: ["Money", "Goods"], following: 9600, need: 88, image: null,
    blurb: "A health-focused relief organization responding to disasters and delivering medicine and supplies where they are needed most." },
  { id: 6, real: true, name: "charity: water", handle: "charitywater.org", loc: "Global", region: "global", country: "GB",
    cause: "Water", urgent: false, types: ["Money"], following: 15400, need: 55, image: null,
    blurb: "Funds clean and safe drinking water projects in communities without access, with 100% of public donations going to the field." },
  { id: 7, real: true, name: "Save the Children", handle: "savethechildren.org", loc: "Global", region: "global", country: "GB",
    cause: "Children", urgent: false, types: ["Money", "Time"], following: 20500, need: 64, image: null,
    blurb: "Protects children in crisis through health, education, and emergency programs across the world." },
  { id: 8, real: true, name: "International Rescue Committee", handle: "rescue.org", loc: "Global", region: "global", country: "US",
    cause: "Refugees", urgent: true, types: ["Money", "Time"], following: 12700, need: 82, image: null,
    blurb: "Helps people affected by conflict and disaster to survive, recover, and rebuild, from emergency aid to resettlement." },
  { id: 9, real: true, name: "Oxfam", handle: "oxfam.org", loc: "Global", region: "global", country: "GB",
    cause: "Hunger", urgent: false, types: ["Money", "Time"], following: 17600, need: 58, image: null,
    blurb: "Works worldwide to fight inequality and end poverty and injustice, from clean water to emergency food response." },
  { id: 10, real: true, name: "BRAC", handle: "brac.net", loc: "Bangladesh · Africa", region: "global", country: "BD",
    cause: "Education", urgent: false, types: ["Money", "Time"], following: 8300, need: 61, image: null,
    blurb: "One of the world's largest development organizations, running schools, microfinance, and health programs across the Global South." },
  { id: 11, real: true, name: "UNICEF", handle: "unicef.org", loc: "Global", region: "global", country: "US",
    cause: "Children", urgent: true, types: ["Money", "Sponsor"], following: 40200, need: 86, image: null,
    blurb: "Works in over 190 countries to protect children's rights through health, nutrition, education, and emergency relief." },
  { id: 12, real: true, name: "Doctors Without Borders", handle: "msf.org", loc: "Global", region: "global", country: "FR",
    cause: "Health", urgent: true, types: ["Money"], following: 28900, need: 91, image: null,
    blurb: "Delivers emergency medical care to people affected by conflict, epidemics, and disasters, independent of politics." },
  { id: 99, demo: true, name: "Maria's Recovery Fund", handle: "community request", loc: "Florida, USA", region: "local", country: "US",
    cause: "Disaster", urgent: true, types: ["Money", "Goods"], following: 210, need: 78, image: null,
    blurb: "Home damaged in recent hurricane flooding. A neighbor-posted request for help with essential repairs and supplies." },
];

const addBrandAssets = (org) => {
  if (!org.real || !org.handle) return org;
  const website = org.website || `https://${org.handle}`;
  return {
    ...org,
    website,
    image: org.image || `https://image.thum.io/get/width/1000/crop/600/noanimate/${website}`,
    logo: org.logo || `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(website)}&sz=128`,
  };
};

const ORGS = [...CORE_ORGS, ...EXTRA_ORGS].map(addBrandAssets);

// ---------- Generated cover art (full-bleed scene per org; unique via name hash) ----------
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

function CoverArt({ org, height = 120, radius = 0 }) {
  const [assetFailed, setAssetFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const imageUrl = org.image || "";
  const logoUrl = org.logo || "";

  if (imageUrl && !assetFailed) {
    return <div style={{ height, borderRadius: radius, overflow: "hidden", position: "relative", background: CAUSE[org.cause].g[0] }}>
      <img src={imageUrl} alt={`${org.name} official website`} onError={() => setAssetFailed(true)}
        loading="lazy" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(16,13,11,.62), rgba(16,13,11,.08) 68%, rgba(16,13,11,.2))" }} />
      {logoUrl && !logoFailed && <div style={{ position: "absolute", left: 12, bottom: 10, width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,.96)", padding: 7, boxShadow: "0 5px 18px rgba(0,0,0,.28)", display: "grid", placeItems: "center" }}>
        <img src={logoUrl} alt={`${org.name} logo`} onError={() => setLogoFailed(true)} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
      </div>}
    </div>;
  }
  const meta = CAUSE[org.cause];
  const [c0, c1] = meta.g;
  const h = hashStr(org.name);
  const gid = "g" + org.id, motif = h % 4;
  return (
    <div style={{ height, borderRadius: radius, overflow: "hidden", position: "relative" }}>
      <svg width="100%" height={height} viewBox={`0 0 320 ${height}`} preserveAspectRatio="xMidYMid slice"
        style={{ display: "block" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c0} /><stop offset="1" stopColor={c1} />
          </linearGradient>
        </defs>
        <rect width="320" height={height} fill={`url(#${gid})`} />
        {/* layered translucent motifs give the scene depth */}
        {motif === 0 && <>
          <circle cx="250" cy={height * 0.3} r="52" fill="#fff" opacity=".08" />
          <circle cx="285" cy={height * 0.2} r="26" fill="#fff" opacity=".1" />
          <path d={`M0 ${height} Q80 ${height*0.55} 160 ${height*0.8} T320 ${height*0.7} V${height} Z`} fill="#000" opacity=".16" />
        </>}
        {motif === 1 && <>
          <path d={`M0 ${height} L70 ${height*0.4} L130 ${height} Z`} fill="#000" opacity=".18" />
          <path d={`M90 ${height} L180 ${height*0.28} L270 ${height} Z`} fill="#000" opacity=".12" />
          <path d={`M210 ${height} L285 ${height*0.5} L320 ${height*0.75} V${height} Z`} fill="#fff" opacity=".07" />
        </>}
        {motif === 2 && <>
          {[0,1,2,3,4,5].map(i => (
            <rect key={i} x={i*58} y={height - (18 + (hashStr(org.name+i)%Math.round(height*0.55)))}
              width="34" height={height} rx="3" fill={i%2? "#000":"#fff"} opacity={i%2? .14:.06} />
          ))}
        </>}
        {motif === 3 && <>
          <circle cx="60" cy={height*0.4} r="40" fill="#fff" opacity=".07" />
          <path d={`M0 ${height*0.75} C 80 ${height*0.55}, 160 ${height*0.9}, 320 ${height*0.6} L320 ${height} L0 ${height} Z`} fill="#000" opacity=".18" />
          <path d={`M0 ${height*0.85} C 90 ${height*0.7}, 180 ${height}, 320 ${height*0.78} L320 ${height} L0 ${height} Z`} fill="#000" opacity=".12" />
        </>}
      </svg>
    </div>
  );
}

// small square crest (kept for avatars in feed / detail)
function Crest({ org, size = 48, radius = 12 }) {
  const initials = org.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: radius, overflow: "hidden", flexShrink: 0, position: "relative" }}>
      <CoverArt org={org} height={size} radius={radius} />
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
        fontFamily: "inherit", fontWeight: 700, fontSize: size * 0.32, color: "#fff",
        textShadow: "0 1px 3px rgba(0,0,0,.4)" }}>{initials}</div>
    </div>
  );
}

// ---------- Match engine (explainable) ----------
function scoreMatch(g, o) {
  const w = { cause: 38, type: 22, region: 20, urgency: 12, local: 8 };
  const causes = g.causes || [], gives = g.gives || [], range = g.region2 || "global";
  let s = 0; const why = [];
  if (causes.includes(o.cause)) { s += w.cause; why.push("Shares your cause"); }
  else if (causes.length === 0) s += w.cause * 0.5;
  if (o.types.some((t) => gives.includes(t))) { s += w.type; why.push("Accepts what you give"); }
  if (range === "global" || range === o.region) { s += w.region; why.push("In your range"); }
  else s += w.region * 0.4;
  if (g.country && o.country === g.country) { s += w.local; why.push("Active in your country"); }
  s += o.urgent ? w.urgency : w.urgency * 0.6;
  if (o.urgent) why.push("Time-sensitive");
  s += (o.need / 100) * 5;
  return { score: Math.min(100, Math.round(s)), why: why.slice(0, 3) };
}

// ---------- Motion ----------
function MotionStyles() {
  return (<style>{`
    @keyframes sc-fade-up { from { opacity:0; transform:translateY(10px);} to {opacity:1; transform:none;} }
    @keyframes sc-slide-up { from { transform:translateY(100%);} to {transform:translateY(0);} }
    @keyframes sc-fade { from {opacity:0;} to {opacity:1;} }
    @keyframes sc-pop { 0%{opacity:0; transform:scale(.96);} 100%{opacity:1; transform:none;} }
    @keyframes sc-spin { to { transform:rotate(360deg);} }
    .sc-page { animation: sc-fade-up .32s ease both; }
    .sc-stagger > * { animation: sc-fade-up .34s ease both; }
    .sc-stagger > *:nth-child(1){animation-delay:.03s}
    .sc-stagger > *:nth-child(2){animation-delay:.08s}
    .sc-stagger > *:nth-child(3){animation-delay:.13s}
    .sc-stagger > *:nth-child(4){animation-delay:.18s}
    .sc-stagger > *:nth-child(5){animation-delay:.23s}
    .sc-sheet { animation: sc-slide-up .3s cubic-bezier(.32,.72,.35,1) both; }
    .sc-scrim { animation: sc-fade .2s ease both; }
    .sc-pop { animation: sc-pop .18s ease both; }
    .sc-menu { animation: sc-pop .14s ease both; }
    .sc-spin { animation: sc-spin 1s linear infinite; }
    .sc-tap { transition: transform .08s ease, filter .15s ease; }
    .sc-tap:active { transform: scale(.97); }
    .sc-hover:hover { filter: brightness(1.08); }
    ::-webkit-scrollbar { width: 0; height: 0; }
    @media (prefers-reduced-motion: reduce) {
      .sc-page,.sc-stagger>*,.sc-sheet,.sc-scrim,.sc-pop,.sc-menu { animation: none !important; }
    }
  `}</style>);
}

const inputStyle = { flex: 1, background: "transparent", border: "none", outline: "none", color: C.cream, fontSize: 15 };

// ---------- Autocomplete ----------
function Autocomplete({ icon: Icon, value, onChange, placeholder, options, autoFocus }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef(null);
  const q = (value || "").toLowerCase();
  const matches = (q ? options.filter((o) => o.toLowerCase().includes(q)) : options).slice(0, 8);
  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const pick = (v) => { onChange(v); setOpen(false); };
  return (
    <div ref={boxRef} style={{ position: "relative", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.paper2,
        border: "1.5px solid " + (open ? C.rust : C.line2), borderRadius: 10, padding: "13px 14px", transition: "border-color .15s" }}>
        {Icon && <Icon size={18} color={C.mute} />}
        <input style={inputStyle} value={value} placeholder={placeholder} autoFocus={autoFocus}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setHi(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(matches.length - 1, h + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
            else if (e.key === "Enter" && matches[hi]) { e.preventDefault(); pick(matches[hi]); }
            else if (e.key === "Escape") setOpen(false);
          }} />
        <ChevronDown size={16} color={C.mute} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </div>
      {open && matches.length > 0 && (
        <div className="sc-menu" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20,
          background: C.card, border: "1.5px solid " + C.line2, borderRadius: 12, overflow: "hidden",
          boxShadow: "0 16px 40px rgba(0,0,0,.5)", maxHeight: 260, overflowY: "auto" }}>
          {matches.map((o, i) => (
            <button key={o} onMouseEnter={() => setHi(i)} onClick={() => pick(o)}
              style={{ width: "100%", textAlign: "left", padding: "12px 14px", border: "none", cursor: "pointer",
                background: i === hi ? C.paper2 : "transparent", color: C.cream, fontSize: 14,
                borderBottom: i < matches.length - 1 ? "1px solid " + C.line : "none",
                display: "flex", alignItems: "center", gap: 9 }}>
              <MapPin size={14} color={C.mute} /> {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Splash ----------
function Splash({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%",
      background: `radial-gradient(120% 80% at 50% 0%, ${C.paper2}, ${C.bg})`,
      alignItems: "center", justifyContent: "center", gap: 22 }}>
      <div className="sc-pop" style={{ width: 96, height: 96, borderRadius: 26,
        background: `linear-gradient(135deg, ${C.rust}, ${C.ember})`, display: "grid", placeItems: "center",
        boxShadow: `0 12px 40px ${C.rust}66` }}>
        <Compass size={48} color="#fff" />
      </div>
      <div className="sc-pop" style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 25, color: C.cream }}>ShareCompass</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.mute, fontSize: 13 }}>
        <RefreshCw size={15} className="sc-spin" /> {label || "Loading…"}
      </div>
    </div>
  );
}

// ---------- Atoms ----------
function Meter({ value, size = 46 }) {
  const r = (size - 6) / 2, circ = 2 * Math.PI * r;
  const col = value >= 80 ? C.pine : value >= 55 ? C.gold : C.mute;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={C.line2} strokeWidth="4" fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={col} strokeWidth="4" fill="none"
          strokeDasharray={circ} strokeDashoffset={circ - (value/100)*circ} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
        fontFamily: "inherit", fontSize: size*0.3, fontWeight: 700, color: col }}>{value}</div>
    </div>
  );
}
function Tag({ cause }) {
  const m = CAUSE[cause];
  return <span style={{ fontSize: 11.5, fontWeight: 600, color: m.c, letterSpacing: .2 }}>{m.tag}</span>;
}
function Chip({ active, onClick, children, color }) {
  return <button onClick={onClick} className="sc-tap" style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
    border: "1.5px solid " + (active ? (color || C.rust) : C.line2), background: active ? (color || C.rust) : "transparent",
    color: active ? "#fff" : C.mute, cursor: "pointer", whiteSpace: "nowrap" }}>{children}</button>;
}
function SectionRule({ children }) {
  return <h3 style={{ fontFamily: "inherit", fontSize: 18, fontWeight: 750, color: C.cream, margin: "0 0 14px", letterSpacing: "-.02em" }}>{children}</h3>;
}
function FilterRow({ label, children }) {
  return <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 11, color: C.faint, marginBottom: 8, letterSpacing: 1 }}>{label.toUpperCase()}</div>
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>{children}</div>
  </div>;
}
function Toast({ msg }) {
  if (!msg) return null;
  return <div className="sc-pop" style={{ position: "absolute", bottom: 82, left: "50%", transform: "translateX(-50%)",
    background: C.cream, color: C.bg, padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
    zIndex: 45, boxShadow: "0 10px 30px rgba(0,0,0,.4)", whiteSpace: "nowrap" }}>{msg}</div>;
}

// ---------- Org card (with generated cover art header) ----------
function OrgCard({ org, match, following, onFollow, onOpen, primaryLabel = "Explore" }) {
  const m = CAUSE[org.cause];
  return (
    <article onClick={onOpen} className="sc-tap" style={{ background: C.card, border: "1px solid " + C.line,
      borderRadius: 16, overflow: "hidden", cursor: "pointer", position: "relative" }}>
      <div style={{ position: "relative" }}>
        <CoverArt org={org} height={104} />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          {org.urgent && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: 1,
            background: C.rust, padding: "3px 8px", borderRadius: 6, boxShadow: "0 2px 6px rgba(0,0,0,.3)" }}>URGENT</span>}
          {org.demo && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: .5,
            background: "rgba(0,0,0,.5)", padding: "3px 8px", borderRadius: 6 }}>DEMO REQUEST</span>}
        </div>
        {match && <div style={{ position: "absolute", top: 10, right: 10, background: C.card, borderRadius: "50%",
          padding: 3, boxShadow: "0 2px 8px rgba(0,0,0,.4)" }}><Meter value={match.score} size={42} /></div>}
      </div>
      <div style={{ padding: 15 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 17, color: C.cream }}>{org.name}</span>
          <Tag cause={org.cause} />
        </div>
        <div style={{ fontSize: 12, color: C.faint, display: "flex", alignItems: "center", gap: 5, margin: "4px 0 10px" }}>
          <MapPin size={11} /> {org.loc} · {org.handle}
        </div>
        <p style={{ fontSize: 13, color: C.mute, lineHeight: 1.55, margin: "0 0 12px" }}>{org.blurb}</p>
        {match && match.why.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            {match.why.map((r) => <span key={r} style={{ fontSize: 11.5, color: C.pine, display: "inline-flex", alignItems: "center", gap: 4 }}><Check size={12} /> {r}</span>)}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); onFollow(org.id); }} className="sc-tap"
            style={{ flex: 1, padding: "9px", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              border: "1.5px solid " + (following ? C.line2 : C.cream), background: following ? "transparent" : C.cream,
              color: following ? C.mute : C.bg }}>{following ? "Following" : "Follow"}</button>
          <button onClick={(e) => { e.stopPropagation(); onOpen(); }} className="sc-tap"
            style={{ flex: 1, padding: "9px", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              border: "none", background: m.c, color: "#fff" }}>{org.demo ? "Support" : primaryLabel}</button>
        </div>
      </div>
    </article>
  );
}

// ---------- Detail sheet (cover banner + give CTA -> donation flow) ----------
function DetailSheet({ org, match, following, onFollow, onClose, onGive }) {
  if (!org) return null;
  const m = CAUSE[org.cause];
  return (
    <div onClick={onClose} className="sc-scrim" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "flex-end", zIndex: 30 }}>
      <div onClick={(e) => e.stopPropagation()} className="sc-sheet" style={{ background: C.paper, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        width: "100%", maxHeight: "88%", overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ position: "relative" }}>
          <CoverArt org={org} height={150} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%",
            background: "rgba(0,0,0,.5)", border: "none", cursor: "pointer", display: "grid", placeItems: "center" }}><X size={18} color="#fff" /></button>
          {match && <div style={{ position: "absolute", bottom: -24, right: 18, background: C.paper, borderRadius: "50%", padding: 4, boxShadow: "0 4px 12px rgba(0,0,0,.4)" }}><Meter value={match.score} size={54} /></div>}
        </div>
        <div style={{ padding: "18px 20px 22px" }}>
          <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 23, color: C.cream }}>{org.name}</div>
          <div style={{ fontSize: 13, color: C.mute, display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}><MapPin size={12} /> {org.loc} · {org.handle}</div>
          {org.real && <div style={{ fontSize: 12, color: C.pine, display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}><ShieldCheck size={14} /> Official website listed</div>}
          {org.demo && <div style={{ fontSize: 12, color: C.mute, background: C.paper2, borderRadius: 8, padding: "8px 11px", marginTop: 10 }}>Illustrative community request, shown to demonstrate individual giving.</div>}
          {match && (
            <div style={{ border: "1px solid " + C.line, borderRadius: 12, padding: 14, margin: "16px 0", background: C.paper2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.gold, display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontFamily: "inherit" }}>
                <Sparkles size={14} /> Why this fits you · {match.score}%</div>
              {match.why.length ? match.why.map((r) => (
                <div key={r} style={{ fontSize: 13, color: C.mute, display: "flex", alignItems: "center", gap: 7, padding: "3px 0" }}><Check size={14} color={C.pine} /> {r}</div>
              )) : <div style={{ fontSize: 13, color: C.mute }}>Outside your current preferences. Adjust filters on Connect.</div>}
            </div>
          )}
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: C.cream, margin: "16px 0" }}>{org.blurb}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => onFollow(org.id)} className="sc-tap" style={{ flex: 1, padding: 14, borderRadius: 11, fontWeight: 700, fontSize: 14, cursor: "pointer",
              border: "1.5px solid " + (following ? C.line2 : C.cream), background: following ? "transparent" : C.cream, color: following ? C.mute : C.bg }}>
              {following ? "Following" : "Follow"}</button>
            <button onClick={() => onGive(org)} className="sc-tap" style={{ flex: 1.4, padding: 14, borderRadius: 11, fontWeight: 700, fontSize: 14, cursor: "pointer",
              border: "none", background: m.c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Heart size={16} /> {org.demo ? "Support this request" : "Visit & give"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Donation flow (amount -> frequency -> payment -> confirm) ----------
function GiveFlow({ org, onClose, onDone }) {
  const m = CAUSE[org.cause];
  const [stage, setStage] = useState(1);
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [freq, setFreq] = useState("once");
  const presets = [25, 50, 100, 250];
  const amt = custom ? Math.max(0, parseInt(custom.replace(/\D/g, "") || "0", 10)) : amount;

  const Header = ({ title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", background: C.paper2, borderBottom: "1px solid " + C.line }}>
      <button onClick={() => (stage > 1 ? setStage(stage - 1) : onClose())} style={{ background: "none", border: "none", cursor: "pointer" }}>
        <ArrowLeft size={20} color={C.cream} /></button>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 16, color: C.cream }}>{title}</div>
        <div style={{ fontSize: 12, color: C.mute }}>{org.name}</div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={C.mute} /></button>
    </div>
  );

  return (
    <div className="sc-page" style={{ display: "flex", flexDirection: "column", height: "100%", background: C.paper }}>
      {stage === 1 && <>
        <Header title="Choose an amount" />
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {presets.map((p) => {
              const on = !custom && amount === p;
              return <button key={p} onClick={() => { setAmount(p); setCustom(""); }} className="sc-tap"
                style={{ padding: "20px 0", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 22,
                  border: "1.5px solid " + (on ? m.c : C.line2), background: on ? m.c + "22" : C.paper2, color: on ? m.c : C.cream }}>${p}</button>;
            })}
          </div>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: 1, marginBottom: 8 }}>OR ENTER YOUR OWN</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.paper2, border: "1.5px solid " + (custom ? m.c : C.line2), borderRadius: 12, padding: "14px 16px" }}>
            <span style={{ fontSize: 22, fontFamily: "inherit", color: C.mute }}>$</span>
            <input value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="0"
              style={{ ...inputStyle, fontSize: 22, fontFamily: "inherit" }} />
          </div>
        </div>
        <div style={{ padding: 20, borderTop: "1px solid " + C.line }}>
          <button onClick={() => amt > 0 && setStage(2)} disabled={amt <= 0} className="sc-tap"
            style={{ width: "100%", padding: 15, borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none",
              background: amt > 0 ? C.cream : C.line2, color: amt > 0 ? C.bg : C.faint, cursor: amt > 0 ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Continue with ${amt} <ArrowRight size={17} /></button>
        </div>
      </>}

      {stage === 2 && <>
        <Header title="How often?" />
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "grid", gap: 12 }}>
          {[["once", "One-time gift", "A single donation of $" + amt], ["monthly", "Monthly", "$" + amt + " every month"], ["yearly", "Yearly", "$" + amt + " once a year"]].map(([k, t, s]) => {
            const on = freq === k;
            return <button key={k} onClick={() => setFreq(k)} className="sc-tap" style={{ display: "flex", alignItems: "center", gap: 14, padding: 18, borderRadius: 14, cursor: "pointer", textAlign: "left",
              border: "1.5px solid " + (on ? m.c : C.line2), background: on ? m.c + "18" : C.paper2 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid " + (on ? m.c : C.line2), display: "grid", placeItems: "center" }}>
                {on && <div style={{ width: 11, height: 11, borderRadius: "50%", background: m.c }} />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 16, color: C.cream }}>{t}</div>
                <div style={{ fontSize: 12.5, color: C.mute }}>{s}</div></div>
            </button>;
          })}
        </div>
        <div style={{ padding: 20, borderTop: "1px solid " + C.line }}>
          <button onClick={() => setStage(3)} className="sc-tap" style={{ width: "100%", padding: 15, borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none", background: C.cream, color: C.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Continue <ArrowRight size={17} /></button>
        </div>
      </>}

      {stage === 3 && <>
        <Header title="Save a demo pledge" />
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div style={{ background: C.paper2, border: "1px solid " + C.line, borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 18, color: C.cream, marginBottom: 8 }}>No payment details needed</div>
            <p style={{ fontSize: 13.5, color: C.mute, lineHeight: 1.6, margin: 0 }}>This community request is illustrative. ShareCompass will save a private pledge to your profile, but it will not charge you or send money.</p>
          </div>
        </div>
        <div style={{ padding: 20, borderTop: "1px solid " + C.line }}>
          <button onClick={() => setStage(4)} className="sc-tap" style={{ width: "100%", padding: 15, borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none", background: m.c, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Check size={16} /> Save ${amt}{freq !== "once" ? "/" + (freq === "monthly" ? "mo" : "yr") : ""} pledge</button>
        </div>
      </>}

      {stage === 4 && <>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
          <div className="sc-pop" style={{ width: 88, height: 88, borderRadius: "50%", background: C.pine, display: "grid", placeItems: "center", marginBottom: 24 }}>
            <Check size={46} color="#fff" /></div>
          <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 26, color: C.cream, marginBottom: 10 }}>Thank you</div>
          <p style={{ fontSize: 14.5, color: C.mute, lineHeight: 1.6, maxWidth: 280 }}>
            Your {freq === "once" ? "pledge" : freq + " pledge"} of <b style={{ color: C.cream }}>${amt}</b> to {org.name} was saved. No payment was processed.</p>
        </div>
        <div style={{ padding: 20, borderTop: "1px solid " + C.line }}>
          <button onClick={() => onDone(amt, freq, org)} className="sc-tap" style={{ width: "100%", padding: 15, borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none", background: C.cream, color: C.bg, cursor: "pointer" }}>
            Back to app</button>
        </div>
      </>}
    </div>
  );
}

// =======================================================================
//  ONBOARDING
// =======================================================================
const CAUSE_KEYS = Object.keys(CAUSE);
const GIVE_MODES = [
  { key: "Money", label: "Money", desc: "One-off or recurring donations", icon: DollarSign },
  { key: "Time", label: "Time", desc: "Volunteering and skills", icon: Clock },
  { key: "Goods", label: "Goods", desc: "Clothing, food, supplies", icon: Package },
];
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function Field({ icon: Icon, children }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.paper2,
    border: "1.5px solid " + C.line2, borderRadius: 10, padding: "13px 14px", marginBottom: 14 }}>
    {Icon && <Icon size={18} color={C.mute} />}{children}</div>;
}
function BigButton({ children, onClick, disabled }) {
  return <button onClick={onClick} disabled={disabled} className="sc-tap"
    style={{ width: "100%", padding: 15, borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none",
      cursor: disabled ? "not-allowed" : "pointer", background: disabled ? C.line2 : C.cream, color: disabled ? C.faint : C.bg,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{children}</button>;
}
function StepScaffold({ step, total, onBack, title, sub, children, footer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          {onBack ? <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><ArrowLeft size={20} color={C.cream} /></button> : <div style={{ width: 28 }} />}
          <div style={{ flex: 1, height: 4, background: C.line2, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: (step/total)*100 + "%", height: "100%", background: C.rust, transition: "width .3s" }} /></div>
          <div style={{ fontSize: 11, color: C.mute }}>{step}/{total}</div>
        </div>
      </div>
      <div key={step} className="sc-page" style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
        <h2 style={{ fontFamily: "inherit", fontSize: 25, fontWeight: 700, color: C.cream, margin: "0 0 8px", lineHeight: 1.2 }}>{title}</h2>
        {sub && <p style={{ fontSize: 14, color: C.mute, lineHeight: 1.5, margin: "0 0 22px" }}>{sub}</p>}
        {children}
      </div>
      <div style={{ padding: 20, borderTop: "1px solid " + C.line }}>{footer}</div>
    </div>
  );
}

function Onboarding({ onComplete, initial }) {
  const TOTAL = 5;
  const [step, setStep] = useState(initial ? 6 : 1);
  const [d, setD] = useState(initial || { email: "", password: "", countryCode: "US", phone: "", causes: [], gives: [], region: "", city: "", newsletter: true });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const geo = GEO[d.countryCode];
  const cityOptions = d.countryCode === "US" ? (US_CITIES_BY_STATE[d.region] || []) : geo.cities;
  const [sentCode, setSentCode] = useState(null);
  const [entered, setEntered] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [resendIn, setResendIn] = useState(0);
  useEffect(() => { if (resendIn <= 0) return; const t = setTimeout(() => setResendIn((s) => s - 1), 1000); return () => clearTimeout(t); }, [resendIn]);
  const sendCode = () => { const c = String(Math.floor(1000 + Math.random() * 9000)); setSentCode(c); setEntered(""); setCodeErr(""); setResendIn(30); }; // BACKEND: Twilio Verify
  const next = () => setStep((s) => ({ 1: 6, 6: 7, 7: 8, 8: 9 }[s] || 9));
  const back = () => setStep((s) => ({ 9: 8, 8: 7, 7: 6, 6: 1 }[s] || 1));
  const toggle = (k, v) => set(k, d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v]);
  const countryNames = COUNTRY_CODES.map((c) => GEO[c].name);
  const codeByName = (nm) => COUNTRY_CODES.find((c) => GEO[c].name === nm);

  if (step === 1) return (
    <StepScaffold step={1} total={TOTAL} title="Welcome to ShareCompass"
      sub="Tell us what matters to you, and we will help you find good places to start."
      footer={<BigButton onClick={next}>Get started <ArrowRight size={17} /></BigButton>}>
      <div style={{ display: "grid", placeItems: "center", padding: "6px 0 22px" }}>
        <div style={{ width: 100, height: 100, borderRadius: 26, background: `linear-gradient(135deg, ${C.rust}, ${C.ember})`, display: "grid", placeItems: "center", boxShadow: `0 12px 40px ${C.rust}55` }}>
          <Compass size={50} color="#fff" /></div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {[["Match by cause, not guesswork", C.gold], ["Give money, time, or goods", C.pine], ["Find local & global causes", C.slate]].map(([t, col]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 14, color: C.cream }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} /> {t}</div>
        ))}
      </div>
    </StepScaffold>
  );

  if (step === 2) return (
    <StepScaffold step={2} total={TOTAL} onBack={back} title="What's your email?" sub="You'll use this to sign in. We'll never share it."
      footer={<BigButton onClick={next} disabled={!emailOk(d.email)}>Continue <ArrowRight size={17} /></BigButton>}>
      <Field icon={Mail}><input style={inputStyle} type="email" placeholder="you@example.com" value={d.email} onChange={(e) => set("email", e.target.value)} autoFocus /></Field>
      {d.email && !emailOk(d.email) && <div style={{ fontSize: 12, color: C.rust }}>That doesn't look like a valid email yet.</div>}
    </StepScaffold>
  );

  if (step === 3) {
    const strong = (d.password || "").length >= 8;
    const lvl = (d.password || "").length >= 12 ? 3 : (d.password || "").length >= 8 ? 2 : (d.password || "").length >= 4 ? 1 : 0;
    return (
      <StepScaffold step={3} total={TOTAL} onBack={back} title="Create a password" sub="At least 8 characters. Mix in a number or symbol for a stronger one."
        footer={<BigButton onClick={next} disabled={!strong}>Continue <ArrowRight size={17} /></BigButton>}>
        <Field icon={Lock}>
          <input style={inputStyle} type={d._show ? "text" : "password"} placeholder="Your password" value={d.password} onChange={(e) => set("password", e.target.value)} autoFocus />
          <button onClick={() => set("_show", !d._show)} style={{ background: "none", border: "none", cursor: "pointer" }}>{d._show ? <EyeOff size={17} color={C.mute} /> : <Eye size={17} color={C.mute} />}</button>
        </Field>
        <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < lvl ? (lvl === 3 ? C.pine : lvl === 2 ? C.gold : C.rust) : C.line2 }} />)}</div>
      </StepScaffold>
    );
  }

  if (step === 4) return (
    <StepScaffold step={4} total={TOTAL} onBack={back} title="Your phone number" sub="We'll send a one-time code to confirm it's you. Standard rates may apply."
      footer={<BigButton onClick={() => { sendCode(); next(); }} disabled={d.phone.replace(/\D/g, "").length < 6}>Send code <ArrowRight size={17} /></BigButton>}>
      <div style={{ fontSize: 11, color: C.faint, letterSpacing: 1, marginBottom: 8 }}>COUNTRY</div>
      <Autocomplete icon={Globe2} placeholder="Country" value={d._ctext ?? geo.name} options={countryNames}
        onChange={(v) => { set("_ctext", v); const code = codeByName(v); if (code) { set("countryCode", code); set("region", ""); set("city", ""); set("_ctext", GEO[code].name); } }} />
      <div style={{ fontSize: 11, color: C.faint, letterSpacing: 1, margin: "6px 0 8px" }}>NUMBER</div>
      <Field icon={Phone}>
        <span style={{ color: C.mute, fontSize: 15 }}>{geo.dial}</span>
        <input style={inputStyle} type="tel" placeholder="Phone number" value={d.phone} onChange={(e) => set("phone", e.target.value)} autoFocus /></Field>
    </StepScaffold>
  );

  if (step === 5) return (
    <StepScaffold step={5} total={TOTAL} onBack={back} title="Enter the code" sub={`We sent a 4-digit code to ${geo.dial} ${d.phone}.`}
      footer={<BigButton onClick={() => { if (entered === sentCode) { setCodeErr(""); next(); } else setCodeErr("That code isn't right. Check and try again."); }} disabled={entered.length !== 4}>Verify <Check size={17} /></BigButton>}>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, margin: "8px 0 16px" }}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 54, height: 62, border: "1.5px solid " + (entered.length === i ? C.rust : C.line2), borderRadius: 12, display: "grid", placeItems: "center", fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: C.cream, background: C.paper2 }}>{entered[i] || ""}</div>)}
      </div>
      <input value={entered} onChange={(e) => { setEntered(e.target.value.replace(/\D/g, "").slice(0, 4)); setCodeErr(""); }} inputMode="numeric" autoFocus placeholder="Tap and type the code"
        style={{ width: "100%", textAlign: "center", padding: 12, borderRadius: 10, border: "1.5px solid " + C.line2, background: C.paper2, fontSize: 14, color: C.cream, outline: "none", boxSizing: "border-box" }} />
      {codeErr && <div style={{ fontSize: 12.5, color: C.rust, marginTop: 10, textAlign: "center" }}>{codeErr}</div>}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <button onClick={sendCode} disabled={resendIn > 0} style={{ background: "none", border: "none", cursor: resendIn > 0 ? "default" : "pointer", color: resendIn > 0 ? C.faint : C.ember, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={14} /> {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}</button>
      </div>
      <div style={{ marginTop: 18, textAlign: "center", fontSize: 11.5, color: C.mute, background: C.paper2, borderRadius: 8, padding: "8px 10px" }}>
        This is a demo, so no text was sent. Your code is <b style={{ color: C.cream, letterSpacing: 2 }}>{sentCode}</b></div>
    </StepScaffold>
  );

  if (step === 6) return (
    <StepScaffold step={2} total={TOTAL} onBack={initial ? undefined : back} title="Tell us about you" sub="Your account stays private unless you choose to appear in nearby volunteer matching."
      footer={<BigButton onClick={next} disabled={!d.displayName?.trim() || !d.region}>Continue <ArrowRight size={17} /></BigButton>}>
      <div style={{ fontSize: 11, color: C.faint, letterSpacing: 1, marginBottom: 8 }}>DISPLAY NAME</div>
      <Field icon={User}><input style={inputStyle} placeholder="How neighbors will know you" value={d.displayName || ""} onChange={(e) => set("displayName", e.target.value)} /></Field>
      <div style={{ fontSize: 11, color: C.faint, letterSpacing: 1, marginBottom: 8 }}>COUNTRY</div>
      <Autocomplete icon={Globe2} placeholder="Start typing your country…" value={d._ctext ?? geo.name} options={countryNames}
        onChange={(v) => { set("_ctext", v); const code = codeByName(v); if (code) { set("countryCode", code); set("region", ""); set("city", ""); set("_ctext", GEO[code].name); } }} />
      <div style={{ fontSize: 11, color: C.faint, letterSpacing: 1, margin: "6px 0 8px" }}>REGION / STATE</div>
      <Autocomplete icon={MapPin} placeholder="Start typing your region…" value={d.region} options={geo.regions} onChange={(v) => setD((p) => ({ ...p, region: v, city: "" }))} />
      <div style={{ fontSize: 11, color: C.faint, letterSpacing: 1, margin: "6px 0 8px" }}>CITY (RECOMMENDED FOR LOCAL PAIRING)</div>
      <Autocomplete icon={MapPin} placeholder={d.countryCode === "US" && !d.region ? "Choose a state first…" : "Start typing your city…"} value={d.city} options={cityOptions} onChange={(v) => set("city", v)} />
      {d.countryCode === "US" && d.region && <div style={{ fontSize: 11.5, color: C.faint, margin: "-6px 2px 10px" }}>{cityOptions.length.toLocaleString()} Census-recognized places available in {d.region}.</div>}
    </StepScaffold>
  );

  if (step === 7) return (
    <StepScaffold step={3} total={TOTAL} onBack={back} title="What do you care about?" sub="Pick the causes you'd most like to support. You can change these anytime."
      footer={<BigButton onClick={next} disabled={d.causes.length === 0}>Continue{d.causes.length ? ` (${d.causes.length})` : ""} <ArrowRight size={17} /></BigButton>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {CAUSE_KEYS.map((k) => { const on = d.causes.includes(k); return (
          <button key={k} onClick={() => toggle("causes", k)} className="sc-tap" style={{ textAlign: "left", padding: 0, borderRadius: 12, cursor: "pointer", overflow: "hidden", border: "1.5px solid " + (on ? CAUSE[k].c : C.line2), background: C.paper2 }}>
            <div style={{ position: "relative", height: 72 }}>
              <CoverArt org={{ id: "c" + k, cause: k, name: k, image: CAUSE[k].image }} height={72} />
              {on && <div style={{ position: "absolute", top: 6, right: 6, background: CAUSE[k].c, borderRadius: "50%", width: 22, height: 22, display: "grid", placeItems: "center" }}><Check size={14} color="#fff" /></div>}
            </div>
            <div style={{ padding: "8px 11px 10px" }}>
              <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 14.5, color: C.cream }}>{k}</div>
              <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>{CAUSE[k].tag}</div></div>
          </button>); })}
      </div>
    </StepScaffold>
  );

  if (step === 8) return (
    <StepScaffold step={4} total={TOTAL} onBack={back} title="How would you like to help?" sub="Choose any options that work for you."
      footer={<BigButton onClick={next} disabled={d.gives.length === 0}>Continue <ArrowRight size={17} /></BigButton>}>
      <div style={{ display: "grid", gap: 12 }}>
        {GIVE_MODES.map(({ key, label, desc, icon: Icon }) => { const on = d.gives.includes(key); return (
          <button key={key} onClick={() => toggle("gives", key)} className="sc-tap" style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, cursor: "pointer", textAlign: "left", border: "1.5px solid " + (on ? C.cream : C.line2), background: on ? C.paper2 : C.paper }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: on ? C.cream : C.line2, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={22} color={on ? C.bg : C.mute} /></div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 16, color: C.cream }}>{label}</div><div style={{ fontSize: 12.5, color: C.mute }}>{desc}</div></div>
            {on && <Check size={20} color={C.cream} />}</button>); })}
      </div>
    </StepScaffold>
  );

  if (step === 9) return (
    <StepScaffold step={5} total={TOTAL} onBack={back} title="Stay in the loop?" sub="Get a monthly note on urgent causes and new local events. No spam, unsubscribe anytime."
      footer={<BigButton onClick={() => onComplete(d)}>Finish setup <PartyPopper size={17} /></BigButton>}>
      <button onClick={() => set("newsletter", !d.newsletter)} className="sc-tap" style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, cursor: "pointer", textAlign: "left", border: "1.5px solid " + (d.newsletter ? C.cream : C.line2), background: d.newsletter ? C.paper2 : C.paper }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: d.newsletter ? C.cream : C.line2, display: "grid", placeItems: "center" }}><Bell size={22} color={d.newsletter ? C.bg : C.mute} /></div>
        <div style={{ flex: 1 }}><div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 16, color: C.cream }}>Monthly newsletter</div><div style={{ fontSize: 12.5, color: C.mute }}>{d.newsletter ? "You're subscribed" : "Not subscribed"}</div></div>
        <div style={{ width: 46, height: 27, borderRadius: 14, background: d.newsletter ? C.pine : C.line2, position: "relative", flexShrink: 0 }}><div style={{ position: "absolute", top: 3, left: d.newsletter ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "left .2s" }} /></div>
      </button>
    </StepScaffold>
  );
  return null;
}

// =======================================================================
//  APP PAGES
// =======================================================================
function HomePage({ giver, follows, onFollow, onOpen }) {
  const ranked = useMemo(() => ORGS.map((o) => ({ o, m: scoreMatch(giver, o) })).sort((a, b) => b.m.score - a.m.score), [giver]);
  const top = ranked[0];
  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <div style={{ borderBottom: "2px solid " + C.line2, paddingBottom: 8, marginBottom: 4 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.faint }}>THE GIVING FIELD GUIDE</div></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 11, color: C.faint, marginBottom: 16 }}>
        <span>{giver.city || giver.region || "Worldwide"} · 2026</span><span>{ORGS.filter((o) => o.urgent).length} urgent today</span></div>
      {/* hero match with cover art */}
      <div onClick={() => onOpen(top.o)} className="sc-tap" style={{ borderRadius: 18, overflow: "hidden", marginBottom: 22, cursor: "pointer", border: "1px solid " + C.line, position: "relative" }}>
        <CoverArt org={top.o} height={150} />
        <div style={{ position: "absolute", top: 12, left: 14, fontSize: 11, letterSpacing: 2, color: "#fff", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,.5)" }}>YOUR STRONGEST MATCH</div>
        <div style={{ position: "absolute", top: 10, right: 12, background: C.card, borderRadius: "50%", padding: 3, boxShadow: "0 2px 8px rgba(0,0,0,.4)" }}><Meter value={top.m.score} size={46} /></div>
        <div style={{ padding: 16, background: C.card }}>
          <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 20, color: C.cream }}>{top.o.name}</div>
          <div style={{ fontSize: 12.5, color: C.mute, marginBottom: 8 }}>{top.o.loc} · {CAUSE[top.o.cause].tag}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{top.m.why.map((r) => <span key={r} style={{ fontSize: 11.5, color: C.pine, display: "inline-flex", alignItems: "center", gap: 4 }}><Check size={12} /> {r}</span>)}</div>
        </div>
      </div>
      <div style={{ padding: "4px 0 18px", marginBottom: 18, borderBottom: "1px solid " + C.line }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <CalendarClock size={18} color={C.slate} />
          <span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 15, color: C.cream }}>Events near you</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.slate, letterSpacing: .5 }}>SOON</span></div>
        <div style={{ fontSize: 13, color: C.mute, lineHeight: 1.5 }}>We are working on local volunteer events for {giver.region || "your area"}.</div></div>
      <SectionRule>Featured organizations</SectionRule>
      <div className="sc-stagger" style={{ display: "grid", gap: 14 }}>
        {ranked.slice(1, 4).map(({ o, m }) => <OrgCard key={o.id} org={o} match={m} following={follows.has(o.id)} onFollow={onFollow} onOpen={() => onOpen(o)} />)}</div>
    </div>
  );
}

function GivePage({ giver, follows, onFollow, onOpen }) {
  const [query, setQuery] = useState("");
  const urgent = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ORGS.filter((o) => o.urgent && (!term || `${o.name} ${o.cause} ${o.loc} ${o.blurb}`.toLowerCase().includes(term)))
      .map((o) => ({ o, m: scoreMatch(giver, o) })).sort((a, b) => b.m.score - a.m.score);
  }, [giver, query]);
  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <SectionRule>Give to an organization</SectionRule>
      <p style={{ fontSize: 13.5, color: C.mute, lineHeight: 1.55, margin: "-4px 0 16px" }}>Find a nonprofit to support with money, time, supplies, or sponsorship.</p>
      <SearchBox value={query} onChange={setQuery} placeholder="Search organizations, causes, or locations…" />
      <div style={{ fontSize: 12, color: C.faint, margin: "-7px 2px 13px" }}>{urgent.length} urgent organization{urgent.length === 1 ? "" : "s"}</div>
      <div className="sc-stagger" style={{ display: "grid", gap: 14 }}>
        {urgent.map(({ o, m }) => <OrgCard key={o.id} org={o} match={m} following={follows.has(o.id)} onFollow={onFollow} onOpen={() => onOpen(o)} primaryLabel="Support" />)}
        {!urgent.length && <EmptySearch label="No urgent organizations match that search." />}</div>
    </div>
  );
}

function FindHelpPage({ follows, onFollow, onOpen }) {
  const [query, setQuery] = useState("");
  const [need, setNeed] = useState("All");
  const needs = ["All", "Housing", "Hunger", "Health", "Water"];
  const help = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ORGS.filter((o) => ["Housing", "Hunger", "Health", "Water"].includes(o.cause) && !o.demo)
      .filter((o) => need === "All" || o.cause === need)
      .filter((o) => !term || `${o.name} ${o.cause} ${o.loc} ${o.blurb}`.toLowerCase().includes(term));
  }, [need, query]);
  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <SectionRule>Find services for yourself</SectionRule>
      <p style={{ fontSize: 13.5, color: C.mute, margin: "-4px 0 14px", lineHeight: 1.55 }}>Looking for support? Search for food, housing, clean water, and medical services near you.</p>
      <SearchBox value={query} onChange={setQuery} placeholder="Search help by organization or location…" />
      <FilterRow label="What do you need?">{needs.map((item) => <Chip key={item} active={need === item} onClick={() => setNeed(item)}>{item === "Hunger" ? "Food" : item === "Health" ? "Medical" : item}</Chip>)}</FilterRow>
      <div style={{ fontSize: 12, color: C.faint, margin: "4px 2px 13px" }}>{help.length} service provider{help.length === 1 ? "" : "s"}</div>
      <div className="sc-stagger" style={{ display: "grid", gap: 14 }}>
        {help.map((o) => <OrgCard key={o.id} org={o} following={follows.has(o.id)} onFollow={onFollow} onOpen={() => onOpen(o)} primaryLabel="View services" />)}
        {!help.length && <EmptySearch label="No service providers match those filters." />}
      </div>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.paper2, border: "1.5px solid " + C.line2, borderRadius: 11, padding: "11px 13px", marginBottom: 14 }}>
    <Search size={17} color={C.mute} />
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} style={inputStyle} />
    {value && <button aria-label="Clear search" onClick={() => onChange("")} style={{ border: 0, background: "none", padding: 0, display: "grid", cursor: "pointer" }}><X size={16} color={C.mute} /></button>}
  </div>;
}

function EmptySearch({ label }) {
  return <div style={{ textAlign: "center", padding: "34px 18px", color: C.mute, border: "1px dashed " + C.line2, borderRadius: 14 }}>
    <Search size={25} style={{ opacity: .45 }} /><p style={{ fontSize: 13, margin: "9px 0 0" }}>{label}</p>
  </div>;
}

function ConnectPage({ giver, setGiver, follows, onFollow, onOpen }) {
  const [q, setQ] = useState("");
  const causes = Object.keys(CAUSE), types = ["Money", "Time", "Goods", "Sponsor"];
  const toggle = (k, v) => setGiver((g) => ({ ...g, [k]: g[k].includes(v) ? g[k].filter((x) => x !== v) : [...g[k], v] }));
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return ORGS.map((o) => ({ o, m: scoreMatch(giver, o) })).filter(({ o }) => (!giver.urgentOnly || o.urgent) && (!t || (o.name + o.blurb + o.cause + o.loc).toLowerCase().includes(t))).sort((a, b) => b.m.score - a.m.score);
  }, [q, giver]);
  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <SectionRule>Find organizations</SectionRule>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.paper2, border: "1.5px solid " + C.line2, borderRadius: 10, padding: "11px 13px", marginBottom: 18 }}>
        <Search size={17} color={C.mute} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search organizations, causes, places…" style={inputStyle} />
        {q && <X size={16} color={C.mute} style={{ cursor: "pointer" }} onClick={() => setQ("")} />}</div>
      <FilterRow label="Cause">{causes.map((c) => <Chip key={c} active={giver.causes.includes(c)} color={CAUSE[c].c} onClick={() => toggle("causes", c)}>{c}</Chip>)}</FilterRow>
      <FilterRow label="How you give">{types.map((t) => <Chip key={t} active={giver.gives.includes(t)} onClick={() => toggle("gives", t)}>{t}</Chip>)}</FilterRow>
      <FilterRow label="Range">
        {["local", "national", "global"].map((r) => <Chip key={r} active={giver.region2 === r} onClick={() => setGiver((g) => ({ ...g, region2: r }))}>{r[0].toUpperCase() + r.slice(1)}</Chip>)}
        <Chip active={giver.urgentOnly} color={C.rust} onClick={() => setGiver((g) => ({ ...g, urgentOnly: !g.urgentOnly }))}>Urgent only</Chip></FilterRow>
      <div style={{ fontSize: 12.5, color: C.mute, margin: "16px 0 12px", borderTop: "1px solid " + C.line, paddingTop: 12 }}>{results.length} match{results.length !== 1 ? "es" : ""}, best first</div>
      <div className="sc-stagger" style={{ display: "grid", gap: 14 }}>
        {results.map(({ o, m }) => <OrgCard key={o.id} org={o} match={m} following={follows.has(o.id)} onFollow={onFollow} onOpen={() => onOpen(o)} />)}
        {!results.length && <div style={{ textAlign: "center", padding: "40px 20px", color: C.mute }}><Compass size={28} style={{ opacity: .4 }} /><p style={{ fontSize: 14, marginTop: 10 }}>Nothing fits those filters yet. Loosen one to explore more.</p></div>}</div>
    </div>
  );
}

function ConnectHub({ giver, setGiver, follows, onFollow, onOpen, community, userId, onToast }) {
  const [view, setView] = useState("people");
  const { people = [], connections = [], error, requestConnection, respondToConnection } = community || {};
  const connectionFor = (uid) => connections.find((item) => item.participants?.includes(uid));
  const shared = (person) => (giver.causes || []).filter((cause) => (person.causes || []).includes(cause));
  const act = async (action, success) => {
    try { await action(); onToast(success); }
    catch (e) { onToast(e.message || "Something went wrong"); }
  };

  return <div style={{ paddingTop: 14 }}>
    <div style={{ display: "flex", gap: 6, margin: "0 16px 20px", padding: 3, background: C.paper2, borderRadius: 10 }}>
      {[["people", "Volunteer together", Users], ["orgs", "Organizations", Compass]].map(([id, label, Icon]) => <button key={id} onClick={() => setView(id)} style={{ flex: 1, border: "none", borderRadius: 9, padding: "10px 8px", cursor: "pointer", background: view === id ? C.cream : "transparent", color: view === id ? C.bg : C.mute, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon size={15} />{label}</button>)}
    </div>
    {view === "orgs" ? <ConnectPage giver={giver} setGiver={setGiver} follows={follows} onFollow={onFollow} onOpen={onOpen} /> :
      <div style={{ padding: "0 16px 18px" }}>
        <SectionRule>Volunteer with someone nearby</SectionRule>
        {!giver.isPublic ? <div style={{ background: C.paper2, border: "1px solid " + C.line, borderRadius: 16, padding: 24, textAlign: "center" }}>
          <ShieldCheck size={34} color={C.pine} />
          <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 19, marginTop: 10, color: C.cream }}>Your profile is private</div>
          <p style={{ color: C.mute, fontSize: 13.5, lineHeight: 1.55 }}>Nobody can find or request to pair with you. Turn on public discovery in Settings when you want to meet nearby volunteers.</p>
        </div> : <>
          <div style={{ background: C.pine + "18", border: "1px solid " + C.pine + "55", borderRadius: 12, padding: 13, marginBottom: 16, color: C.mute, fontSize: 12.5, lineHeight: 1.5 }}><b style={{ color: C.cream }}>Public discovery is on.</b> People only see your display name, general area, causes, and ways you help. Your email and phone stay private.</div>
          {error && <div style={{ color: C.rust, fontSize: 13, marginBottom: 12 }}>{error}</div>}
          {!people.length && <div style={{ border: "1px dashed " + C.line2, borderRadius: 14, padding: 24, textAlign: "center", color: C.mute, fontSize: 13.5 }}>No public volunteers are visible in your area yet. You will appear here for other nearby members.</div>}
          <div style={{ display: "grid", gap: 12 }}>{people.map((person) => {
            const connection = connectionFor(person.uid), common = shared(person);
            const incoming = connection?.status === "pending" && connection.recipientId === userId;
            return <article key={person.uid} style={{ background: C.card, border: "1px solid " + C.line, borderRadius: 15, padding: 15 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.rust}, ${C.gold})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800 }}>{(person.displayName || "N")[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}><div style={{ color: C.cream, fontWeight: 700, fontFamily: "inherit", fontSize: 16 }}>{person.displayName}</div><div style={{ color: C.mute, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{[person.city, person.region].filter(Boolean).join(", ") || "Your area"}</div></div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0" }}>{(common.length ? common : person.causes || []).slice(0, 4).map((cause) => <span key={cause} style={{ fontSize: 10.5, color: CAUSE[cause]?.c || C.pine, border: "1px solid currentColor", borderRadius: 5, padding: "2px 6px" }}>{common.includes(cause) ? `Both care about ${cause}` : cause}</span>)}</div>
              {incoming ? <div style={{ display: "flex", gap: 8 }}><button onClick={() => act(() => respondToConnection(connection.id, "accepted"), `You and ${person.displayName} are paired`)} style={{ flex: 1, border: "none", borderRadius: 9, padding: 10, background: C.pine, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Accept</button><button onClick={() => act(() => respondToConnection(connection.id, "declined"), "Request declined")} style={{ flex: 1, border: "1px solid " + C.line2, borderRadius: 9, padding: 10, background: "transparent", color: C.mute, fontWeight: 700, cursor: "pointer" }}>Decline</button></div> :
                <button disabled={Boolean(connection)} onClick={() => act(() => requestConnection(person), `Request sent to ${person.displayName}`)} style={{ width: "100%", border: "none", borderRadius: 9, padding: 10, background: connection?.status === "accepted" ? C.pine : connection ? C.line2 : C.cream, color: connection ? "#fff" : C.bg, fontWeight: 700, cursor: connection ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><UserPlus size={15} />{connection?.status === "accepted" ? "Helping Pair" : connection?.status === "pending" ? "Request sent" : connection?.status === "declined" ? "Request declined" : "Connect to volunteer together"}</button>}
            </article>;
          })}</div>
        </>}
      </div>}
  </div>;
}

function ProfilePage({ giver, follows, gifts, onEditProfile, onOpenSettings }) {
  const followed = ORGS.filter((o) => follows.has(o.id));
  const counts = {}; followed.forEach((o) => (counts[o.cause] = (counts[o.cause] || 0) + 1));
  const maxC = Math.max(1, ...Object.values(counts));
  const totalGiven = gifts.reduce((s, g) => s + g.amt, 0);
  const stats = [
    { label: "Following", value: follows.size, c: C.cream },
    { label: "Pledged", value: "$" + totalGiven, c: C.pine },
    { label: "Causes", value: Object.keys(counts).length, c: C.gold },
  ];
  const geo = GEO[giver.countryCode];
  return (
    <div style={{ padding: "4px 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.rust}, ${C.ember})`, color: "#fff", display: "grid", placeItems: "center", fontFamily: "inherit", fontWeight: 700, fontSize: 22 }}>{(giver.email || "O")[0].toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 20, color: C.cream }}>{giver.displayName || (giver.email ? giver.email.split("@")[0] : "Volunteer")}</div>
          <div style={{ fontSize: 12.5, color: C.mute, display: "flex", alignItems: "center", gap: 5 }}><MapPin size={11} /> {[giver.city, giver.region, geo?.name].filter(Boolean).join(", ") || "Location not set"}</div></div>
        <button onClick={onOpenSettings} className="sc-tap" style={{ background: "none", border: "1.5px solid " + C.line2, borderRadius: 10, padding: 9, cursor: "pointer" }}><Settings size={18} color={C.cream} /></button></div>
      <div style={{ display: "flex", marginBottom: 20, border: "1px solid " + C.line, borderRadius: 12, overflow: "hidden" }}>
        {stats.map((s, i) => <div key={s.label} style={{ flex: 1, padding: "16px 10px", textAlign: "center", borderLeft: i ? "1px solid " + C.line : "none", background: C.paper2 }}>
          <div style={{ fontFamily: "inherit", fontSize: 25, fontWeight: 700, color: s.c }}>{s.value}</div>
          <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>{s.label}</div></div>)}</div>
      <button onClick={onEditProfile} className="sc-tap" style={{ width: "100%", textAlign: "left", background: C.paper2, border: "1px solid " + C.line, borderRadius: 12, padding: 14, marginBottom: 22, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: C.cream, marginBottom: 6 }}>Your giving preferences</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{giver.causes.slice(0, 4).map((c) => <span key={c} style={{ fontSize: 11, color: CAUSE[c].c, border: "1px solid " + CAUSE[c].c + "66", borderRadius: 5, padding: "2px 7px" }}>{c}</span>)}{giver.causes.length === 0 && <span style={{ fontSize: 12, color: C.mute }}>Nothing selected yet. Tap to choose.</span>}</div></div>
        <ChevronRight size={18} color={C.mute} /></button>
      <SectionRule><BarChart3 size={14} style={{ verticalAlign: -2 }} /> Giving footprint</SectionRule>
      {Object.keys(counts).length === 0 ? <div style={{ border: "1px dashed " + C.line2, borderRadius: 12, padding: 24, textAlign: "center", color: C.mute, fontSize: 13.5, background: C.paper2 }}>Follow organizations to build your footprint.</div>
        : <div style={{ background: C.paper2, border: "1px solid " + C.line, borderRadius: 12, padding: 16, display: "grid", gap: 13 }}>
          {Object.entries(counts).map(([c, n]) => <div key={c}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span style={{ color: C.cream }}>{c}</span><span style={{ color: C.mute }}>{n}</span></div>
            <div style={{ height: 6, background: C.line2, borderRadius: 3, overflow: "hidden" }}><div style={{ width: (n / maxC) * 100 + "%", height: "100%", background: CAUSE[c].c, transition: "width .5s" }} /></div></div>)}</div>}
      <div style={{ marginTop: 22 }}><SectionRule>From orgs you follow</SectionRule></div>
      <div style={{ display: "grid", gap: 10 }}>
        {!followed.length && <div style={{ fontSize: 13.5, color: C.mute }}>Updates appear here once you follow.</div>}
        {followed.map((o) => <div key={o.id} style={{ display: "flex", gap: 11, alignItems: "center", background: C.paper2, border: "1px solid " + C.line, borderRadius: 12, padding: 11 }}>
          <Crest org={o} size={40} radius={11} /><div style={{ flex: 1, fontSize: 13, color: C.mute }}><b style={{ color: C.cream, fontFamily: "inherit" }}>{o.name}</b><br />Open its profile to see current programs and official ways to help.</div></div>)}</div>
    </div>
  );
}

function SettingsScreen({ giver, setGiver, onClose, onEditProfile, onSignOut, onToast }) {
  const geo = GEO[giver.countryCode];
  const Row = ({ label, value, onClick }) => {
    const Tag = onClick ? "button" : "div";
    return <Tag onClick={onClick} className={onClick ? "sc-hover" : undefined} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.paper2, border: "none", borderBottom: "1px solid " + C.line, cursor: onClick ? "pointer" : "default", textAlign: "left" }}>
      <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, color: C.cream, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>{value}</div></div>{onClick && <ChevronRight size={17} color={C.mute} />}</Tag>;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.paper }}>
      <div style={{ padding: "16px 18px", background: C.paper2, color: C.cream, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid " + C.line }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><ArrowLeft size={20} color={C.cream} /></button>
        <span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 18 }}>Settings</span></div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "16px 16px 8px", fontSize: 11, letterSpacing: 1, color: C.faint }}>ACCOUNT</div>
        <Row label="Email" value={giver.email || "Not set"} />
        <Row label="Phone" value={giver.phone ? `${geo?.dial || ""} ${giver.phone}` : "Not set"} />
        <Row label="Password" value="Send a secure reset email" onClick={async () => { try { await sendPasswordResetEmail(auth, giver.email); onToast("Password reset email sent"); } catch { onToast("Could not send reset email. Try again."); } }} />
        <div style={{ padding: "16px 16px 8px", fontSize: 11, letterSpacing: 1, color: C.faint }}>GIVING</div>
        <Row label="Causes you care about" value={giver.causes.join(", ") || "None"} onClick={onEditProfile} />
        <Row label="How you give" value={giver.gives.join(", ") || "None"} onClick={onEditProfile} />
        <Row label="Location" value={[giver.city, giver.region, geo?.name].filter(Boolean).join(", ") || "Not set"} onClick={onEditProfile} />
        <div style={{ padding: "16px 16px 8px", fontSize: 11, letterSpacing: 1, color: C.faint }}>PREFERENCES</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.paper2, borderBottom: "1px solid " + C.line }}>
          {giver.theme === "light" ? <Sun size={20} color={C.gold} /> : <Moon size={20} color={C.slate} />}
          <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, color: C.cream, fontWeight: 600 }}>Light appearance</div><div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>{giver.theme === "light" ? "Warm light theme" : "Dark espresso theme"}</div></div>
          <button aria-label="Toggle light appearance" onClick={() => setGiver((g) => ({ ...g, theme: g.theme === "light" ? "dark" : "light" }))} style={{ width: 46, height: 27, borderRadius: 14, background: giver.theme === "light" ? C.gold : C.line2, position: "relative", border: "none", cursor: "pointer" }}><div style={{ position: "absolute", top: 3, left: giver.theme === "light" ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "left .2s" }} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.paper2, borderBottom: "1px solid " + C.line }}>
          <ShieldCheck size={20} color={giver.isPublic ? C.pine : C.slate} />
          <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, color: C.cream, fontWeight: 600 }}>Public volunteer profile</div><div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>{giver.isPublic ? "Nearby members can find and pair with you" : "Private by default; nobody can discover you"}</div></div>
          <button aria-label="Toggle public volunteer profile" onClick={() => { const next = !giver.isPublic; setGiver((g) => ({ ...g, isPublic: next })); onToast(next ? "Your volunteer profile is now public" : "Your profile is now private"); }} style={{ width: 46, height: 27, borderRadius: 14, background: giver.isPublic ? C.pine : C.line2, position: "relative", border: "none", cursor: "pointer" }}><div style={{ position: "absolute", top: 3, left: giver.isPublic ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "left .2s" }} /></button>
        </div>
        <div style={{ padding: "10px 16px", background: C.paper, borderBottom: "1px solid " + C.line, color: C.faint, fontSize: 11.5, lineHeight: 1.5 }}>Public profiles show only your display name, city/region, causes, and helping preferences. Email and phone are never shared.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.paper2, borderBottom: "1px solid " + C.line }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, color: C.cream, fontWeight: 600 }}>Monthly newsletter</div><div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>{giver.newsletter ? "Subscribed" : "Not subscribed"}</div></div>
          <button onClick={() => { setGiver((g) => ({ ...g, newsletter: !g.newsletter })); onToast(giver.newsletter ? "Unsubscribed" : "Subscribed to newsletter"); }} style={{ width: 46, height: 27, borderRadius: 14, background: giver.newsletter ? C.pine : C.line2, position: "relative", border: "none", cursor: "pointer" }}>
            <div style={{ position: "absolute", top: 3, left: giver.newsletter ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "left .2s" }} /></button></div>
        <div style={{ padding: 16 }}>
          <button onClick={onSignOut} className="sc-tap" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 11, border: "1.5px solid " + C.rust, background: "transparent", color: C.ember, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            <LogOut size={17} /> Sign out</button></div>
      </div>
    </div>
  );
}

// =======================================================================
//  ROOT
// =======================================================================
export default function ShareCompass({ userId, profile, saveProfile, community, onSignOut }) {
  const [phase, setPhase] = useState("boot");
  const [tab, setTab] = useState("home");
  const [showSettings, setShowSettings] = useState(false);
  const [detail, setDetail] = useState(null);
  const [giveOrg, setGiveOrg] = useState(null);
  const [gifts, setGifts] = useState(profile?.gifts || []);
  const [toast, setToast] = useState("");
  const toastRef = useRef();
  const pageScrollRef = useRef();
  const fireToast = (m) => { setToast(m); clearTimeout(toastRef.current); toastRef.current = setTimeout(() => setToast(""), 2200); };

  useEffect(() => { if (phase !== "boot") return; const t = setTimeout(() => setPhase(profile?.onboarded ? "app" : "onboarding"), 900); return () => clearTimeout(t); }, [phase, profile?.onboarded]);
  useEffect(() => { pageScrollRef.current?.scrollTo({ top: 0, behavior: "auto" }); }, [tab]);

  const [giver, setGiverState] = useState(() => ({ email: "", displayName: "", countryCode: "US", phone: "", causes: [], gives: [], region: "", city: "", newsletter: true, region2: "global", urgentOnly: false, isPublic: false, theme: "dark", ...profile }));
  const [follows, setFollows] = useState(() => new Set(profile?.follows || []));
  const setGiver = (next) => setGiverState((current) => {
    const value = typeof next === "function" ? next(current) : next;
    saveProfile?.(value);
    return value;
  });
  const onFollow = (id) => setFollows((p) => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id);
    saveProfile?.({ follows: [...n] });
    return n;
  });
  useEffect(() => {
    if (!giveOrg?.real) return;
    window.open(giveOrg.website || `https://${giveOrg.handle}`, "_blank", "noopener,noreferrer");
    setGiveOrg(null);
    setDetail(null);
  }, [giveOrg]);

  const finishOnboarding = (data) => { const next = { ...giver, ...data, region2: "global", urgentOnly: false, onboarded: true }; setGiverState(next); saveProfile?.(next); setPhase("setup"); setTimeout(() => { setPhase("app"); setTab("home"); fireToast("Welcome to ShareCompass!"); }, 1200); };
  const finishEdit = (data) => { setGiver((g) => ({ ...g, ...data })); setPhase("app"); setShowSettings(false); fireToast("Preferences updated"); };

  const dMatch = detail ? scoreMatch(giver, detail) : null;
  const NAV = [{ id: "home", label: "Home", icon: Home }, { id: "give", label: "Give", icon: Gift }, { id: "connect", label: "Connect", icon: Link2 }, { id: "help", label: "Find Help", icon: HandHeart }, { id: "profile", label: "Profile", icon: User }];

  const theme = THEMES[giver.theme] || THEMES.dark;
  const { outer, shadow, ...themeVars } = theme;
  const frame = (inner) => (
    <div style={{ ...themeVars, minHeight: "100vh", background: outer, display: "grid", placeItems: "center", padding: 20, fontFamily: "'Avenir Next', Avenir, 'Helvetica Neue', Arial, sans-serif", transition: "background .25s ease" }}>
      <MotionStyles />
      <div className="sc-phone" style={{ width: 400, maxWidth: "100%", height: "min(820px, calc(100dvh - 40px))", background: C.paper, color: C.cream, borderRadius: 30, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", boxShadow: `0 30px 90px ${shadow}`, border: "1px solid " + C.line }}>
        {inner}<Toast msg={toast} /></div>
    </div>
  );

  if (phase === "boot") return frame(<Splash label="Loading…" />);
  if (phase === "setup") return frame(<Splash label="Building your matches…" />);
  if (phase === "onboarding") return frame(<div className="sc-page" style={{ height: "100%" }}><Onboarding onComplete={finishOnboarding} /></div>);
  if (phase === "editProfile") return frame(<div className="sc-page" style={{ height: "100%" }}><Onboarding initial={giver} onComplete={finishEdit} /></div>);

  if (giveOrg?.real) return frame(<Splash label={`Opening ${giveOrg.name}…`} />);
  if (giveOrg) return frame(<GiveFlow org={giveOrg} onClose={() => setGiveOrg(null)} onDone={(amt, freq, org) => { const next = [...gifts, { amt, freq, id: org.id, createdAt: Date.now() }]; setGifts(next); saveProfile?.({ gifts: next }); setGiveOrg(null); setDetail(null); fireToast(`Support pledge for ${org.name} saved`); }} />);

  if (showSettings) return frame(<SettingsScreen giver={giver} setGiver={setGiver} onClose={() => setShowSettings(false)} onEditProfile={() => { setShowSettings(false); setPhase("editProfile"); }} onSignOut={onSignOut} onToast={fireToast} />);

  return frame(<>
    <div style={{ padding: "16px 18px 12px", background: C.paper2, color: C.cream, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid " + C.line }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}><Compass size={20} color={C.ember} /><span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 18 }}>ShareCompass</span></div>
      <span style={{ fontSize: 10, color: C.mute, border: "1px solid " + C.line2, padding: "2px 7px", borderRadius: 4, letterSpacing: 1 }}>V2.2</span></div>
    <div ref={pageScrollRef} style={{ flex: 1, overflowY: "auto", scrollPaddingTop: 14 }}>
      <div key={tab} className="sc-page" style={{ minHeight: "100%" }}>
        {tab === "home" && <HomePage giver={giver} follows={follows} onFollow={onFollow} onOpen={setDetail} />}
        {tab === "give" && <GivePage giver={giver} follows={follows} onFollow={onFollow} onOpen={setDetail} />}
        {tab === "connect" && <ConnectHub giver={giver} setGiver={setGiver} follows={follows} onFollow={onFollow} onOpen={setDetail} community={community} userId={userId} onToast={fireToast} />}
        {tab === "help" && <FindHelpPage follows={follows} onFollow={onFollow} onOpen={setDetail} />}
        {tab === "profile" && <ProfilePage giver={giver} follows={follows} gifts={gifts} onEditProfile={() => setPhase("editProfile")} onOpenSettings={() => setShowSettings(true)} />}
      </div>
    </div>
    <div style={{ display: "flex", borderTop: "1px solid " + C.line, background: C.paper2 }}>
      {NAV.map((n) => { const active = tab === n.id, center = n.id === "connect", I = n.icon; return (
        <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "9px 0 7px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: center ? 44 : "auto", height: center ? 44 : "auto", marginTop: center ? -22 : 0, borderRadius: center ? "50%" : 0, background: center ? `linear-gradient(135deg, ${C.rust}, ${C.ember})` : "transparent", display: "grid", placeItems: "center", boxShadow: center ? `0 6px 16px ${C.rust}66` : "none", border: center ? "3px solid " + C.paper2 : "none" }}>
            <I size={center ? 22 : 20} color={center ? "#fff" : active ? C.ember : C.faint} /></div>
          <span style={{ fontSize: 10, fontWeight: 600, color: active ? C.ember : C.faint }}>{n.label}</span></button>); })}
    </div>
    <DetailSheet org={detail} match={dMatch} following={detail && follows.has(detail.id)} onFollow={onFollow} onClose={() => setDetail(null)} onGive={(o) => setGiveOrg(o)} />
  </>);
}
