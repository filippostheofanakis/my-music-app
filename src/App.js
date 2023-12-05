// App.js
import React, { useState } from "react";
import Player from "./components/Player";
import SongList from "./components/SongList";
import chillHop from "./data";

function App() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [songProgress, setSongProgress] = useState(0);
  const songs = chillHop(); // Retrieve the songs array

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
    </div>
  );
}

export default App;
