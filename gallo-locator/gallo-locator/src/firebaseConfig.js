import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBPt0vktXStpdqA5rEIQHGYoNrdMglHLT4",
    authDomain: "alpha-version-95155.firebaseapp.com",
    projectId: "alpha-version-95155",
    storageBucket: "alpha-version-95155.appspot.com",
    messagingSenderId: "341350914048",
    appId: "1:341350914048:web:a44ba77f6196eef27e60e5",
    measurementId: "G-B73YCG3D3T"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
