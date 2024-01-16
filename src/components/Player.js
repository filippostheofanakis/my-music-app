import React, { useState, useRef, useEffect, useCallback } from "react";
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
    const width = e.target.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const duration = audioRef.current.duration;
    audioRef.current.currentTime = (clickX / width) * duration;
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

  const resetPlayback = useCallback(() => {
    setCurrentTime(0);
    setSongProgress(0);
    setRemainingTime(duration);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [duration]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      console.log("Playing audio");
      audioRef.current.play();
    } else if (audioRef.current) {
      console.log("Pausing audio");
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    console.log("Current song audio source:", currentSong?.audio);

    if (currentSong && audioRef.current) {
      audioRef.current.src = new URL(currentSong.audio, window.location.origin);
      audioRef.current.load();
      resetPlayback();
      if (isPlaying) {
        setTimeout(() => audioRef.current.play(), 100);
      }
      audioRef.current.onerror = function () {
        console.error("Error with audio element", audioRef.current.error);
      };
    }
  }, [currentSong, isPlaying, resetPlayback]);

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
      {currentSong && (
        <>
          <div className="current-song">
            <img
              src={currentSong.cover_url}
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
              <div
                className="progress"
                style={{ width: `${songProgress}%` }}
              ></div>
            </div>
            <div className="progress-time">
              <span>
                {!isNaN(currentTime) ? formatTime(currentTime) : "0:00"}
              </span>
              <span>
                {!isNaN(remainingTime)
                  ? `-${formatTime(remainingTime)}`
                  : "0:00"}
              </span>
            </div>
          </div>
          <audio
            ref={audioRef}
            src={currentSong.audio}
            onLoadedMetadata={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            onEnded={playNextSong}
            onError={(e) =>
              console.error("Error loading audio:", e.nativeEvent)
            }
          ></audio>
        </>
      )}
    </div>
  );
};

export default Player;
