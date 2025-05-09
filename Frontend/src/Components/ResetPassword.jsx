import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { authAPI } from "../services/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const { token } = useParams();
  const navigate = useNavigate();

  // Validate token format
  useEffect(() => {
    if (!token || token.length < 20) {
      setTokenValid(false);
      toast.error("Invalid reset token");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authAPI.resetPassword(token, password);

      setResetSuccess(true);
      toast.success(response.data.message || "Password reset successful");

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (error) {
      console.error("Reset password error:", error);

      if (error.response) {
        if (error.response.status === 400) {
          setTokenValid(false);
        }
        toast.error(error.response.data.error || "Failed to reset password");
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="d-flex vh-100 login-container">
        <ToastContainer />
        <div className="w-50 d-flex flex-column justify-content-center align-items-center text-white bg-danger left-section">
          <h1 className="fw-bold">Invalid Token</h1>
          <p>The password reset link is invalid or has expired.</p>
        </div>
        <div className="w-50 d-flex justify-content-center align-items-center right-section">
          <div className="card shadow p-4" style={{ width: "400px" }}>
            <div className="text-center">
              <h2 className="text-danger fw-bold">Link Expired</h2>
              <p>Your password reset link is invalid or has expired.</p>
              <Link to="/forgot-password" className="btn btn-danger mt-3">
                Request New Link
              </Link>
              <div className="mt-3">
                <Link to="/" className="text-decoration-none">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex vh-100 login-container">
      <ToastContainer />

      {/* Left Section */}
      <div className="w-50 d-flex flex-column justify-content-center align-items-center text-white bg-danger left-section animated-section">
        <h1 className="fw-bold slide-in">Reset Password</h1>
        <p className="fade-in">Create a new password for your RoomLink account.</p>
      </div>

      {/* Right Section */}
      <div className="w-50 d-flex justify-content-center align-items-center right-section">
        <div className="card shadow p-4 login-card animated-card" style={{ width: "400px", height: "370px" }}>
          <h2 className="text-center text-danger fw-bold bounce-in">New Password</h2>

          {resetSuccess ? (
            <div className="text-center mt-4">
              <div className="alert alert-success">
                <p>Password reset successful!</p>
                <p>You will be redirected to the login page shortly.</p>
              </div>
              <Link to="/" className="btn btn-danger mt-3">
                Go to Login
              </Link>
            </div>
          ) : (
            <form className="fade-in-up" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control custom-input"
                  id="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="form-text">
                  Password must be at least 6 characters long.
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control custom-input"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-danger w-100 hover-effect"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
