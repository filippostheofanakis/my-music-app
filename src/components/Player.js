import React, { useState, useRef, useEffect } from "react";
import chillHop from "../data"; // Adjust this import based on your data file's location
import "./Player.css";

const Player = ({
  currentSong,
  currentSongIndex,
  setCurrentSongIndex,
  songs,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const [remainingTime, setRemainingTime] = useState(0);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (!isNaN(currentTime)) {
        setCurrentTime(currentTime);
        setRemainingTime(duration - currentTime);
        setSongProgress((currentTime / duration) * 100);
      }
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const setSeekBar = (e) => {
    const width = e.target.clientWidth; // Get the width of the progress bar
    const clickX = e.nativeEvent.offsetX; // Get the horizontal point of the click within the bar
    const duration = audioRef.current.duration; // Total duration of the song
    audioRef.current.currentTime = (clickX / width) * duration; // Set the current time
  };

  const playNextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    resetPlayback();
  };

  const playPrevSong = () => {
    setCurrentSongIndex((prevIndex) => {
      return prevIndex === 0 ? songs.length - 1 : prevIndex - 1;
    });
    resetPlayback();
  };

  const resetPlayback = () => {
    // Reset the current time and progress bar
    setCurrentTime(0);
    setSongProgress(0);
    setRemainingTime(duration);
    // If using a progress bar element, you may need to reset its value directly as well
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentSong.audio;
      audioRef.current.load();
      resetPlayback(); // Reset the playback whenever the song changes
      if (isPlaying) {
        setTimeout(() => audioRef.current.play(), 100); // A slight delay to ensure the new song loads
      }
    }
  }, [currentSong]);

  function formatTime(seconds) {
    if (isNaN(seconds)) {
      return "0:00";
    }
    return `${Math.floor(seconds / 60)}:${`0${Math.floor(seconds % 60)}`.slice(
      -2
    )}`;
  }

  return (
    <div className="player">
      <div className="current-song">
        <img
          src={currentSong.cover}
          alt={currentSong.name}
          className="current-song-cover"
        />
        <h2 className="current-song-name">{currentSong.name}</h2>
        <h3 className="current-song-artist">{currentSong.artist}</h3>
      </div>
      <div className="player-controls">
        <button onClick={playPrevSong} className="control-button">
          <i className="fas fa-step-backward"></i>
        </button>
        <button onClick={togglePlayPause} className="control-button">
          {isPlaying ? (
            <i className="fas fa-pause"></i>
          ) : (
            <i className="fas fa-play"></i>
          )}
        </button>
        <button onClick={playNextSong} className="control-button">
          <i className="fas fa-step-forward"></i>
        </button>
      </div>
      <div className="progress-container" onClick={setSeekBar}>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${songProgress}%` }}></div>
        </div>
        <div className="progress-time">
          <span>{!isNaN(currentTime) ? formatTime(currentTime) : "0:00"}</span>
          <span>
            {!isNaN(remainingTime) ? `-${formatTime(remainingTime)}` : "0:00"}
          </span>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={currentSong.audio}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={playNextSong}
      ></audio>
    </div>
  );
};

export default Player;
