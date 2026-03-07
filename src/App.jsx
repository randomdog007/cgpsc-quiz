import { useState, useEffect, useRef } from "react";

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

const PREVIEW_LEADERBOARD = [
  { user_id:"preview-user",   display_name:"Aspirant",       avatar_url:null, total_attempts:12, avg_accuracy:74, total_score:187, best_streak:5, rank:1 },
  { user_id:"user-2",         display_name:"Ravi Kumar",     avatar_url:null, total_attempts:20, avg_accuracy:68, total_score:210, best_streak:8, rank:2 },
  { user_id:"user-3",         display_name:"Priya Sharma",   avatar_url:null, total_attempts:15, avg_accuracy:61, total_score:155, best_streak:4, rank:3 },
  { user_id:"user-4",         display_name:"Suresh Yadav",   avatar_url:null, total_attempts:8,  avg_accuracy:55, total_score:98,  best_streak:2, rank:4 },
];

// ── FLAT TOPICS LIST for mock (all 83 topics) ────────────────────────────────
const ALL_STATIC_TOPICS = Object.values(STATIC_DATA.topics).flat();

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

const supabase = {
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
      table === "leaderboard"   ? PREVIEW_LEADERBOARD     :
      table === "subjects"      ? STATIC_DATA.subjects    :
      table === "topics"        ? ALL_STATIC_TOPICS        :
      table === "quizzes"       ? PREVIEW_QUIZZES         :
      table === "questions"     ? PREVIEW_QUESTIONS       :
      table === "quiz_attempts" ? PREVIEW_ATTEMPTS        :
      [];
    return createQueryChain({ data: mockData, error: null });
  }
};

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
  en: { appName:"CGPSC EXAM",tagline:"Preparation Portal",prepareSmarter:"Structured Learning",scoreHigher:"Track your progress daily.",chooseSubject:"Select Subject",subjects:"Subjects",topics:"Topics",chooseTopic:"Select Topic",quizzes:"Assessments",questions:"Questions",startQuiz:"Start Test →",back:"← Back",home:"Home",analytics:"Analytics",leaderboard:"Rankings",bookmarks:"Saved",profile:"Profile",signInGoogle:"Continue with Google",signInMsg:"Sign in to access assessments and track performance.",mockMode:"Exam Mode",mockModeDesc:"Strict timer & no instant feedback.",previousYear:"Previous Year Only",allDifficulty:"All Levels",search:"Search assessments...",explanation:"EXPLANATION",nextQuestion:"Next Question →",finishQuiz:"Submit Test",retry:"Retake Test",moreQuizzes:"More Tests",excellent:"Excellent Performance!",goodJob:"Good Effort!",keepPracticing:"Needs Improvement",needStudy:"Review Required",score:"Score",accuracy:"Accuracy",correct:"Correct",wrong:"Incorrect",timeTaken:"Time Taken",yourRank:"Current Rank",savedQuestions:"Saved Questions",noBookmarks:"No saved questions",noBookmarksDesc:"Bookmark questions for revision",performanceOverview:"Performance Overview",subjectWise:"Subject Breakdown",deeperAnalysis:"Analytical Breakdown",strongAreas:"Strong Areas",weakAreas:"Areas to Improve",recentAttempts:"Recent Activity",quizHistory:"Test History",signOut:"Sign Out",darkMode:"Dark Mode",language:"Language",loading:"Loading...",quizOf:"of",question:"Question",answerReview:"Answer Key & Review",remove:"Remove",signingIn:"Authenticating...",noSubjects:"No subjects available",noSubjectsDesc:"Database requires subject entries",noTopics:"No topics available",noTopicsDesc:"Database requires topic entries for this subject",noQuizzes:"No tests available",noQuizzesDesc:"Database requires quiz entries for this topic",noQuestions:"No questions available",noQuestionsDesc:"Test contains no questions yet",noHistory:"No test history",noHistoryDesc:"Complete an assessment to view analytics",filterNoMatch:"No tests match the current filters" },
  hi: { appName:"CGPSC परीक्षा",tagline:"तैयारी पोर्टल",prepareSmarter:"व्यवस्थित अध्ययन",scoreHigher:"अपनी प्रगति ट्रैक करें।",chooseSubject:"विषय चुनें",subjects:"विषय",topics:"टॉपिक्स",chooseTopic:"टॉपिक चुनें",quizzes:"परीक्षण",questions:"प्रश्न",startQuiz:"टेस्ट शुरू करें →",back:"← वापस",home:"होम",analytics:"विश्लेषण",leaderboard:"रैंकिंग",bookmarks:"सहेजे गए",profile:"प्रोफ़ाइल",signInGoogle:"Google से साइन इन करें",signInMsg:"परीक्षण और प्रगति के लिए साइन इन करें।",mockMode:"परीक्षा मोड",mockModeDesc:"कठोर टाइमर और कोई तुरंत फीडबैक नहीं।",previousYear:"केवल पिछले वर्ष",allDifficulty:"सभी स्तर",search:"परीक्षण खोजें...",explanation:"व्याख्या",nextQuestion:"अगला प्रश्न →",finishQuiz:"टेस्ट सबमिट करें",retry:"पुनः प्रयास करें",moreQuizzes:"अधिक टेस्ट",excellent:"उत्कृष्ट प्रदर्शन!",goodJob:"अच्छा प्रयास!",keepPracticing:"सुधार की आवश्यकता है",needStudy:"पुनरीक्षण आवश्यक है",score:"अंक",accuracy:"सटीकता",correct:"सही",wrong:"गलत",timeTaken:"लिया गया समय",yourRank:"आपकी रैंक",savedQuestions:"सहेजे गए प्रश्न",noBookmarks:"कोई प्रश्न सहेजा नहीं गया",noBookmarksDesc:"रिवीजन के लिए प्रश्न बुकमार्क करें",performanceOverview:"प्रदर्शन अवलोकन",subjectWise:"विषय-वार विश्लेषण",deeperAnalysis:"गहन विश्लेषण",strongAreas:"म मजबूत क्षेत्र",weakAreas:"सुधार वाले क्षेत्र",recentAttempts:"हाल की गतिविधि",quizHistory:"टेस्ट इतिहास",signOut:"साइन आउट",darkMode:"डार्क मोड",language:"भाषा",loading:"लोड हो रहा है...",quizOf:"में से",question:"प्रश्न",answerReview:"उत्तर कुंजी और समीक्षा",remove:"हटाएं",signingIn:"प्रमाणीकरण हो रहा है...",noSubjects:"कोई विषय उपलब्ध नहीं",noSubjectsDesc:"डेटाबेस में विषय प्रविष्टियों की आवश्यकता है",noTopics:"कोई टॉपिक उपलब्ध नहीं",noTopicsDesc:"इस विषय के लिए डेटाबेस में टॉपिक की आवश्यकता है",noQuizzes:"कोई टेस्ट उपलब्ध नहीं",noQuizzesDesc:"इस टॉपिक के लिए डेटाबेस में क्विज़ की आवश्यकता है",noQuestions:"कोई प्रश्न उपलब्ध नहीं",noQuestionsDesc:"टेस्ट में अभी कोई प्रश्न नहीं है",noHistory:"कोई टेस्ट इतिहास नहीं",noHistoryDesc:"विश्लेषण देखने के लिए परीक्षण पूरा करें",filterNoMatch:"वर्तमान फ़िल्टर से कोई टेस्ट मेल नहीं खाता" }
};

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

  // ── PROFILE & LEADERBOARD ───────────────────────────────────────────────────
  const [profile, setProfile]         = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
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
  const timerRef = useRef(null);
  const t = T[lang];

  // ── PROFESSIONAL EXAM THEME COLORS ──────────────────────────────────────────
  const C = dark
    ? { bg:"#0f172a", card:"#1e293b", border:"#334155", text:"#f8fafc", muted:"#94a3b8", hdr:"#1e293b", acc:"#3b82f6", acc2:"#2563eb", ok:"#10b981", err:"#ef4444", inp:"#0f172a" }
    : { bg:"#f8fafc", card:"#ffffff", border:"#e2e8f0", text:"#0f172a", muted:"#64748b", hdr:"#ffffff", acc:"#2563eb", acc2:"#1d4ed8", ok:"#059669", err:"#dc2626", inp:"#f1f5f9" };

  // ════════════════════════════════════════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setScreen("main");
        fetchProfile(session.user);
        fetchHistory(session.user);
      }
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user);
        setScreen("main");
        setTab("home");
        fetchProfile(session.user);
        fetchHistory(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setScreen("login");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) { alert("Sign in failed: " + error.message); setSigningIn(false); }
  };

  const signOut = async () => { await supabase.auth.signOut(); };

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
    if (screen === "main" && tab === "leaderboard") fetchLeaderboard();
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
    setScreen("topic");
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
    setScreen("quiz");
    setSelectedQuiz(quiz);
    setCurrentQ(0);
    setAnswers({});
    setShowExp(false);
    setTimer((quiz.time_limit_mins || 20) * 60);
    setScore(0);
    try {
      const { data, error } = await supabase.from("questions").select("*").eq("quiz_id", quiz.id).order("sort_order").limit(200);
      if (error) { setDataError("Could not load questions: " + error.message); setDataLoading(false); return; }
      const filtered = (data || []).filter(q => Number(q.quiz_id) === Number(quiz.id));
      const formatted = filtered.map(q => ({
        id:          q.id,
        question:    q.question,
        question_hi: q.question_hi || q.question,
        options:     [q.option_a, q.option_b, q.option_c, q.option_d],
        options_hi:  [q.option_a_hi || q.option_a, q.option_b_hi || q.option_b, q.option_c_hi || q.option_c, q.option_d_hi || q.option_d],
        correct:     q.correct_option,
        explanation:    q.explanation    || "",
        explanation_hi: q.explanation_hi || q.explanation || "",
      }));
      setQuestions(formatted);
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

  // ── Leaderboard ───────────────────────────────────────────────────────────
  const fetchLeaderboard = async () => {
    setLbLoading(true);
    try {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .limit(50);
      if (!error && data) setLeaderboard(data);
    } catch (e) {}
    setLbLoading(false);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // TIMER & QUIZ LOGIC
  // ════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (screen === "quiz" && !dataLoading) {
      timerRef.current = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, dataLoading]);

  const selectAnswer = (idx) => {
    if (answers[currentQ] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentQ]: idx }));
    if (!mockMode) setShowExp(true);
  };

  const nextQ = () => {
    setShowExp(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      clearInterval(timerRef.current);
      const correct = questions.filter((q, i) => answers[i] === q.correct).length;
      const totalSecs = (selectedQuiz?.time_limit_mins || 20) * 60;
      const taken   = totalSecs - timer;
      setScore(correct);
      setTimeTaken(taken);
      saveAttempt(selectedQuiz.id, correct, questions.length, taken);
      fetchHistory(user);
      setScreen("result");
    }
  };

  const toggleBM  = (q)  => setBookmarks(prev => prev.find(b => b.id === q.id) ? prev.filter(b => b.id !== q.id) : [...prev, q]);
  const isBM      = (q)  => q && bookmarks.some(b => b.id === q.id);
  const fmt       = (s)  => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  
  const diffClr   = (d)  => d === "Easy" ? C.ok : d === "Medium" ? "#eab308" : C.err;

  const filteredQuizzes = quizzes.filter(q =>
    (diff === "All" || q.difficulty === diff) &&
    (!prevYear || q.is_previous_year) &&
    (q.title?.toLowerCase().includes(search.toLowerCase()) || q.title_hi?.includes(search))
  );

  // ════════════════════════════════════════════════════════════════════════════
  // REUSABLE UI PIECES
  // ════════════════════════════════════════════════════════════════════════════
  const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}.card-h{transition:all 0.2s ease;cursor:pointer;}.card-h:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.08);border-color:${C.acc}88 !important;}.opt{transition:all 0.15s;width:100%;border:none;text-align:left;cursor:pointer;}.opt:hover:not(:disabled){background:${C.inp};}.bar{transition:width 1s cubic-bezier(0.4,0,0.2,1);}`;
  const ms  = { minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter', sans-serif", paddingBottom:80 };

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
      {[["home","▢",t.home],["analytics","📊",t.analytics],["leaderboard","🏆",t.leaderboard],["bookmarks","🔖",t.bookmarks],["profile","👤",t.profile]].map(([id,icon,label])=>(
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
  if (authLoading) return <Spinner text="Initializing System..." />;

  if (screen === "login") return (
    <div style={{minHeight:"100vh",background:dark?"#0f172a":"#f1f5f9",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Inter',sans-serif"}}>
      <style>{css}</style>
      <div style={{maxWidth:400,width:"100%",animation:"fadeUp 0.5s ease"}}>
        {/* Brand */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:64,height:64,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:22,margin:"0 auto 14px",boxShadow:"0 8px 24px rgba(37,99,235,0.35)"}}>CG</div>
          <h1 style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:4,letterSpacing:"-0.5px"}}>{t.appName}</h1>
          <p style={{color:C.muted,fontSize:12,textTransform:"uppercase",letterSpacing:"2px",fontWeight:600}}>State Civil Services Portal</p>
        </div>

        {/* Exam overview pills */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24,flexWrap:"wrap"}}>
          {[["Paper 1","General Studies + CG","#2563eb"],["Paper 2","CSAT Aptitude","#7c3aed"]].map(([p,d,c])=>(
            <div key={p} style={{background:`${c}12`,border:`1px solid ${c}33`,borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
              <div style={{fontWeight:700,fontSize:12,color:c}}>{p}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{d}</div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:24}}>
          {[["20","Subjects"],["83","Topics"],["2","Papers"]].map(([n,l])=>(
            <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontWeight:800,fontSize:18,color:C.text}}>{n}</div>
              <div style={{fontSize:10,color:C.muted,fontWeight:500,marginTop:2,textTransform:"uppercase",letterSpacing:"0.5px"}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Sign-in card */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:28,boxShadow:"0 10px 40px rgba(0,0,0,0.06)"}}>
          <p style={{color:C.text,fontSize:14,marginBottom:20,textAlign:"center",fontWeight:500,lineHeight:1.5}}>{t.signInMsg}</p>
          {signingIn
            ? <div style={{textAlign:"center",padding:"12px 0"}}><Spinner text={t.signingIn}/></div>
            : (
              <button onClick={signIn} style={{width:"100%",background:"#fff",border:"1.5px solid #dadce0",borderRadius:8,padding:"13px 16px",fontSize:14,fontWeight:600,cursor:"pointer",color:"#3c4043",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.12)";e.currentTarget.style.borderColor="#aaa";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.08)";e.currentTarget.style.borderColor="#dadce0";}}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t.signInGoogle}
              </button>
            )
          }
          <p style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:16,lineHeight:1.5}}>By signing in you agree to use this portal for CGPSC exam preparation only.</p>
        </div>

        <p style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:16,opacity:0.6}}>
          Powered by Chhattisgarh PSC Prep · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // SUBJECT SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === "subject") return (
    <div style={ms}><style>{css}</style>
      <Hdr back onBack={()=>setScreen("main")}/>
      <ErrorBanner msg={dataError}/>
      <div style={{padding:"20px 16px",animation:"fadeUp 0.3s ease", maxWidth:800, margin:"0 auto"}}>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:20,marginBottom:24}}>
          <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginBottom:4}}>Subject Module</div>
          <div style={{fontWeight:700,fontSize:22,color:C.text,letterSpacing:"-0.5px",marginBottom:6}}>{lang==="hi"&&selectedSubject?.name_hi ? selectedSubject.name_hi : selectedSubject?.name}</div>
        </div>

        <h2 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.chooseTopic}</h2>
        
        {dataLoading
          ? <Spinner/>
          : topics.length === 0
            ? <Empty icon="📂" title={t.noTopics} desc={`${t.noTopicsDesc} ${selectedSubject?.id}`}/>
            : <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {topics.map((topic, idx) => (
                  <div key={topic.id} className="card-h" onClick={()=>openTopic(topic)}
                    style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                      <div style={{width:32,height:32,borderRadius:6,background:C.inp,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,border:`1px solid ${C.border}`}}>
                        {String(idx+1).padStart(2,'0')}
                      </div>
                      <div>
                        <div style={{fontWeight:600,fontSize:15,color:C.text}}>{lang==="hi"&&topic.name_hi ? topic.name_hi : topic.name}</div>
                      </div>
                    </div>
                    <span style={{color:C.muted,fontSize:18}}>→</span>
                  </div>
                ))}
              </div>
        }
      </div>
      <Nav/>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // TOPIC SCREEN (SHOWS QUIZZES)
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === "topic") return (
    <div style={ms}><style>{css}</style>
      <Hdr back onBack={()=>setScreen("subject")}/>
      <ErrorBanner msg={dataError}/>
      <div style={{padding:"20px 16px",animation:"fadeUp 0.3s ease", maxWidth:800, margin:"0 auto"}}>

        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,color:C.acc,textTransform:"uppercase",letterSpacing:"1px",fontWeight:700,marginBottom:4}}>Topic Overview</div>
          <div style={{fontWeight:700,fontSize:20,color:C.text,letterSpacing:"-0.5px"}}>{lang==="hi"&&selectedTopic?.name_hi ? selectedTopic.name_hi : selectedTopic?.name}</div>
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}
            style={{flex:1,minWidth:140,background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
          {["All","Easy","Medium","Hard"].map(d=>(
            <button key={d} onClick={()=>setDiff(d)} style={{background:diff===d?C.acc:C.card,border:`1px solid ${diff===d?C.acc:C.border}`,color:diff===d?"#fff":C.text,borderRadius:6,padding:"8px 12px",fontSize:12,cursor:"pointer",fontWeight:500,transition:"all 0.2s"}}>
              {d==="All"?t.allDifficulty:d}
            </button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,background:C.card,padding:12,borderRadius:8,border:`1px solid ${C.border}`}}>
           <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <input type="checkbox" checked={prevYear} onChange={e=>setPrevYear(e.target.checked)}/>
            <span style={{fontSize:13,color:C.text,fontWeight:500}}>{t.previousYear}</span>
          </label>
          <div style={{width:1,height:20,background:C.border}}></div>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <input type="checkbox" checked={mockMode} onChange={e=>setMockMode(e.target.checked)}/>
            <span style={{fontSize:13,color:C.text,fontWeight:500}}>{t.mockMode}</span>
          </label>
        </div>

        {/* Quiz list */}
        {dataLoading
          ? <Spinner/>
          : quizzes.length === 0
            ? <Empty icon="📄" title={t.noQuizzes} desc={`${t.noQuizzesDesc} ${selectedTopic?.id}`}/>
            : filteredQuizzes.length === 0
              ? <Empty icon="🔍" title={t.filterNoMatch} desc="Adjust your filters to see more results"/>
              : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {filteredQuizzes.map((quiz, idx) => (
                    <div key={quiz.id} className="card-h" onClick={()=>startQuiz(quiz)}
                      style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:15,color:C.text,marginBottom:8}}>{lang==="hi"&&quiz.title_hi ? quiz.title_hi : quiz.title}</div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,color:C.muted,background:C.inp,padding:"2px 8px",borderRadius:4,border:`1px solid ${C.border}`}}>{quiz.total_questions||20} Qs</span>
                            <span style={{fontSize:11,color:diffClr(quiz.difficulty),background:`${diffClr(quiz.difficulty)}15`,padding:"2px 8px",borderRadius:4,fontWeight:600}}>{quiz.difficulty||"Medium"}</span>
                            {quiz.is_previous_year && <span style={{fontSize:11,color:"#0ea5e9",background:"#0ea5e915",padding:"2px 8px",borderRadius:4,fontWeight:600}}>PYQ</span>}
                          </div>
                        </div>
                        <button style={{background:C.acc,color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontWeight:600,fontSize:13,cursor:"pointer",flexShrink:0,transition:"opacity 0.2s"}}>{t.startQuiz}</button>
                      </div>
                    </div>
                  ))}
                </div>
        }
      </div>
      <Nav/>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // QUIZ SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === "quiz") {
    const q        = questions[currentQ];
    const answered = answers[currentQ] !== undefined;
    const opts     = lang==="hi" && q?.options_hi ? q.options_hi : q?.options;
    const qTxt     = lang==="hi" && q?.question_hi ? q.question_hi : q?.question;

    return (
      <div style={ms}><style>{css}</style>
        <Hdr back onBack={()=>setScreen("topic")}/>
        <ErrorBanner msg={dataError}/>

        {dataLoading
          ? <Spinner text="Loading Assessment..."/>
          : questions.length === 0
            ? <Empty icon="📄" title={t.noQuestions} desc={`${t.noQuestionsDesc} ${selectedQuiz?.id}`}/>
            : (
              <div style={{padding:"20px 16px",maxWidth:800,margin:"0 auto"}}>
                {/* Progress */}
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
                  <span style={{fontSize:13,color:C.text,fontWeight:600}}>Q. {currentQ+1} <span style={{color:C.muted,fontWeight:400}}>/ {questions.length}</span></span>
                  <span style={{fontSize:12,color:C.muted,background:C.card,padding:"2px 8px",borderRadius:4,border:`1px solid ${C.border}`}}>
                    {Object.keys(answers).filter(k=>answers[k]===questions[k]?.correct).length} {t.correct}
                  </span>
                </div>
                <div style={{height:4,background:C.border,borderRadius:2,marginBottom:24,overflow:"hidden"}}>
                  <div style={{width:`${((currentQ+1)/questions.length)*100}%`,height:"100%",background:C.acc,borderRadius:2,transition:"width 0.3s"}}/>
                </div>

                {/* Question card */}
                <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:24,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.02)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                    <p style={{fontSize:16,lineHeight:1.6,color:C.text,fontWeight:500,marginRight:16}}>{qTxt}</p>
                    <button onClick={()=>q&&toggleBM(q)} style={{background:"none",border:`1px solid ${isBM(q)?C.acc:C.border}`,borderRadius:4,padding:"4px 8px",cursor:"pointer",fontSize:12,color:isBM(q)?C.acc:C.muted,fontWeight:500,flexShrink:0}}>
                      {isBM(q)?"Saved":"Save"}
                    </button>
                  </div>
                  
                  {/* Options */}
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {opts?.map((opt, idx) => {
                      const isSel=answers[currentQ]===idx, isOk=q?.correct===idx;
                      let bg=C.inp, border=C.border, tc=C.text;
                      if (answered && !mockMode) {
                        if (isOk)      { bg=`${C.ok}11`;  border=C.ok;  tc=C.text; }
                        else if (isSel){ bg=`${C.err}11`; border=C.err; tc=C.text; }
                      } else if (isSel && mockMode) { bg=`${C.acc}11`; border=C.acc; tc=C.acc; }
                      
                      const letter = ["A","B","C","D"][idx];
                      
                      return (
                        <button key={idx} onClick={()=>selectAnswer(idx)} disabled={answered} className="opt"
                          style={{background:bg,border:`1px solid ${border}`,borderRadius:6,padding:"14px 16px",color:tc,fontSize:14,display:"flex",alignItems:"center",gap:14}}>
                          <span style={{width:24,height:24,borderRadius:4,flexShrink:0,background:answered&&!mockMode&&isOk?C.ok:answered&&!mockMode&&isSel?C.err:(isSel&&mockMode?C.acc:C.card),border:`1px solid ${answered&&!mockMode?(isOk?C.ok:isSel?C.err:C.border):(isSel&&mockMode?C.acc:C.border)}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600,fontSize:12,color:answered&&!mockMode&&(isOk||isSel)||(isSel&&mockMode)?"#fff":C.muted}}>
                            {letter}
                          </span>
                          <span style={{lineHeight:1.4}}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                {showExp && !mockMode && (
                  <div style={{background:dark?"#064e3b":"#f0fdf4",border:`1px solid ${C.ok}44`,borderRadius:8,padding:16,marginBottom:16,animation:"fadeUp 0.3s ease"}}>
                    <div style={{fontSize:11,color:C.ok,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.explanation}</div>
                    <p style={{color:C.text,fontSize:14,lineHeight:1.6}}>{lang==="hi"&&q?.explanation_hi ? q.explanation_hi : q?.explanation}</p>
                  </div>
                )}

                {answered && (
                  <button onClick={nextQ} style={{width:"100%",background:C.acc,border:"none",borderRadius:6,padding:"16px",color:"#fff",fontWeight:600,fontSize:15,cursor:"pointer",marginTop:8,boxShadow:"0 4px 12px rgba(37,99,235,0.2)"}}>
                    {currentQ<questions.length-1 ? t.nextQuestion : t.finishQuiz}
                  </button>
                )}

                {/* Dot navigator */}
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:24,justifyContent:"center",paddingTop:20,borderTop:`1px solid ${C.border}`}}>
                  {questions.map((_,i)=>(
                    <div key={i} onClick={()=>{if(i<=currentQ){setCurrentQ(i);setShowExp(!mockMode&&answers[i]!==undefined);}}}
                      style={{width:30,height:30,borderRadius:4,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:500,
                        color:answers[i]!==undefined ? "#fff" : C.muted,
                        background:answers[i]===undefined?(i===currentQ?C.border:C.card):mockMode?C.acc:answers[i]===questions[i]?.correct?C.ok:C.err,
                        border:`1px solid ${i===currentQ?C.text:(answers[i]!==undefined?'transparent':C.border)}`
                      }}>
                      {i+1}
                    </div>
                  ))}
                </div>
              </div>
            )
        }
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === "result") {
    const pct = Math.round((score / questions.length) * 100);
    const lbl = pct>=80?t.excellent:pct>=60?t.goodJob:pct>=40?t.keepPracticing:t.needStudy;
    return (
      <div style={ms}><style>{css}</style>
        <Hdr back onBack={()=>setScreen("topic")}/>
        <div style={{padding:"32px 16px",textAlign:"center",animation:"fadeUp 0.4s ease",maxWidth:600,margin:"0 auto"}}>
          <div style={{fontSize:12,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600,marginBottom:8}}>Assessment Complete</div>
          <h2 style={{fontSize:24,fontWeight:700,color:C.text,marginBottom:8,letterSpacing:"-0.5px"}}>{lbl}</h2>
          <p style={{color:C.muted,fontSize:14,marginBottom:24}}>{lang==="hi"&&selectedQuiz?.title_hi ? selectedQuiz.title_hi : selectedQuiz?.title}</p>
          
          {mockMode && <div style={{display:"inline-block",fontSize:12,background:C.inp,color:C.text,padding:"4px 12px",borderRadius:4,fontWeight:600,border:`1px solid ${C.border}`,marginBottom:24}}>{t.mockMode}</div>}

          {/* Score Display */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:32,marginBottom:24,boxShadow:"0 4px 20px rgba(0,0,0,0.03)"}}>
            <div style={{fontSize:48,fontWeight:700,color:pct>=60?C.ok:C.err,lineHeight:1,marginBottom:8}}>{pct}%</div>
            <div style={{fontSize:13,color:C.muted,fontWeight:500}}>{t.accuracy}</div>
            
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginTop:32,paddingTop:24,borderTop:`1px solid ${C.border}`}}>
              <div><div style={{fontSize:20,fontWeight:700,color:C.text}}>{score}/{questions.length}</div><div style={{fontSize:11,color:C.muted,marginTop:4,textTransform:"uppercase"}}>{t.score}</div></div>
              <div><div style={{fontSize:20,fontWeight:700,color:C.err}}>{questions.length-score}</div><div style={{fontSize:11,color:C.muted,marginTop:4,textTransform:"uppercase"}}>{t.wrong}</div></div>
              <div><div style={{fontSize:18,fontWeight:600,color:C.text,fontFamily:"monospace"}}>{fmt(timeTaken)}</div><div style={{fontSize:11,color:C.muted,marginTop:4,textTransform:"uppercase"}}>{t.timeTaken}</div></div>
            </div>
          </div>

          {/* Mock mode answer review */}
          {mockMode && (
            <div style={{textAlign:"left",marginBottom:32}}>
              <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.answerReview}</h3>
              {questions.map((q,i)=>{
                const ok=answers[i]===q.correct;
                return (
                  <div key={i} style={{background:C.card,borderLeft:`4px solid ${ok?C.ok:C.err}`,borderTop:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,borderRadius:"0 8px 8px 0",padding:16,marginBottom:12}}>
                    <div style={{display:"flex",gap:12,marginBottom:10}}>
                      <span style={{color:ok?C.ok:C.err,fontWeight:700,fontSize:14}}>{ok?"✓":"✗"}</span>
                      <p style={{fontSize:14,color:C.text,flex:1,fontWeight:500}}>{lang==="hi"&&q.question_hi?q.question_hi:q.question}</p>
                    </div>
                    <div style={{fontSize:13,color:C.ok,background:`${C.ok}11`,padding:"8px 12px",borderRadius:4,marginBottom:ok?0:6}}>
                      <span style={{fontWeight:600,marginRight:8}}>Correct:</span>
                      {lang==="hi"&&q.options_hi?q.options_hi[q.correct]:q.options[q.correct]}
                    </div>
                    {!ok && <div style={{fontSize:13,color:C.err,background:`${C.err}11`,padding:"8px 12px",borderRadius:4}}>
                      <span style={{fontWeight:600,marginRight:8}}>Your Answer:</span>
                      {lang==="hi"&&q.options_hi?q.options_hi[answers[i]]||"Skipped":q.options[answers[i]]||"Skipped"}
                    </div>}
                    {q.explanation && <div style={{fontSize:13,color:C.text,marginTop:12,paddingTop:12,borderTop:`1px dashed ${C.border}`}}><strong style={{color:C.muted}}>Exp:</strong> {lang==="hi"&&q.explanation_hi?q.explanation_hi:q.explanation}</div>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={()=>startQuiz(selectedQuiz)} style={{background:C.acc,border:"none",borderRadius:6,padding:"14px",color:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",width:"100%"}}>{t.retry}</button>
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>setScreen("topic")} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"12px",color:C.text,fontWeight:500,fontSize:14,cursor:"pointer"}}>{t.moreQuizzes}</button>
              <button onClick={()=>{setTab("analytics");setScreen("main");fetchHistory();}} style={{flex:1,background:C.inp,border:`1px solid ${C.border}`,borderRadius:6,padding:"12px",color:C.text,fontWeight:500,fontSize:14,cursor:"pointer"}}>{t.analytics}</button>
            </div>
          </div>
        </div>
        <Nav/>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MAIN TABS
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === "main") {

    const HomeTab = () => (
      <div style={{animation:"fadeUp 0.3s ease"}}>
        <div style={{padding:"24px 16px",background:C.hdr,borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
            <Av ini={userAvatar} size={48} pic={userPic} color={C.acc} />
            <div>
              <div style={{fontSize:12,color:C.muted,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.5px"}}>Welcome back,</div>
              <div style={{fontWeight:700,fontSize:18,color:C.text,letterSpacing:"-0.5px"}}>{userName}</div>
            </div>
          </div>
          <div style={{background:C.acc,borderRadius:8,padding:"20px",color:"#fff",boxShadow:"0 10px 25px rgba(37,99,235,0.2)"}}>
            <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{t.prepareSmarter}</div>
            <div style={{fontSize:13,opacity:0.9,fontWeight:400}}>{t.scoreHigher}</div>
            {profile && (
              <div style={{display:"flex",gap:16,marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.2)"}}>
                <div style={{textAlign:"center"}}><div style={{fontWeight:700,fontSize:16}}>{profile.avg_accuracy||0}%</div><div style={{fontSize:10,opacity:0.8}}>ACCURACY</div></div>
                <div style={{textAlign:"center"}}><div style={{fontWeight:700,fontSize:16}}>{profile.best_streak||0}🔥</div><div style={{fontSize:10,opacity:0.8}}>BEST STREAK</div></div>
                <div style={{textAlign:"center"}}><div style={{fontWeight:700,fontSize:16}}>{profile.total_score||0}</div><div style={{fontSize:10,opacity:0.8}}>TOTAL PTS</div></div>
              </div>
            )}
          </div>
        </div>
        
        <div style={{padding:"24px 16px", maxWidth: 800, margin: "0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:32}}>
            {[
              [subjects.length||STATIC_DATA.subjects.length, t.subjects],
              [Object.values(STATIC_DATA.topics).reduce((a,v)=>a+v.length,0), t.topics],
              [profile?.total_attempts ?? history.length, "My Tests"],
            ].map(([n,l])=>(
              <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 8px",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:700,color:C.text}}>{n}</div>
                <div style={{fontSize:11,color:C.muted,fontWeight:500,marginTop:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>{l}</div>
              </div>
            ))}
          </div>
          
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{fontSize:14,fontWeight:600,color:C.text,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.chooseSubject}</h2>
          </div>
          
          {dataLoading
            ? <Spinner/>
            : subjects.length===0
              ? <Empty icon="📚" title={t.noSubjects} desc={t.noSubjectsDesc}/>
              : (() => {
                  const grouped = {};
                  subjects.forEach(sub => {
                    const p = sub.paper || "General";
                    if (!grouped[p]) grouped[p] = [];
                    grouped[p].push(sub);
                  });
                  return Object.entries(grouped).map(([paperName, subs]) => (
                    <div key={paperName} style={{marginBottom:28}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.acc,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>{paperName}</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                        {subs.map(sub=>(
                          <div key={sub.id} className="card-h" onClick={()=>openSubject(sub)}
                            style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
                            <div style={{width:36,height:36,borderRadius:8,background:C.inp,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:10,border:`1px solid ${C.border}`}}>{sub.icon||"📚"}</div>
                            <div style={{fontWeight:600,fontSize:13,color:C.text,lineHeight:1.4}}>{lang==="hi"&&sub.name_hi ? sub.name_hi : sub.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()
          }

          <h2 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.recentAttempts}</h2>
          {history.length===0
            ? <Empty icon="⏱" title={t.noHistory} desc={t.noHistoryDesc}/>
            : <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {history.slice(0,5).map((h,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{flex:1,paddingRight:12}}>
                      <div style={{fontWeight:600,fontSize:14,color:C.text,marginBottom:4}}>{h.quizzes?.title||"Assessment"}</div>
                      <div style={{fontSize:12,color:C.muted}}>
                        {h.subjects?.name||""} {h.topics?.name ? `· ${h.topics.name}` : ""}
                      </div>
                    </div>
                    <div style={{textAlign:"right",paddingLeft:12,borderLeft:`1px solid ${C.border}`}}>
                      <div style={{fontWeight:700,color:h.accuracy>=60?C.ok:C.err,fontSize:16}}>{h.accuracy}%</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{h.score}/{h.total}</div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    );

    const AnalyticsTab = () => {
      const subjData = {};
      history.forEach(h => {
        const sName = lang === "hi" && h.subjects?.name_hi ? h.subjects.name_hi : (h.subjects?.name || "Other");
        if (!subjData[sName]) subjData[sName] = { name: sName, attempts: 0, accSum: 0 };
        subjData[sName].attempts += 1;
        subjData[sName].accSum += h.accuracy;
      });
      
      const subjAnalysis = Object.values(subjData)
        .map(s => ({ name: s.name, avg: Math.round(s.accSum / s.attempts), attempts: s.attempts }))
        .sort((a,b) => b.avg - a.avg);

      return (
        <div style={{padding:"24px 16px",animation:"fadeUp 0.3s ease",maxWidth:800,margin:"0 auto"}}>
          <h2 style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:20,letterSpacing:"-0.5px"}}>{t.performanceOverview}</h2>
          {history.length===0
            ? <Empty icon="📊" title={t.noHistory} desc={t.noHistoryDesc}/>
            : <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:32}}>
                  {[
                    [`${Math.round(history.reduce((a,h)=>a+h.accuracy,0)/history.length)}%`, "Avg Accuracy", C.text],
                    [history.length, "Tests Taken", C.text],
                    [`${Math.max(...history.map(h=>h.score))}/${history[0]?.total||20}`, "High Score", C.ok],
                    [fmt(Math.round(history.reduce((a,h)=>a+(h.time_taken||0),0)/history.length)), "Avg Time", C.text],
                  ].map(([vl,lb,cl])=>(
                    <div key={lb} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"20px 16px"}}>
                      <div style={{fontSize:24,fontWeight:700,color:cl,marginBottom:4}}>{vl}</div>
                      <div style={{fontSize:12,color:C.muted,fontWeight:500}}>{lb}</div>
                    </div>
                  ))}
                </div>

                {subjAnalysis.length > 0 && (
                  <>
                    <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.deeperAnalysis}</h3>
                    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:20,marginBottom:32}}>
                      <div style={{fontSize:12,color:C.muted,marginBottom:20,fontWeight:500}}>{t.subjectWise}</div>
                      {subjAnalysis.map((s, i) => (
                        <div key={i} style={{marginBottom:16}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}>
                            <span style={{fontWeight:600,color:C.text}}>{s.name} <span style={{color:C.muted,fontWeight:400,marginLeft:4}}>({s.attempts} tests)</span></span>
                            <span style={{fontWeight:700,color:C.text}}>{s.avg}%</span>
                          </div>
                          <div style={{height:6,background:C.inp,borderRadius:3,overflow:"hidden"}}>
                            <div className="bar" style={{width:`${s.avg}%`,height:"100%",background:s.avg>=60?C.ok:C.err,borderRadius:3}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <h3 style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.quizHistory}</h3>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {history.map((h,i)=>(
                    <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:14,color:C.text,marginBottom:4}}>{h.quizzes?.title||"Assessment"}</div>
                        <div style={{fontSize:12,color:C.muted}}>
                          {new Date(h.created_at).toLocaleDateString("en-IN")} · {h.subjects?.name}
                        </div>
                      </div>
                      <div style={{textAlign:"right",paddingLeft:16}}>
                        <div style={{fontWeight:700,fontSize:16,color:h.accuracy>=60?C.ok:C.err}}>{h.accuracy}%</div>
                        <div style={{fontSize:11,color:C.muted,marginTop:2}}>{h.score}/{h.total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
          }
        </div>
      );
    };

    const LeaderboardTab = () => {
      const medals = ["🥇","🥈","🥉"];
      const myId = user?.id;
      return (
        <div style={{padding:"24px 16px",animation:"fadeUp 0.3s ease",maxWidth:800,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:18,fontWeight:700,color:C.text,letterSpacing:"-0.5px"}}>{t.leaderboard}</h2>
            <button onClick={fetchLeaderboard} style={{background:C.inp,border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:500}}>↻ Refresh</button>
          </div>

          {lbLoading
            ? <Spinner/>
            : leaderboard.length === 0
              ? <Empty icon="🏆" title="No Rankings Yet" desc="Complete a quiz to appear on the leaderboard"/>
              : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {leaderboard.map((p, i) => {
                    const isMe = p.user_id === myId;
                    return (
                      <div key={p.user_id} style={{
                        background: isMe ? `${C.acc}0D` : C.card,
                        border: `1px solid ${isMe ? C.acc : C.border}`,
                        borderRadius:10,padding:"14px 16px",
                        display:"flex",alignItems:"center",gap:14
                      }}>
                        {/* Rank */}
                        <div style={{width:32,textAlign:"center",fontWeight:700,fontSize:i<3?20:14,color:i<3?["#f59e0b","#94a3b8","#b45309"][i]:C.muted,flexShrink:0}}>
                          {i<3 ? medals[i] : `#${p.rank}`}
                        </div>
                        {/* Avatar */}
                        <Av ini={(p.display_name||"?").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)} size={38} pic={p.avatar_url} color={C.acc}/>
                        {/* Name + attempts */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:14,color:C.text,display:"flex",alignItems:"center",gap:6}}>
                            {p.display_name||"Anonymous"}
                            {isMe && <span style={{fontSize:10,background:C.acc,color:"#fff",padding:"1px 6px",borderRadius:4,fontWeight:700}}>YOU</span>}
                          </div>
                          <div style={{fontSize:12,color:C.muted,marginTop:2}}>{p.total_attempts} tests · {p.total_score} pts</div>
                        </div>
                        {/* Accuracy */}
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontWeight:700,fontSize:18,color:p.avg_accuracy>=60?C.ok:C.err}}>{p.avg_accuracy}%</div>
                          <div style={{fontSize:10,color:C.muted,textTransform:"uppercase"}}>accuracy</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
          }
        </div>
      );
    };

    const BookmarksTab = () => (
      <div style={{padding:"24px 16px",animation:"fadeUp 0.3s ease",maxWidth:800,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontSize:18,fontWeight:700,color:C.text,letterSpacing:"-0.5px"}}>{t.savedQuestions}</h2>
          <span style={{fontSize:12,color:C.muted,background:C.card,padding:"4px 10px",borderRadius:12,border:`1px solid ${C.border}`}}>{bookmarks.length} Saved</span>
        </div>
        
        {bookmarks.length===0
          ? <Empty icon="🔖" title={t.noBookmarks} desc={t.noBookmarksDesc}/>
          : <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {bookmarks.map(q=>(
                <div key={q.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:20}}>
                  <p style={{fontSize:15,color:C.text,lineHeight:1.6,marginBottom:16,fontWeight:500}}>{lang==="hi"&&q.question_hi?q.question_hi:q.question}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                    {(lang==="hi"&&q.options_hi?q.options_hi:q.options).map((opt,i)=>(
                      <div key={i} style={{fontSize:13,padding:"10px 12px",borderRadius:6,background:i===q.correct?`${C.ok}11`:C.inp,color:i===q.correct?C.text:C.muted,border:`1px solid ${i===q.correct?C.ok:C.border}`,display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontWeight:600,color:i===q.correct?C.ok:C.muted}}>{["A","B","C","D"][i]}.</span> {opt}
                      </div>
                    ))}
                  </div>
                  {q.explanation && <div style={{fontSize:13,color:C.text,background:`${C.acc}0A`,padding:"12px",borderRadius:6,borderLeft:`3px solid ${C.acc}`,marginBottom:16}}><strong style={{color:C.acc}}>Exp:</strong> {lang==="hi"&&q.explanation_hi?q.explanation_hi:q.explanation}</div>}
                  <button onClick={()=>toggleBM(q)} style={{background:C.inp,border:`1px solid ${C.border}`,color:C.err,borderRadius:4,padding:"6px 12px",fontSize:13,fontWeight:500,cursor:"pointer",transition:"background 0.2s"}}>Remove Bookmark</button>
                </div>
              ))}
            </div>
        }
      </div>
    );

    const ProfileTab = () => {
      const totalAttempts = profile?.total_attempts ?? history.length;
      const avgAcc = profile?.avg_accuracy ?? (history.length ? Math.round(history.reduce((a,h)=>a+h.accuracy,0)/history.length) : 0);
      const totalScore = profile?.total_score ?? history.reduce((a,h)=>a+h.score,0);
      const bestStreak = profile?.best_streak ?? 0;
      const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN",{month:"short",year:"numeric"}) : "—";
      const lastSeen = profile?.last_seen_at ? new Date(profile.last_seen_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "—";
      const provider = profile?.provider || "google";

      return (
        <div style={{padding:"24px 16px",animation:"fadeUp 0.3s ease",maxWidth:600,margin:"0 auto"}}>
          {/* Avatar + name card */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:28,marginBottom:16,textAlign:"center"}}>
            <div style={{position:"relative",display:"inline-block",marginBottom:12}}>
              <Av ini={userAvatar} size={80} pic={userPic} />
              <div style={{position:"absolute",bottom:-4,right:-4,width:20,height:20,borderRadius:"50%",background:"#fff",border:`2px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>
                {provider==="google"?"G":"?"}
              </div>
            </div>
            <div style={{fontWeight:700,fontSize:20,color:C.text,letterSpacing:"-0.5px"}}>{userName}</div>
            <div style={{color:C.muted,fontSize:13,marginTop:4}}>{userEmail}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:4}}>Member since {memberSince} · Last active {lastSeen}</div>

            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:24,paddingTop:20,borderTop:`1px solid ${C.border}`}}>
              {[
                [totalAttempts,  "Tests",     C.text],
                [`${avgAcc}%`,   "Accuracy",  avgAcc>=60?C.ok:avgAcc>0?C.err:C.text],
                [totalScore,     "Score",     C.acc],
                [bestStreak,     "Streak 🔥", "#f97316"],
              ].map(([val,lbl,cl])=>(
                <div key={lbl}>
                  <div style={{fontWeight:700,fontSize:20,color:cl}}>{val}</div>
                  <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",marginTop:4,letterSpacing:"0.5px"}}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",marginBottom:16}}>
            <div style={{padding:"10px 16px",background:C.inp,borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px"}}>Preferences</span>
            </div>
            {[
              [t.darkMode,   toggleDark, dark?"Enabled":"Disabled"],
              [t.language,   toggleLang, lang==="en"?"English":"हिंदी"],
            ].map(([lb,fn,vl],i)=>(
              <div key={lb} onClick={fn} style={{padding:"14px 16px",borderBottom:i===0?`1px solid ${C.border}`:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                <span style={{fontWeight:500,color:C.text,fontSize:14}}>{lb}</span>
                <span style={{fontSize:12,color:C.muted,background:C.inp,padding:"4px 10px",borderRadius:4,fontWeight:600,border:`1px solid ${C.border}`}}>{vl}</span>
              </div>
            ))}
          </div>

          {/* Account info */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",marginBottom:16}}>
            <div style={{padding:"10px 16px",background:C.inp,borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px"}}>Account</span>
            </div>
            {[
              ["Sign-in Provider", provider.charAt(0).toUpperCase()+provider.slice(1)],
              ["User ID",          (user?.id||"").slice(0,16)+"..."],
              ["Joined",           memberSince],
            ].map(([lb,vl])=>(
              <div key={lb} style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:C.muted}}>{lb}</span>
                <span style={{fontSize:13,color:C.text,fontWeight:500,fontFamily:lb==="User ID"?"monospace":"inherit"}}>{vl}</span>
              </div>
            ))}
          </div>

          <button onClick={signOut} style={{width:"100%",background:C.card,border:`1px solid ${C.err}44`,color:C.err,borderRadius:8,padding:"14px",fontWeight:600,fontSize:14,cursor:"pointer"}}>
            Sign Out
          </button>
        </div>
      );
    };

    return (
      <div style={ms}><style>{css}</style>
        <Hdr/>
        <ErrorBanner msg={dataError}/>
        {tab==="home"      && <HomeTab/>}
        {tab==="analytics" && <AnalyticsTab/>}
        {tab==="leaderboard"&& <LeaderboardTab/>}
        {tab==="bookmarks" && <BookmarksTab/>}
        {tab==="profile"   && <ProfileTab/>}
        <Nav/>
      </div>
    );
  }

  return null;
}

