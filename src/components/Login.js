// src/components/Login.js
import React, { useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Update the state when input fields change
  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/login", // Replace with your backend login endpoint
        credentials
      );
      localStorage.setItem("token", response.data.token);
      // Update UI or Redirect user here
      console.log("Login successful"); // Handle the response, such as storing the token
    } catch (err) {
      setError(err.response.data.error);
      console.error("Login Failed:", err.response.data); // Handle errors
    }
  };

  // Google sign-in functionality
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // Handle the successful authentication here.
        // You can access the user's info with result.user
      })
      .catch((error) => {
        // Handle errors here.
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
    </div>
  );
};

export default Login;
