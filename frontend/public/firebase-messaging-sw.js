importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAHz8kKhzRJIOQLaA6fk6N62wfKhiNz22Q",
  authDomain: "coopmarketplace.firebaseapp.com",
  projectId: "coopmarketplace",
  storageBucket: "coopmarketplace.firebasestorage.app",
  messagingSenderId: "1097963534736",
  appId: "1:1097963534736:web:ca3a25e58f3dcb974d9b15",
});

firebase.messaging();
