// components/UrlConverter.js

import React, { useState } from "react";
import axios from "axios";

// Define the UrlConverter component
const UrlConverter = () => {
  // State for storing the input URL
  const [url, setUrl] = useState("");
  // State for storing the message to display to the user
  const [message, setMessage] = useState("");
  // State to store the path of the mp3 file
  const [audioPath, setAudioPath] = useState("");

  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      // Make a POST request to the server with the YouTube URL
      const response = await axios.post("http://localhost:5000/submit-url", {
        songUrl: url,
      });
      // store the path of the convertedd mp3 file
      setAudioPath(response.data.path);
      console.log("Audio path set to:", response.data.path); // <-- Add this line

      // Update the message state with the success message and path to the converted file
      setMessage(`Conversion successful! File saved at: ${response.data.path}`);
    } catch (error) {
      // If the request fails, update the message state with an error message
      setMessage(
        "Failed to convert the URL. Please make sure it is a valid YouTube URL."
      );
      console.error("Error converting URL:", error);
    }
  };

  // Render the form and any messages to the user
  return (
    <div>
      <h2>Convert YouTube URL to MP3</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)} // Update the URL state when the input changes
          placeholder="Enter YouTube URL here"
          required // Make the field required to prevent empty submissions
        />
        <button type="submit">Convert to MP3</button>
      </form>
      {message && <p>{message}</p>}
      {audioPath && ( // If audioPath is set, display the audio player
        <div>
          <audio controls>
            <source
              src={`http://localhost:5000${audioPath}`}
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
