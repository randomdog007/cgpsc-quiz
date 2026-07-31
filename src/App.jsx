import { useState, useEffect, useRef } from "react";
import { supabase as realSupabase } from "./supabase";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import SubjectPage from "./pages/SubjectPage";
import TopicPage from "./pages/TopicPage";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import RevisionPage from "./pages/RevisionPage";
import AdminPage from "./pages/AdminPage";
import Sprite from "./components/layout/Sprite";

// --- SUPABASE CLIENT PLACEHOLDER FOR CANVAS PREVIEW ---
// For local development, delete this dummy object and uncomment the import below:
// import { supabase } from "./supabase";

const STATIC_DATA = { subjects: [], topics: {} };
const T = { 
  en: {}, 
  hi: {} 
};

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
  { id:1, quiz_id:2, question:"Which is the oldest of the four Vedas?", option_a:"Samaveda", option_b:"Rigveda", option_c:"Yajurveda", option_d:"Atharvaveda", correct_option:1, explanation:"The Rigveda is the oldest Veda, composed around 1500–1200 BCE.", question_hi:"चारों वेदों में सबसे प्राचीन कौन सा है?", option_a_hi:"सामवेद", option_b_hi:"ऋग्वेद", option_c_hi:"यजुर्वेद", option_d_hi:"अथर्ववेद", explanation_hi:"ऋग्वेद सबसे प्राचीन वेद है, जो लगभग 1500–1200 ईसा पूर्व रचित है.", sort_order:1 },
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
  en: { appName:"CGPSC EXAM by Daily Prep Notes",tagline:"Preparation Portal",prepareSmarter:"Structured Learning",scoreHigher:"Track your progress daily.",chooseSubject:"Select Subject",subjects:"Subjects",topics:"Topics",chooseTopic:"Select Topic",quizzes:"Assessments",questions:"Questions",startQuiz:"Start Test →",back:"← Back",home:"Home",analytics:"Analytics",bookmarks:"Saved",profile:"Profile",signInGoogle:"Continue with Google",signInMsg:"Sign in to access assessments and track performance.",mockMode:"Exam Mode",mockModeDesc:"Strict timer & no instant feedback.",practiceModeDesc:"Instant answers and explanations shown immediately. Good for casual learning.",previousYear:"Previous Year Only",allDifficulty:"All Levels",search:"Search assessments...",explanation:"EXPLANATION",nextQuestion:"Next Question →",finishQuiz:"Submit Test",retry:"Retake Test",moreQuizzes:"More Tests",excellent:"Excellent Performance!",goodJob:"Good Effort!",keepPracticing:"Needs Improvement",needStudy:"Review Required",score:"Score",accuracy:"Accuracy",correct:"Correct",wrong:"Incorrect",timeTaken:"Time Taken",yourRank:"Current Rank",savedQuestions:"Saved Questions",noBookmarks:"No saved questions",noBookmarksDesc:"Bookmark questions for revision",performanceOverview:"Performance Overview",subjectWise:"Subject Breakdown",deeperAnalysis:"Analytical Breakdown",strongAreas:"Strong Areas",weakAreas:"Areas to Improve",recentAttempts:"Recent Activity",quizHistory:"Test History",signOut:"Sign Out",darkMode:"Dark Mode",language:"Language",loading:"Loading...",quizOf:"of",question:"Question",answerReview:"Answer Key & Review",remove:"Remove",signingIn:"Authenticating...",noSubjects:"No subjects available",noSubjectsDesc:"Database requires subject entries",noTopics:"No topics available",noTopicsDesc:"Database requires topic entries for this subject",noQuizzes:"No tests available",noQuizzesDesc:"Database requires quiz entries for this topic",noQuestions:"No questions available",noQuestionsDesc:"Test contains no questions yet",noHistory:"No test history",noHistoryDesc:"Complete an assessment to view analytics",filterNoMatch:"No tests match the current filters",topicOverview:"Topic Overview",restart:"Restart",resume:"Resume",pts:"pts",answered:"answered",savedIcon:"★ Saved",saveIcon:"☆ Save",skipQ:"Skip Question →",skipSubmit:"Skip & Submit",clear:"Clear",legendCorrect:"✓ Correct",legendWrong:"✗ Wrong",legendSkipped:"— Skipped",assessmentComplete:"Assessment Complete",outOf:"out of",marks:"marks",ofMaxMarks:"of maximum marks",each:"each",time:"Time",taken:"taken",pass:"✓ Pass",belowPass:"✗ Below pass mark",noQsCategory:"No questions in this category.",yourAnswer:"Your answer",correctAnswer:"✓ Answer",all:"All",skipped:"Skipped",subjectModule:"Subject Module",welcomeBack:"Welcome back",todaysRevision:"Today's Revision",dueForReview1:"You have",dueForReview2:"questions due for review.",streak:"Streak",allCaughtUp:"All caught up!",noRevisionsDue:"No revisions due today.",leaderboardTitle:"Leaderboard & Rank",leaderboardDesc:"See where you stand globally.",viewBtn:"View",searchResults:"Search Results",noQuizzesFound:"No tests found.",mins:"Mins",startBtn:"Start",exploreBtn:"Explore",rank:"Rank",nextLevel:"Next Level:",quizzesText:"Quizzes",overallAcc:"Overall Acc.",dayStreak:"Day Streak",bestStreak:"Best Streak",timeSpent:"Time Spent",bestScore:"Best Score",accuracyTrend:"Accuracy Trend",categoryBreakdown:"Category Breakdown",loadingSaved:"Loading saved questions...",savedSyncDesc:"Saved questions sync to your account and are available across devices.",disableDark:"Disable Dark",enableDark:"Enable Dark",adminPanel:"Admin Panel" },
  hi: { appName:"CGPSC EXAM by Daily Prep Notes",tagline:"तैयारी का सबसे बेहतरीन मंच",prepareSmarter:"स्मार्ट तरीके से तैयारी करें",scoreHigher:"हर दिन अपना स्कोर बेहतर करें।",chooseSubject:"अपना विषय चुनें",subjects:"विषय",topics:"अध्याय",chooseTopic:"अध्याय चुनें",quizzes:"क्विज़",questions:"प्रश्न",startQuiz:"क्विज़ शुरू करें →",back:"← पीछे जाएँ",home:"होम",analytics:"प्रदर्शन विश्लेषण",bookmarks:"बुकमार्क (रिवीजन)",profile:"प्रोफ़ाइल",signInGoogle:"Google के साथ आगे बढ़ें",signInMsg:"क्विज़ देने और अपनी प्रगति ट्रैक करने के लिए साइन इन करें।",mockMode:"असली परीक्षा मोड (Mock)",mockModeDesc:"परीक्षा जैसा माहौल: समय सीमा के साथ, उत्तर बाद में।",practiceModeDesc:"त्वरित उत्तर और विस्तृत व्याख्या। अभ्यास के लिए उपयुक्त।",previousYear:"पिछले वर्षों के प्रश्न (PYQ)",allDifficulty:"सभी कठिनाई स्तर",search:"क्विज़ या विषय खोजें...",explanation:"विस्तृत व्याख्या (Explanation)",nextQuestion:"अगला प्रश्न →",finishQuiz:"क्विज़ सबमिट करें",retry:"फिर से प्रयास करें",moreQuizzes:"और क्विज़ देखें",excellent:"शानदार प्रदर्शन! लगे रहें!",goodJob:"बहुत अच्छा प्रयास!",keepPracticing:"थोड़ी और मेहनत की जरूरत है।",needStudy:"आपको इस विषय को फिर से पढ़ना चाहिए।",score:"प्राप्तांक",accuracy:"सटीकता",correct:"सही उत्तर",wrong:"गलत उत्तर",timeTaken:"लिया गया समय",yourRank:"आपकी वर्तमान रैंक",savedQuestions:"बुकमार्क किए गए प्रश्न",noBookmarks:"अभी तक कोई प्रश्न बुकमार्क नहीं किया गया है",noBookmarksDesc:"महत्वपूर्ण प्रश्नों को रिवीजन के लिए यहाँ सेव करें",performanceOverview:"आपके प्रदर्शन की एक झलक",subjectWise:"विषय के अनुसार आपकी पकड़",deeperAnalysis:"आपकी तैयारी का गहराई से विश्लेषण",strongAreas:"आपके सबसे मजबूत विषय",weakAreas:"वे विषय जहाँ सुधार की गुंजाइश है",recentAttempts:"आपके हालिया क्विज़",quizHistory:"आपका क्विज़ इतिहास",signOut:"लॉग आउट करें",darkMode:"डार्क मोड",language:"भाषा बदलें",loading:"लोड हो रहा है, कृपया प्रतीक्षा करें...",quizOf:"में से",question:"प्रश्न",answerReview:"उत्तर कुंजी और व्याख्या",remove:"हटाएँ",signingIn:"लॉग इन हो रहा है...",noSubjects:"यहाँ अभी कोई विषय नहीं है",noSubjectsDesc:"जल्द ही नए विषय जोड़े जाएंगे",noTopics:"इस विषय में अभी कोई अध्याय नहीं है",noTopicsDesc:"हम जल्द ही यहाँ नए अध्याय जोड़ेंगे",noQuizzes:"इस अध्याय के लिए अभी कोई क्विज़ नहीं है",noQuizzesDesc:"जल्द ही इस अध्याय के क्विज़ उपलब्ध होंगे",noQuestions:"इस क्विज़ में अभी प्रश्न नहीं जोड़े गए हैं",noQuestionsDesc:"कृपया बाद में दोबारा जांचें",noHistory:"आपने अभी तक कोई क्विज़ नहीं दिया है",noHistoryDesc:"अपने प्रदर्शन का विश्लेषण देखने के लिए एक क्विज़ पूरा करें",filterNoMatch:"आपकी खोज के अनुसार कोई क्विज़ नहीं मिला",topicOverview:"अध्याय का सार",restart:"फिर से शुरू करें",resume:"जारी रखें",pts:"अंक",answered:"उत्तर दिए",savedIcon:"★ सेव किया गया",saveIcon:"☆ सेव करें",skipQ:"प्रश्न छोड़ें →",skipSubmit:"छोड़ें और सबमिट करें",clear:"हटाएं",legendCorrect:"✓ सही",legendWrong:"✗ गलत",legendSkipped:"— छोड़ा गया",assessmentComplete:"टेस्ट समाप्त",outOf:"में से",marks:"अंक",ofMaxMarks:"अधिकतम अंकों में से",each:"प्रत्येक",time:"समय",taken:"लिया गया",pass:"✓ पास",belowPass:"✗ पासिंग मार्क से कम",noQsCategory:"इस श्रेणी में कोई प्रश्न नहीं है।",yourAnswer:"आपका उत्तर",correctAnswer:"✓ उत्तर",all:"सभी",skipped:"छोड़े गए",subjectModule:"विषय मॉड्यूल",welcomeBack:"वापसी पर स्वागत है",todaysRevision:"आज का रिवीजन",dueForReview1:"आपके",dueForReview2:"प्रश्न रिवीजन के लिए बाकी हैं।",streak:"स्ट्रीक (Streak)",allCaughtUp:"सब कुछ पूरा हो गया!",noRevisionsDue:"आज कोई रिवीजन बाकी नहीं है।",leaderboardTitle:"लीडरबोर्ड और रैंक",leaderboardDesc:"देखें आप दूसरों के मुकाबले कहाँ हैं।",viewBtn:"देखें",searchResults:"खोज के परिणाम",noQuizzesFound:"कोई टेस्ट नहीं मिला।",mins:"मिनट",startBtn:"शुरू करें",exploreBtn:"देखें",rank:"रैंक",nextLevel:"अगला लेवल:",quizzesText:"क्विज़",overallAcc:"सटीकता",dayStreak:"दिन की स्ट्रीक",bestStreak:"सबसे अच्छी स्ट्रीक",timeSpent:"बिताया गया समय",bestScore:"सबसे अच्छा स्कोर",accuracyTrend:"सटीकता का रुझान",categoryBreakdown:"श्रेणी-वार प्रदर्शन",loadingSaved:"सेव किए गए प्रश्न लोड हो रहे हैं...",savedSyncDesc:"सेव किए गए प्रश्न आपके अकाउंट से सिंक होते हैं और सभी डिवाइस पर उपलब्ध हैं।",disableDark:"डार्क मोड हटाएं",enableDark:"डार्क मोड लगाएं",adminPanel:"एडमिन पैनल" }
};

const supabase = process.env.REACT_APP_USE_MOCK === "true" ? mockSupabase : realSupabase;

// Converts literal "\n" strings (from CSV import) into real newline characters.
// Apply to any text field before rendering so \n shows as line breaks, not text.
const formatText = (str) => (str ? String(str).replace(/\\n/g, "\n") : str);

export default function App() {
  const [lang, setLang]           = useState(() => localStorage.getItem("cgpsc_lang") || "en");
  const [dark, setDark]           = useState(() => localStorage.getItem("cgpsc_dark") === "true"); 

  // ── AUTH ────────────────────────────────────────────────────────────────────
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  // ── NAVIGATION ──────────────────────────────────────────────────────────────
  const [screen, setScreen]       = useState("login");
  const [tab, setTab]             = useState("home");

  useEffect(() => {
    document.body.dataset.route = screen;
  }, [screen]);

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

  useEffect(() => {
    const coverage = profile?.avg_accuracy || 0;
    const line = document.getElementById("prepLine");
    if (line) line.style.width = `${coverage}%`;
  }, [profile]);

  // ── QUIZ STATE ──────────────────────────────────────────────────────────────
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic]     = useState(null);

  const [selectedQuiz, setSelectedQuiz]       = useState(null);
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState({});
  const [showExp, setShowExp]     = useState(false);
  const [timer, setTimer]         = useState(1200);
  const [score, setScore]           = useState(0);
  const [marksScored, setMarksScored] = useState(0);  // +2 correct, -0.66 wrong, 0 skipped
  const [timeTaken, setTimeTaken] = useState(0);
  const [mockMode, setMockMode]   = useState(true);
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
  const saveQuizState  = (p) => { try { const x=JSON.parse(localStorage.getItem(QUIZ_KEY)||"{}"); localStorage.setItem(QUIZ_KEY,JSON.stringify({...x,...p,savedAt:Date.now()})); } catch(_){} };
  const loadQuizState  = ()  => { try { return JSON.parse(localStorage.getItem(QUIZ_KEY)||"null"); } catch(_){ return null; } };
  const clearQuizState = ()  => { try { localStorage.removeItem(QUIZ_KEY); } catch(_){} };

  // ── PREMIUM DESIGN SYSTEM TOKENS ──────────────────────────────────────────
  const C = dark
    ? { bg:"#000000", card:"#0a0a0a", border:"#222222", text:"#ededed", muted:"#888888", hdr:"rgba(0,0,0,0.75)", acc:"#3388FF", acc2:"#1c66d8", ok:"#14b8a6", err:"#ef4444", inp:"#111111", shadow:"0 4px 12px rgba(255,255,255,0.03)" }
    : { bg:"#fafafa", card:"#ffffff", border:"#eaeaea", text:"#111111", muted:"#666666", hdr:"rgba(255,255,255,0.85)", acc:"#0055FF", acc2:"#0044CC", ok:"#059669", err:"#e11d48", inp:"#f5f5f5", shadow:"0 2px 8px rgba(0,0,0,0.04)" };
  const syncUrl = (path, replace = false) => {
    if (typeof window === "undefined") return;
    const method = replace ? "replaceState" : "pushState";
    if (window.location.pathname !== path) {
      window.history[method]({}, "", path);
    }
  };

  const goAdmin = (replace = false) => {
    setScreen("admin");
    syncUrl("/admin", replace);
  };

  const goRevision = (replace = false) => {
    setScreen("revision");
    syncUrl("/revision", replace);
  };

  const mainPath = (nextTab = "home") => (nextTab === "home" ? "/" : `/${nextTab}`);
  const goLogin = (replace = false) => {
    setScreen("login");
    syncUrl("/login", replace);
  };
  const goMain = (t = "home") => {
    if (t === "revision") {
      setScreen("revision");
      return;
    }
    setTab(t);
    setScreen("main");
    setMockMode(false);
    syncUrl(mainPath(t), false);
    saveNav({ screen: "main", tab: t, subjectId: null, topicId: null });
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


  const restorePathAfterAuth = async (path) => {
    if (!path || path === "/" || path === "/login") {
      goMain("home", true);
      return;
    }
    if (["/analytics", "/bookmarks", "/profile", "/leaderboard"].includes(path)) {
      setScreen("main");
      setTab(path.slice(1));
      return;
    }
    if (path.startsWith("/subject/")) {
      const subjectId = path.split("/")[2];
      const { data } = await supabase.from("subjects").select("*").eq("id", subjectId);
      if (data && data.length > 0) {
        openSubject(data[0]);
        return;
      }
    }
    if (path.startsWith("/topic/")) {
      const topicId = path.split("/")[2];
      const { data: topicsData } = await supabase.from("topics").select("*").eq("id", topicId);
      if (topicsData && topicsData.length > 0) {
        const topic = topicsData[0];
        const { data: subjectsData } = await supabase.from("subjects").select("*").eq("id", topic.subject_id);
        if (subjectsData && subjectsData.length > 0) {
          setSelectedSubject(subjectsData[0]);
        }
        openTopic(topic);
        return;
      }
    }
    if (path.startsWith("/quiz/")) {
       const quizId = path.split("/")[2];
       const qs = loadQuizState();
       if (qs && qs.quiz && String(qs.quiz.id) === String(quizId)) {
           resumeQuizFromStorage(qs);
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
  const restoreFromNav = async (saved) => {
    let subject = null;
    let topic = null;
    
    if (saved.subjectId != null) {
      const { data } = await supabase.from("subjects").select("*").eq("id", saved.subjectId);
      if (data && data.length > 0) subject = data[0];
    }
    if (saved.topicId != null) {
      const { data } = await supabase.from("topics").select("*").eq("id", saved.topicId);
      if (data && data.length > 0) topic = data[0];
    }
    
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
      if (path === "/admin") { setScreen("admin"); return; }
      if (path === "/" || path === "") { setScreen("main"); setTab("home"); return; }
      if (["/analytics", "/bookmarks", "/profile", "/leaderboard"].includes(path)) {
        setScreen("main");
        setTab(path.slice(1));
        return;
      }
      if (path.startsWith("/subject/") && selectedSubject) { setScreen("subject"); return; }
      if (path.startsWith("/topic/") && selectedTopic) { setScreen("topic"); return; }

      if (path.startsWith("/quiz/") && selectedQuiz) { setScreen("quiz"); return; }
      if (path.startsWith("/result/") && selectedQuiz) { setScreen("result"); return; }
      
      // If we are missing state but it's a valid deep link, restore it
      if (path.startsWith("/subject/") || path.startsWith("/topic/") || path.startsWith("/quiz/") || path.startsWith("/result/")) {
        restorePathAfterAuth(path);
        return;
      }
      
      if (user) { setScreen("main"); setTab("home"); }
    };
    applyPath();
    window.addEventListener("popstate", applyPath);
    return () => window.removeEventListener("popstate", applyPath);
  }, [user, selectedSubject, selectedTopic, selectedQuiz]);
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) { alert("Sign in failed: " + error.message); setSigningIn(false); }
    else { setSigningIn(true); }
  };

  const signOut = async () => { clearNav(); clearQuizState(); await supabase.auth.signOut(); };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("cgpsc_dark", String(next));
    savePreference("dark_mode", next);
  };

  const toggleLang = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("cgpsc_lang", next);
    savePreference("preferred_lang", next);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.body.setAttribute('data-route', screen);
  }, [dark, screen]);

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
      // Use /api/user/profile which returns profile + rank in one request
      const token = localStorage.getItem('firebase_id_token');
      const res = await fetch('/api/user/profile', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        let p = json.data;
        if (p) {
          // Backfill real name/email if they are placeholder
          const realName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0];
          const realEmail = currentUser?.email;
          if (realName && (p.full_name === "Aspirant" || !p.full_name || p.email === "" || !p.email)) {
            const updateData = {};
            if (p.full_name === "Aspirant" || !p.full_name) updateData.full_name = realName;
            if (p.email === "" || !p.email) updateData.email = realEmail || "";
            await supabase.from("profiles").eq("id", uid).update(updateData);
            p = { ...p, ...updateData };
          }
          setProfile(p); // p already includes rank from user_rank view
          // Restore user preferences from DB
          if (p.preferred_lang) {
            setLang(p.preferred_lang);
            localStorage.setItem("cgpsc_lang", p.preferred_lang);
          }
          if (typeof p.dark_mode === "boolean" || typeof p.dark_mode === "number") {
            const darkVal = Boolean(p.dark_mode);
            setDark(darkVal);
            localStorage.setItem("cgpsc_dark", String(darkVal));
          }
        }
      }
    } catch (e) { console.error("fetchProfile error:", e); }
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
      const { data, error } = await supabase.from("topics").select("*, quizzes(id)").eq("subject_id", subject.id).order("sort_order");
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
    goTopic(topic);
    saveNav({ screen: "topic", topicId: topic.id });
    setDataLoading(true);
    setDataError(null);
    try {
      const { data, error } = await supabase.from("quizzes").select("*").eq("topic_id", topic.id).order("id");
      if (error) { setDataError(lang === "hi" ? "क्विज़ लोड नहीं हो सके" : "Could not load quizzes"); setDataLoading(false); return; }
      const formatted = (data || []).map(q => ({
        ...q, 
        title: formatText(q.title), 
        title_hi: formatText(q.title_hi || q.title), 
        name: formatText(q.name || q.title),
        name_hi: formatText(q.name_hi || q.title_hi || q.name || q.title),
        description: formatText(q.description),
        description_hi: formatText(q.description_hi || q.description)
      }));
      setQuizzes(formatted);
    } catch (e) { setQuizzes([]); }
    setDataLoading(false);
  };



  const startQuiz = async (quiz, forceResume) => {
    const saved = loadQuizState();
    let resume = false;
    if (saved && saved.quizId === quiz.id) {
      if (forceResume !== undefined) {
        resume = forceResume;
      } else {
        resume = window.confirm(lang === "hi" ? "आपके पास इस क्विज़ का एक अधूरा प्रयास है। क्या आप वहीं से जारी रखना चाहते हैं?" : "You have an unfinished attempt for this quiz. Do you want to resume?");
      }
    }

    if (resume) {
      setDataLoading(true);
      setDataError(null);
      goQuiz(quiz);
      setSelectedQuiz({ ...saved.quiz, ...quiz });
      setCurrentQ(saved.currentQ || 0);
      setAnswers(saved.answers || {});
      setShowExp(false);
      setTimer(saved.timer);
      setQuestions(saved.questions || []);
      setMockMode(saved.mockMode ?? true);
      quizStartTs.current = saved.startedAt || Date.now();
      setDataLoading(false);
      return;
    }

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
    setMarksScored(0);
    quizStartTs.current = Date.now();
    try {
      let token = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
      } catch (e) {}

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Practice mode needs an authenticated answer key. Guests can still take
      // the quiz in exam mode instead of being sent away from the assessment.
      let currentMode = mockMode;
      if (!currentMode && !token) {
        currentMode = true;
        setMockMode(true);
        setDataError(lang === "hi" ? "प्रैक्टिस मोड के लिए लॉगिन आवश्यक है। क्विज़ परीक्षा मोड में शुरू किया गया है।" : "Sign in is required for Practice Mode. This quiz has started in Exam Mode.");
      }
      const modeQuery = !currentMode ? "?mode=practice" : "";
      const res = await fetch(`/api/quiz/${quiz.id}${modeQuery}`, { headers });
      
      if (res.status === 401) {
        alert(lang === "hi" ? "कृपया प्रैक्टिस मोड का उपयोग करने के लिए लॉगिन करें।" : "Please sign in to use Practice Mode.");
        setDataLoading(false);
        setScreen("profile");
        return;
      }
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      const publicData = await res.json();
      const enrichedQuiz = {
        ...quiz,
        title: quiz.title || publicData.title,
        title_hi: quiz.title_hi || publicData.titleHi,
        name: quiz.name || quiz.title || publicData.title,
        name_hi: quiz.name_hi || quiz.title_hi || publicData.titleHi || publicData.title,
        topic_name: quiz.topic_name || publicData.topic,
        topic_name_hi: quiz.topic_name_hi || publicData.topicHi || publicData.topic
      };
      setSelectedQuiz(enrichedQuiz);
      
      let qData = publicData.questions || [];
      if (qData.length > 0) {
        qData = qData.sort(() => 0.5 - Math.random());
      }

      const formatted = qData.map(q => ({
        id:          q.id,
        question:    formatText(q.text),
        question_hi: formatText(q.textHi || q.text),
        options:     [q.options?.a, q.options?.b, q.options?.c, q.options?.d].map(formatText),
        options_hi:  [q.optionsHi?.a || q.options?.a, q.optionsHi?.b || q.options?.b, q.optionsHi?.c || q.options?.c, q.optionsHi?.d || q.options?.d].map(formatText),
        correct:     q.correct !== undefined ? q.correct : -1,
        explanation: q.explanation || "",
        explanation_hi: q.explanationHi || ""
      }));
      
      setQuestions(formatted);
      saveQuizState({
        quizId: quiz.id, quiz: enrichedQuiz, questions: formatted,
        currentQ: 0, answers: {}, timer: totalSecs, totalSecs,
        mockMode: currentMode, startedAt: Date.now(),
        version: publicData.version
      });
      saveNav({ screen: "quiz", quizId: quiz.id });
    } catch (e) { 
      setDataError(lang === "hi" ? "API से प्रश्न लोड नहीं किए जा सके" : "Could not load questions from API");
      setQuestions([]); 
    }
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

  // saveAttempt is now handled server-side. We keep a stub for backward compatibility if needed, but it does nothing.
  const saveAttempt = async () => {};



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
          
          // Trigger the 'alive' breathing timer effect
          import('./alive.js').then(m => {
            const totalSecs = (selectedQuiz?.time_limit_mins * 60) || 1200;
            if (m && m.timerTick) {
              const el = document.querySelector('.timer');
              if (el) m.timerTick(el, next, totalSecs);
            }
          }).catch(() => {});

          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, dataLoading]);

  const selectAnswer = (idx) => {
    if (answers[currentQ] !== undefined && !mockMode) return;
    if (answers[currentQ] === idx) {
      clearAnswer();
      return;
    }
    const newAnswers = { ...answers, [currentQ]: idx };
    setAnswers(newAnswers);
    if (!mockMode) setShowExp(true);
    saveQuizState({ answers: newAnswers, currentQ });
  };

  const clearAnswer = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQ];
    setAnswers(newAnswers);
    if (!mockMode) setShowExp(false);
    saveQuizState({ answers: newAnswers, currentQ });
  };

  const finishQuiz = async () => {
    clearInterval(timerRef.current);
    setDataLoading(true);
    setDataError(null);
    
    try {
      const saved = loadQuizState();
      const version = saved?.version || 1;
      const totalSecs = (selectedQuiz?.time_limit_mins || 20) * 60;
      const taken = Math.max(totalSecs - timer, 0);

      // Convert { currentQIndex: optIndex (0-3) } to { questionId: optIndex+1 }
      const apiAnswers = {};
      for (const [qIdx, optIdx] of Object.entries(answers)) {
        const qId = questions[qIdx]?.id;
        if (qId && optIdx !== undefined && optIdx !== null) {
          apiAnswers[String(qId)] = parseInt(optIdx) + 1; // 1-based for DB
        }
      }

      let token = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
      } catch (e) {}

      const res = await fetch(`/api/quiz/${selectedQuiz?.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ version, timeTaken: taken, answers: apiAnswers })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Submit failed (${res.status})`);
      }

      const resultData = await res.json();
      
      // The server scored the quiz! Update local state to show ResultPage.
      setScore(resultData.score);
      setMarksScored(resultData.marks);
      setTimeTaken(resultData.timeTaken);
      
      // Inject correct answers & explanations back into `questions` state for ResultPage
      const mappedQuestions = [...questions];
      for (const resItem of resultData.results) {
        const qIdx = mappedQuestions.findIndex(q => String(q.id) === String(resItem.questionId));
        if (qIdx !== -1) {
          mappedQuestions[qIdx].correct = resItem.correctOption - 1; // 0-indexed for frontend
          mappedQuestions[qIdx].explanation = formatText(resItem.explanation);
          mappedQuestions[qIdx].explanation_hi = formatText(resItem.explanationHi);
        }
      }
      setQuestions(mappedQuestions);
      
      clearQuizState();
      fetchHistory(user);
      fetchProfile(user); // Fetch updated stats from server
      goResult(selectedQuiz);

    } catch (e) {
      setDataError(e.message || (lang === "hi" ? "क्विज़ सबमिट करने में विफल।" : "Failed to submit quiz."));
      // Don't clear state, let them try submitting again
    } finally {
      setDataLoading(false);
    }
  };

  const skipQ = () => {
    setShowExp(false);
    if (currentQ < questions.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      saveQuizState({ currentQ: next });
    } else {
      finishQuiz();
    }
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
      if (uid) {
        try { await supabase.from("saved_questions").eq("user_id", uid).eq("question_id", q.id).delete(); } catch (e) { console.error("Failed to delete bookmark:", e); }
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
          await supabase.from("saved_questions").insert({
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
          });
        } catch (e) { console.error("Failed to insert bookmark:", e); }
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
    return (
      (search === "" || (q.title && q.title.toLowerCase().includes(search.toLowerCase())) || (q.title_hi && q.title_hi.includes(search)))
    );
  });

  // ════════════════════════════════════════════════════════════════════════════
  // REUSABLE UI PIECES
  // ════════════════════════════════════════════════════════════════════════════
  const css = ``;
  
  const ms  = { minHeight:"100vh", background: C.bg, color: C.text, paddingBottom: 80 };

  const Hdr = ({ back, onBack, titleOverride, subtitleOverride }) => (
    <header className="glass" style={{ padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {back && (
          <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.text, padding: "8px", borderRadius: 8, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = C.inp} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
            ←
          </button>
        )}
        {!back && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => { setScreen("main"); setTab("home"); }}>
            <div style={{ width: 32, height: 32, background: C.acc, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: `0 4px 10px ${C.acc}55` }}>
              CG
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.text, letterSpacing: "-0.5px", lineHeight: 1.2 }}>{titleOverride || t.appName}</div>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{subtitleOverride || t.tagline}</div>
            </div>
          </div>
        )}
        {back && titleOverride && (
          <div style={{ fontWeight: 600, fontSize: 15, color: C.text, letterSpacing: "-0.3px" }}>{titleOverride}</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {screen === "quiz" && !dataLoading && (
          <div style={{ background: timer < 120 ? `${C.err}15` : C.inp, color: timer < 120 ? C.err : C.text, border: `1px solid ${timer < 120 ? C.err : C.border}`, borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 14, fontFamily: "'Inter', monospace", letterSpacing: "0.5px" }}>
            {fmt(timer)}
          </div>
        )}
        <button onClick={toggleLang} style={{ background: "transparent", border: "none", color: C.muted, padding: "10px", borderRadius: 8, fontSize: 16, cursor: "pointer", fontWeight: 700, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = C.text} onMouseOut={e => e.currentTarget.style.color = C.muted}>{lang === "en" ? "हिं" : "EN"}</button>
        <button onClick={toggleDark} style={{ background: "transparent", border: "none", color: C.muted, padding: "10px", borderRadius: 8, fontSize: 20, cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = C.text} onMouseOut={e => e.currentTarget.style.color = C.muted}>{dark ? "☀️" : "🌙"}</button>
      </div>
    </header>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // LOADING / LOGIN SCREENS
  const headerProps = { toggleLang, toggleDark, lang, dark };
  const renderScreen = () => {
    if (authLoading) return <div style={ms}><style>{css}</style><div style={{ paddingTop: 120 }}><div style={{ textAlign: "center", color: C.text }}>{t.loading}</div></div></div>;
    if (screen === "login") return <LoginPage dark={dark} css={css} C={C} t={t} signingIn={signingIn} signIn={signIn} />;
    if (screen === "subject") return <SubjectPage ms={ms} css={css} C={C} t={t} topics={topics} history={history} selectedSubject={selectedSubject} dataLoading={dataLoading} dataError={dataError} onClearError={() => setDataError(null)} onBack={() => goMain("home")} onOpenTopic={openTopic} onHome={() => goMain("home")} onTabNavigate={goMain} tab={tab} headerProps={headerProps} lang={lang} profile={profile} supabase={supabase} />;
    if (screen === "topic") return <TopicPage ms={ms} css={css} C={C} t={t} selectedTopic={selectedTopic} dataLoading={dataLoading} dataError={dataError} onClearError={() => setDataError(null)} onBack={() => openSubject(selectedSubject)} onHome={() => goMain("home")} onTabNavigate={goMain} tab={tab} headerProps={headerProps} lang={lang} search={search} setSearch={setSearch} mockMode={mockMode} setMockMode={setMockMode} quizzes={quizzes} filteredQuizzes={filteredQuizzes} diffClr={diffClr} onStartQuiz={startQuiz} history={history} unfinishedQuizId={loadQuizState()?.quizId} profile={profile} />;
    if (screen === "quiz") return <QuizPage ms={ms} css={css} C={C} t={t} dataLoading={dataLoading} dataError={dataError} onClearError={() => setDataError(null)} onBack={() => selectedTopic ? openTopic(selectedTopic) : goMain("home")} onHome={() => goMain("home")} headerProps={headerProps} questions={questions} currentQ={currentQ} answers={answers} lang={lang} mockMode={mockMode} showExp={showExp} selectAnswer={selectAnswer} clearAnswer={clearAnswer} nextQ={nextQ} skipQ={skipQ} setCurrentQ={setCurrentQ} setShowExp={setShowExp} toggleBM={toggleBM} isBM={isBM} selectedQuiz={selectedQuiz} selectedTopic={selectedTopic} timer={timer} fmt={fmt} />;
    if (screen === "result") return <ResultPage ms={ms} css={css} C={C} t={t} score={score} marksScored={marksScored} questions={questions} lang={lang} selectedQuiz={selectedQuiz} mockMode={mockMode} timeTaken={timeTaken} fmt={fmt} answers={answers} onRetry={() => startQuiz(selectedQuiz)} onMoreQuizzes={() => selectedTopic ? openTopic(selectedTopic) : goMain("home")} onAnalytics={() => { fetchHistory(); goMain("analytics"); }} onBack={() => selectedTopic ? openTopic(selectedTopic) : goMain("home")} onHome={() => goMain("home")} onTabNavigate={goMain} tab={tab} headerProps={headerProps} profile={profile} />;
    if (screen === "admin") return <AdminPage user={user} onBack={() => goMain("home")} t={t} C={C} STATIC_DATA={STATIC_DATA} />;
    if (screen === "revision") return <RevisionPage ms={ms} css={css} C={C} t={t} lang={lang} onBack={() => goMain("home")} onHome={() => goMain("home")} supabase={supabase} onTabNavigate={goMain} tab="revision" headerProps={headerProps} profile={profile} />;
    if (screen === "main") return <MainPage ms={ms} css={css} C={C} t={t} tab={tab} lang={lang} dark={dark} dataError={dataError} onClearError={() => setDataError(null)} onHome={() => goMain("home")} onTabNavigate={goMain} headerProps={headerProps} userAvatar={userAvatar} userPic={userPic} userName={userName} profile={profile} subjects={subjects} history={history} dataLoading={dataLoading} openSubject={openSubject} bookmarks={bookmarks} bmLoading={bmLoading} toggleBM={toggleBM} signOut={signOut} toggleDark={toggleDark} toggleLang={toggleLang} user={user} userEmail={userEmail} onAdmin={() => goAdmin()} onRevision={() => goRevision()} supabase={supabase} onStartQuiz={startQuiz} />;
    return null;
  };

  return (
    <>
      <Sprite />
      {renderScreen()}
    </>
  );
}
