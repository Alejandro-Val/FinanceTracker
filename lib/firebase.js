// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNs-A0d2oRwafEHH4gg3t0XaLzXPLIDFw",
  authDomain: "my-finances-80659.firebaseapp.com",
  projectId: "my-finances-80659",
  storageBucket: "my-finances-80659.firebasestorage.app",
  messagingSenderId: "69126987388",
  appId: "1:69126987388:web:86d458da768894f5e773f9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);