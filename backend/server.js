const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const pool = require("./db"); // Adjust this path to your database connection file
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Middleware to authenticate and verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
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
    if (req.user.user_id !== id) {
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
