import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { authAPI } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      console.log('Attempting login with:', { email });

      const response = await authAPI.login({
        email,
        password,
      });

      console.log('Login response:', response.data);

      // Check if we have a token and user data
      if (!response.data.token || !response.data.user) {
        toast.error("Invalid response from server");
        return;
      }

      const { token } = response.data;
      const { role, id, name } = response.data.user;

      if (!role) {
        toast.error("User role not found. Contact admin.");
        return;
      }

      // Store user data in local storage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", id);
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("role", role);

      toast.success("Login successful!");

      // Role-based navigation
      switch (role) {
        case "user":
          navigate("/home");
          break;
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "owner":
          navigate("/owner-dashboard/dashboard");
          break;
        default:
          toast.error("Invalid role. Access denied.");
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle different error scenarios
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Server response error:', error.response.data);

        if (error.response.status === 404) {
          toast.error("Email does not exist. Don't have an account?");
        } else if (error.response.status === 401) {
          toast.error("Invalid password. Please try again.");
        } else if (error.response.status === 400) {
          toast.error(error.response.data.error || "Invalid input. Please check your details.");
        } else {
          toast.error(error.response.data.error || "Login failed. Please try again.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error("No response from server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="d-flex vh-100 login-container">
      <ToastContainer />

      {/* Left Section */}
      <div className="w-50 d-flex flex-column justify-content-center align-items-center text-white bg-danger left-section animated-section">
        <h1 className="fw-bold slide-in">Welcome to RoomLink</h1>
        <p className="fade-in">Your gateway to the best and easy accommodation.</p>
      </div>

      {/* Right Section */}
      <div className="w-50 d-flex justify-content-center align-items-center right-section">
        <div className="card shadow p-4 login-card animated-card" style={{ width: "400px", height: "370px" }}>
          <h2 className="text-center text-danger fw-bold bounce-in">Login</h2>
          <form className="fade-in-up" onSubmit={handleLogin}>
            <div className="mb-3 input-group">
              <input
                type="email"
                className="form-control custom-input"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3 input-group">
              <input
                type="password"
                className="form-control custom-input"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-danger w-100 hover-effect">
              Login
            </button>
          </form>
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-decoration-none hover-link">Forgot Password?</Link>
          </div>
          <div className="text-center mt-2">
            Don't have an account? <Link to="/register" className="text-danger text-decoration-none hover-link">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
