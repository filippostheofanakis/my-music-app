import React, { useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = ({ onCustomLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { username, password } = credentials;

  // Update the state when input fields change
  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        credentials
      );
      const { token, user_id } = response.data;

      onCustomLogin(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", response.data.user_id); // Store user ID as a string

      console.log("Login successful");
    } catch (err) {
      setError(err.response.data.error);
      console.error("Login Failed:", err.response.data);
    }
  };

  // Google sign-in functionality
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // Successful authentication handling
      })
      .catch((error) => {
        console.error("Error during sign in:", error);
      });
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      {error && <p className="error">{error}</p>} {/* Display login errors */}
    </div>
  );
};

export default Login;
