// SongList.js
import React, { useState } from "react";

import "./SongList.css";
import chillHop from "../data";

const SongList = ({ songs, currentSongIndex, handleSongSelect }) => {
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
