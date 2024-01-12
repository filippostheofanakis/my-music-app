// SongList.js
import React, { useState, useEffect } from "react";

// import "./SongList.css";
// import chillHop from "../data";

const SongList = ({ songs, currentSongIndex, handleSongSelect }) => {
  return (
    <aside className="w-64 h-screen bg-black overflow-y-auto text-gray-400 p-5">
      <h2 className="text-xl font-semibold text-white mb-6">Library</h2>
      {songs.map((song, index) => (
        <div
          key={song.id}
          className={`flex items-center mb-4 p-2 rounded-lg cursor-pointer ${
            index === currentSongIndex ? "bg-gray-900" : "hover:bg-gray-800"
          }`}
          onClick={() => handleSongSelect(index)}
        >
          <img
            className="w-14 h-14 object-cover rounded-md mr-4"
            src={song.cover_url}
            alt={song.title}
          />
          <div>
            <h3 className="text-white font-semibold">{song.title}</h3>
            <p className="text-gray-500 text-sm">{song.artist}</p>
          </div>
        </div>
      ))}
    </aside>
  );
};

export default SongList;
