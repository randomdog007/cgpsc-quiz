import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';
import { translations } from '../i18n';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("cgpsc_lang") || "en");
  const [dark, setDark] = useState(() => localStorage.getItem("cgpsc_dark") === "true");
  
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    localStorage.setItem("cgpsc_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("cgpsc_dark", dark);
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.setAttribute("data-theme", "light");
    }
  }, [dark]);

  const loadProfile = async (userId) => {
    try {
      const res = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (res.data) setProfile(res.data);
    } catch (err) {
      console.error("Profile load error:", err);
    }
  };

  const loadGlobalData = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [subsRes, topsRes, quizzesRes] = await Promise.all([
        supabase.from('subjects').select('*').order('sort_order'),
        supabase.from('topics').select('*').order('sort_order'),
        supabase.from('quizzes').select('*').order('id', { ascending: false })
      ]);
      if (subsRes.error) throw subsRes.error;
      if (topsRes.error) throw topsRes.error;
      if (quizzesRes.error) throw quizzesRes.error;
      setSubjects(subsRes.data || []);
      setTopics(topsRes.data || []);
      setQuizzes(quizzesRes.data || []);
    } catch (err) {
      console.error("Data load error:", err);
      setDataError("Failed to load catalog.");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchHistory = async (uid) => {
    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes(title, title_hi), subjects(name, name_hi), topics(name, name_hi)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (!error && data) setHistory(data.filter(a => a.user_id === uid));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const fetchBookmarks = async (uid) => {
    try {
      const { data, error } = await supabase
        .from("saved_questions")
        .select("*")
        .eq("user_id", uid);
      if (!error && data) setBookmarks(data);
    } catch (e) {
      console.error("Failed to load bookmarks", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      const session = data?.session;
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        loadGlobalData();
        fetchHistory(session.user.id);
        fetchBookmarks(session.user.id);
      }
      setAuthLoading(false);
    }).catch(err => {
      console.error(err);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        loadGlobalData();
        fetchHistory(session.user.id);
        fetchBookmarks(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setHistory([]);
        setBookmarks([]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user, authLoading, profile, setProfile,
    lang, setLang, dark, setDark, t,
    subjects, topics, quizzes, dataLoading, dataError, loadGlobalData,
    history, setHistory, fetchHistory,
    bookmarks, setBookmarks, fetchBookmarks
  }), [user, authLoading, profile, lang, dark, t, subjects, topics, quizzes, dataLoading, dataError, history, bookmarks]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
