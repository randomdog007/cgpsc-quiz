import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();



class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.params = new URLSearchParams();
  }
  
  select(columns) { 
    this.params.set('select', columns); 
    return this; 
  }
  
  eq(column, value) { 
    this.params.append(`eq_${column}`, value); 
    return this; 
  }
  
  ilike(column, value) {
    this.params.append(`ilike_${column}`, value);
    return this;
  }

  search(query) {
    this.params.set('search_query', query);
    return this;
  }
  
  order(column, options = {}) { 
    this.params.set('order', column); 
    if (options.ascending === false) {
      this.params.set('desc', 'true');
    }
    return this; 
  }
  
  limit(n) { 
    this.params.set('limit', n); 
    return this; 
  }
  
  single() { 
    this.params.set('single', 'true'); 
    return this; 
  }
  
  async insert(data) {
    const res = await fetch(`/api/${this.table}`, { 
      method: 'POST', 
      body: JSON.stringify(data), 
      headers: this.headers() 
    });
    return res.json();
  }
  
  async update(data) {
    const res = await fetch(`/api/${this.table}?${this.params.toString()}`, { 
      method: 'PATCH', 
      body: JSON.stringify(data), 
      headers: this.headers() 
    });
    return res.json();
  }
  
  async delete() {
    const res = await fetch(`/api/${this.table}?${this.params.toString()}`, { 
      method: 'DELETE', 
      headers: this.headers() 
    });
    return res.json();
  }
  
  then(resolve, reject) {
    this.params.set('_t', Date.now());
    fetch(`/api/${this.table}?${this.params.toString()}`, { headers: this.headers(), cache: 'no-store' })
      .then(res => res.json())
      .then(resolve)
      .catch(reject);
  }
  
  headers() {
    const h = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('firebase_id_token');
    if (token) {
      h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  }
}

const mockSupabaseAuth = {
  getSession: async () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        unsubscribe();
        if (user) {
          const token = await user.getIdToken();
          localStorage.setItem('firebase_id_token', token);
          resolve({ 
            data: { 
              session: { 
                access_token: token,
                user: { 
                  id: user.uid, 
                  email: user.email, 
                  user_metadata: { full_name: user.displayName, avatar_url: user.photoURL } 
                } 
              } 
            } 
          });
        } else {
          localStorage.removeItem('firebase_id_token');
          resolve({ data: { session: null } });
        }
      });
    });
  },
  onAuthStateChange: (callback) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('firebase_id_token', token);
        callback('SIGNED_IN', { 
          access_token: token,
          user: { 
            id: user.uid, 
            email: user.email, 
            user_metadata: { full_name: user.displayName, avatar_url: user.photoURL } 
          } 
        });
      } else {
        localStorage.removeItem('firebase_id_token');
        callback('SIGNED_OUT', null);
      }
    });
    return { data: { subscription: { unsubscribe } } };
  },
  signInWithOAuth: async ({ provider }) => {
    try {
      if (provider === 'google') {
        const result = await signInWithPopup(firebaseAuth, googleProvider);
        const token = await result.user.getIdToken();
        localStorage.setItem('firebase_id_token', token);
        return { data: result.user, error: null };
      }
      return { data: null, error: { message: "Unsupported provider" } };
    } catch (error) {
      return { data: null, error };
    }
  },
  signOut: async () => {
    await fbSignOut(firebaseAuth);
    localStorage.removeItem('firebase_id_token');
    return { error: null };
  }
};

export const supabase = {
  from: (table) => new QueryBuilder(table),
  auth: mockSupabaseAuth
};  
// Auto-refresh token to prevent expiration during long sessions  
setInterval(async () = 
  const user = firebaseAuth.currentUser;  
  if (user) {  
    try {  
      const token = await user.getIdToken(true);  
      localStorage.setItem('firebase_id_token', token);  
    } catch (e) {  
      console.warn('Token refresh failed:', e);  
    }  
  }  
}, 50 * 60 * 1000); // refresh every 50 mins 
