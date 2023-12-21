const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./db"); // Adjust this path to your database connection file

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

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
    const token = jwt.sign({ user_id: user.rows[0].id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    // Send the token in the response
    res.json({ message: `User ${username} logged in successfully`, token });
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
