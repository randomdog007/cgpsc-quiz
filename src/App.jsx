import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: { appName:"CGPSC EXAM",tagline:"Quiz Platform",prepareSmarter:"Prepare Smarter.",scoreHigher:"Score Higher.",chooseSubject:"Choose a Subject",subjects:"Subjects",quizzes:"Quizzes",questions:"Questions",startQuiz:"Start →",back:"← Back",home:"Home",analytics:"Analytics",leaderboard:"Leaderboard",bookmarks:"Bookmarks",profile:"Profile",signInGoogle:"Continue with Google",signInMsg:"Sign in to track your progress",mockMode:"Mock Test Mode",mockModeDesc:"No instant feedback — results shown at end.",previousYear:"Previous Year",allDifficulty:"All Levels",search:"Search quizzes...",explanation:"EXPLANATION",nextQuestion:"Next Question →",finishQuiz:"Finish Quiz 🏁",retry:"🔄 Retry",moreQuizzes:"📚 More Quizzes",excellent:"Excellent!",goodJob:"Good Job!",keepPracticing:"Keep Practicing!",needStudy:"Need More Study",score:"Score",accuracy:"Accuracy",correct:"Correct",wrong:"Wrong",timeTaken:"Time Taken",yourRank:"Your Rank",savedQuestions:"Saved Questions",noBookmarks:"No bookmarks yet",noBookmarksDesc:"Tap 🔖 on any question to save it",performanceOverview:"Performance Overview",subjectWise:"Subject-wise Accuracy",recentAttempts:"Recent Attempts",quizHistory:"Quiz History",signOut:"Sign Out",darkMode:"Dark Mode",language:"Language",loading:"Loading...",quizOf:"of",question:"Question",answerReview:"Answer Review",remove:"Remove",signingIn:"Signing you in...",noSubjects:"No subjects found",noSubjectsDesc:"Add subjects in your Supabase table editor",noQuizzes:"No quizzes found",noQuizzesDesc:"Add quizzes in Supabase with subject_id =",noQuestions:"No questions found",noQuestionsDesc:"Add questions in Supabase with quiz_id =",noHistory:"No quiz attempts yet",noHistoryDesc:"Complete a quiz to see your history here",filterNoMatch:"No quizzes match your filters" },
  hi: { appName:"CGPSC परीक्षा",tagline:"क्विज़ प्लेटफ़ॉर्म",prepareSmarter:"स्मार्ट तरीके से पढ़ें।",scoreHigher:"बेहतर अंक पाएं।",chooseSubject:"विषय चुनें",subjects:"विषय",quizzes:"क्विज़",questions:"प्रश्न",startQuiz:"शुरू करें →",back:"← वापस",home:"होम",analytics:"विश्लेषण",leaderboard:"लीडरबोर्ड",bookmarks:"बुकमार्क",profile:"प्रोफ़ाइल",signInGoogle:"Google से जारी रखें",signInMsg:"प्रगति ट्रैक करने के लिए साइन इन करें",mockMode:"मॉक टेस्ट मोड",mockModeDesc:"तुरंत फीडबैक नहीं — अंत में परिणाम।",previousYear:"पिछले वर्ष",allDifficulty:"सभी स्तर",search:"क्विज़ खोजें...",explanation:"व्याख्या",nextQuestion:"अगला प्रश्न →",finishQuiz:"क्विज़ समाप्त करें 🏁",retry:"🔄 दोबारा",moreQuizzes:"📚 और क्विज़",excellent:"शानदार!",goodJob:"बढ़िया!",keepPracticing:"अभ्यास जारी रखें!",needStudy:"और पढ़ाई जरूरी है",score:"अंक",accuracy:"सटीकता",correct:"सही",wrong:"गलत",timeTaken:"समय",yourRank:"आपकी रैंक",savedQuestions:"सहेजे गए प्रश्न",noBookmarks:"अभी कोई बुकमार्क नहीं",noBookmarksDesc:"किसी भी प्रश्न पर 🔖 दबाएं",performanceOverview:"प्रदर्शन अवलोकन",subjectWise:"विषय-वार सटीकता",recentAttempts:"हाल के प्रयास",quizHistory:"क्विज़ इतिहास",signOut:"साइन आउट",darkMode:"डार्क मोड",language:"भाषा",loading:"लोड हो रहा है...",quizOf:"में से",question:"प्रश्न",answerReview:"उत्तर समीक्षा",remove:"हटाएं",signingIn:"साइन इन हो रहा है...",noSubjects:"कोई विषय नहीं मिला",noSubjectsDesc:"Supabase टेबल एडिटर में विषय जोड़ें",noQuizzes:"कोई क्विज़ नहीं मिली",noQuizzesDesc:"Supabase में subject_id = के साथ क्विज़ जोड़ें",noQuestions:"कोई प्रश्न नहीं मिला",noQuestionsDesc:"Supabase में quiz_id = के साथ प्रश्न जोड़ें",noHistory:"अभी कोई प्रयास नहीं",noHistoryDesc:"क्विज़ पूरी करने के बाद यहाँ दिखेगा",filterNoMatch:"फ़िल्टर से कोई क्विज़ नहीं मिली" }
};

export default function App() {
  const [lang, setLang]           = useState("en");
  const [dark, setDark]           = useState(true);

  // ── AUTH ────────────────────────────────────────────────────────────────────
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  // ── NAVIGATION ──────────────────────────────────────────────────────────────
  const [screen, setScreen]       = useState("login");
  const [tab, setTab]             = useState("home");

  // ── SUPABASE DATA ───────────────────────────────────────────────────────────
  const [subjects, setSubjects]   = useState([]);
  const [quizzes, setQuizzes]     = useState([]);
  const [questions, setQuestions] = useState([]);
  const [history, setHistory]     = useState([]);   // user's past attempts
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // ── QUIZ STATE ──────────────────────────────────────────────────────────────
  const [selectedSubject, setSelectedSubject] = useState(null);
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

  // ── THEME COLORS ────────────────────────────────────────────────────────────
  const C = dark
    ? { bg:"#0f0e17", card:"#16213e", border:"#2a2a4e", text:"#fffffe", muted:"#888", hdr:"#1a0a00", acc:"#e85d04", acc2:"#ffd166", ok:"#1b7a4b", err:"#9b2226", inp:"#1a1a2e" }
    : { bg:"#f5f5f0", card:"#ffffff", border:"#e0e0e0", text:"#1a1a1a", muted:"#666",  hdr:"#fff8f0", acc:"#e85d04", acc2:"#d4a017", ok:"#1b7a4b", err:"#9b2226", inp:"#f0f0f0" };

  // ════════════════════════════════════════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); setScreen("main"); }
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); setScreen("main"); setTab("home"); }
      else { setUser(null); setScreen("login"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) { alert("Sign in failed: " + error.message); setSigningIn(false); }
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const userName  = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const userAvatar = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const userEmail = user?.email || "";
  const userPic   = user?.user_metadata?.avatar_url || null;

  // ════════════════════════════════════════════════════════════════════════════
  // SUPABASE FETCHES
  // ════════════════════════════════════════════════════════════════════════════

  // Fetch subjects when main screen loads
  useEffect(() => {
    if (screen === "main") fetchSubjects();
  }, [screen]);

  const fetchSubjects = async () => {
    setDataLoading(true);
    setDataError(null);
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("id");
    if (error) setDataError("Could not load subjects: " + error.message);
    else setSubjects(data || []);
    setDataLoading(false);
  };

  // Fetch quizzes when subject is opened
  const openSubject = async (subject) => {
    setSelectedSubject(subject);
    setSearch("");
    setDiff("All");
    setPrevYear(false);
    setScreen("subject");
    setDataLoading(true);
    setDataError(null);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("subject_id", subject.id)
      .order("id");
    if (error) setDataError("Could not load quizzes: " + error.message);
    else setQuizzes(data || []);
    setDataLoading(false);
  };

  // Fetch questions when quiz starts
  const startQuiz = async (quiz) => {
    setDataLoading(true);
    setDataError(null);
    setScreen("quiz"); // go to quiz screen immediately (shows spinner)
    setSelectedQuiz(quiz);
    setCurrentQ(0);
    setAnswers({});
    setShowExp(false);
    setTimer(1200);
    setScore(0);

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("id")
      .limit(20);

    if (error) {
      setDataError("Could not load questions: " + error.message);
      setDataLoading(false);
      return;
    }

    // Map Supabase columns → app format
    const formatted = (data || []).map(q => ({
      id:          q.id,
      question:    q.question,
      question_hi: q.question_hi || q.question,
      options:     [q.option_a, q.option_b, q.option_c, q.option_d],
      options_hi:  [q.option_a_hi || q.option_a, q.option_b_hi || q.option_b, q.option_c_hi || q.option_c, q.option_d_hi || q.option_d],
      correct:     q.correct_option,   // 0, 1, 2 or 3
      explanation:    q.explanation    || "",
      explanation_hi: q.explanation_hi || q.explanation || "",
    }));

    setQuestions(formatted);
    setDataLoading(false);
  };

  // Fetch this user's quiz history
  const fetchHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("quiz_attempts")          // see SQL below to create this table
      .select("*, quizzes(title), subjects(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error) setHistory(data || []);
  };

  // Save attempt after quiz finishes
  const saveAttempt = async (quizId, scoreVal, totalVal, timeSecs) => {
    if (!user) return;
    await supabase.from("quiz_attempts").insert({
      user_id:    user.id,
      quiz_id:    quizId,
      score:      scoreVal,
      total:      totalVal,
      time_taken: timeSecs,
      accuracy:   Math.round((scoreVal / totalVal) * 100),
    });
  };

  // ════════════════════════════════════════════════════════════════════════════
  // TIMER
  // ════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (screen === "quiz" && !dataLoading) {
      timerRef.current = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, dataLoading]);

  // ════════════════════════════════════════════════════════════════════════════
  // QUIZ LOGIC
  // ════════════════════════════════════════════════════════════════════════════
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
      const taken   = 1200 - timer;
      setScore(correct);
      setTimeTaken(taken);
      saveAttempt(selectedQuiz.id, correct, questions.length, taken);
      fetchHistory();
      setScreen("result");
    }
  };

  const toggleBM  = (q)  => setBookmarks(prev => prev.find(b => b.id === q.id) ? prev.filter(b => b.id !== q.id) : [...prev, q]);
  const isBM      = (q)  => q && bookmarks.some(b => b.id === q.id);
  const fmt       = (s)  => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const diffClr   = (d)  => d === "Easy" ? C.ok : d === "Medium" ? C.acc : C.err;

  const filteredQuizzes = quizzes.filter(q =>
    (diff === "All" || q.difficulty === diff) &&
    (!prevYear || q.is_previous_year) &&
    (q.title?.toLowerCase().includes(search.toLowerCase()) || q.title_hi?.includes(search))
  );

  // ════════════════════════════════════════════════════════════════════════════
  // REUSABLE UI PIECES
  // ════════════════════════════════════════════════════════════════════════════
  const css = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}.card-h{transition:transform 0.2s;cursor:pointer;}.card-h:hover{transform:translateY(-3px);}.opt{transition:all 0.15s;width:100%;border:none;text-align:left;cursor:pointer;}.opt:hover:not(:disabled){transform:translateX(4px);filter:brightness(1.1);}.bar{transition:width 1.2s cubic-bezier(0.4,0,0.2,1);}`;
  const ms  = { minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Noto Sans',sans-serif", paddingBottom:80 };

  const Av = ({ ini, size=36, color=C.acc, pic=null }) => (
    pic
      ? <img src={pic} alt="av" style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${color}`,objectFit:"cover",flexShrink:0}}/>
      : <div style={{width:size,height:size,borderRadius:"50%",background:`${color}33`,border:`2px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.35,color,flexShrink:0}}>{ini}</div>
  );

  const Spinner = ({ text }) => (
    <div style={{textAlign:"center",padding:60}}>
      <div style={{width:40,height:40,border:`4px solid ${C.border}`,borderTop:`4px solid ${C.acc}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
      <p style={{color:C.muted,fontSize:14}}>{text || t.loading}</p>
    </div>
  );

  const Empty = ({ emoji, title, desc }) => (
    <div style={{textAlign:"center",padding:52}}>
      <div style={{fontSize:48,marginBottom:14}}>{emoji}</div>
      <div style={{fontWeight:600,color:C.text,marginBottom:6,fontSize:16}}>{title}</div>
      <div style={{color:C.muted,fontSize:13}}>{desc}</div>
    </div>
  );

  const ErrorBanner = ({ msg }) => msg ? (
    <div style={{background:`${C.err}22`,border:`1px solid ${C.err}`,borderRadius:10,padding:"12px 16px",margin:"0 16px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{color:"#ff6b6b",fontSize:13}}>⚠️ {msg}</span>
      <button onClick={()=>setDataError(null)} style={{background:"none",border:"none",color:"#ff6b6b",cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
    </div>
  ) : null;

  const Nav = () => (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:C.hdr,borderTop:`2px solid ${C.acc}44`,display:"flex",justifyContent:"space-around",padding:"8px 0",boxShadow:"0 -4px 20px rgba(0,0,0,0.25)"}}>
      {[["home","🏠",t.home],["analytics","📊",t.analytics],["leaderboard","🏆",t.leaderboard],["bookmarks","🔖",t.bookmarks],["profile","👤",t.profile]].map(([id,icon,label])=>(
        <button key={id} onClick={()=>{setTab(id);setScreen("main");}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,opacity:tab===id?1:0.5,transform:tab===id?"scale(1.1)":"scale(1)",transition:"all 0.2s"}}>
          <span style={{fontSize:20}}>{icon}</span>
          <span style={{fontSize:9,color:tab===id?C.acc:C.muted,fontWeight:tab===id?700:400}}>{label}</span>
        </button>
      ))}
    </div>
  );

  const Hdr = ({ back, onBack }) => (
    <header style={{background:`linear-gradient(135deg,${C.hdr},${dark?"#2d1200":"#fff3e8"})`,borderBottom:`2px solid ${C.acc}`,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:100,boxShadow:`0 4px 20px ${C.acc}22`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {back
          ? <button onClick={onBack} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 12px",borderRadius:6,fontSize:13,cursor:"pointer"}}>{t.back}</button>
          : <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>{setScreen("main");setTab("home");}}>
              <span style={{fontSize:24}}>🎯</span>
              <div><div style={{fontWeight:700,fontSize:15,color:C.acc2}}>{t.appName}</div><div style={{fontSize:9,color:C.muted,letterSpacing:2}}>{t.tagline}</div></div>
            </div>}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {screen==="quiz" && !dataLoading && (
          <div style={{background:timer<120?`${C.err}22`:`${C.acc}22`,border:`2px solid ${timer<120?"#ff4d4d":C.acc}`,borderRadius:8,padding:"4px 12px",fontWeight:700,fontSize:17,color:timer<120?"#ff4d4d":C.acc2}}>⏱ {fmt(timer)}</div>
        )}
        <button onClick={()=>setLang(l=>l==="en"?"hi":"en")} style={{background:`${C.acc}22`,border:`1px solid ${C.acc}44`,color:C.acc,padding:"4px 10px",borderRadius:6,fontSize:11,cursor:"pointer",fontWeight:700}}>{lang==="en"?"हिं":"EN"}</button>
        <button onClick={()=>setDark(d=>!d)} style={{background:C.inp,border:`1px solid ${C.border}`,color:C.text,padding:"4px 10px",borderRadius:6,fontSize:13,cursor:"pointer"}}>{dark?"☀️":"🌙"}</button>
      </div>
    </header>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // LOADING SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  if (authLoading) return (
    <div style={{minHeight:"100vh",background:"#0f0e17",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{fontSize:48,marginBottom:16}}>🎯</span>
      <div style={{width:40,height:40,border:"4px solid #2a2a4e",borderTop:"4px solid #e85d04",borderRadius:"50%",animation:"spin 0.8s linear infinite",marginBottom:12}}/>
      <p style={{color:"#888",fontSize:14}}>Loading CGPSC Quiz...</p>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  if (screen === "login") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Noto Sans',sans-serif"}}>
      <style>{css}</style>
      <div style={{maxWidth:380,width:"100%",textAlign:"center",animation:"fadeUp 0.5s ease"}}>
        <div style={{fontSize:60,marginBottom:12}}>🎯</div>
        <h1 style={{fontSize:30,fontWeight:700,background:`linear-gradient(135deg,${C.acc2},${C.acc})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6}}>{t.appName}</h1>
        <p style={{color:C.muted,fontSize:13,marginBottom:6}}>CHHATTISGARH PUBLIC SERVICE COMMISSION</p>
        <p style={{color:C.muted,fontSize:13,marginBottom:36}}>{t.signInMsg}</p>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,boxShadow:`0 8px 40px ${C.acc}11`}}>
          {signingIn
            ? <div style={{textAlign:"center",padding:"12px 0"}}>
                <div style={{width:36,height:36,border:"3px solid #e0e0e0",borderTop:`3px solid ${C.acc}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
                <p style={{color:C.muted,fontSize:14}}>{t.signingIn}</p>
              </div>
            : <button onClick={signIn} style={{width:"100%",background:"#fff",border:"1px solid #ddd",borderRadius:10,padding:"14px 20px",fontSize:15,fontWeight:600,cursor:"pointer",color:"#333",display:"flex",alignItems:"center",justifyContent:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {t.signInGoogle}
              </button>
          }
          <p style={{color:C.muted,fontSize:11,marginTop:16}}>Free forever · No credit card needed</p>
        </div>
        <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:20}}>
          <button onClick={()=>setDark(d=>!d)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>{dark?"☀️ Light":"🌙 Dark"}</button>
          <button onClick={()=>setLang(l=>l==="en"?"hi":"en")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>🌐 {lang==="en"?"हिंदी":"English"}</button>
        </div>
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
      <div style={{padding:16,animation:"fadeUp 0.4s ease"}}>

        {/* Subject banner */}
        <div style={{background:`linear-gradient(135deg,${selectedSubject?.color||C.acc}22,${C.card})`,border:`1px solid ${selectedSubject?.color||C.acc}55`,borderRadius:14,padding:18,marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:42}}>{selectedSubject?.icon||"📚"}</span>
          <div>
            <div style={{fontSize:10,color:selectedSubject?.color||C.acc,letterSpacing:3,fontWeight:600}}>SUBJECT</div>
            <div style={{fontWeight:700,fontSize:20,color:C.text}}>{lang==="hi"&&selectedSubject?.name_hi ? selectedSubject.name_hi : selectedSubject?.name}</div>
            <div style={{color:C.muted,fontSize:13}}>{lang==="hi"&&selectedSubject?.description_hi ? selectedSubject.description_hi : selectedSubject?.description}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search}
            style={{flex:1,minWidth:140,background:C.inp,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,outline:"none"}}/>
          {["All","Easy","Medium","Hard"].map(d=>(
            <button key={d} onClick={()=>setDiff(d)} style={{background:diff===d?selectedSubject?.color||C.acc:C.inp,border:`1px solid ${diff===d?selectedSubject?.color||C.acc:C.border}`,color:diff===d?"#fff":C.muted,borderRadius:8,padding:"7px 11px",fontSize:12,cursor:"pointer",fontWeight:diff===d?700:400}}>
              {d==="All"?t.allDifficulty:d}
            </button>
          ))}
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,cursor:"pointer"}}>
          <input type="checkbox" checked={prevYear} onChange={e=>setPrevYear(e.target.checked)}/>
          <span style={{fontSize:13,color:C.muted}}>📅 {t.previousYear} only</span>
        </label>

        {/* Mock mode toggle */}
        <div style={{background:`${C.acc}11`,border:`1px solid ${C.acc}33`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:600,fontSize:14,color:C.text}}>🎭 {t.mockMode}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{t.mockModeDesc}</div>
          </div>
          <div onClick={()=>setMockMode(m=>!m)} style={{width:44,height:24,borderRadius:12,background:mockMode?C.acc:C.border,cursor:"pointer",position:"relative",transition:"background 0.3s",flexShrink:0}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:mockMode?23:3,transition:"left 0.3s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
          </div>
        </div>

        {/* Quiz list */}
        {dataLoading
          ? <Spinner/>
          : quizzes.length === 0
            ? <Empty emoji="📭" title={t.noQuizzes} desc={`${t.noQuizzesDesc} ${selectedSubject?.id}`}/>
            : filteredQuizzes.length === 0
              ? <Empty emoji="🔍" title={t.filterNoMatch} desc="Try changing the filters above"/>
              : filteredQuizzes.map((quiz, idx) => (
                  <div key={quiz.id} className="card-h" onClick={()=>startQuiz(quiz)}
                    style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>
                        <div style={{width:38,height:38,borderRadius:10,background:`${selectedSubject?.color||C.acc}22`,border:`2px solid ${selectedSubject?.color||C.acc}66`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:selectedSubject?.color||C.acc,fontSize:15,flexShrink:0}}>{idx+1}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:14,color:C.text}}>{lang==="hi"&&quiz.title_hi ? quiz.title_hi : quiz.title}</div>
                          <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,color:C.muted}}>📝 {quiz.total_questions||20} Qs</span>
                            <span style={{fontSize:11,color:C.muted}}>⏱ 20 min</span>
                            <span style={{fontSize:11,color:diffClr(quiz.difficulty),background:`${diffClr(quiz.difficulty)}22`,padding:"1px 7px",borderRadius:10,fontWeight:600}}>{quiz.difficulty||"Medium"}</span>
                            {quiz.is_previous_year && <span style={{fontSize:11,color:"#0077b6",background:"#0077b611",padding:"1px 7px",borderRadius:10,fontWeight:600}}>📅 PYQ</span>}
                            {mockMode && <span style={{fontSize:11,color:"#6b2d8b",background:"#6b2d8b11",padding:"1px 7px",borderRadius:10,fontWeight:600}}>🎭 Mock</span>}
                          </div>
                        </div>
                      </div>
                      <button style={{background:selectedSubject?.color||C.acc,color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0}}>{t.startQuiz}</button>
                    </div>
                  </div>
                ))
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
        <Hdr back onBack={()=>setScreen("subject")}/>
        <ErrorBanner msg={dataError}/>

        {dataLoading
          ? <Spinner text="Loading questions..."/>
          : questions.length === 0
            ? <Empty emoji="📭" title={t.noQuestions} desc={`${t.noQuestionsDesc} ${selectedQuiz?.id}`}/>
            : (
              <div style={{padding:16}}>
                {/* Progress */}
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:13,color:C.muted}}>{t.question} <span style={{color:C.acc2,fontWeight:700}}>{currentQ+1}</span> {t.quizOf} {questions.length}</span>
                  <span style={{fontSize:13,color:C.muted}}>✅ {Object.keys(answers).filter(k=>answers[k]===questions[k]?.correct).length} {t.correct}</span>
                </div>
                <div style={{height:5,background:C.border,borderRadius:3,marginBottom:16,overflow:"hidden"}}>
                  <div style={{width:`${((currentQ+1)/questions.length)*100}%`,height:"100%",background:`linear-gradient(90deg,${C.acc},${C.acc2})`,borderRadius:3,transition:"width 0.3s"}}/>
                </div>

                {/* Question card */}
                <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:14,animation:"fadeUp 0.3s ease"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontSize:11,color:C.acc,fontWeight:700}}>Q{currentQ+1}</span>
                    <button onClick={()=>q&&toggleBM(q)} style={{background:isBM(q)?`${C.acc2}22`:"none",border:`1px solid ${isBM(q)?C.acc2:C.border}`,borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:13,color:isBM(q)?C.acc2:C.muted}}>
                      🔖 {isBM(q)?"Saved":"Save"}
                    </button>
                  </div>
                  <p style={{fontSize:16,lineHeight:1.65,color:C.text,fontWeight:500}}>{qTxt}</p>
                </div>

                {/* Options */}
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                  {opts?.map((opt, idx) => {
                    const isSel=answers[currentQ]===idx, isOk=q?.correct===idx;
                    let bg=C.card, border=C.border, tc=C.text;
                    if (answered && !mockMode) {
                      if (isOk)      { bg=`${C.ok}22`;  border=C.ok;  tc="#4caf50"; }
                      else if (isSel){ bg=`${C.err}22`; border=C.err; tc="#ff6b6b"; }
                    } else if (isSel && mockMode) { bg=`${C.acc}22`; border=C.acc; tc=C.acc; }
                    return (
                      <button key={idx} onClick={()=>selectAnswer(idx)} disabled={answered} className="opt"
                        style={{background:bg,border:`2px solid ${border}`,borderRadius:10,padding:"13px 15px",color:tc,fontSize:14,display:"flex",alignItems:"center",gap:12}}>
                        <span style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:answered&&!mockMode&&isOk?C.ok:answered&&!mockMode&&isSel?C.err:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#fff"}}>
                          {answered&&!mockMode&&isOk?"✓":answered&&!mockMode&&isSel?"✗":["A","B","C","D"][idx]}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExp && !mockMode && (
                  <div style={{background:dark?"#0d2818":"#f0fff4",border:`1px solid ${C.ok}44`,borderRadius:10,padding:14,marginBottom:12,animation:"fadeUp 0.3s ease"}}>
                    <div style={{fontSize:11,color:C.ok,fontWeight:700,marginBottom:5}}>💡 {t.explanation}</div>
                    <p style={{color:C.muted,fontSize:13,lineHeight:1.6}}>{lang==="hi"&&q?.explanation_hi ? q.explanation_hi : q?.explanation}</p>
                  </div>
                )}

                {answered && (
                  <button onClick={nextQ} style={{width:"100%",background:`linear-gradient(135deg,${C.acc},${C.acc2})`,border:"none",borderRadius:10,padding:15,color:dark?"#0f0e17":"#fff",fontWeight:700,fontSize:16,cursor:"pointer"}}>
                    {currentQ<questions.length-1 ? t.nextQuestion : t.finishQuiz}
                  </button>
                )}

                {/* Dot navigator */}
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:14,justifyContent:"center"}}>
                  {questions.map((_,i)=>(
                    <div key={i} onClick={()=>{if(i<=currentQ){setCurrentQ(i);setShowExp(!mockMode&&answers[i]!==undefined);}}}
                      style={{width:26,height:26,borderRadius:5,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:"#fff",border:i===currentQ?`2px solid ${C.acc2}`:"2px solid transparent",background:answers[i]===undefined?(i===currentQ?C.acc:C.border):mockMode?C.acc:answers[i]===questions[i]?.correct?C.ok:C.err}}>
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
        <Hdr back onBack={()=>setScreen("subject")}/>
        <div style={{padding:20,textAlign:"center",animation:"fadeUp 0.4s ease"}}>
          <div style={{fontSize:68,marginBottom:8}}>{pct>=80?"🏆":pct>=60?"🥈":pct>=40?"🥉":"📚"}</div>
          <h2 style={{fontSize:26,fontWeight:700,background:`linear-gradient(135deg,${C.acc2},${C.acc})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6}}>{lbl}</h2>
          <p style={{color:C.muted,fontSize:13,marginBottom:6}}>{lang==="hi"&&selectedQuiz?.title_hi ? selectedQuiz.title_hi : selectedQuiz?.title}</p>
          {mockMode && <span style={{fontSize:12,background:"#6b2d8b22",color:"#6b2d8b",padding:"3px 10px",borderRadius:10,fontWeight:600}}>🎭 Mock Test</span>}

          {/* Score circle */}
          <div style={{margin:"20px auto",width:110,height:110,borderRadius:"50%",background:`conic-gradient(${C.acc} ${pct*3.6}deg,${C.border} 0deg)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 28px ${C.acc}44`}}>
            <div style={{width:88,height:88,borderRadius:"50%",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:24,fontWeight:700,color:C.acc2}}>{pct}%</div>
              <div style={{fontSize:10,color:C.muted}}>{t.accuracy}</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,maxWidth:340,margin:"0 auto 20px"}}>
            {[[t.score,`${score}/${questions.length}`,C.acc2],[t.correct,score,C.ok],[t.wrong,questions.length-score,C.err],[t.timeTaken,fmt(timeTaken),"#0077b6"]].map(([lb,vl,cl])=>(
              <div key={lb} style={{background:C.card,border:`1px solid ${cl}44`,borderRadius:12,padding:14}}>
                <div style={{fontSize:22,fontWeight:700,color:cl}}>{vl}</div>
                <div style={{fontSize:11,color:C.muted}}>{lb}</div>
              </div>
            ))}
          </div>

          {/* Mock mode answer review */}
          {mockMode && (
            <div style={{textAlign:"left",marginBottom:20}}>
              <h3 style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:10}}>📋 {t.answerReview}</h3>
              {questions.map((q,i)=>{
                const ok=answers[i]===q.correct;
                return (
                  <div key={i} style={{background:C.card,border:`1px solid ${ok?C.ok:C.err}44`,borderRadius:10,padding:12,marginBottom:8}}>
                    <div style={{display:"flex",gap:8,marginBottom:6}}>
                      <span style={{color:ok?C.ok:C.err,fontWeight:700}}>{ok?"✓":"✗"}</span>
                      <p style={{fontSize:13,color:C.text,flex:1}}>{lang==="hi"&&q.question_hi?q.question_hi:q.question}</p>
                    </div>
                    <div style={{fontSize:12,color:C.ok}}>✅ {lang==="hi"&&q.options_hi?q.options_hi[q.correct]:q.options[q.correct]}</div>
                    {!ok && <div style={{fontSize:12,color:C.err,marginTop:2}}>❌ {lang==="hi"&&q.options_hi?q.options_hi[answers[i]]||"—":q.options[answers[i]]||"—"}</div>}
                    {q.explanation && <div style={{fontSize:12,color:C.muted,marginTop:4,fontStyle:"italic"}}>💡 {lang==="hi"&&q.explanation_hi?q.explanation_hi:q.explanation}</div>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>startQuiz(selectedQuiz)} style={{background:`linear-gradient(135deg,${C.acc},${C.acc2})`,border:"none",borderRadius:10,padding:"13px 22px",color:dark?"#0f0e17":"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>{t.retry}</button>
            <button onClick={()=>setScreen("subject")} style={{background:"none",border:`2px solid ${C.acc}`,borderRadius:10,padding:"13px 22px",color:C.acc,fontWeight:700,fontSize:14,cursor:"pointer"}}>{t.moreQuizzes}</button>
            <button onClick={()=>{setTab("analytics");setScreen("main");fetchHistory();}} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 22px",color:C.muted,fontWeight:600,fontSize:14,cursor:"pointer"}}>📊 Analytics</button>
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
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <div style={{padding:"16px 16px 8px",background:`linear-gradient(180deg,${dark?"#1a0a00":"#fff3e8"},transparent)`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <Av ini={userAvatar} size={44} pic={userPic}/>
            <div><div style={{fontSize:12,color:C.muted}}>Namaste 👋</div><div style={{fontWeight:700,fontSize:17,color:C.text}}>{userName}</div></div>
          </div>
          <div style={{background:`linear-gradient(135deg,${C.acc},${C.acc2})`,borderRadius:14,padding:"14px 18px"}}>
            <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>{t.prepareSmarter}</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.85)"}}>{t.scoreHigher}</div>
          </div>
        </div>
        <div style={{padding:"0 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,margin:"14px 0"}}>
            {[[subjects.length||"—",t.subjects],["—",t.quizzes],["—",t.questions]].map(([n,l])=>(
              <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:700,color:C.acc2}}>{n}</div>
                <div style={{fontSize:11,color:C.muted}}>{l}</div>
              </div>
            ))}
          </div>
          <h2 style={{fontSize:15,fontWeight:700,color:C.acc2,marginBottom:12}}>📚 {t.chooseSubject}</h2>
          {dataLoading
            ? <Spinner/>
            : subjects.length===0
              ? <Empty emoji="📭" title={t.noSubjects} desc={t.noSubjectsDesc}/>
              : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:20}}>
                  {subjects.map(sub=>(
                    <div key={sub.id} className="card-h" onClick={()=>openSubject(sub)}
                      style={{background:C.card,border:`1px solid ${sub.color||C.acc}44`,borderRadius:12,padding:14,boxShadow:`0 4px 14px ${sub.color||C.acc}18`}}>
                      <div style={{fontSize:30,marginBottom:8,background:`${sub.color||C.acc}22`,borderRadius:8,padding:"5px 8px",display:"inline-block"}}>{sub.icon||"📚"}</div>
                      <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:3}}>{lang==="hi"&&sub.name_hi ? sub.name_hi : sub.name}</div>
                      <div style={{fontSize:11,color:C.muted}}>{lang==="hi"&&sub.description_hi ? sub.description_hi : sub.description}</div>
                      <div style={{marginTop:6,fontSize:11,color:sub.color||C.acc,fontWeight:600}}>{sub.quiz_count||"?"} {t.quizzes} →</div>
                    </div>
                  ))}
                </div>
          }

          {/* Recent attempts from Supabase */}
          <h2 style={{fontSize:15,fontWeight:700,color:C.acc2,marginBottom:10}}>🕐 {t.recentAttempts}</h2>
          {history.length===0
            ? <Empty emoji="📝" title={t.noHistory} desc={t.noHistoryDesc}/>
            : history.slice(0,5).map((h,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:C.text}}>{h.quizzes?.title||"Quiz"}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{h.subjects?.name||""} · {new Date(h.created_at).toLocaleDateString("en-IN")}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700,color:h.accuracy>=70?C.ok:C.err,fontSize:15}}>{h.accuracy}%</div>
                  <div style={{fontSize:11,color:C.muted}}>{h.score}/{h.total}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );

    const AnalyticsTab = () => (
      <div style={{padding:16,animation:"fadeUp 0.4s ease"}}>
        <h2 style={{fontSize:17,fontWeight:700,color:C.acc2,marginBottom:14}}>📊 {t.performanceOverview}</h2>
        {history.length===0
          ? <Empty emoji="📊" title={t.noHistory} desc={t.noHistoryDesc}/>
          : <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
                {[
                  ["🎯", `${Math.round(history.reduce((a,h)=>a+h.accuracy,0)/history.length)}%`, "Avg Accuracy", C.acc],
                  ["📝", history.length, "Quizzes Done", C.acc2],
                  ["🏆", `${Math.max(...history.map(h=>h.score))}/${history[0]?.total||20}`, "Best Score", C.ok],
                  ["⏱", fmt(Math.round(history.reduce((a,h)=>a+(h.time_taken||0),0)/history.length)), "Avg Time", "#0077b6"],
                ].map(([ic,vl,lb,cl])=>(
                  <div key={lb} style={{background:C.card,border:`1px solid ${cl}44`,borderRadius:12,padding:16,textAlign:"center"}}>
                    <div style={{fontSize:22}}>{ic}</div>
                    <div style={{fontSize:22,fontWeight:700,color:cl}}>{vl}</div>
                    <div style={{fontSize:11,color:C.muted}}>{lb}</div>
                  </div>
                ))}
              </div>
              <h3 style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>📋 {t.quizHistory}</h3>
              {history.map((h,i)=>(
                <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13,color:C.text}}>{h.quizzes?.title||"Quiz"}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{new Date(h.created_at).toLocaleDateString("en-IN")} · {h.subjects?.name}</div>
                      <div style={{marginTop:6,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                        <div className="bar" style={{width:`${h.accuracy}%`,height:"100%",background:h.accuracy>=70?C.ok:C.err,borderRadius:2}}/>
                      </div>
                    </div>
                    <div style={{marginLeft:14,textAlign:"right"}}>
                      <div style={{fontWeight:700,fontSize:18,color:h.accuracy>=70?C.ok:C.err}}>{h.accuracy}%</div>
                      <div style={{fontSize:11,color:C.muted}}>{h.score}/{h.total}</div>
                    </div>
                  </div>
                </div>
              ))}
            </>
        }
      </div>
    );

    const LeaderboardTab = () => (
      <div style={{padding:16,animation:"fadeUp 0.4s ease"}}>
        <h2 style={{fontSize:17,fontWeight:700,color:C.acc2,marginBottom:6}}>🏆 {t.leaderboard}</h2>
        <p style={{color:C.muted,fontSize:13,marginBottom:16}}>Coming soon — connect quiz_attempts to build live rankings</p>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:40,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>🏆</div>
          <div style={{fontWeight:600,color:C.text,marginBottom:6}}>Leaderboard</div>
          <div style={{color:C.muted,fontSize:13}}>Add this SQL to Supabase to enable live rankings:</div>
          <div style={{background:C.inp,borderRadius:8,padding:12,marginTop:12,textAlign:"left",fontSize:11,color:C.acc2,fontFamily:"monospace",lineHeight:1.8}}>
            SELECT profiles.name,<br/>
            &nbsp;&nbsp;AVG(accuracy) as avg_acc,<br/>
            &nbsp;&nbsp;COUNT(*) as total<br/>
            FROM quiz_attempts<br/>
            JOIN profiles USING(user_id)<br/>
            GROUP BY profiles.name<br/>
            ORDER BY avg_acc DESC<br/>
            LIMIT 10;
          </div>
        </div>
      </div>
    );

    const BookmarksTab = () => (
      <div style={{padding:16,animation:"fadeUp 0.4s ease"}}>
        <h2 style={{fontSize:17,fontWeight:700,color:C.acc2,marginBottom:6}}>🔖 {t.savedQuestions}</h2>
        <p style={{color:C.muted,fontSize:13,marginBottom:16}}>{bookmarks.length} questions saved</p>
        {bookmarks.length===0
          ? <Empty emoji="🔖" title={t.noBookmarks} desc={t.noBookmarksDesc}/>
          : bookmarks.map(q=>(
            <div key={q.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:10}}>
              <p style={{fontSize:13,color:C.text,lineHeight:1.5,marginBottom:10}}>{lang==="hi"&&q.question_hi?q.question_hi:q.question}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                {(lang==="hi"&&q.options_hi?q.options_hi:q.options).map((opt,i)=>(
                  <span key={i} style={{fontSize:11,padding:"2px 9px",borderRadius:6,background:i===q.correct?`${C.ok}22`:C.inp,color:i===q.correct?C.ok:C.muted,border:`1px solid ${i===q.correct?C.ok:C.border}`}}>
                    {["A","B","C","D"][i]}. {opt}
                  </span>
                ))}
              </div>
              {q.explanation && <p style={{fontSize:12,color:C.muted,marginBottom:8,fontStyle:"italic"}}>💡 {lang==="hi"&&q.explanation_hi?q.explanation_hi:q.explanation}</p>}
              <button onClick={()=>toggleBM(q)} style={{background:"none",border:`1px solid ${C.err}`,color:C.err,borderRadius:6,padding:"3px 10px",fontSize:12,cursor:"pointer"}}>{t.remove}</button>
            </div>
          ))
        }
      </div>
    );

    const ProfileTab = () => (
      <div style={{padding:16,animation:"fadeUp 0.4s ease"}}>
        <div style={{background:`linear-gradient(135deg,${C.acc}22,${C.acc2}11)`,borderRadius:16,padding:24,marginBottom:18,textAlign:"center"}}>
          <Av ini={userAvatar} size={70} pic={userPic}/>
          <div style={{marginTop:12,fontWeight:700,fontSize:19,color:C.text}}>{userName}</div>
          <div style={{color:C.muted,fontSize:13}}>{userEmail}</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.inp,borderRadius:20,padding:"4px 12px",marginTop:8,fontSize:12,color:C.muted}}>
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Signed in with Google
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:16}}>
            {[[history.length,"Quizzes"],[history.length?`${Math.round(history.reduce((a,h)=>a+h.accuracy,0)/history.length)}%`:"—","Accuracy"],["—","Rank"]].map(([v,l])=>(
              <div key={l} style={{textAlign:"center"}}><div style={{fontWeight:700,fontSize:17,color:C.acc2}}>{v}</div><div style={{fontSize:11,color:C.muted}}>{l}</div></div>
            ))}
          </div>
        </div>
        {[[dark?"☀️":"🌙",t.darkMode,()=>setDark(d=>!d),dark?"On":"Off"],["🌐",t.language,()=>setLang(l=>l==="en"?"hi":"en"),lang==="en"?"English":"हिंदी"]].map(([ic,lb,fn,vl])=>(
          <div key={lb} className="card-h" onClick={fn} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:20}}>{ic}</span><span style={{fontWeight:500,color:C.text}}>{lb}</span></div>
            <span style={{fontSize:13,color:C.acc,fontWeight:600}}>{vl}</span>
          </div>
        ))}
        <button onClick={signOut} style={{width:"100%",background:`${C.err}22`,border:`1px solid ${C.err}`,color:C.err,borderRadius:12,padding:14,fontWeight:700,fontSize:15,cursor:"pointer",marginTop:8}}>🚪 {t.signOut}</button>
      </div>
    );

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