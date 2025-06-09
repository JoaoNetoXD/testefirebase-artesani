
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getStorage, type FirebaseStorage } from 'firebase/storage'; // Descomente se precisar do Firebase Storage

// Configuração do Firebase do seu aplicativo web.
// Estas variáveis DEVEM ser configuradas no seu arquivo .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional, para Google Analytics
};

// Log para depuração - Verifique o terminal do servidor Next.js
if (typeof window === 'undefined') { // Apenas logar no lado do servidor
  console.log("--- Firebase Config Debug ---");
  console.log("Attempting to read NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Found" : "MISSING or UNDEFINED");
  console.log("Attempting to read NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Found" : "MISSING or UNDEFINED");
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.error("ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is not defined in .env.local or not loaded.");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("ERROR: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not defined in .env.local or not loaded.");
  }
  console.log("--- End Firebase Config Debug ---");
}


// Inicializa o Firebase
let app: FirebaseApp;

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Esta mensagem aparecerá se as chaves não forem encontradas, o que é a causa provável do erro.
  // O erro 'auth/invalid-api-key' pode ocorrer mesmo se as chaves forem strings vazias ou undefined.
  console.error(
    'CRITICAL FIREBASE CONFIG ERROR: API Key or Project ID is missing from firebaseConfig.',
    'This usually means NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID are not correctly set in your .env.local file, or the server was not restarted after changes.'
  );
}

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
// const storage: FirebaseStorage = getStorage(app); // Descomente se precisar do Firebase Storage

export { app, auth, db /*, storage */ };
