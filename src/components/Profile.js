import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [profileData, setProfileData] = useState({ username: "", email: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Function to retrieve the current user ID from local storage
  const getCurrentUserId = () => {
    const userId = String(localStorage.getItem("userId"));
    console.log("User ID from localStorage:", userId);
    if (!userId) {
      setErrorMessage("No user ID found.");
      return null;
    }
    return userId;
  };

  // Effect hook to fetch profile data once the component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!userId || !token) {
        setErrorMessage("No user ID or token found.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfileData({
          username: response.data.username,
          email: response.data.email,
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setErrorMessage("Failed to load profile data");
      }
    };

    fetchProfileData();
  }, []);

  // Function to handle input changes and update state
  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Handlers for edit mode toggling
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    const userId = getCurrentUserId();
    if (!userId) {
      setErrorMessage("No user ID found for password change.");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const payload = {
      userId,
      currentPassword,
      newPassword,
    };

    try {
      const response = await axios.put(
        "http://localhost:5000/change-password",
        payload,
        { headers }
      );
      if (response.data) {
        setErrorMessage("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Failed to change password:", error.response.data);
      setErrorMessage("Failed to change password");
    }
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = getCurrentUserId();
    if (!userId) {
      setErrorMessage("No user ID found for update.");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      newUsername: profileData.username,
      newEmail: profileData.email,
      userId,
    };

    try {
      const response = await axios.put(
        "http://localhost:5000/update-profile",
        payload,
        { headers }
      );
      setIsEditMode(false);
      setErrorMessage("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error.response.data);
      setErrorMessage("Failed to update profile");
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      {isEditMode ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            value={profileData.username}
            onChange={handleInputChange}
            placeholder="Username"
          />
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            placeholder="Email"
          />
          <input
            type="password"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
          />
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
          />
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
          />
          <button type="button" onClick={handlePasswordChange}>
            Change Password
          </button>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={handleCancelClick}>
            Cancel
          </button>
        </form>
      ) : (
        <button type="button" onClick={handleEditClick}>
          Edit Profile
        </button>
      )}
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default Profile;
