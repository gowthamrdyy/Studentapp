import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBTGS_-huOLxlHD5pGRnsvO1lVxCGnZfpA",
    authDomain: "driverapp-5895c.firebaseapp.com",
    databaseURL: "https://driverapp-5895c-default-rtdb.firebaseio.com",
    projectId: "driverapp-5895c",
    storageBucket: "driverapp-5895c.firebasestorage.app",
    messagingSenderId: "782516255020",
    appId: "1:782516255020:web:ac25cce4287f6b1249d489",
    measurementId: "G-X421DWNFW5"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
