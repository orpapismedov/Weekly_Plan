// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzBLjLxQltCFRdF0nJYW0QcGpazFhienY",
  authDomain: "weeklyplan-2488f.firebaseapp.com",
  projectId: "weeklyplan-2488f",
  storageBucket: "weeklyplan-2488f.firebasestorage.app",
  messagingSenderId: "888786349194",
  appId: "1:888786349194:web:824a4ee74c7b790efdd173",
  measurementId: "G-FY6L8Y3G79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
