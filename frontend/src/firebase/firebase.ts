import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAHz8kKhzRJIOQLaA6fk6N62wfKhiNz22Q",
  authDomain: "coopmarketplace.firebaseapp.com",
  projectId: "coopmarketplace",
  storageBucket: "coopmarketplace.firebasestorage.app",
  messagingSenderId: "1097963534736",
  appId: "1:1097963534736:web:ca3a25e58f3dcb974d9b15",
  measurementId: "G-HLW8GL1C7H",
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
