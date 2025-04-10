import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXBD-smLSC6wSntBnDWUplGYLzHjINUGE",
  authDomain: "tisd-d637e.firebaseapp.com",
  projectId: "tisd-d637e",
  storageBucket: "tisd-d637e.firebasestorage.app",
  messagingSenderId: "331414025036",
  appId: "1:331414025036:web:4315a31de5b6e4106cd5e9"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 