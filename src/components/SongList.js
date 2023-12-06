// SongList.js
import React, { useState, useEffect } from "react";

import "./SongList.css";
import chillHop from "../data";

const SongList = ({ currentSongIndex, handleSongSelect }) => {
  const [songs, setSongs] = useState([]); // State to store the fetched songs

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

  return (
    <div className="song-list">
      <h2 className="library-title">Library</h2>

      {songs.map((song, index) => (
        <div
          className={`song-list-item ${
            index === currentSongIndex ? "active" : ""
          }`}
          key={song.id}
          onClick={() => handleSongSelect(index)}
        >
          <img src={song.cover} alt={song.name} className="song-cover" />
          <div className="song-description">
            <h3 className="song-title">{song.name}</h3>
            <p className="song-artist">{song.artist}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongList;
