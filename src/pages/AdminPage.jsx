import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function AdminPage({ user, onBack, t, C, STATIC_DATA }) {
  const [activeTab, setActiveTab] = useState('quizzes');
  const [status, setStatus] = useState({ type: '', msg: '' });

  // Add Quiz State
  const [quizData, setQuizData] = useState({
    topic_id: '',
    title: '',
    title_hi: '',
    total_questions: 10,
    time_limit_mins: 15,
    is_premium: false,
    description: '',
    description_hi: ''
  });

  // Add Question State
  const [qData, setQData] = useState({
    topic_id: '',
    quiz_id: '',
    question: '',
    question_hi: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    option_a_hi: '',
    option_b_hi: '',
    option_c_hi: '',
    option_d_hi: '',
    correct_option: 1,
    explanation: '',
    explanation_hi: '',
    sort_order: 1
  });

  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  
  // Bulk Upload State
  const [bulkText, setBulkText] = useState('');
  const [bulkTopicId, setBulkTopicId] = useState('');
  const [bulkQuizId, setBulkQuizId] = useState('');

  
  useEffect(() => {
    supabase.from('quizzes').select('*').order('id', { ascending: false }).limit(50).then(({ data }) => {
      if (data) setQuizzes(data);
    });
    supabase.from('topics').select('*').then(({ data }) => {
      if (data) setTopics(data);
    });
  }, []);

  // Extremely basic admin protection
  const isAdmin = user?.email === 'randomdog007@gmail.com' || user?.email === 'preview@cgpsc.com' || (user?.email && user.email.includes('admin'));

  if (!isAdmin) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.text }}>
        <h2>Access Denied</h2>
        <p style={{ color: C.muted }}>You do not have permission to view the admin panel.</p>
        <button onClick={onBack} style={{ marginTop: 20, padding: '10px 20px', background: C.acc, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Back to Home</button>
      </div>
    );
  }

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Adding quiz...' });
    const { error } = await supabase.from('quizzes').insert({
      ...quizData,
      topic_id: parseInt(quizData.topic_id),
      total_questions: parseInt(quizData.total_questions),
      time_limit_mins: parseInt(quizData.time_limit_mins),
      is_premium: quizData.is_premium,
      difficulty: "All Levels",
      is_previous_year: false,
      description: quizData.description || null,
      description_hi: quizData.description_hi || null
    });
    if (error) {
      setStatus({ type: 'error', msg: error.message });
    } else {
      setStatus({ type: 'success', msg: 'Quiz added successfully!' });
      setQuizData({ ...quizData, title: '', title_hi: '' });
      // Refresh quizzes
      supabase.from('quizzes').select('*').order('id', { ascending: false }).limit(50).then(({ data }) => {
        if (data) setQuizzes(data);
      });
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Adding question...' });
    const { error } = await supabase.from('questions').insert({
      ...qData,
      quiz_id: qData.quiz_id ? parseInt(qData.quiz_id) : null,
      topic_id: qData.topic_id ? parseInt(qData.topic_id) : null,
      correct_option: parseInt(qData.correct_option),
      sort_order: parseInt(qData.sort_order)
    });
    if (error) {
      setStatus({ type: 'error', msg: error.message });
    } else {
      setStatus({ type: 'success', msg: 'Question added successfully!' });
      // Reset form but keep quiz_id
      setQData({
        ...qData,
        question: '', question_hi: '',
        option_a: '', option_b: '', option_c: '', option_d: '',
        option_a_hi: '', option_b_hi: '', option_c_hi: '', option_d_hi: '',
        explanation: '', explanation_hi: '',
        sort_order: parseInt(qData.sort_order) + 1
      });
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkText || !bulkTopicId) {
      return setStatus({ type: 'error', msg: 'Please select a topic and paste data.' });
    }
    
    setStatus({ type: 'loading', msg: 'Parsing and uploading...' });
    
    try {
      const rows = bulkText.split('\n').filter(r => r.trim());
      
      const parseLine = (line) => {
        if (line.includes('\t')) return line.split('\t').map(c => c.trim());
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' && line[i+1] === '"') {
            current += '"';
            i++;
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      // Expecting columns: Q(EN), Q(HI), OptA(EN), OptA(HI), OptB(EN), OptB(HI), OptC(EN), OptC(HI), OptD(EN), OptD(HI), Correct(1-4), Exp(EN), Exp(HI)
      const questionsToInsert = rows.map((row, idx) => {
        const cols = parseLine(row);
        return {
          topic_id: parseInt(bulkTopicId),
          quiz_id: bulkQuizId ? parseInt(bulkQuizId) : null,
          question: cols[0] || `Bulk Q ${idx}`,
          question_hi: cols[1] || '',
          option_a: cols[2] || 'A',
          option_a_hi: cols[3] || '',
          option_b: cols[4] || 'B',
          option_b_hi: cols[5] || '',
          option_c: cols[6] || 'C',
          option_c_hi: cols[7] || '',
          option_d: cols[8] || 'D',
          option_d_hi: cols[9] || '',
          correct_option: parseInt(cols[10]) || 1,
          explanation: cols[11] || '',
          explanation_hi: cols[12] || '',
          sort_order: idx + 1
        };
      });
      
      const { error } = await supabase.from('questions').insert(questionsToInsert);
      
      if (error) throw error;
      
      setStatus({ type: 'success', msg: `Successfully added ${questionsToInsert.length} questions!` });
      setBulkText('');
    } catch (e) {
      setStatus({ type: 'error', msg: e.message || 'Error parsing or inserting data.' });
    }
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: `1px solid ${C.border}`, background: C.inp, color: C.text };
  const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600, color: C.muted };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ color: C.text, fontSize: 24, margin: 0 }}>Admin Panel</h1>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button 
          onClick={() => setActiveTab('quizzes')}
          style={{ flex: 1, padding: 12, background: activeTab === 'quizzes' ? C.acc : C.card, color: activeTab === 'quizzes' ? '#fff' : C.text, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          Add Quiz
        </button>
        <button 
          onClick={() => setActiveTab('questions')}
          style={{ flex: 1, padding: 12, background: activeTab === 'questions' ? C.acc : C.card, color: activeTab === 'questions' ? '#fff' : C.text, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          Add Questions (Single)
        </button>
        <button 
          onClick={() => setActiveTab('bulk')}
          style={{ flex: 1, padding: 12, background: activeTab === 'bulk' ? C.acc : C.card, color: activeTab === 'bulk' ? '#fff' : C.text, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          Question Bank (Bulk Upload)
        </button>
      </div>

      {status.msg && (
        <div style={{ padding: 12, marginBottom: 20, borderRadius: 8, background: status.type === 'error' ? `${C.err}22` : `${C.ok}22`, color: status.type === 'error' ? C.err : C.ok, fontWeight: 500, border: `1px solid ${status.type === 'error' ? C.err : C.ok}` }}>
          {status.msg}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <form onSubmit={handleAddQuiz}>
            <label style={labelStyle}>Topic</label>
            <select required value={quizData.topic_id} onChange={e => setQuizData({...quizData, topic_id: e.target.value})} style={inputStyle}>
              <option value="">-- Select a Topic --</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            
            <label style={labelStyle}>Title (English)</label>
            <input required type="text" value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})} style={inputStyle} placeholder="Quiz Title" />
            
            <label style={labelStyle}>Title (Hindi)</label>
            <input type="text" value={quizData.title_hi} onChange={e => setQuizData({...quizData, title_hi: e.target.value})} style={inputStyle} placeholder="क्विज़ शीर्षक" />
            
            <label style={labelStyle}>Description (Optional)</label>
            <textarea rows={2} value={quizData.description} onChange={e => setQuizData({...quizData, description: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="Quiz description..." />
            
            <label style={labelStyle}>Description Hindi (Optional)</label>
            <textarea rows={2} value={quizData.description_hi} onChange={e => setQuizData({...quizData, description_hi: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="क्विज़ विवरण..." />
            
            <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Total Questions</label>
                <input required type="number" value={quizData.total_questions} onChange={e => setQuizData({...quizData, total_questions: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Time Limit (Mins)</label>
                <input required type="number" value={quizData.time_limit_mins} onChange={e => setQuizData({...quizData, time_limit_mins: e.target.value})} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: C.text, cursor: 'pointer' }}>
                <input type="checkbox" checked={quizData.is_premium} onChange={e => setQuizData({...quizData, is_premium: e.target.checked})} style={{ width: 18, height: 18 }} />
                Premium Quiz
              </label>
            </div>

            <button type="submit" style={{ marginTop: 20, width: '100%', padding: 14, background: C.acc, color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Create Quiz
            </button>
          </form>
        </div>
      )}

      {activeTab === 'questions' && (
        <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <form onSubmit={handleAddQuestion}>
            <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Topic (Question Bank)</label>
                <select value={qData.topic_id} onChange={e => setQData({...qData, topic_id: e.target.value})} style={inputStyle}>
                  <option value="">-- Or Select a Topic Bank --</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Specific Quiz (Optional)</label>
                <select value={qData.quiz_id} onChange={e => setQData({...qData, quiz_id: e.target.value})} style={inputStyle}>
                  <option value="">-- Select a Quiz --</option>
                  {quizzes.map(q => <option key={q.id} value={q.id}>ID: {q.id} - {q.title}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Question (English)</label>
                <textarea required rows={3} value={qData.question} onChange={e => setQData({...qData, question: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Question (Hindi)</label>
                <textarea rows={3} value={qData.question_hi} onChange={e => setQData({...qData, question_hi: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label style={labelStyle}>Option A (EN)</label>
                <input required type="text" value={qData.option_a} onChange={e => setQData({...qData, option_a: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Option A (HI)</label>
                <input type="text" value={qData.option_a_hi} onChange={e => setQData({...qData, option_a_hi: e.target.value})} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Option B (EN)</label>
                <input required type="text" value={qData.option_b} onChange={e => setQData({...qData, option_b: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Option B (HI)</label>
                <input type="text" value={qData.option_b_hi} onChange={e => setQData({...qData, option_b_hi: e.target.value})} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Option C (EN)</label>
                <input required type="text" value={qData.option_c} onChange={e => setQData({...qData, option_c: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Option C (HI)</label>
                <input type="text" value={qData.option_c_hi} onChange={e => setQData({...qData, option_c_hi: e.target.value})} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Option D (EN)</label>
                <input required type="text" value={qData.option_d} onChange={e => setQData({...qData, option_d: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Option D (HI)</label>
                <input type="text" value={qData.option_d_hi} onChange={e => setQData({...qData, option_d_hi: e.target.value})} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Correct Option (1-4)</label>
                <select value={qData.correct_option} onChange={e => setQData({...qData, correct_option: e.target.value})} style={inputStyle}>
                  <option value={1}>1 (A)</option>
                  <option value={2}>2 (B)</option>
                  <option value={3}>3 (C)</option>
                  <option value={4}>4 (D)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Sort Order</label>
                <input type="number" value={qData.sort_order} onChange={e => setQData({...qData, sort_order: e.target.value})} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Explanation (English)</label>
                <textarea rows={3} value={qData.explanation} onChange={e => setQData({...qData, explanation: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Explanation (Hindi)</label>
                <textarea rows={3} value={qData.explanation_hi} onChange={e => setQData({...qData, explanation_hi: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
              </div>
            </div>

            <button type="submit" style={{ marginTop: 10, width: '100%', padding: 14, background: C.acc, color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Add Question
            </button>
          </form>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <form onSubmit={handleBulkUpload}>
            <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Select Topic for Question Bank</label>
                <select required value={bulkTopicId} onChange={e => setBulkTopicId(e.target.value)} style={inputStyle}>
                  <option value="">-- Select a Topic --</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Specific Quiz (Optional)</label>
                <select value={bulkQuizId} onChange={e => setBulkQuizId(e.target.value)} style={inputStyle}>
                  <option value="">-- Select a Quiz --</option>
                  {quizzes.map(q => <option key={q.id} value={q.id}>ID: {q.id} - {q.title}</option>)}
                </select>
              </div>
            </div>

            <label style={labelStyle}>Paste from Excel (TSV format)</label>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Columns must be exactly: <b>Q(EN), Q(HI), OptA(EN), OptA(HI), OptB(EN), OptB(HI), OptC(EN), OptC(HI), OptD(EN), OptD(HI), Correct(1-4), Exp(EN), Exp(HI)</b></div>
            <textarea 
              required
              rows={15} 
              value={bulkText} 
              onChange={e => setBulkText(e.target.value)} 
              style={{...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre'}} 
              placeholder="Q(EN)	Q(HI)	A(EN)	A(HI)	B(EN)	B(HI)	C(EN)	C(HI)	D(EN)	D(HI)	1	Exp(EN)	Exp(HI)..."
            />

            <button type="submit" style={{ marginTop: 10, width: '100%', padding: 14, background: C.acc, color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Bulk Import Questions
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
