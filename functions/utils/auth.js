import { createRemoteJWKSet, jwtVerify } from 'jose';

// Fetch the Firebase JWKS. This URI handles all Firebase projects.
const JWKS_URI = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const jwks = createRemoteJWKSet(new URL(JWKS_URI));

export async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, jwks);
    
    // Firebase required claims
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) return null;
    if (now - payload.iat > 3600) return null; // max 1hr token age
    
    if (env.REACT_APP_FIREBASE_PROJECT_ID) {
      const projectId = env.REACT_APP_FIREBASE_PROJECT_ID;
      if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
      if (payload.aud !== projectId) return null;
    }

    return { 
      id: payload.user_id || payload.sub, 
      email: payload.email 
    };
  } catch (error) {
    console.error("JWT Verification failed:", error.message);
    return null;
  }
}
