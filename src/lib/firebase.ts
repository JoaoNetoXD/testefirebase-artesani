
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

// Log para depuração
let firebaseServicesAvailable = false;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebaseServicesAvailable = true;
} else {
  if (typeof window !== 'undefined') { // Apenas logar/avisar no lado do cliente para este específico
    console.warn( // Alterado para console.warn
      'CRITICAL FIREBASE CONFIG WARNING (CLIENT-SIDE): API Key or Project ID is missing. Firebase functionality will be DISABLED. ',
      'This usually means NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID are not correctly set in your .env.local file, or the server was not restarted after changes.'
    );
  } else { // Log do lado do servidor (pode permanecer como erro, pois é útil no build)
      console.error(
      'CRITICAL FIREBASE CONFIG ERROR (SERVER-SIDE): API Key or Project ID is missing from firebaseConfig. ',
      'This usually means NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID are not correctly set in your .env.local file, or the server was not restarted after changes.'
      );
  }
}


// Inicializa o Firebase condicionalmente
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
// let storage: FirebaseStorage | null = null; // Descomente se precisar

if (firebaseServicesAvailable) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase initialization error:", e);
      // app, auth, db permanecerão null
      firebaseServicesAvailable = false; // Marca como não disponível se a inicialização falhar
    }
  } else {
    app = getApp();
  }

  if (app) { // Verifica se 'app' foi inicializado com sucesso
    try {
      auth = getAuth(app);
      db = getFirestore(app);
      // storage = getStorage(app); // Descomente se precisar
    } catch (e) {
        console.error("Firebase service acquisition error (getAuth, getFirestore):", e);
        auth = null;
        db = null;
        firebaseServicesAvailable = false; // Marca como não disponível se a aquisição do serviço falhar
    }
  } else {
    // Se app for null aqui, significa que initializeApp falhou ou não foi chamado
    firebaseServicesAvailable = false;
  }
}
// Se firebaseServicesAvailable for false aqui, auth e db serão null.

export { app, auth, db /*, storage */ };
