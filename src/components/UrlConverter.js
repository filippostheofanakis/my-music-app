import React, { useState } from "react";
import axios from "axios";

const UrlConverter = () => {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [audioPath, setAudioPath] = useState("");
  const [songTitle, setSongTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/submit-url",
        { songUrl: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.path) {
        const correctedPath = response.data.path.startsWith("/")
          ? response.data.path.substring(1)
          : response.data.path;
        setAudioPath(correctedPath);
        setSongTitle("Extracted Title"); // Placeholder, update as needed
        setMessage(
          `Conversion successful! File saved at: ${response.data.path}`
        );
      }
    } catch (error) {
      setMessage(
        "Failed to convert the URL. Please make sure it is a valid YouTube URL."
      );
      console.error("Error converting URL:", error);
    }
  };

  const saveSongDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!audioPath) {
        console.error("Audio path is required to save song details");
        return;
      }

      const response = await fetch("http://localhost:5000/save-song-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: songTitle,
          artist: "Unknown Artist", // Default artist
          coverUrl: "default_cover.jpg", // Default cover URL
          filename: null, // Filename set to null
          path: audioPath,
          active: true, // Default active status
          color: "default_color", // Default color
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Song saved to database:", data);
      } else {
        console.error("Failed to save song to database:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving song to database:", error);
    }
  };

  return (
    <div className=" flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Convert YouTube URL to MP3</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL here"
          required
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="flex-1 text-white bg-blue-500 hover:bg-blue-600 font-medium py-2 px-4 rounded-md transition duration-200"
        >
          Convert to MP3
        </button>
        <button
          onClick={saveSongDetails}
          className="flex-1 text-white bg-blue-500 hover:bg-blue-600 font-medium py-2 px-4 rounded-md transition duration-200"
        >
          Save to Database
        </button>
      </form>
      {message && <p>{message}</p>}
      {audioPath && (
        <div className="mt-4">
          <audio
            controls
            onError={(e) => console.error("Error playing audio:", e)}
          >
            <source
              src={`http://localhost:5000/${audioPath}`}
              type="audio/mpeg"
            />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default UrlConverter;
