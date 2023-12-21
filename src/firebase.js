// Import individual components from Firebase instead of the entire library
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4qma8Dq3XVJaVx8EB89jweARn4TgBUFM",
  authDomain: "react-music-app-5e9f5.firebaseapp.com",
  projectId: "react-music-app-5e9f5",
  storageBucket: "react-music-app-5e9f5.appspot.com",
  messagingSenderId: "440399755016",
  appId: "1:440399755016:web:9f7e7918e7e0595dad9ebd",
  measurementId: "G-BBX1NWEM60",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get the Firebase Auth instance
const auth = getAuth(app);

// Export the Firebase Auth instance for use in your application
export { auth };
