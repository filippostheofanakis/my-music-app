// App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "./firebase";
// import firebase from "./firebase";
import Register from "./components/Register";
import Login from "./components/Login";
import Player from "./components/Player";
import SongList from "./components/SongList";
import chillHop from "./data";
// import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [songProgress, setSongProgress] = useState(0);
  const [songs, setSongs] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseuser) => {
      if (firebaseuser) {
        // User is signer in
        console.log("User signed in with Firebase:", firebaseuser);
        setUser(firebaseuser);
      } else {
        // User is signed out
        console.log("User signed out from Firebase");
        setUser(null);
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch songs when the component mounts
    fetch("http://localhost:5000/songs") // Make a GET request to the backend
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Parse the response body as JSON
      })
      .then((data) => setSongs(data)) // Update the 'songs' state with the fetched data
      .catch((error) => console.error("Error fetching songs:", error)); // Log any errors
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const resetPlayback = () => {
    // Reset the current time and progress bar
    setCurrentTime(0);
    setSongProgress(0);
    // if (audioRef.current) {
    //   audioRef.current.currentTime = 0;
    // }
  };

  const handleSongSelect = (index) => {
    setCurrentSongIndex(index);
    resetPlayback();
  };

  const handleCustomLogin = async (username, password) => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
    } catch (error) {
      console.log("Login error:", error);
    }
  };

  const handleLogout = () => {
    if (auth.currentUser) {
      //Logout from firebase
      auth.signOut();
    } else if (token) {
      // Logout custom token-based authentication
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  return (
    <div className="App">
      <SongList
        songs={songs}
        currentSongIndex={currentSongIndex}
        handleSongSelect={handleSongSelect} // Pass the function as a prop here
      />
      <Player
        currentSong={songs[currentSongIndex]}
        setCurrentSongIndex={setCurrentSongIndex}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        songProgress={songProgress}
        setSongProgress={setSongProgress}
        songs={songs}
      />
      {user || token ? (
        <div>
          <div>
            Welcome, {user ? user.displayName || user.email : "Custom User"}
          </div>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      ) : (
        <>
          <Login onCustomLogin={handleCustomLogin} />
          <Register />
        </>
      )}
    </div>
  );
}

export default App;
