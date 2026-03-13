import { useState, useEffect, useRef } from "react";
import { supabase as realSupabase } from "./supabase";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import SubjectPage from "./pages/SubjectPage";
import TopicPage from "./pages/TopicPage";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";

// --- SUPABASE CLIENT PLACEHOLDER FOR CANVAS PREVIEW ---
// For local development, delete this dummy object and uncomment the import below:
// import { supabase } from "./supabase";

// Creates a thenable chain that PRESERVES its resolved value through all chaining methods.
// This is critical: .select().eq().order() must all resolve to the same data, not wipe it.
const createQueryChain = (resolvedValue = { data: [], error: null }) => {
  const promise = Promise.resolve(resolvedValue);
  // Each chain method returns a new chain with the SAME data (not empty)
  const self = () => createQueryChain(resolvedValue);
  promise.eq        = self;
  promise.order     = self;
  promise.limit     = self;
  promise.select    = self;
  promise.single    = self;
  promise.match     = self;
  promise.filter    = self;
  promise.or        = self;
  promise.in        = self;
  promise.is        = self;
  promise.not       = self;
  promise.range     = self;
  promise.contains  = self;
  promise.ascending = self;
  promise.update    = self;
  promise.insert    = async () => ({ error: null });
  promise.upsert    = async () => ({ error: null });
  promise.delete    = async () => ({ error: null });
  return promise;
};
const idsMatch = (a, b) => String(a == null ? "" : a) === String(b == null ? "" : b);

// ── PREVIEW USER PROFILE ────────────────────────────────────────────────────
const PREVIEW_PROFILE = {
  id: "preview-user",
  full_name: "Aspirant",
  email: "preview@cgpsc.com",
  avatar_url: null,
  provider: "google",
  total_attempts: 12,
  total_score: 187,
  avg_accuracy: 74,
  best_streak: 5,
  current_streak: 3,
  preferred_lang: "en",
  dark_mode: false,
  created_at: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
  last_seen_at: new Date().toISOString(),
};



// ── MOCK QUIZ ATTEMPTS for preview ───────────────────────────────────────────
const PREVIEW_ATTEMPTS = [
  { id:1, user_id:"preview-user", quiz_id:1, subject_id:1, topic_id:107, score:4, total:5, accuracy:80, time_taken:480,
    created_at: new Date(Date.now()-2*24*60*60*1000).toISOString(),
    quizzes: { title:"The Revolt of 1857 — PYQ Set", title_hi:"1857 का विद्रोह — पिछले वर्ष प्रश्न" },
    subjects: { name:"Indian History & National Movement", name_hi:"भारतीय इतिहास और राष्ट्रीय आंदोलन" },
    topics:   { name:"The Revolt of 1857", name_hi:"1857 का विद्रोह" }
  },
  { id:2, user_id:"preview-user", quiz_id:2, subject_id:1, topic_id:102, score:3, total:5, accuracy:60, time_taken:320,
    created_at: new Date(Date.now()-5*24*60*60*1000).toISOString(),
    quizzes: { title:"Vedic Culture — Practice Set 1", title_hi:null },
    subjects: { name:"Indian History & National Movement", name_hi:"भारतीय इतिहास और राष्ट्रीय आंदोलन" },
    topics:   { name:"Vedic Culture", name_hi:"वैदिक संस्कृति" }
  },
];

// ── MOCK QUIZZES for preview ──────────────────────────────────────────────────
const PREVIEW_QUIZZES = [
  { id:1, topic_id:107, title:"The Revolt of 1857 — PYQ Set",     title_hi:"1857 का विद्रोह — पिछले वर्ष प्रश्न", difficulty:"Hard",   total_questions:3,  time_limit_mins:10, is_previous_year:true },
  { id:2, topic_id:102, title:"Vedic Culture — Practice Set 1",   title_hi:null,                                   difficulty:"Medium", total_questions:5,  time_limit_mins:10, is_previous_year:false },
  { id:3, topic_id:303, title:"Fundamental Rights — Set 1",       title_hi:"मौलिक अधिकार — सेट 1",                difficulty:"Easy",   total_questions:5,  time_limit_mins:10, is_previous_year:true },
];

// ── MOCK QUESTIONS for preview ────────────────────────────────────────────────
const PREVIEW_QUESTIONS = [
  { id:1, quiz_id:2, question:"Which is the oldest of the four Vedas?", option_a:"Samaveda", option_b:"Rigveda", option_c:"Yajurveda", option_d:"Atharvaveda", correct_option:1, explanation:"The Rigveda is the oldest Veda, composed around 1500–1200 BCE.", question_hi:"चारों वेदों में सबसे प्राचीन कौन सा है?", option_a_hi:"सामवेद", option_b_hi:"ऋग्वेद", option_c_hi:"यजुर्वेद", option_d_hi:"अथर्ववेद", explanation_hi:"ऋग्वेद सबसे प्राचीन वेद है, जो लगभग 1500–1200 ईसा पूर्व रचित है।", sort_order:1 },
  { id:2, quiz_id:2, question:"The Vedic river 'Saraswati' corresponds to which modern river system?", option_a:"Indus", option_b:"Ganga", option_c:"Ghaggar-Hakra", option_d:"Yamuna", correct_option:2, explanation:"Most scholars identify the Rigvedic Saraswati with the Ghaggar-Hakra river system.", question_hi:null, option_a_hi:null, option_b_hi:null, option_c_hi:null, option_d_hi:null, explanation_hi:null, sort_order:2 },
  { id:3, quiz_id:2, question:"The term 'Gotra' in Vedic society primarily referred to?", option_a:"Village unit", option_b:"Patrilineal clan", option_c:"Cattle pen", option_d:"Administrative unit", correct_option:1, explanation:"Gotra evolved to mean a patrilineal clan tracing descent from a common ancestor.", question_hi:null, option_a_hi:null, option_b_hi:null, option_c_hi:null, option_d_hi:null, explanation_hi:null, sort_order:3 },
  { id:4, quiz_id:2, question:"Which assembly in the Rig Vedic period was larger and more democratic?", option_a:"Sabha", option_b:"Samiti", option_c:"Parishad", option_d:"Gana", correct_option:1, explanation:"Samiti was the larger popular assembly of all tribal members.", question_hi:null, option_a_hi:null, option_b_hi:null, option_c_hi:null, option_d_hi:null, explanation_hi:null, sort_order:4 },
  { id:5, quiz_id:2, question:"The Upanishads are also known as?", option_a:"Aranyakas", option_b:"Brahmanas", option_c:"Vedangas", option_d:"Vedanta", correct_option:3, explanation:"The Upanishads are called Vedanta — the end/culmination of the Vedas.", question_hi:null, option_a_hi:null, option_b_hi:null, option_c_hi:null, option_d_hi:null, explanation_hi:null, sort_order:5 },
  { id:6, quiz_id:1, question:"The revolt of 1857 started from which place on 10 May?", option_a:"Delhi", option_b:"Meerut", option_c:"Lucknow", option_d:"Kanpur", correct_option:1, explanation:"The revolt began on 10 May 1857 at Meerut.", question_hi:"10 मई 1857 का विद्रोह किस स्थान से शुरू हुआ था?", option_a_hi:"दिल्ली", option_b_hi:"मेरठ", option_c_hi:"लखनऊ", option_d_hi:"कानपुर", explanation_hi:"10 मई 1857 को मेरठ में विद्रोह शुरू हुआ था।", sort_order:1 },
  { id:7, quiz_id:1, question:"Who is regarded as the first martyr of the 1857 Revolt?", option_a:"Tantia Tope", option_b:"Mangal Pandey", option_c:"Nana Sahib", option_d:"Bahadur Shah Zafar", correct_option:1, explanation:"Mangal Pandey fired the first shot on 29 March 1857 at Barrackpore.", question_hi:"1857 के विद्रोह का प्रथम शहीद कौन था?", option_a_hi:"तात्या टोपे", option_b_hi:"मंगल पांडे", option_c_hi:"नाना साहब", option_d_hi:"बहादुर शाह ज़फ़र", explanation_hi:"मंगल पांडे ने 29 मार्च 1857 को बैरकपुर में पहली गोली चलाई थी।", sort_order:2 },
  { id:8, quiz_id:1, question:"The revolt of 1857 was called 'First War of Independence' by?", option_a:"Bal Gangadhar Tilak", option_b:"V.D. Savarkar", option_c:"Lala Lajpat Rai", option_d:"Subhas Chandra Bose", correct_option:1, explanation:"V.D. Savarkar described it as the First War of Indian Independence in his 1909 book.", question_hi:null, option_a_hi:null, option_b_hi:null, option_c_hi:null, option_d_hi:null, explanation_hi:null, sort_order:3 },
  { id:9, quiz_id:3, question:"In which Part of the Indian Constitution are Fundamental Rights enshrined?", option_a:"Part II", option_b:"Part III", option_c:"Part IV", option_d:"Part V", correct_option:1, explanation:"Fundamental Rights are in Part III (Articles 12–35).", question_hi:"भारतीय संविधान के किस भाग में मौलिक अधिकार वर्णित हैं?", option_a_hi:"भाग II", option_b_hi:"भाग III", option_c_hi:"भाग IV", option_d_hi:"भाग V", explanation_hi:"मौलिक अधिकार भाग III (अनुच्छेद 12–35) में हैं।", sort_order:1 },
];

const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (cb) => {
      setTimeout(() => cb("SIGNED_IN", { user: { id: "preview-user", email: "preview@cgpsc.com", user_metadata: { full_name: "Aspirant" } } }), 600);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithOAuth: async () => ({ error: null }),
    signOut: async () => { try { window.location.reload(); } catch(e) {} }
  },
  from: (table) => {
    // Each table returns its own correct mock dataset so the preview works end-to-end
    const mockData =
      table === "profiles"      ? [PREVIEW_PROFILE]      :
      table === "saved_questions" ? { data: [], error: null } :
      table === "subjects"      ? STATIC_DATA.subjects    :
      table === "topics"        ? Object.values(STATIC_DATA.topics).flat() :
      table === "quizzes"       ? PREVIEW_QUIZZES         :
      table === "questions"     ? PREVIEW_QUESTIONS       :
      table === "quiz_attempts" ? PREVIEW_ATTEMPTS        :
      [];
    return createQueryChain({ data: mockData, error: null });
  }
};

const supabase = process.env.REACT_APP_USE_MOCK === "true" ? mockSupabase : realSupabase;

// ─── STATIC CGPSC SUBJECTS & TOPICS SCHEMA ────────────────────────────────────
const STATIC_DATA = {
  subjects: [
    // ── PAPER 1: GENERAL STUDIES (INDIA) ──────────────────────────────────────
    { id:1,  paper:"Paper 1 · General Studies (India)",    icon:"🏛️", name:"Indian History & National Movement",          name_hi:"भारतीय इतिहास और राष्ट्रीय आंदोलन" },
    { id:2,  paper:"Paper 1 · General Studies (India)",    icon:"🗺️", name:"Geography of India",                          name_hi:"भारत का भूगोल" },
    { id:3,  paper:"Paper 1 · General Studies (India)",    icon:"⚖️", name:"Constitution of India & Polity",              name_hi:"भारत का संविधान और राजव्यवस्था" },
    { id:4,  paper:"Paper 1 · General Studies (India)",    icon:"💰", name:"Indian Economy",                              name_hi:"भारतीय अर्थव्यवस्था" },
    { id:5,  paper:"Paper 1 · General Studies (India)",    icon:"🔬", name:"General Science & Technology",                name_hi:"सामान्य विज्ञान और प्रौद्योगिकी" },
    { id:6,  paper:"Paper 1 · General Studies (India)",    icon:"🎭", name:"Indian Philosophy, Art, Literature & Culture", name_hi:"भारतीय दर्शन, कला, साहित्य और संस्कृति" },
    { id:7,  paper:"Paper 1 · General Studies (India)",    icon:"🌱", name:"Environment & Ecology",                       name_hi:"पर्यावरण और पारिस्थितिकी" },
    { id:8,  paper:"Paper 1 · General Studies (India)",    icon:"📰", name:"National & International Current Affairs",    name_hi:"राष्ट्रीय और अंतर्राष्ट्रीय समसामयिकी" },
    // ── PAPER 1: GENERAL KNOWLEDGE OF CHHATTISGARH ────────────────────────────
    { id:9,  paper:"Paper 1 · General Knowledge of Chhattisgarh", icon:"🏔️", name:"History of Chhattisgarh",                   name_hi:"छत्तीसगढ़ का इतिहास" },
    { id:10, paper:"Paper 1 · General Knowledge of Chhattisgarh", icon:"🌄", name:"Geography of Chhattisgarh",                  name_hi:"छत्तीसगढ़ का भूगोल" },
    { id:11, paper:"Paper 1 · General Knowledge of Chhattisgarh", icon:"🎨", name:"Culture, Literature & Arts of Chhattisgarh", name_hi:"छत्तीसगढ़ की संस्कृति, साहित्य और कला" },
    { id:12, paper:"Paper 1 · General Knowledge of Chhattisgarh", icon:"🪘", name:"Tribes of Chhattisgarh",                     name_hi:"छत्तीसगढ़ की जनजातियाँ" },
    { id:13, paper:"Paper 1 · General Knowledge of Chhattisgarh", icon:"🌾", name:"Economy, Agriculture & Resources of CG",     name_hi:"छत्तीसगढ़ की अर्थव्यवस्था, कृषि और संसाधन" },
    { id:14, paper:"Paper 1 · General Knowledge of Chhattisgarh", icon:"🏛️", name:"Polity & Administration of Chhattisgarh",   name_hi:"छत्तीसगढ़ की राजव्यवस्था और प्रशासन" },
    { id:15, paper:"Paper 1 · General Knowledge of Chhattisgarh", icon:"📡", name:"Chhattisgarh Current Affairs",               name_hi:"छत्तीसगढ़ समसामयिकी" },
    // ── PAPER 2: APTITUDE TEST (CSAT) ─────────────────────────────────────────
    { id:16, paper:"Paper 2 · Aptitude Test (CSAT)",       icon:"🧩", name:"Logical Reasoning & Analytical Ability",     name_hi:"तार्किक तर्क और विश्लेषणात्मक क्षमता" },
    { id:17, paper:"Paper 2 · Aptitude Test (CSAT)",       icon:"🔢", name:"General Mental Ability & Basic Numeracy",    name_hi:"सामान्य मानसिक योग्यता और बुनियादी संख्यात्मकता" },
    { id:18, paper:"Paper 2 · Aptitude Test (CSAT)",       icon:"📊", name:"Data Interpretation",                       name_hi:"आँकड़ा निर्वचन" },
    { id:19, paper:"Paper 2 · Aptitude Test (CSAT)",       icon:"🤔", name:"Decision Making & Problem Solving",          name_hi:"निर्णय लेना और समस्या समाधान" },
    { id:20, paper:"Paper 2 · Aptitude Test (CSAT)",       icon:"🗣️", name:"Languages (Hindi & Chhattisgarhi)",          name_hi:"भाषाएँ (हिंदी और छत्तीसगढ़ी)" },
  ],
  topics: {
    1:  [
      { id:101, subject_id:1, name:"Pre-historic Age & Indus Valley Civilization",   name_hi:"प्रागैतिहासिक काल और सिंधु घाटी सभ्यता" },
      { id:102, subject_id:1, name:"Vedic Culture",                                  name_hi:"वैदिक संस्कृति" },
      { id:103, subject_id:1, name:"Major Ancient Empires (Mauryan, Gupta, etc.)",   name_hi:"प्रमुख प्राचीन साम्राज्य (मौर्य, गुप्त आदि)" },
      { id:104, subject_id:1, name:"Major Dynasties of South India",                  name_hi:"दक्षिण भारत के प्रमुख राजवंश" },
      { id:105, subject_id:1, name:"Medieval India (Delhi Sultanate & Mughals)",      name_hi:"मध्यकालीन भारत (दिल्ली सल्तनत और मुगल)" },
      { id:106, subject_id:1, name:"Advent of Europeans & British Expansion",         name_hi:"यूरोपियों का आगमन और ब्रिटिश विस्तार" },
      { id:107, subject_id:1, name:"The Revolt of 1857",                              name_hi:"1857 का विद्रोह" },
      { id:108, subject_id:1, name:"Socio-Religious Reform Movements",                name_hi:"सामाजिक-धार्मिक सुधार आंदोलन" },
      { id:109, subject_id:1, name:"Indian National Movement (Freedom Struggle)",     name_hi:"भारतीय राष्ट्रीय आंदोलन (स्वतंत्रता संग्राम)" },
      { id:110, subject_id:1, name:"Post-Independence Consolidation",                 name_hi:"स्वतंत्रता के बाद एकीकरण" },
    ],
    2:  [
      { id:201, subject_id:2, name:"Physical Features & Geological Structure",        name_hi:"भौतिक विशेषताएँ और भूवैज्ञानिक संरचना" },
      { id:202, subject_id:2, name:"Drainage System (Rivers & Lakes)",                name_hi:"अपवाह तंत्र (नदियाँ और झीलें)" },
      { id:203, subject_id:2, name:"Climate, Soil, and Vegetation",                   name_hi:"जलवायु, मृदा और वनस्पति" },
      { id:204, subject_id:2, name:"Demographics (Population, Census, Density)",      name_hi:"जनसांख्यिकी (जनसंख्या, जनगणना, घनत्व)" },
      { id:205, subject_id:2, name:"Indian Agriculture",                              name_hi:"भारतीय कृषि" },
      { id:206, subject_id:2, name:"Minerals and Mining",                             name_hi:"खनिज और खनन" },
      { id:207, subject_id:2, name:"Energy Resources (Renewable & Non-renewable)",    name_hi:"ऊर्जा संसाधन (नवीकरणीय और गैर-नवीकरणीय)" },
      { id:208, subject_id:2, name:"Industries and Transport Networks",               name_hi:"उद्योग और परिवहन नेटवर्क" },
    ],
    3:  [
      { id:301, subject_id:3, name:"Constitutional Development (1773–1950)",          name_hi:"संवैधानिक विकास (1773–1950)" },
      { id:302, subject_id:3, name:"Making of the Constitution & Preamble",           name_hi:"संविधान निर्माण और उद्देशिका" },
      { id:303, subject_id:3, name:"Fundamental Rights & Duties",                     name_hi:"मौलिक अधिकार और कर्तव्य" },
      { id:304, subject_id:3, name:"Directive Principles of State Policy (DPSP)",     name_hi:"राज्य के नीति निदेशक तत्व" },
      { id:305, subject_id:3, name:"Union Executive, Legislature & Judiciary",        name_hi:"संघीय कार्यपालिका, विधायिका और न्यायपालिका" },
      { id:306, subject_id:3, name:"State Executive, Legislature & Judiciary",        name_hi:"राज्य कार्यपालिका, विधायिका और न्यायपालिका" },
      { id:307, subject_id:3, name:"Panchayati Raj & Municipalities",                 name_hi:"पंचायती राज और नगरपालिकाएँ" },
      { id:308, subject_id:3, name:"Constitutional & Non-Constitutional Bodies",      name_hi:"संवैधानिक और गैर-संवैधानिक निकाय" },
    ],
    4:  [
      { id:401, subject_id:4, name:"Basic Economic Concepts & National Income",       name_hi:"बुनियादी आर्थिक अवधारणाएँ और राष्ट्रीय आय" },
      { id:402, subject_id:4, name:"Economic Planning & NITI Aayog",                  name_hi:"आर्थिक नियोजन और नीति आयोग" },
      { id:403, subject_id:4, name:"Money, Banking & RBI (Monetary Policy)",          name_hi:"मुद्रा, बैंकिंग और RBI" },
      { id:404, subject_id:4, name:"Inflation & Taxation",                            name_hi:"मुद्रास्फीति और कराधान" },
      { id:405, subject_id:4, name:"Union Budget & Fiscal Policy",                    name_hi:"केंद्रीय बजट और राजकोषीय नीति" },
      { id:406, subject_id:4, name:"Agriculture, Industry and Services Sectors",      name_hi:"कृषि, उद्योग और सेवा क्षेत्र" },
      { id:407, subject_id:4, name:"Poverty, Unemployment & Rural Development",       name_hi:"गरीबी, बेरोजगारी और ग्रामीण विकास" },
      { id:408, subject_id:4, name:"Foreign Trade & International Organizations",     name_hi:"विदेश व्यापार और अंतर्राष्ट्रीय संगठन" },
    ],
    5:  [
      { id:501, subject_id:5, name:"Physics (Mechanics, Light, Sound, Electricity)", name_hi:"भौतिकी (यांत्रिकी, प्रकाश, ध्वनि, विद्युत)" },
      { id:502, subject_id:5, name:"Chemistry (Elements, Compounds, Reactions)",     name_hi:"रसायन विज्ञान (तत्व, यौगिक, अभिक्रियाएँ)" },
      { id:503, subject_id:5, name:"Biology (Human Body, Diseases, Botany, Zoology)",name_hi:"जीव विज्ञान (मानव शरीर, रोग, वनस्पति, प्राणी)" },
      { id:504, subject_id:5, name:"Space Technology & ISRO",                        name_hi:"अंतरिक्ष प्रौद्योगिकी और इसरो" },
      { id:505, subject_id:5, name:"Information Technology & Computers",             name_hi:"सूचना प्रौद्योगिकी और कंप्यूटर" },
      { id:506, subject_id:5, name:"Defense Technology",                             name_hi:"रक्षा प्रौद्योगिकी" },
      { id:507, subject_id:5, name:"Biotechnology",                                  name_hi:"जैव प्रौद्योगिकी" },
    ],
    6:  [
      { id:601, subject_id:6, name:"Nature of Indian Philosophy (Samkhya, Yoga, Buddhism, Jainism)", name_hi:"भारतीय दर्शन (सांख्य, योग, बौद्ध, जैन)" },
      { id:602, subject_id:6, name:"Indian Architecture & Sculpture",                name_hi:"भारतीय वास्तुकला और मूर्तिकला" },
      { id:603, subject_id:6, name:"Indian Paintings",                               name_hi:"भारतीय चित्रकला" },
      { id:604, subject_id:6, name:"Classical & Folk Dances of India",               name_hi:"भारत के शास्त्रीय और लोक नृत्य" },
      { id:605, subject_id:6, name:"Indian Music (Hindustani & Carnatic)",           name_hi:"भारतीय संगीत (हिंदुस्तानी और कर्नाटक)" },
      { id:606, subject_id:6, name:"Important Books & Authors (Ancient to Modern)",  name_hi:"महत्वपूर्ण पुस्तकें और लेखक" },
    ],
    7:  [
      { id:701, subject_id:7, name:"Ecosystems & Food Chains",                       name_hi:"पारिस्थितिकी तंत्र और खाद्य श्रृंखला" },
      { id:702, subject_id:7, name:"Biodiversity & Conservation",                    name_hi:"जैव विविधता और संरक्षण" },
      { id:703, subject_id:7, name:"Environmental Pollution & Control",              name_hi:"पर्यावरण प्रदूषण और नियंत्रण" },
      { id:704, subject_id:7, name:"Climate Change & Global Warming",                name_hi:"जलवायु परिवर्तन और ग्लोबल वार्मिंग" },
      { id:705, subject_id:7, name:"National Parks, Sanctuaries & Biosphere Reserves", name_hi:"राष्ट्रीय उद्यान, अभयारण्य और जीवमंडल" },
      { id:706, subject_id:7, name:"Environmental Laws, Treaties & Protocols",       name_hi:"पर्यावरण कानून, संधियाँ और प्रोटोकॉल" },
    ],
    8:  [
      { id:801, subject_id:8, name:"Recent National Events",                         name_hi:"हालिया राष्ट्रीय घटनाएँ" },
      { id:802, subject_id:8, name:"Recent International Events",                    name_hi:"हालिया अंतर्राष्ट्रीय घटनाएँ" },
      { id:803, subject_id:8, name:"Important Summits & Conferences",                name_hi:"महत्वपूर्ण सम्मेलन और शिखर सम्मेलन" },
      { id:804, subject_id:8, name:"Awards & Honors",                                name_hi:"पुरस्कार और सम्मान" },
      { id:805, subject_id:8, name:"Sports Tournaments & Winners",                   name_hi:"खेल टूर्नामेंट और विजेता" },
      { id:806, subject_id:8, name:"Important Days & Themes",                        name_hi:"महत्वपूर्ण दिवस और विषय" },
    ],
    9:  [
      { id:901, subject_id:9, name:"Pre-historic & Ancient History of CG",           name_hi:"छत्तीसगढ़ का प्रागैतिहासिक और प्राचीन इतिहास" },
      { id:902, subject_id:9, name:"Major Regional Dynasties (Kalchuri, Somvanshi)", name_hi:"प्रमुख क्षेत्रीय राजवंश (कलचुरी, सोमवंशी)" },
      { id:903, subject_id:9, name:"Maratha Rule in Chhattisgarh",                   name_hi:"छत्तीसगढ़ में मराठा शासन" },
      { id:904, subject_id:9, name:"Zamindari System",                               name_hi:"जमींदारी व्यवस्था" },
      { id:905, subject_id:9, name:"Revolt of 1857 in Chhattisgarh",                 name_hi:"छत्तीसगढ़ में 1857 का विद्रोह" },
      { id:906, subject_id:9, name:"Tribal Revolts in Chhattisgarh",                 name_hi:"छत्तीसगढ़ में जनजातीय विद्रोह" },
      { id:907, subject_id:9, name:"Contribution of CG to the National Freedom Movement", name_hi:"राष्ट्रीय स्वतंत्रता आंदोलन में CG का योगदान" },
      { id:908, subject_id:9, name:"Formation of the Chhattisgarh State",            name_hi:"छत्तीसगढ़ राज्य का गठन" },
    ],
    10: [
      { id:1001, subject_id:10, name:"Location & Physical Features",                 name_hi:"स्थिति और भौतिक विशेषताएँ" },
      { id:1002, subject_id:10, name:"Drainage System (Rivers of CG)",               name_hi:"अपवाह तंत्र (CG की नदियाँ)" },
      { id:1003, subject_id:10, name:"Climate & Soils",                              name_hi:"जलवायु और मृदा" },
      { id:1004, subject_id:10, name:"Forests & Wildlife Sanctuaries/National Parks",name_hi:"वन और वन्यजीव अभयारण्य/राष्ट्रीय उद्यान" },
      { id:1005, subject_id:10, name:"Demographics & Census of Chhattisgarh",        name_hi:"जनसांख्यिकी और जनगणना" },
      { id:1006, subject_id:10, name:"Archaeological & Tourist Centers",             name_hi:"पुरातात्विक और पर्यटन केंद्र" },
    ],
    11: [
      { id:1101, subject_id:11, name:"Literature & Prominent Authors of CG",         name_hi:"साहित्य और प्रमुख लेखक" },
      { id:1102, subject_id:11, name:"Folk Music & Folk Dances (Panthi, Raut Nacha, Pandwani)", name_hi:"लोक संगीत और नृत्य (पंथी, राउत नाचा, पंडवानी)" },
      { id:1103, subject_id:11, name:"Art & Craft of Chhattisgarh",                  name_hi:"छत्तीसगढ़ की कला और शिल्प" },
      { id:1104, subject_id:11, name:"Idioms, Proverbs, Puzzles (Janula) & Hana",    name_hi:"मुहावरे, लोकोक्तियाँ, जानुला और हाना" },
      { id:1105, subject_id:11, name:"Fairs & Festivals (Madai, Hareli, Pola, etc.)",name_hi:"मेले और त्योहार (मड़ई, हरेली, पोला आदि)" },
    ],
    12: [
      { id:1201, subject_id:12, name:"Major Tribes (Gond, Baiga, Halba, etc.)",      name_hi:"प्रमुख जनजातियाँ (गोंड, बैगा, हल्बा आदि)" },
      { id:1202, subject_id:12, name:"Tribal Culture, Marriage, Family & Clan",      name_hi:"जनजातीय संस्कृति, विवाह, परिवार और गोत्र" },
      { id:1203, subject_id:12, name:"Special Tribal Traditions & Customs",          name_hi:"विशेष जनजातीय परंपराएँ और रीति-रिवाज" },
      { id:1204, subject_id:12, name:"Tribal Development Programs",                  name_hi:"जनजातीय विकास कार्यक्रम" },
    ],
    13: [
      { id:1301, subject_id:13, name:"State Economy & Budget",                       name_hi:"राज्य की अर्थव्यवस्था और बजट" },
      { id:1302, subject_id:13, name:"Agriculture & Forest Produce",                 name_hi:"कृषि और वन उपज" },
      { id:1303, subject_id:13, name:"Mineral Resources (Coal, Iron ore, Bauxite)",  name_hi:"खनिज संसाधन (कोयला, लौह अयस्क, बॉक्साइट)" },
      { id:1304, subject_id:13, name:"Energy Resources & Power Generation",          name_hi:"ऊर्जा संसाधन और विद्युत उत्पादन" },
      { id:1305, subject_id:13, name:"Major Industries in Chhattisgarh",             name_hi:"छत्तीसगढ़ के प्रमुख उद्योग" },
      { id:1306, subject_id:13, name:"Water Resources & Irrigation Projects",        name_hi:"जल संसाधन और सिंचाई परियोजनाएँ" },
    ],
    14: [
      { id:1401, subject_id:14, name:"Administrative Structure of the State",        name_hi:"राज्य की प्रशासनिक संरचना" },
      { id:1402, subject_id:14, name:"State Legislature, Executive & High Court",    name_hi:"राज्य विधायिका, कार्यपालिका और उच्च न्यायालय" },
      { id:1403, subject_id:14, name:"Local Government & Panchayati Raj in CG",     name_hi:"स्थानीय सरकार और पंचायती राज" },
    ],
    15: [
      { id:1501, subject_id:15, name:"State Government Schemes & Policies",          name_hi:"राज्य सरकार की योजनाएँ और नीतियाँ" },
      { id:1502, subject_id:15, name:"Recent Political & Economic Developments in CG",name_hi:"CG में हालिया राजनीतिक और आर्थिक विकास" },
      { id:1503, subject_id:15, name:"State Awards, Sports & Personalities in News", name_hi:"राज्य पुरस्कार, खेल और चर्चित व्यक्तित्व" },
    ],
    16: [
      { id:1601, subject_id:16, name:"Series Completion (Number & Alphabet)",        name_hi:"श्रृंखला पूर्णता (संख्या और वर्णमाला)" },
      { id:1602, subject_id:16, name:"Coding-Decoding",                              name_hi:"कोडिंग-डिकोडिंग" },
      { id:1603, subject_id:16, name:"Blood Relations",                              name_hi:"रक्त संबंध" },
      { id:1604, subject_id:16, name:"Direction Sense",                              name_hi:"दिशा बोध" },
      { id:1605, subject_id:16, name:"Syllogism & Venn Diagrams",                    name_hi:"न्यायवाक्य और वेन आरेख" },
      { id:1606, subject_id:16, name:"Analogy & Classification",                     name_hi:"सादृश्यता और वर्गीकरण" },
      { id:1607, subject_id:16, name:"Clocks & Calendars",                           name_hi:"घड़ी और कैलेंडर" },
    ],
    17: [
      { id:1701, subject_id:17, name:"Number System & Rational Numbers",             name_hi:"संख्या प्रणाली और परिमेय संख्याएँ" },
      { id:1702, subject_id:17, name:"HCF & LCM",                                   name_hi:"महत्तम समापवर्तक और लघुत्तम समापवर्त्य" },
      { id:1703, subject_id:17, name:"Percentage, Profit & Loss",                    name_hi:"प्रतिशत, लाभ और हानि" },
      { id:1704, subject_id:17, name:"Ratio & Proportion",                           name_hi:"अनुपात और समानुपात" },
      { id:1705, subject_id:17, name:"Simple & Compound Interest",                   name_hi:"साधारण और चक्रवृद्धि ब्याज" },
      { id:1706, subject_id:17, name:"Time, Speed & Distance (incl. Boats & Streams)", name_hi:"समय, चाल और दूरी" },
      { id:1707, subject_id:17, name:"Time & Work",                                  name_hi:"समय और कार्य" },
      { id:1708, subject_id:17, name:"Averages & Probability",                       name_hi:"औसत और प्रायिकता" },
    ],
    18: [
      { id:1801, subject_id:18, name:"Tables",                                       name_hi:"सारणियाँ" },
      { id:1802, subject_id:18, name:"Bar Graphs",                                   name_hi:"बार ग्राफ" },
      { id:1803, subject_id:18, name:"Line Charts",                                  name_hi:"रेखा चार्ट" },
      { id:1804, subject_id:18, name:"Pie Charts",                                   name_hi:"पाई चार्ट" },
      { id:1805, subject_id:18, name:"Data Sufficiency",                             name_hi:"आँकड़ा पर्याप्तता" },
    ],
    19: [
      { id:1901, subject_id:19, name:"Situational Judgement",                        name_hi:"परिस्थितिजन्य निर्णय" },
      { id:1902, subject_id:19, name:"Administrative Ethics & Interpersonal Skills", name_hi:"प्रशासनिक नैतिकता और पारस्परिक कौशल" },
    ],
    20: [
      { id:2001, subject_id:20, name:"Hindi Grammar (Sandhi, Samas, Upsarg, Pratyay)", name_hi:"हिंदी व्याकरण (संधि, समास, उपसर्ग, प्रत्यय)" },
      { id:2002, subject_id:20, name:"Hindi Vocabulary (Synonyms, Antonyms, One-word)", name_hi:"हिंदी शब्द भंडार (पर्यायवाची, विलोम, एकार्थी शब्द)" },
      { id:2003, subject_id:20, name:"Chhattisgarhi Language History & Development",  name_hi:"छत्तीसगढ़ी भाषा का इतिहास और विकास" },
      { id:2004, subject_id:20, name:"Chhattisgarhi Grammar & Vocabulary",            name_hi:"छत्तीसगढ़ी व्याकरण और शब्द भंडार" },
      { id:2005, subject_id:20, name:"Prominent Chhattisgarhi Authors & their Works", name_hi:"प्रमुख छत्तीसगढ़ी लेखक और उनकी रचनाएँ" },
    ],
  }
};

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: { appName:"CGPSC EXAM",tagline:"Preparation Portal",prepareSmarter:"Structured Learning",scoreHigher:"Track your progress daily.",chooseSubject:"Select Subject",subjects:"Subjects",topics:"Topics",chooseTopic:"Select Topic",quizzes:"Assessments",questions:"Questions",startQuiz:"Start Test →",back:"← Back",home:"Home",analytics:"Analytics",bookmarks:"Saved",profile:"Profile",signInGoogle:"Continue with Google",signInMsg:"Sign in to access assessments and track performance.",mockMode:"Exam Mode",mockModeDesc:"Strict timer & no instant feedback.",previousYear:"Previous Year Only",allDifficulty:"All Levels",search:"Search assessments...",explanation:"EXPLANATION",nextQuestion:"Next Question →",finishQuiz:"Submit Test",retry:"Retake Test",moreQuizzes:"More Tests",excellent:"Excellent Performance!",goodJob:"Good Effort!",keepPracticing:"Needs Improvement",needStudy:"Review Required",score:"Score",accuracy:"Accuracy",correct:"Correct",wrong:"Incorrect",timeTaken:"Time Taken",yourRank:"Current Rank",savedQuestions:"Saved Questions",noBookmarks:"No saved questions",noBookmarksDesc:"Bookmark questions for revision",performanceOverview:"Performance Overview",subjectWise:"Subject Breakdown",deeperAnalysis:"Analytical Breakdown",strongAreas:"Strong Areas",weakAreas:"Areas to Improve",recentAttempts:"Recent Activity",quizHistory:"Test History",signOut:"Sign Out",darkMode:"Dark Mode",language:"Language",loading:"Loading...",quizOf:"of",question:"Question",answerReview:"Answer Key & Review",remove:"Remove",signingIn:"Authenticating...",noSubjects:"No subjects available",noSubjectsDesc:"Database requires subject entries",noTopics:"No topics available",noTopicsDesc:"Database requires topic entries for this subject",noQuizzes:"No tests available",noQuizzesDesc:"Database requires quiz entries for this topic",noQuestions:"No questions available",noQuestionsDesc:"Test contains no questions yet",noHistory:"No test history",noHistoryDesc:"Complete an assessment to view analytics",filterNoMatch:"No tests match the current filters" },
  hi: { appName:"CGPSC परीक्षा",tagline:"तैयारी पोर्टल",prepareSmarter:"व्यवस्थित अध्ययन",scoreHigher:"अपनी प्रगति ट्रैक करें।",chooseSubject:"विषय चुनें",subjects:"विषय",topics:"टॉपिक्स",chooseTopic:"टॉपिक चुनें",quizzes:"परीक्षण",questions:"प्रश्न",startQuiz:"टेस्ट शुरू करें →",back:"← वापस",home:"होम",analytics:"विश्लेषण",bookmarks:"सहेजे गए",profile:"प्रोफ़ाइल",signInGoogle:"Google से साइन इन करें",signInMsg:"परीक्षण और प्रगति के लिए साइन इन करें।",mockMode:"परीक्षा मोड",mockModeDesc:"कठोर टाइमर और कोई तुरंत फीडबैक नहीं।",previousYear:"केवल पिछले वर्ष",allDifficulty:"सभी स्तर",search:"परीक्षण खोजें...",explanation:"व्याख्या",nextQuestion:"अगला प्रश्न →",finishQuiz:"टेस्ट सबमिट करें",retry:"पुनः प्रयास करें",moreQuizzes:"अधिक टेस्ट",excellent:"उत्कृष्ट प्रदर्शन!",goodJob:"अच्छा प्रयास!",keepPracticing:"सुधार की आवश्यकता है",needStudy:"पुनरीक्षण आवश्यक है",score:"अंक",accuracy:"सटीकता",correct:"सही",wrong:"गलत",timeTaken:"लिया गया समय",yourRank:"आपकी रैंक",savedQuestions:"सहेजे गए प्रश्न",noBookmarks:"कोई प्रश्न सहेजा नहीं गया",noBookmarksDesc:"रिवीजन के लिए प्रश्न बुकमार्क करें",performanceOverview:"प्रदर्शन अवलोकन",subjectWise:"विषय-वार विश्लेषण",deeperAnalysis:"गहन विश्लेषण",strongAreas:"म मजबूत क्षेत्र",weakAreas:"सुधार वाले क्षेत्र",recentAttempts:"हाल की गतिविधि",quizHistory:"टेस्ट इतिहास",signOut:"साइन आउट",darkMode:"डार्क मोड",language:"भाषा",loading:"लोड हो रहा है...",quizOf:"में से",question:"प्रश्न",answerReview:"उत्तर कुंजी और समीक्षा",remove:"हटाएं",signingIn:"प्रमाणीकरण हो रहा है...",noSubjects:"कोई विषय उपलब्ध नहीं",noSubjectsDesc:"डेटाबेस में विषय प्रविष्टियों की आवश्यकता है",noTopics:"कोई टॉपिक उपलब्ध नहीं",noTopicsDesc:"इस विषय के लिए डेटाबेस में टॉपिक की आवश्यकता है",noQuizzes:"कोई टेस्ट उपलब्ध नहीं",noQuizzesDesc:"इस टॉपिक के लिए डेटाबेस में क्विज़ की आवश्यकता है",noQuestions:"कोई प्रश्न उपलब्ध नहीं",noQuestionsDesc:"टेस्ट में अभी कोई प्रश्न नहीं है",noHistory:"कोई टेस्ट इतिहास नहीं",noHistoryDesc:"विश्लेषण देखने के लिए परीक्षण पूरा करें",filterNoMatch:"वर्तमान फ़िल्टर से कोई टेस्ट मेल नहीं खाता" }
};

// Converts literal "\n" strings (from CSV import) into real newline characters.
// Apply to any text field before rendering so \n shows as line breaks, not text.
const formatText = (str) => (str ? String(str).replace(/\\n/g, "\n") : str);

export default function App() {
  const [lang, setLang]           = useState("en");
  const [dark, setDark]           = useState(false); 

  // ── AUTH ────────────────────────────────────────────────────────────────────
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  // ── NAVIGATION ──────────────────────────────────────────────────────────────
  const [screen, setScreen]       = useState("login");
  const [tab, setTab]             = useState("home");

  // ── SUPABASE DATA ───────────────────────────────────────────────────────────
  const [subjects, setSubjects]   = useState([]);
  const [topics, setTopics]       = useState([]);
  const [quizzes, setQuizzes]     = useState([]);
  const [questions, setQuestions] = useState([]);
  const [history, setHistory]     = useState([]);   
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // ── PROFILE ──────────────────────────────────────────────────────────────────
  const [profile, setProfile]         = useState(null);
  const [lbLoading, setLbLoading]     = useState(false);

  // ── QUIZ STATE ──────────────────────────────────────────────────────────────
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic]     = useState(null);
  const [selectedQuiz, setSelectedQuiz]       = useState(null);
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState({});
  const [showExp, setShowExp]     = useState(false);
  const [timer, setTimer]         = useState(1200);
  const [score, setScore]         = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [mockMode, setMockMode]   = useState(false);
  const [prevYear, setPrevYear]   = useState(false);
  const [diff, setDiff]           = useState("All");
  const [search, setSearch]       = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [bmLoading, setBmLoading] = useState(false);
  const timerRef    = useRef(null);
  const quizStartTs = useRef(null);
  const t = T[lang];

  // ── NAV + QUIZ PERSISTENCE ───────────────────────────────────────────────────
  const saveNav  = (p) => { try { const x=JSON.parse(sessionStorage.getItem("cgpsc_nav")||"{}"); sessionStorage.setItem("cgpsc_nav",JSON.stringify({...x,...p})); } catch(_){} };
  const loadNav  = ()  => { try { return JSON.parse(sessionStorage.getItem("cgpsc_nav")||"{}"); } catch(_){ return {}; } };
  const clearNav = ()  => { try { sessionStorage.removeItem("cgpsc_nav"); } catch(_){} };
  const QUIZ_KEY       = "cgpsc_quiz";
  const saveQuizState  = (p) => { try { const x=JSON.parse(sessionStorage.getItem(QUIZ_KEY)||"{}"); sessionStorage.setItem(QUIZ_KEY,JSON.stringify({...x,...p,savedAt:Date.now()})); } catch(_){} };
  const loadQuizState  = ()  => { try { return JSON.parse(sessionStorage.getItem(QUIZ_KEY)||"null"); } catch(_){ return null; } };
  const clearQuizState = ()  => { try { sessionStorage.removeItem(QUIZ_KEY); } catch(_){} };

  // ── PROFESSIONAL EXAM THEME COLORS ──────────────────────────────────────────
  const C = dark
    ? { bg:"#0f172a", card:"#1e293b", border:"#334155", text:"#f8fafc", muted:"#94a3b8", hdr:"#1e293b", acc:"#3b82f6", acc2:"#2563eb", ok:"#10b981", err:"#ef4444", inp:"#0f172a" }
    : { bg:"#f8fafc", card:"#ffffff", border:"#e2e8f0", text:"#0f172a", muted:"#64748b", hdr:"#ffffff", acc:"#2563eb", acc2:"#1d4ed8", ok:"#059669", err:"#dc2626", inp:"#f1f5f9" };
  const syncUrl = (path, replace = false) => {
    if (typeof window === "undefined") return;
    const method = replace ? "replaceState" : "pushState";
    if (window.location.pathname !== path) {
      window.history[method]({}, "", path);
    }
  };

  const mainPath = (nextTab = "home") => (nextTab === "home" ? "/" : `/${nextTab}`);
  const goLogin = (replace = false) => {
    setScreen("login");
    syncUrl("/login", replace);
  };
  const goMain = (nextTab = "home", replace = false) => {
    setTab(nextTab);
    setScreen("main");
    syncUrl(mainPath(nextTab), replace);
    saveNav({ screen: "main", tab: nextTab, subjectId: null, topicId: null });
  };
  const goSubject = (subject, replace = false) => {
    if (subject) setSelectedSubject(subject);
    setScreen("subject");
    syncUrl(subject ? `/subject/${subject.id}` : "/", replace);
    if (subject) saveNav({ screen: "subject", subjectId: subject.id, topicId: null });
  };
  const goTopic = (topic, replace = false) => {
    if (topic) setSelectedTopic(topic);
    setScreen("topic");
    syncUrl(topic ? `/topic/${topic.id}` : "/", replace);
    if (topic) saveNav({ screen: "topic", topicId: topic.id });
  };
  const goQuiz = (quiz, replace = false) => {
    if (quiz) setSelectedQuiz(quiz);
    setScreen("quiz");
    syncUrl(quiz ? `/quiz/${quiz.id}` : "/", replace);
    if (quiz) saveNav({ screen: "quiz", quizId: quiz.id });
  };
  const goResult = (quiz = selectedQuiz, replace = false) => {
    setScreen("result");
    syncUrl(quiz ? `/result/${quiz.id}` : "/result", replace);
  };


  const restorePathAfterAuth = (path) => {
    if (!path || path === "/" || path === "/login") {
      goMain("home", true);
      return;
    }
    if (["/analytics", "/bookmarks", "/profile"].includes(path)) {
      setScreen("main");
      setTab(path.slice(1));
      return;
    }
    if (path.startsWith("/subject/")) {
      const subjectId = path.split("/")[2];
      const subject = STATIC_DATA.subjects.find((item) => idsMatch(item.id, subjectId));
      if (subject) {
        openSubject(subject);
        return;
      }
    }
    if (path.startsWith("/topic/")) {
      const topicId = path.split("/")[2];
      const allTopics = Object.values(STATIC_DATA.topics).flat();
      const topic = allTopics.find((item) => idsMatch(item.id, topicId));
      if (topic) {
        const subject = STATIC_DATA.subjects.find((item) => idsMatch(item.id, topic.subject_id));
        if (subject) setSelectedSubject(subject);
        openTopic(topic);
        return;
      }
    }
    goMain("home", true);
  };

  // Resume an in-progress quiz after any interruption
  const resumeQuizFromStorage = (qs, subject, topic) => {
    if (subject) setSelectedSubject(subject);
    if (topic)   setSelectedTopic(topic);
    const quiz = qs.quiz;
    setSelectedQuiz(quiz);
    setQuestions(qs.questions);
    setCurrentQ(qs.currentQ ?? 0);
    setAnswers(qs.answers ?? {});
    setMockMode(qs.mockMode ?? false);
    setShowExp(false);
    setScore(0);
    const elapsed   = qs.savedAt ? Math.floor((Date.now() - qs.savedAt) / 1000) : 0;
    const remaining = Math.max((qs.timer ?? 1200) - elapsed, 0);
    setTimer(remaining);
    quizStartTs.current = Date.now() - ((qs.totalSecs ?? 1200) - remaining) * 1000;
    setScreen("quiz");
    syncUrl(`/quiz/${quiz.id}`);
    saveNav({ screen: "quiz", quizId: quiz.id });
  };

  // Restore the user's position from sessionStorage on app resume
  const restoreFromNav = (saved) => {
    const allTopics = Object.values(STATIC_DATA.topics || {}).flat();
    const subject = saved.subjectId != null ? STATIC_DATA.subjects.find(s => String(s.id) === String(saved.subjectId)) : null;
    const topic   = saved.topicId   != null ? allTopics.find(t => String(t.id) === String(saved.topicId))             : null;
    if (subject) setSelectedSubject(subject);
    if (topic)   setSelectedTopic(topic);
    if (saved.screen === "subject" && subject) {
      openSubject(subject);
    } else if (saved.screen === "topic" && topic) {
      if (subject) setSelectedSubject(subject);
      openTopic(topic);
    } else if (saved.screen === "quiz") {
      const qs = loadQuizState();
      if (qs && qs.questions?.length > 0 && String(qs.quizId) === String(saved.quizId)) {
        resumeQuizFromStorage(qs, subject, topic);
      } else if (topic) {
        if (subject) setSelectedSubject(subject);
        openTopic(topic);
      } else {
        goMain(saved.tab || "home", true);
      }
    } else {
      goMain(saved.tab || "home", true);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
        fetchHistory(session.user);
        fetchBookmarks(session.user);
        const saved = loadNav();
        if (saved.screen && saved.screen !== "login") {
          setTimeout(() => restoreFromNav(saved), 50);
        } else {
          restorePathAfterAuth(window.location.pathname);
        }
      }
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        const alreadyIn = !!user;
        setUser(session.user);
        fetchProfile(session.user);
        fetchHistory(session.user);
        fetchBookmarks(session.user);
        if (!alreadyIn) {
          const saved = loadNav();
          if (saved.screen && saved.screen !== "login") {
            setTimeout(() => restoreFromNav(saved), 50);
          } else {
            goMain("home", true);
          }
        }
      } else {
        setUser(null);
        setProfile(null);
        clearNav();
        clearQuizState();
        goLogin(true);
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const applyPath = () => {
      const path = window.location.pathname;
      if (path === "/login") { setScreen("login"); return; }
      if (path === "/" || path === "") { setScreen("main"); setTab("home"); return; }
      if (["/analytics", "/bookmarks", "/profile"].includes(path)) {
        setScreen("main");
        setTab(path.slice(1));
        return;
      }
      if (path.startsWith("/subject/") && selectedSubject) { setScreen("subject"); return; }
      if (path.startsWith("/topic/") && selectedTopic) { setScreen("topic"); return; }
      if (path.startsWith("/quiz/") && selectedQuiz) { setScreen("quiz"); return; }
      if (path.startsWith("/result/") && selectedQuiz) { setScreen("result"); return; }
      if (user) { setScreen("main"); setTab("home"); }
    };
    applyPath();
    window.addEventListener("popstate", applyPath);
    return () => window.removeEventListener("popstate", applyPath);
  }, [user, selectedSubject, selectedTopic, selectedQuiz]);
  const signIn = async () => {
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) { alert("Sign in failed: " + error.message); setSigningIn(false); }
  };

  const signOut = async () => { clearNav(); clearQuizState(); await supabase.auth.signOut(); };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    savePreference("dark_mode", next);
  };

  const toggleLang = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    savePreference("preferred_lang", next);
  };

  const userName   = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Aspirant";
  const userAvatar = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const userEmail  = profile?.email || user?.email || "";
  const userPic    = profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  // ════════════════════════════════════════════════════════════════════════════
  // SUPABASE FETCHES
  // ════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (screen === "main" && tab === "home") fetchSubjects();
  }, [screen, tab]);

  // ── Profile ───────────────────────────────────────────────────────────────
  const fetchProfile = async (currentUser) => {
    const uid = currentUser?.id || user?.id;
    if (!uid) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid);
      if (!error && data && data.length > 0) {
        const p = data[0];
        setProfile(p);
        // Restore user preferences from DB
        if (p.preferred_lang) setLang(p.preferred_lang);
        if (typeof p.dark_mode === "boolean") setDark(p.dark_mode);
      }
    } catch (e) {}
  };

  const savePreference = async (key, value) => {
    const uid = user?.id;
    if (!uid) return;
    try {
      await supabase.from("profiles").update({ [key]: value, last_seen_at: new Date().toISOString() }).eq("id", uid);
      setProfile(prev => prev ? { ...prev, [key]: value } : prev);
    } catch (e) {}
  };

  // ── Subjects / Topics / Quizzes / Questions ───────────────────────────────
  const fetchSubjects = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const { data, error } = await supabase.from("subjects").select("*").order("sort_order");
      if (error || !data || data.length === 0) setSubjects(STATIC_DATA.subjects);
      else setSubjects(data);
    } catch (e) { setSubjects(STATIC_DATA.subjects); }
    setDataLoading(false);
  };

  const openSubject = async (subject) => {
    setSelectedSubject(subject);
    setScreen("subject");
    syncUrl(`/subject/${subject.id}`);
    saveNav({ screen: "subject", subjectId: subject.id, topicId: null });
    setDataLoading(true);
    setDataError(null);
    try {
      const { data, error } = await supabase.from("topics").select("*").eq("subject_id", subject.id).order("sort_order");
      if (error) { setTopics(STATIC_DATA.topics[subject.id] || []); }
      else {
        // Filter client-side by subject_id (supports numeric and UUID/text IDs)
        const filtered = (data || []).filter(t => idsMatch(t.subject_id, subject.id));
        setTopics(filtered.length > 0 ? filtered : (STATIC_DATA.topics[subject.id] || []));
      }
    } catch (e) { setTopics(STATIC_DATA.topics[subject.id] || []); }
    setDataLoading(false);
  };

  const openTopic = async (topic) => {
    setSelectedTopic(topic);
    setSearch("");
    setDiff("All");
    setPrevYear(false);
    goTopic(topic);
    saveNav({ screen: "topic", topicId: topic.id });
    setDataLoading(true);
    setDataError(null);
    try {
      const { data, error } = await supabase.from("quizzes").select("*").eq("topic_id", topic.id).order("id");
      if (error) {
        const msg = String(error.message || "");
        if (msg.includes("quizzes.subject_id")) {
          setDataError("Could not load quizzes: Supabase schema/policy references quizzes.subject_id, but that column is missing.");
        } else {
          setDataError("Could not load assessments: " + msg);
        }
        setQuizzes([]);
      }
      else {
        const filtered = (data || []).filter(q => idsMatch(q.topic_id, topic.id));
        setQuizzes(filtered);
      }
    } catch (e) { setQuizzes([]); }
    setDataLoading(false);
  };

  const startQuiz = async (quiz) => {
    setDataLoading(true);
    setDataError(null);
    clearQuizState();
    goQuiz(quiz);
    setSelectedQuiz(quiz);
    setCurrentQ(0);
    setAnswers({});
    setShowExp(false);
    const totalSecs = (quiz.time_limit_mins || 20) * 60;
    setTimer(totalSecs);
    setScore(0);
    quizStartTs.current = Date.now();
    try {
      const { data, error } = await supabase.from("questions").select("*").eq("quiz_id", quiz.id).order("sort_order").limit(200);
      if (error) { setDataError("Could not load questions: " + error.message); setDataLoading(false); return; }
      const filtered = (data || []).filter(q => idsMatch(q.quiz_id, quiz.id));
      const formatted = filtered.map(q => ({
        id:          q.id,
        question:    formatText(q.question),
        question_hi: formatText(q.question_hi || q.question),
        options:     [q.option_a, q.option_b, q.option_c, q.option_d].map(formatText),
        options_hi:  [q.option_a_hi || q.option_a, q.option_b_hi || q.option_b, q.option_c_hi || q.option_c, q.option_d_hi || q.option_d].map(formatText),
        correct:     q.correct_option,
        explanation:    formatText(q.explanation    || ""),
        explanation_hi: formatText(q.explanation_hi || q.explanation || ""),
      }));
      setQuestions(formatted);
      saveQuizState({
        quizId: quiz.id, quiz, questions: formatted,
        currentQ: 0, answers: {}, timer: totalSecs, totalSecs,
        mockMode, startedAt: Date.now(),
      });
      saveNav({ screen: "quiz", quizId: quiz.id });
    } catch (e) { setQuestions([]); }
    setDataLoading(false);
  };

  const fetchHistory = async (currentUser) => {
    const uid = currentUser?.id || user?.id;
    if (!uid) return;
    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes(title, title_hi), subjects(name, name_hi), topics(name, name_hi)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (!error && data) setHistory(data.filter(a => a.user_id === uid));
    } catch (e) {}
  };

  const saveAttempt = async (quizId, scoreVal, totalVal, timeSecs) => {
    const uid = user?.id;
    if (!uid) return;
    try {
      await supabase.from("quiz_attempts").insert({
        user_id:    uid,
        subject_id: selectedSubject?.id,
        topic_id:   selectedTopic?.id,
        quiz_id:    quizId,
        score:      scoreVal,
        total:      totalVal,
        time_taken: timeSecs,
        accuracy:   totalVal > 0 ? Math.round((scoreVal / totalVal) * 100) : 0,
      });
      // Refresh profile stats (the DB trigger updates them, re-fetch to sync UI)
      await fetchProfile(user);
    } catch (e) {}
  };



  // ════════════════════════════════════════════════════════════════════════════
  // TIMER & QUIZ LOGIC
  // ════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    clearInterval(timerRef.current);
    if (screen === "quiz" && !dataLoading) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const next = prev > 0 ? prev - 1 : 0;
          if (next % 5 === 0) saveQuizState({ timer: next });
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, dataLoading]);

  const selectAnswer = (idx) => {
    if (answers[currentQ] !== undefined) return;
    const newAnswers = { ...answers, [currentQ]: idx };
    setAnswers(newAnswers);
    if (!mockMode) setShowExp(true);
    saveQuizState({ answers: newAnswers, currentQ });
  };

  const finishQuiz = () => {
    clearInterval(timerRef.current);
    clearQuizState();
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    const totalSecs = (selectedQuiz?.time_limit_mins || 20) * 60;
    const taken = Math.max(totalSecs - timer, 0);
    setScore(correct);
    setTimeTaken(taken);
    if (selectedQuiz?.id) saveAttempt(selectedQuiz.id, correct, questions.length, taken);
    fetchHistory(user);
    goResult(selectedQuiz);
  };

  const nextQ = () => {
    setShowExp(false);
    if (currentQ < questions.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      saveQuizState({ currentQ: next });
      return;
    }
    finishQuiz();
  };

  // ── Saved Questions — persisted to Supabase per user ──────────────────────────
  const fetchBookmarks = async (currentUser) => {
    const uid = (currentUser || user)?.id;
    if (!uid) return;
    setBmLoading(true);
    try {
      const { data, error } = await supabase
        .from("saved_questions")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setBookmarks(data.map(row => ({
          id:              row.question_id,
          _rowId:          row.id,
          question:        row.question_text,
          question_hi:     row.question_text_hi,
          options:         row.options    ? JSON.parse(row.options)    : [],
          options_hi:      row.options_hi ? JSON.parse(row.options_hi) : [],
          correct:         row.correct_option,
          explanation:     row.explanation,
          explanation_hi:  row.explanation_hi,
          _subjectId:      row.subject_id,
          _subjectName:    row.subject_name,
          _subjectName_hi: row.subject_name_hi,
          _topicName:      row.topic_name,
          _topicName_hi:   row.topic_name_hi,
        })));
      }
    } catch (e) {}
    setBmLoading(false);
  };

  const toggleBM = async (q) => {
    if (!q) return;
    const uid = user?.id;
    const alreadySaved = bookmarks.find(b => b.id === q.id);
    if (alreadySaved) {
      setBookmarks(prev => prev.filter(b => b.id !== q.id));
      if (uid && alreadySaved._rowId) {
        try { await supabase.from("saved_questions").delete().eq("id", alreadySaved._rowId); } catch (e) {}
      }
    } else {
      const enriched = {
        ...q, _rowId: null,
        _subjectId:      selectedSubject?.id,
        _subjectName:    selectedSubject?.name,
        _subjectName_hi: selectedSubject?.name_hi,
        _topicName:      selectedTopic?.name,
        _topicName_hi:   selectedTopic?.name_hi,
      };
      setBookmarks(prev => [enriched, ...prev]);
      if (uid) {
        try {
          const { data, error } = await supabase.from("saved_questions").insert({
            user_id:          uid,
            question_id:      q.id,
            question_text:    q.question      || null,
            question_text_hi: q.question_hi   || null,
            options:          JSON.stringify(q.options    || []),
            options_hi:       JSON.stringify(q.options_hi || []),
            correct_option:   q.correct,
            explanation:      q.explanation    || null,
            explanation_hi:   q.explanation_hi || null,
            subject_id:       selectedSubject?.id       || null,
            subject_name:     selectedSubject?.name      || null,
            subject_name_hi:  selectedSubject?.name_hi   || null,
            topic_name:       selectedTopic?.name        || null,
            topic_name_hi:    selectedTopic?.name_hi     || null,
          }).select("id").single();
          if (!error && data) {
            setBookmarks(prev => prev.map(b => b.id === q.id ? { ...b, _rowId: data.id } : b));
          }
        } catch (e) {}
      }
    }
  };
  const isBM      = (q)  => q && bookmarks.some(b => b.id === q.id);
  const fmt       = (s)  => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  
  const finishQuizRef = useRef(null);
  finishQuizRef.current = finishQuiz;

  useEffect(() => {
    if (screen === "quiz" && !dataLoading && timer === 0) {
      finishQuizRef.current?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, screen, dataLoading]);

  const diffClr   = (d)  => d === "Easy" ? C.ok : d === "Medium" ? "#eab308" : C.err;

  const filteredQuizzes = quizzes.filter(q => {
    const titleEn = String(q.title || "").toLowerCase();
    const titleHi = String(q.title_hi || "").toLowerCase();
    const query = search.trim().toLowerCase();
    return (
      (diff === "All" || q.difficulty === diff) &&
      (!prevYear || q.is_previous_year) &&
      (query === "" || titleEn.includes(query) || titleHi.includes(query))
    );
  });

  // ════════════════════════════════════════════════════════════════════════════
  // REUSABLE UI PIECES
  // ════════════════════════════════════════════════════════════════════════════
  const css = `@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Noto+Sans+Devanagari:wght@500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes popIn{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}.card-h{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;cursor:pointer;}.card-h:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(15,23,42,.10);border-color:${C.acc}88 !important;}.opt{transition:all .15s;width:100%;border:none;text-align:left;cursor:pointer;}.opt:hover:not(:disabled){background:${C.inp};}.bar{transition:width 1s cubic-bezier(.4,0,.2,1);}.glass{backdrop-filter:blur(8px);}`;
  const ms  = { minHeight:"100vh", background: dark ? 'radial-gradient(circle at 10% 10%, #172554 0%, #0f172a 35%, #020617 100%)' : 'radial-gradient(circle at 10% 10%, #dbeafe 0%, #f8fafc 45%, #eef2ff 100%)', color:C.text, fontFamily:"'Manrope','Noto Sans Devanagari',sans-serif", paddingBottom:80 };

  const Av = ({ ini, size=36, color=C.acc, pic=null }) => (
    pic
      ? <img src={pic} alt="av" style={{width:size,height:size,borderRadius:8,border:`1px solid ${C.border}`,objectFit:"cover",flexShrink:0}}/>
      : <div style={{width:size,height:size,borderRadius:8,background:`${color}15`,border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600,fontSize:size*0.4,color,flexShrink:0}}>{ini}</div>
  );

  const Spinner = ({ text }) => (
    <div style={{textAlign:"center",padding:60}}>
      <div style={{width:32,height:32,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.acc}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
      <p style={{color:C.muted,fontSize:14,fontWeight:500}}>{text || t.loading}</p>
    </div>
  );

  const Empty = ({ icon, title, desc }) => (
    <div style={{textAlign:"center",padding:48,background:C.card,borderRadius:8,border:`1px dashed ${C.border}`}}>
      <div style={{fontSize:32,marginBottom:12,opacity:0.6}}>{icon}</div>
      <div style={{fontWeight:600,color:C.text,marginBottom:4,fontSize:15}}>{title}</div>
      <div style={{color:C.muted,fontSize:13}}>{desc}</div>
    </div>
  );

  const ErrorBanner = ({ msg }) => msg ? (
    <div style={{background:`${C.err}11`,borderLeft:`4px solid ${C.err}`,padding:"12px 16px",margin:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"0 8px 8px 0"}}>
      <span style={{color:C.err,fontSize:13,fontWeight:500}}>{msg}</span>
      <button onClick={()=>setDataError(null)} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
    </div>
  ) : null;

  const Nav = () => (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:C.hdr,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0",boxShadow:"0 -4px 12px rgba(0,0,0,0.03)"}}>
      {[["home","🏠",t.home],["analytics","📊",t.analytics],["bookmarks","🔖",t.bookmarks],["profile","👤",t.profile]].map(([id,icon,label])=>(
        <button key={id} onClick={()=>{setTab(id);setScreen("main");}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,opacity:tab===id?1:0.6,transition:"all 0.2s"}}>
          <span style={{fontSize:18,color:tab===id?C.acc:C.muted}}>{icon}</span>
          <span style={{fontSize:10,color:tab===id?C.acc:C.muted,fontWeight:tab===id?600:500}}>{label}</span>
        </button>
      ))}
    </div>
  );

  const Hdr = ({ back, onBack, titleOverride, subtitleOverride }) => (
    <header style={{background:C.hdr,borderBottom:`1px solid ${C.border}`,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60,position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {back && <button onClick={onBack} style={{background:C.inp,border:`1px solid ${C.border}`,color:C.text,padding:"6px 12px",borderRadius:6,fontSize:13,fontWeight:500,cursor:"pointer"}}>{t.back}</button>}
        {!back && (
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>{setScreen("main");setTab("home");}}>
            <div style={{width:28,height:28,background:C.acc,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14}}>CG</div>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.text,letterSpacing:"-0.5px"}}>{titleOverride || t.appName}</div>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:600}}>{subtitleOverride || t.tagline}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {screen==="quiz" && !dataLoading && (
          <div style={{background:timer<120?`${C.err}15`:`${C.acc}15`,color:timer<120?C.err:C.acc,border:`1px solid ${timer<120?C.err:C.acc}44`,borderRadius:6,padding:"4px 10px",fontWeight:600,fontSize:14,fontFamily:"monospace"}}>
            {fmt(timer)}
          </div>
        )}
        <button onClick={toggleLang} style={{background:C.inp,border:`1px solid ${C.border}`,color:C.text,padding:"4px 8px",borderRadius:6,fontSize:12,cursor:"pointer",fontWeight:600}}>{lang==="en"?"हिं":"EN"}</button>
        <button onClick={toggleDark} style={{background:C.inp,border:`1px solid ${C.border}`,color:C.text,padding:"4px 8px",borderRadius:6,fontSize:12,cursor:"pointer"}}>{dark?"☀️":"🌙"}</button>
      </div>
    </header>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // LOADING / LOGIN SCREENS
  // ════════════════════════════════════════════════════════════════════════════
  if (authLoading) return <div style={ms}><style>{css}</style><div style={{ paddingTop: 120 }}><div style={{ textAlign: "center", color: C.text }}>{t.loading}</div></div></div>;

  const headerProps = { screen, dataLoading, timer, fmt, toggleLang, toggleDark, lang, dark };
  const onHome = () => goMain("home");
  const onTabNavigate = (nextTab) => goMain(nextTab);

  if (screen === "login") {
    return <LoginPage dark={dark} css={css} C={C} t={t} signingIn={signingIn} signIn={signIn} />;
  }

  if (screen === "subject") {
    return <SubjectPage ms={ms} css={css} C={C} t={t} topics={topics} selectedSubject={selectedSubject} dataLoading={dataLoading} dataError={dataError} onClearError={() => setDataError(null)} onBack={() => goMain("home")} onOpenTopic={openTopic} onHome={onHome} onTabNavigate={onTabNavigate} tab={tab} headerProps={headerProps} lang={lang} />;
  }

  if (screen === "topic") {
    return <TopicPage ms={ms} css={css} C={C} t={t} selectedTopic={selectedTopic} dataLoading={dataLoading} dataError={dataError} onClearError={() => setDataError(null)} onBack={() => goSubject(selectedSubject)} onHome={onHome} onTabNavigate={onTabNavigate} tab={tab} headerProps={headerProps} lang={lang} search={search} setSearch={setSearch} diff={diff} setDiff={setDiff} prevYear={prevYear} setPrevYear={setPrevYear} mockMode={mockMode} setMockMode={setMockMode} quizzes={quizzes} filteredQuizzes={filteredQuizzes} diffClr={diffClr} onStartQuiz={startQuiz} />;
  }

  if (screen === "quiz") {
    return <QuizPage ms={ms} css={css} C={C} t={t} dataLoading={dataLoading} dataError={dataError} onClearError={() => setDataError(null)} onBack={() => goTopic(selectedTopic)} onHome={onHome} headerProps={headerProps} questions={questions} currentQ={currentQ} answers={answers} lang={lang} mockMode={mockMode} showExp={showExp} selectAnswer={selectAnswer} nextQ={nextQ} setCurrentQ={setCurrentQ} setShowExp={setShowExp} toggleBM={toggleBM} isBM={isBM} selectedQuiz={selectedQuiz} />;
  }

  if (screen === "result") {
    return <ResultPage ms={ms} css={css} C={C} t={t} score={score} questions={questions} lang={lang} selectedQuiz={selectedQuiz} mockMode={mockMode} timeTaken={timeTaken} fmt={fmt} answers={answers} onRetry={() => startQuiz(selectedQuiz)} onMoreQuizzes={() => goTopic(selectedTopic)} onAnalytics={() => { fetchHistory(); goMain("analytics"); }} onBack={() => goTopic(selectedTopic)} onHome={onHome} onTabNavigate={onTabNavigate} tab={tab} headerProps={headerProps} />;
  }

  if (screen === "main") {
    return <MainPage ms={ms} css={css} C={C} t={t} tab={tab} lang={lang} dark={dark} dataError={dataError} onClearError={() => setDataError(null)} onHome={onHome} onTabNavigate={onTabNavigate} headerProps={headerProps} userAvatar={userAvatar} userPic={userPic} userName={userName} profile={profile} subjects={subjects} history={history} dataLoading={dataLoading} openSubject={openSubject} bookmarks={bookmarks} bmLoading={bmLoading} toggleBM={toggleBM} signOut={signOut} toggleDark={toggleDark} toggleLang={toggleLang} user={user} userEmail={userEmail} />;
  }
  return null;
}