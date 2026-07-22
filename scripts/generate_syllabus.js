const fs = require('fs');

const syllabusText = `
### 1. History of India & Indian Freedom Struggle
- Pre-historic & Proto-historic India (Stone Age, Chalcolithic)
- Indus Valley Civilization
- Vedic Age (Early & Later Vedic)
- Jainism & Buddhism origins and spread
- Mahajanapadas & Rise of Magadha
- Mauryan Empire (Chandragupta, Ashoka, Administration)
- Post-Mauryan dynasties (Shunga, Kanva, Satavahana, Indo-Greeks)
- Gupta Empire (Polity, Economy, Golden Age)
- Post-Gupta period & Harshavardhana
- South Indian Dynasties (Chola, Chera, Pandya, Pallava)
- Delhi Sultanate (Slave, Khilji, Tughlaq, Sayyid, Lodi dynasties)
- Mughal Empire (Babur to Aurangzeb, administration, art)
- Vijayanagara & Bahmani Kingdoms
- Bhakti & Sufi Movements
- Maratha Empire (Shivaji to Peshwas)
- Advent of Europeans (Portuguese, Dutch, French, British)
- Anglo-Indian Wars (Carnatic, Mysore, Maratha, Sikh Wars)
- British Expansion — Diplomacy & Doctrine of Lapse
- Economic Impact of British Rule (Land Revenue Systems, Deindustrialization)
- Social & Religious Reform Movements (Brahmo Samaj, Arya Samaj, etc.)
- Revolt of 1857 — Causes, Course, Consequences
- Formation & Early Phase of Indian National Congress
- Partition of Bengal & Swadeshi Movement
- Rise of Extremism & Revolutionary Movements
- Home Rule Movement
- Gandhian Era (Non-Cooperation, Civil Disobedience, Quit India)
- Peasant, Worker & Tribal Movements
- Dalit Reform Movements (Ambedkar's contributions)
- Muslim Reform Movements & Aligarh Movement
- Azad Hind Fauj (Subhas Chandra Bose, INA)
- Independence & Partition of India (1947)
- Integration of Princely States

### 2. Physical Geography of India
- Location, Extent & Neighbouring Countries
- Geological Structure & Physiographic Divisions (Himalayas, Plains, Plateau, Coasts, Islands)
- Drainage System (Himalayan & Peninsular Rivers)
- Climate of India (Monsoon mechanism, seasons)
- Soil Types of India
- Natural Vegetation & Forest Types
- Wildlife & Biodiversity Conservation Areas

### 3. Social Geography of India
- Population Census & Demographic Trends
- Population Growth, Density & Distribution
- Birth Rate, Death Rate, Infant Mortality Rate
- Migration Patterns
- Literacy Rate & Occupational Structure
- Urbanization Trends

### 4. Economic Geography of India
- Agriculture — Cropping Patterns (Foodgrains, Pulses, Oilseeds, Cash Crops)
- Irrigation Systems & Multipurpose Projects
- Green, White & Blue Revolutions
- Mineral Resources — Distribution & Production
- Energy Resources (Coal, Petroleum, Thermal, Nuclear, Non-conventional)
- Industries — Development, Types & Location Factors

### 5. Indian Constitution
- Constitutional Development (1773–1950 — Regulating Act to Government of India Acts)
- Making of the Constitution (Constituent Assembly)
- Preamble — Features & Significance
- Nature of the Constitution (Federal/Unitary features)
- Fundamental Rights
- Fundamental Duties
- Directive Principles of State Policy
- Constitutional Amendments & Basic Structure Doctrine
- Emergency Provisions (National, State, Financial)

### 6. Indian Polity / State System
- Union Executive (President, Vice-President, PM, Council of Ministers)
- Union Legislature (Parliament — Lok Sabha, Rajya Sabha)
- Union Judiciary (Supreme Court, Judicial Review, Judicial Activism)
- Attorney General of India
- State Executive (Governor, CM, Council of Ministers)
- State Legislature
- State Judiciary (High Court, Advocate General)
- Centre-State Relations (Legislative, Administrative, Financial)
- All India Services
- UPSC & State Public Service Commissions
- Right to Constitutional Remedies & PILs
- Panchayati Raj & Municipalities (73rd & 74th Amendments)
- Lokpal & Lokayukta
- Right to Information Act
- Election Commission & Electoral Process
- Chhattisgarh's Administrative/Legislative/Judicial Structure

### 7. Indian Economy
- National Income & Per Capita Income concepts
- GDP, GNP, Structural Changes in Economy
- Five Year Plans & NITI Aayog
- Economic Reforms (LPG — 1991 reforms)
- Poverty & Unemployment (types, measurement)
- Banking System (RBI, Commercial Banks, NBFCs)
- Monetary Policy & Credit Control
- Public Finance (Revenue, Expenditure, Fiscal Deficit)
- Taxation System (Direct/Indirect, GST)
- Foreign Trade & Balance of Payments
- Inflation & Price Stability

### 8. General Science
- Physics — Mechanics, Light, Electricity, Modern Physics basics
- Chemistry — Chemical reactions, Metals/Non-metals, Organic compounds
- Biology — Human body systems, Plant physiology, Genetics basics
- Everyday Science Applications

### 9. Technology
- Basics of Computers & IT
- Role of IT in Rural Development
- Space Technology (ISRO milestones)
- Defence Technology
- Communication Technology
- Biotechnology Applications
- Nuclear Technology & Energy

### 10. Indian Philosophy
- Vedic & Upanishadic Thought
- Astika Schools (Nyaya, Vaisheshika, Samkhya, Yoga, Mimamsa, Vedanta)
- Nastika Schools (Charvaka, Jain, Buddhist philosophy)
- Bhagavad Gita's Philosophy
- Modern Indian Thinkers (Vivekananda, Aurobindo, Gandhi, Ambedkar)

### 11. Art, Literature & Culture of India
- Classical Dance Forms
- Classical & Folk Music
- Indian Architecture (Temple styles, Indo-Islamic architecture)
- Indian Paintings & Sculpture
- Sangam, Classical & Medieval Literature
- Fairs, Festivals & Religious Traditions
- UNESCO World Heritage Sites in India
- Languages & Literary Academies

### 12. Current Affairs (National/International)
- National Events, Policies & Schemes (last 1 year)
- International Relations & Summits
- Government Schemes & Missions
- Awards & Honours
- Appointments (national/international bodies)
- Books & Authors
- Obituaries (notable personalities)

### 13. Sports
- National & International Tournaments
- Olympics, Commonwealth, Asian Games
- Sports Awards (Khel Ratna, Arjuna, Dronacharya)
- Records & Achievements
- Sports Bodies & Terminology

### 14. Environment
- Ecosystem & Biodiversity Basics
- Environmental Pollution (Air, Water, Soil, Noise)
- Climate Change & Global Warming
- International Environmental Agreements (Paris Accord, Kyoto Protocol)
- National Environmental Policies & Laws
- Protected Areas — National Parks, Sanctuaries, Biosphere Reserves
- Sustainable Development Goals

---
NEXT_SECTION
---

### 1. History of Chhattisgarh
- Ancient Period (Vedic to Gupta era in region)
- Major Dynasties — Rajarshitulya Kula, Nala, Sharabhpuriya, Panduvanshi, Somvanshi
- Kalchuri Dynasty & Administration (Ratanpur & Raipur branches)
- Maratha Rule in Chhattisgarh
- British Protectorate Period
- Former Princely States & Zamindaris of Chhattisgarh
- Feudal Administration System

### 2. Chhattisgarh's Role in Freedom Movement
- Revolt of 1857 in Chhattisgarh (Narayan Singh, etc.)
- Local Freedom Fighters & Movements
- Formation of Chhattisgarh as Separate State (2000) — background

### 3. Geography of Chhattisgarh
- Location, Extent & Boundary
- Geological Structure & Physical Divisions
- Drainage System (Mahanadi, Shivnath, Indravati basins)
- Climate & Rainfall Pattern
- Soil Types

### 4. Census & Demographics of Chhattisgarh
- Population Growth, Density, Distribution
- Birth/Death/Infant Mortality Rates
- Sex Ratio & Age Groups
- Migration
- Scheduled Tribe Population Data
- Literacy & Occupational Structure
- Urbanization
- Family Welfare Programmes

### 5. Archaeological & Tourist Centres
- Archaeological Sites & Excavated Places (Sirpur, Malhar, etc.)
- Protected Monuments
- Tourist Destinations (notified by CG Govt.)
- Waterfalls & Caves (esp. Bastar region)
- National Parks & Wildlife Sanctuaries

### 6. Literature of Chhattisgarh
- History & Development of Chhattisgarhi Literature
- Major Litterateurs & Their Works
- Literary Institutions of the State

### 7. Music, Dance, Art & Culture
- Folk Music of Chhattisgarh
- Folk Dance Forms
- Folk Theatre
- Folk Art traditions
- State-established Cultural Institutions
- State Awards/Honours in Literature, Music, Fine Arts

### 8. Chhattisgarhi Idioms, Proverbs & Folk Sayings
- जनऊला (Riddles)
- मुहावरे (Idioms)
- हाना (Sayings)
- लोकोक्तियाँ (Proverbs)
- Vocabulary & Grammar basics (word formation, prefixes/suffixes)

### 9. Tribes of Chhattisgarh
- Special Primitive/Particularly Vulnerable Tribal Groups (PVTGs)
- Major & Minor Tribes
- Tribal Social Organization (Marriage, Family, Clan, Youth Dormitories/Ghotul)
- Ornaments & Traditional Attire of Tribes
- Tribal Development History, Programmes & Constitutional Provisions
- Tribal Problems — Isolation, Migration, Acculturation
- Scheduled Castes & Other Backward Classes of Chhattisgarh

### 10. Special Traditions, Teej & Festivals
- Major Fairs (Melas) of Chhattisgarh
- Religious & Seasonal Festivals
- Tribal Festivals & Rituals
- Prominent Saints of Chhattisgarh (Guru Ghasidas, etc.)

### 11. Economy of Chhattisgarh
- State Income & Economic Indicators
- Socio-economic Backwardness of SC/ST/OBC/Minorities
- Employment & Income Distribution trends
- Women's Socio-Political-Economic Empowerment
- Child Labour Issues
- Rural Development Programmes
- State Finance — Budget, Tax Structure, Central Tax Share
- Public Debt Composition
- Rural Credit — Institutional/Non-institutional sources
- Co-operative Sector — Structure & Growth

### 12. Forest & Agriculture of Chhattisgarh
- Major Crops (Foodgrains, Pulses, Oilseeds)
- Production & Distribution of Crops
- Irrigation Projects in Chhattisgarh
- Problems of Agriculture & State Schemes for Farmers
- Forest Cover & Forest Types
- Forest Policy & Conservation
- Wildlife Management (Parks & Sanctuaries)

### 13. Administrative Structure of Chhattisgarh
- State Executive, Legislature, Judiciary
- District Administration Setup
- Revenue Administration

### 14. Local Government & Panchayati Raj
- Panchayati Raj Institutions in CG
- Urban Local Bodies (Municipal structure)
- 73rd/74th Amendment implementation in state context

### 15. Industry, Energy, Water & Mineral Resources
- Mineral Resources — Types, Reserves, Production, Distribution
- Energy Resources (Coal, Thermal Power, Non-conventional sources)
- Industrial Development & Structure (Large, Medium, Small scale)
- Agriculture, Forest & Mineral-based Industries
- Means of Transport in Chhattisgarh

### 16. Current Affairs of Chhattisgarh
- Recent State Government Schemes & Policies
- Recent Appointments & Awards (state level)
- State Government Initiatives (last 1 year)
- Recent Infrastructure/Development Projects

---
NEXT_SECTION
---

### 1. Interpersonal & Communication Skills
- Comprehension-based reasoning
- Effective communication concepts

### 2. Logical Reasoning
- Analogy / Similarity-based questions
- Odd One Out (word/number)
- Odd Pair of Words
- Coding-Decoding
- Blood Relations
- Alphabet Test
- Series Completion (Number/Figure/Letter)
- Statement & Assertion-Reason
- Situation Reaction Test
- Missing Number/Word Insertion

### 3. Analytical Ability
- Logical analysis of words
- Data sufficiency
- Pattern recognition

### 4. Decision Making & Problem Solving
- Case-based decision scenarios
- Problem-solving techniques

### 5. General Mental Ability
- Puzzles
- Visual/figure reasoning

### 6. Basic Numeracy (Class X Level)
- Number Systems & Basic Arithmetic Operations
- Ratio & Proportion
- Percentage, Profit & Loss
- Simple & Compound Interest
- Time, Speed & Distance (incl. boats & streams)
- Averages
- LCM & HCF, Factorization
- Vedic Mathematics techniques (Squares, Cubes, Roots)
- Banking Calculations (Savings, FD, RD interest)
- Income Tax Calculation basics
- Indian Mathematicians (Aryabhata, Brahmagupta, Bhaskaracharya, Ramanujan)

### 7. Data Interpretation
- Charts & Graphs
- Tables
- Data Sufficiency
- Statistical Measures (Mean, Median, Mode)
- Probability (basic theorems)

### 8. Hindi Language Knowledge (Class X Level)
- Grammar basics
- Comprehension

### 9. Chhattisgarhi Language Knowledge
- Basic vocabulary & comprehension
- Common usage
`;

const sections = syllabusText.split('---NEXT_SECTION---').map(s => s.trim());
const papers = [
  "Paper 1 · General Studies (India)",
  "Paper 1 · General Knowledge of Chhattisgarh",
  "Paper 2 · Aptitude Test (CSAT)"
];
const icons = ["🏛️", "🗺️", "⚖️", "💰", "🔬", "🎭", "🌱", "📰", "⚙️", "🤔", "🎨", "📅", "🏏", "🌲", "🏔️", "📜", "🌄", "📊", "🛕", "✍️", "💃", "🗨️", "🏹", "🎪", "📉", "🌾", "🏢", "🏘️", "🏭", "🗞️", "🧩", "🔢", "🧠", "💡", "🎲", "➗", "📈", "🗣️", "💬"];

let subjectId = 1;
let topicId = 1001;
const subjectsSql = [];
const topicsSql = [];

let iconIdx = 0;

sections.forEach((sec, sIdx) => {
  const paperName = papers[sIdx];
  const lines = sec.split('\n').filter(l => l.trim().length > 0);
  
  let currentSubjectId = null;
  
  lines.forEach(line => {
    if (line.startsWith('### ')) {
      const sName = line.replace(/### \d+\.\s*/, '').trim().replace(/'/g, "''");
      const icon = icons[iconIdx % icons.length];
      iconIdx++;
      subjectsSql.push(`INSERT INTO subjects (id, paper, icon, name, sort_order) VALUES (${subjectId}, '${paperName}', '${icon}', '${sName}', ${subjectId});`);
      currentSubjectId = subjectId;
      subjectId++;
    } else if (line.startsWith('- ')) {
      const tName = line.replace(/-\s*/, '').trim().replace(/'/g, "''");
      topicsSql.push(`INSERT INTO topics (id, subject_id, name, sort_order) VALUES (${topicId}, ${currentSubjectId}, '${tName}', ${topicId});`);
      topicId++;
    }
  });
});

const sql = `
-- Create subtopics table
CREATE TABLE IF NOT EXISTS subtopics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_hi TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add subtopic_id columns (SQLite doesn't error if they exist, but ALTER TABLE doesn't support IF NOT EXISTS in old SQLite.
-- We'll try to add them via a migration wrapper or just run it directly.
ALTER TABLE quizzes ADD COLUMN subtopic_id INTEGER;
ALTER TABLE quiz_attempts ADD COLUMN subtopic_id INTEGER;

-- Clear old data
DELETE FROM subjects;
DELETE FROM topics;

-- Insert Subjects
${subjectsSql.join('\n')}

-- Insert Topics
${topicsSql.join('\n')}
`;

fs.writeFileSync('migrations/0004_syllabus_update.sql', sql);
console.log('Migration generated.');
