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

  const t = translations[lang] || translations.en;

  useEffect(() => {
    localStorage.setItem("cgpsc_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("cgpsc_dark", dark);
    if (dark) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        loadGlobalData();
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        loadGlobalData();
      } else {
        setUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const value = useMemo(() => ({
    user, authLoading, profile, setProfile,
    lang, setLang, dark, setDark, t,
    subjects, topics, quizzes, dataLoading, dataError, loadGlobalData
  }), [user, authLoading, profile, lang, dark, t, subjects, topics, quizzes, dataLoading, dataError]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
