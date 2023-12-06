const express = require("express");
const cors = require("cors");
const chillHop = require("../src/data");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

//Get route at the root URL
app.get("/", (req, res) => {
  res.send("Welcome to the Backend"); // sending a response back to the client
});

//POST route at '/login' URL for user login (example)
app.post("/login", (req, res) => {
  const { username, password } = req.body; // Extracting username and password from request body
  // Here you would normally validate the user's credentials
  res.send(`Login attempted for user: %{username}`); // Sending  a response back
});

// GET route at '/songs' URL to fetch songs (example)
app.get("/songs", (req, res) => {
  // Here you would normally fetch songs from your database
  const songs = chillHop();
  res.json(songs); // Sending an array of songs as a response
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
