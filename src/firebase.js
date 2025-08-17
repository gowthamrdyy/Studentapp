// Firebase setup for Realtime Database
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Make sure this databaseURL matches your Realtime Database URL
const firebaseConfig = {
  apiKey: "AIzaSyBTGS_-huOLxlHD5pGRnsvO1lVxCGnZfpA",
  authDomain: "driverapp-5895c.firebaseapp.com",
  databaseURL: "https://driverapp-5895c-default-rtdb.firebaseio.com",
  projectId: "driverapp-5895c",
  storageBucket: "driverapp-5895c.firebasestorage.app",
  messagingSenderId: "782516255020",
  appId: "1:782516255020:web:98fde9a26871116f49d489"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);