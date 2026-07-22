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
const STATIC_DATA = { subjects: [], topics: {} };

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: { appName:"CGPSC EXAM by Daily Prep Notes",tagline:"Preparation Portal",prepareSmarter:"Structured Learning",scoreHigher:"Track your progress daily.",chooseSubject:"Select Subject",subjects:"Subjects",topics:"Topics",chooseTopic:"Select Topic",quizzes:"Assessments",questions:"Questions",startQuiz:"Start Test →",back:"← Back",home:"Home",analytics:"Analytics",bookmarks:"Saved",profile:"Profile",signInGoogle:"Continue with Google",signInMsg:"Sign in to access assessments and track performance.",mockMode:"Exam Mode",mockModeDesc:"Strict timer & no instant feedback.",previousYear:"Previous Year Only",allDifficulty:"All Levels",search:"Search assessments...",explanation:"EXPLANATION",nextQuestion:"Next Question →",finishQuiz:"Submit Test",retry:"Retake Test",moreQuizzes:"More Tests",excellent:"Excellent Performance!",goodJob:"Good Effort!",keepPracticing:"Needs Improvement",needStudy:"Review Required",score:"Score",accuracy:"Accuracy",correct:"Correct",wrong:"Incorrect",timeTaken:"Time Taken",yourRank:"Current Rank",savedQuestions:"Saved Questions",noBookmarks:"No saved questions",noBookmarksDesc:"Bookmark questions for revision",performanceOverview:"Performance Overview",subjectWise:"Subject Breakdown",deeperAnalysis:"Analytical Breakdown",strongAreas:"Strong Areas",weakAreas:"Areas to Improve",recentAttempts:"Recent Activity",quizHistory:"Test History",signOut:"Sign Out",darkMode:"Dark Mode",language:"Language",loading:"Loading...",quizOf:"of",question:"Question",answerReview:"Answer Key & Review",remove:"Remove",signingIn:"Authenticating...",noSubjects:"No subjects available",noSubjectsDesc:"Database requires subject entries",noTopics:"No topics available",noTopicsDesc:"Database requires topic entries for this subject",noQuizzes:"No tests available",noQuizzesDesc:"Database requires quiz entries for this topic",noQuestions:"No questions available",noQuestionsDesc:"Test contains no questions yet",noHistory:"No test history",noHistoryDesc:"Complete an assessment to view analytics",filterNoMatch:"No tests match the current filters" },
  hi: { appName:"CGPSC परीक्षा by Daily Prep Notes",tagline:"तैयारी पोर्टल",prepareSmarter:"व्यवस्थित अध्ययन",scoreHigher:"अपनी प्रगति ट्रैक करें।",chooseSubject:"विषय चुनें",subjects:"विषय",topics:"टॉपिक्स",chooseTopic:"टॉपिक चुनें",quizzes:"परीक्षण",questions:"प्रश्न",startQuiz:"टेस्ट शुरू करें →",back:"← वापस",home:"होम",analytics:"विश्लेषण",bookmarks:"सहेजे गए",profile:"प्रोफ़ाइल",signInGoogle:"Google से साइन इन करें",signInMsg:"परीक्षण और प्रगति के लिए साइन इन करें।",mockMode:"परीक्षा मोड",mockModeDesc:"कठोर टाइमर और कोई तुरंत फीडबैक नहीं।",previousYear:"केवल पिछले वर्ष",allDifficulty:"सभी स्तर",search:"परीक्षण खोजें...",explanation:"व्याख्या",nextQuestion:"अगला प्रश्न →",finishQuiz:"टेस्ट सबमिट करें",retry:"पुनः प्रयास करें",moreQuizzes:"अधिक टेस्ट",excellent:"उत्कृष्ट प्रदर्शन!",goodJob:"अच्छा प्रयास!",keepPracticing:"सुधार की आवश्यकता है",needStudy:"पुनरीक्षण आवश्यक है",score:"अंक",accuracy:"सटीकता",correct:"सही",wrong:"गलत",timeTaken:"लिया गया समय",yourRank:"आपकी रैंक",savedQuestions:"सहेजे गए प्रश्न",noBookmarks:"कोई प्रश्न सहेजा नहीं गया",noBookmarksDesc:"रिवीजन के लिए प्रश्न बुकमार्क करें",performanceOverview:"प्रदर्शन अवलोकन",subjectWise:"विषय-वार विश्लेषण",deeperAnalysis:"गहन विश्लेषण",strongAreas:"म मजबूत क्षेत्र",weakAreas:"सुधार वाले क्षेत्र",recentAttempts:"हाल की गतिविधि",quizHistory:"टेस्ट इतिहास",signOut:"साइन आउट",darkMode:"डार्क मोड",language:"भाषा",loading:"लोड हो रहा है...",quizOf:"में से",question:"प्रश्न",answerReview:"उत्तर कुंजी और समीक्षा",remove:"हटाएं",signingIn:"प्रमाणीकरण हो रहा है...",noSubjects:"कोई विषय उपलब्ध नहीं",noSubjectsDesc:"डेटाबेस में विषय प्रविष्टियों की आवश्यकता है",noTopics:"कोई टॉपिक उपलब्ध नहीं",noTopicsDesc:"इस विषय के लिए डेटाबेस में टॉपिक की आवश्यकता है",noQuizzes:"कोई टेस्ट उपलब्ध नहीं",noQuizzesDesc:"इस टॉपिक के लिए डेटाबेस में क्विज़ की आवश्यकता है",noQuestions:"कोई प्रश्न उपलब्ध नहीं",noQuestionsDesc:"टेस्ट में अभी कोई प्रश्न नहीं है",noHistory:"कोई टेस्ट इतिहास नहीं",noHistoryDesc:"विश्लेषण देखने के लिए परीक्षण पूरा करें",filterNoMatch:"वर्तमान फ़िल्टर से कोई टेस्ट मेल नहीं खाता" }
};

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


  const restorePathAfterAuth = async (path) => {
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
      if (["/analytics", "/bookmarks", "/profile"].includes(path)) {
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
        let p = data[0];
        
        // Backfill real name/email if they are placeholder from script
        const realName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0];
        const realEmail = currentUser?.email;
        if (realName && (p.full_name === "Aspirant" || !p.full_name || p.email === "" || !p.email)) {
          const updateData = {};
          if (p.full_name === "Aspirant" || !p.full_name) updateData.full_name = realName;
          if (p.email === "" || !p.email) updateData.email = realEmail || "";
          
          await supabase.from("profiles").eq("id", uid).update(updateData);
          p = { ...p, ...updateData };
        }
        
        setProfile(p);
        // Restore user preferences from DB
        if (p.preferred_lang) {
          setLang(p.preferred_lang);
          localStorage.setItem("cgpsc_lang", p.preferred_lang);
        }
        if (typeof p.dark_mode === "boolean") {
          setDark(p.dark_mode);
          localStorage.setItem("cgpsc_dark", String(p.dark_mode));
        }
      } else if (!error && (!data || data.length === 0)) {
        const newProfile = {
          id: uid,
          full_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || "Aspirant",
          email: currentUser?.email || "",
          avatar_url: currentUser?.user_metadata?.avatar_url || "",
          total_score: 0,
          total_attempts: 0,
          avg_accuracy: 0,
          best_streak: 0,
          current_streak: 0,
          preferred_lang: localStorage.getItem("cgpsc_lang") || "en",
          dark_mode: localStorage.getItem("cgpsc_dark") === "true" ? 1 : 0
        };
        await supabase.from("profiles").insert(newProfile);
        setProfile(newProfile);
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
    goTopic(topic);
    saveNav({ screen: "topic", topicId: topic.id });
    setDataLoading(true);
    setDataError(null);
    try {
      const { data, error } = await supabase.from("quizzes").select("*").eq("topic_id", topic.id).order("id");
      if (error) { setDataError("Could not load quizzes"); setDataLoading(false); return; }
      const formatted = (data || []).map(q => ({
        ...q, 
        title: formatText(q.title), 
        title_hi: formatText(q.title_hi || q.title), 
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
      setSelectedQuiz(saved.quiz);
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

      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${apiUrl}/api/quiz/${quiz.id}`, { headers });
      if (!res.ok) {
        console.error(`Quiz API error: ${res.status} ${res.statusText}`);
        throw new Error(`API returned ${res.status}`);
      }
      const publicData = await res.json();
      
      // Validate response has questions
      if (!publicData.questions || publicData.questions.length === 0) {
        console.warn(`Quiz ${quiz.id} has no questions`);
        throw new Error('No questions available for this quiz');
      }
      
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
        correct:     -1, // Hidden on client
        explanation: "", // Hidden on client
        explanation_hi: "" // Hidden on client
      }));
      
      // We must force mockMode to true because we don't have answers for Practice Mode
      const safeMockMode = true;
      setMockMode(true);
      
      setQuestions(formatted);
      saveQuizState({
        quizId: quiz.id, quiz, questions: formatted,
        currentQ: 0, answers: {}, timer: totalSecs, totalSecs,
        mockMode: true, startedAt: Date.now(),
        version: publicData.version
      });
      saveNav({ screen: "quiz", quizId: quiz.id });
    } catch (e) { 
      console.error("Failed to load quiz questions:", e);
      setDataError(`Could not load questions: ${e.message}. Please try again or check your connection.`);
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
      setDataError(e.message || "Failed to submit quiz.");
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
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', 'Noto Sans Devanagari', sans-serif; -webkit-font-smoothing: antialiased; }
    body { background-color: ${C.bg}; color: ${C.text}; transition: background-color 0.3s ease; }
    
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
    @keyframes spin { to { transform: rotate(360deg) } }
    @keyframes popIn { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(12px) } to { opacity: 1; transform: translateX(0) } }

    .btn-primary { background: ${C.acc}; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.12); }
    .btn-primary:active { transform: scale(0.97); }

    .btn-secondary { background: ${C.card}; color: ${C.text}; border: 1px solid ${C.border}; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: ${C.shadow}; }
    .btn-secondary:hover { background: ${C.inp}; border-color: ${C.muted}; transform: translateY(-1px); }
    .btn-secondary:active { transform: scale(0.97); }

    .card-h { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 16px; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; position: relative; overflow: hidden; box-shadow: ${C.shadow}; }
    .card-h:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,${dark ? 0.3 : 0.06}); border-color: ${C.muted}66; }
    .card-h:active { transform: scale(0.98); }

    .opt { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 14px 16px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); width: 100%; text-align: left; cursor: pointer; font-size: 14px; font-weight: 500; color: ${C.text}; box-shadow: ${C.shadow}; position: relative; }
    .opt:hover:not(:disabled) { border-color: ${C.acc}99; background: ${dark ? '#111' : '#fcfcfc'}; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,${dark ? 0.2 : 0.05}); }
    .opt:active:not(:disabled) { transform: scale(0.98); }
    .opt.selected { border-color: ${C.acc}; box-shadow: 0 0 0 1px ${C.acc}; background: ${dark ? 'rgba(51,136,255,0.08)' : 'rgba(0,85,255,0.03)'}; }

    .input-clean { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid ${C.border}; background: ${C.inp}; color: ${C.text}; font-size: 14px; outline: none; transition: all 0.2s ease; font-weight: 500; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); }
    .input-clean:focus { border-color: ${C.acc}; box-shadow: 0 0 0 3px ${C.acc}33; background: ${C.card}; }

    .bar { transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .glass { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); background: ${C.hdr}; border-bottom: 1px solid ${C.border}; }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.muted}; }
  `.replace(/\n/g, "");
  
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
        <button onClick={toggleLang} style={{ background: "transparent", border: "none", color: C.muted, padding: "8px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = C.text} onMouseOut={e => e.currentTarget.style.color = C.muted}>{lang === "en" ? "हिं" : "EN"}</button>
        <button onClick={toggleDark} style={{ background: "transparent", border: "none", color: C.muted, padding: "8px", borderRadius: 8, fontSize: 16, cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = C.text} onMouseOut={e => e.currentTarget.style.color = C.muted}>{dark ? "☀️" : "🌙"}</button>
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
    return <TopicPage ms={ms} css={css} C={C} t={t} selectedTopic={selectedTopic} dataLoading={dataLoading} dataError={dataError} onClearError={() => setDataError(null)} onBack={() => goSubject(selectedSubject)} onHome={onHome} onTabNavigate={onTabNavigate} tab={tab} headerProps={headerProps} lang={lang} search={search} setSearch={setSearch} mockMode={mockMode} setMockMode={setMockMode} quizzes={quizzes} filteredQuizzes={filteredQuizzes} diffClr={diffClr} onStartQuiz={startQuiz} history={history} unfinishedQuizId={loadQuizState()?.quizId} />;
  }

  if (screen === "quiz") {
    return <QuizPage ms={ms} css={css} C={C} t={t} dataLoading={dataLoading} dataError={dataError} onClearError={() => setDataError(null)} onBack={() => goTopic(selectedTopic)} onHome={onHome} headerProps={headerProps} questions={questions} currentQ={currentQ} answers={answers} lang={lang} mockMode={mockMode} showExp={showExp} selectAnswer={selectAnswer} clearAnswer={clearAnswer} nextQ={nextQ} skipQ={skipQ} setCurrentQ={setCurrentQ} setShowExp={setShowExp} toggleBM={toggleBM} isBM={isBM} selectedQuiz={selectedQuiz} />;
  }

  if (screen === "result") {
    return <ResultPage ms={ms} css={css} C={C} t={t} score={score} marksScored={marksScored} questions={questions} lang={lang} selectedQuiz={selectedQuiz} mockMode={mockMode} timeTaken={timeTaken} fmt={fmt} answers={answers} onRetry={() => startQuiz(selectedQuiz)} onMoreQuizzes={() => goTopic(selectedTopic)} onAnalytics={() => { fetchHistory(); goMain("analytics"); }} onBack={() => goTopic(selectedTopic)} onHome={onHome} onTabNavigate={onTabNavigate} tab={tab} headerProps={headerProps} />;
  }

  if (screen === "admin") {
    return <AdminPage user={user} onBack={() => goMain("home")} t={t} C={C} STATIC_DATA={STATIC_DATA} />;
  }

  if (screen === "revision") {
    return <RevisionPage ms={ms} css={css} C={C} t={t} lang={lang} onBack={() => goMain("home")} onHome={onHome} supabase={supabase} />;
  }

  if (screen === "main") {
    return <MainPage ms={ms} css={css} C={C} t={t} tab={tab} lang={lang} dark={dark} dataError={dataError} onClearError={() => setDataError(null)} onHome={onHome} onTabNavigate={onTabNavigate} headerProps={headerProps} userAvatar={userAvatar} userPic={userPic} userName={userName} profile={profile} subjects={subjects} history={history} dataLoading={dataLoading} openSubject={openSubject} bookmarks={bookmarks} bmLoading={bmLoading} toggleBM={toggleBM} signOut={signOut} toggleDark={toggleDark} toggleLang={toggleLang} user={user} userEmail={userEmail} onAdmin={() => goAdmin()} onRevision={() => goRevision()} supabase={supabase} onStartQuiz={startQuiz} />;
  }
  return null;
}