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
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {isEditMode ? (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          {/* Input fields... */}
          <input
            type="text"
            name="username"
            value={profileData.username}
            onChange={handleInputChange}
            placeholder="Username"
            className="input-style"
          />
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="input-style"
          />
          <input
            type="password"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            className="input-style"
          />
          {/* Other input fields... */}
          <div className="flex justify-between space-x-3">
            <button
              type="button"
              onClick={handlePasswordChange}
              className="flex-1 btn-style bg-blue-500 hover:bg-blue-700"
            >
              Change Password
            </button>
            <button
              type="submit"
              className="flex-1 btn-style bg-green-500 hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancelClick}
              className="flex-1 btn-style bg-red-500 hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={handleEditClick}
          className="btn-style bg-blue-500 hover:bg-blue-700"
        >
          Edit Profile
        </button>
      )}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default Profile;
