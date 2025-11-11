// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtwv6EbKLgAteVZvg8D6cm12d-B2Jph4M",
  authDomain: "truswap-8981b.firebaseapp.com",
  projectId: "truswap-8981b",
  storageBucket: "truswap-8981b.firebasestorage.app",
  messagingSenderId: "1022909508567",
  appId: "1:1022909508567:web:55d556aa7991cdac83f992",
  measurementId: "G-38FL6E6XT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);