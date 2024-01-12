// server.js
const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./db"); // Adjust this path to your database connection file
require("dotenv").config();
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // or your front-end's origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/files", express.static(path.join(__dirname, "files")));

const PORT = process.env.PORT || 5000;

// Middleware to authenticate and verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.sendStatus(403); // Invalid token
    }
    console.log("Token and user info:", token, user); // Log the token and user info
    req.user = user;
    next();
  });
};

// Root URL message
app.get("/", (req, res) => {
  res.send("Welcome to the Backend");
});

// User Registration Endpoint
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    // Insert the new user into the database
    const newUser = await pool.query(
      "INSERT INTO users (username, email, hashed_password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Endpoint to update user Profile
app.put("/update-profile", authenticateToken, async (req, res) => {
  try {
    const { userId, newUsername, newEmail } = req.body;

    // Validate email format
    if (!newEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate username length
    if (newUsername.length < 3) {
      return res.status(400).json({ error: "Username too short" });
    }

    // Check if the new email is already in use by another user
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND id != $2",
      [newEmail, userId]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Update the users profile
    await pool.query(
      "UPDATE users Set username =$1, email = $2 WHERE id = $3",
      [newUsername, newEmail, userId]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// User Login Endpoint
// User Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Look up the user in the database
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare the submitted password with the hashed password
    const isValidPassword = await bcrypt.compare(
      password,
      user.rows[0].hashed_password
    );
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Create and assign a token
    const token = jwt.sign(
      { user_id: user.rows[0].id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token, user_id: user.rows[0].id }); // Send back the token and user_id
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Fetch Songs Endpoint
app.get("/songs", async (req, res) => {
  try {
    const allSongs = await pool.query("SELECT * FROM songs");
    res.json(allSongs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Endpoint to change user password
app.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Fetch user from the database
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if current password is correct
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.rows[0].hashed_password
    );
    if (!isValidPassword) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await pool.query("UPDATE users SET hashed_password = $1 WHERE id = $2", [
      hashedNewPassword,
      userId,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET user data by ID
app.get("/user/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user.user_id) !== String(id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const userData = await pool.query(
      "SELECT username, email FROM users WHERE id = $1",
      [id]
    );
    if (userData.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userData.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post("/submit-url", authenticateToken, async (req, res) => {
  const { songUrl } = req.body;

  if (!ytdl.validateURL(songUrl)) {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  try {
    const info = await ytdl.getInfo(songUrl);
    let title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, "");
    title = title.replace(/\s+/g, " ").trim();
    const filename = title.split(" ").join("_") + ".mp3";
    const outputPath = path.join(__dirname, "files", filename);

    ytdl(songUrl, { format: "mp3" })
      .pipe(fs.createWriteStream(outputPath))
      .on("error", (error) => {
        console.error("YTDL or file stream error:", error);
        res.status(500).json({ error: "Error in file conversion" });
      })
      .on("finish", async () => {
        console.log("Conversion successful, file saved at:", outputPath);

        // Insert song details into the 'songs' table
        const audioPath = `/files/${encodeURIComponent(filename)}`;

        // Send a response back to the client with the path of the saved audio file
        res.json({ path: audioPath });
      });
  } catch (error) {
    console.error("Error converting file:", error);
    res.status(500).json({ error: "Error converting file" });
  }
});

app.get("/user-songs", authenticateToken, async (req, res) => {
  try {
    const userSongs = await pool.query(
      "SELECT s.id, s.title, s.artist, s.cover_url, s.audio, s.active, s.color FROM songs s JOIN user_songs us ON s.id = us.song_id WHERE us.user_id = $1",
      [req.user.user_id]
    );

    const baseUrl = "http://localhost:5000";

    const modifiedUserSongs = userSongs.rows.map((song) => {
      return {
        ...song,
        audio: `${baseUrl}${song.audio}`,
      };
    });

    res.json(modifiedUserSongs);
    console.log("Fetched user songs:", modifiedUserSongs);
  } catch (error) {
    console.error("Error fetching user songs:", error);
    res.status(500).send("Server error");
  }
});

app.get("/stream-audio", async (req, res) => {
  const { url } = req.query; // get the video url from the query string

  try {
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // set response headers to stream the audio
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'inline; filename="audio.mp3"');

    //stream the audio from the youtube directly to the response
    ytdl(url, { quality: "highestaudio", filter: "audioonly" }).pipe(res);
  } catch (error) {
    console.error(" Error streaming the audio:", error);
    res.status(500).json({ error: "Error streaming the audio" });
  }
});

app.post("/save-song", authenticateToken, async (req, res) => {
  const { title, audioPath } = req.body;
  try {
    const newSong = await pool.query(
      "INSERT INTO songs (title, audio) VALUES ($1, $2) RETURNING *",
      [title, audioPath]
    );
    res.json(newSong.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post("/save-song-details", authenticateToken, async (req, res) => {
  const { title, artist, coverUrl, filename, path } = req.body;
  const userId = req.user.user_id;

  if (!title || !path) {
    return res.status(400).json({ error: "Title and path are required" });
  }

  try {
    const effectiveArtist = artist || "Unknown Artist";
    const effectiveCoverUrl = coverUrl || "default_cover.jpg";
    const effectivePath = `/${path}`; // Prepend '/files/' to the path

    console.log("Inserting song details into the songs table");
    const songResult = await pool.query(
      "INSERT INTO songs (title, artist, cover_url, audio, filename) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [title, effectiveArtist, effectiveCoverUrl, effectivePath, filename]
    );
    const songId = songResult.rows[0].id;

    console.log(
      `Inserted song with ID: ${songId}, now inserting into user_songs`
    );
    const userSongResult = await pool.query(
      "INSERT INTO user_songs (user_id, song_id) VALUES ($1, $2) RETURNING *",
      [userId, songId]
    );

    res.json({ song: songResult.rows[0], userSong: userSongResult.rows[0] });
  } catch (error) {
    console.error("Error saving song details:", error);
    res.status(500).json({ error: "Error saving song details" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
