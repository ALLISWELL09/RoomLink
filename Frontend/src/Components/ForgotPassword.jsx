import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [testMode, setTestMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("ForgotPassword: Form submitted");

    if (!email) {
      toast.error("Please enter your email address");
      console.log("ForgotPassword: Email validation failed");
      return;
    }

    setIsSubmitting(true);
    console.log("ForgotPassword: Setting isSubmitting to true");

    try {
      console.log("ForgotPassword: Submitting form with email:", email);

      // Use the authAPI service instead of direct fetch
      const response = await authAPI.forgotPassword(email);

      console.log("ForgotPassword: Response data:", response.data);

      // If we get here, the request was successful
      setEmailSent(true);

      // Check if this is a test email with preview URL
      if (response.data?.testMode && response.data?.previewUrl) {
        setTestMode(true);
        setPreviewUrl(response.data.previewUrl);
        console.log("ForgotPassword: Test mode enabled, preview URL:", response.data.previewUrl);
      }

      // Show success message
      toast.success(response.data.message || "Password sent successfully");

      // Show additional information if provided
      if (response.data?.note) {
        toast.info(response.data.note);
      }
    } catch (error) {
      console.error("ForgotPassword: Error caught:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("ForgotPassword: Server error:", error.response.data);

        if (error.response.status === 404) {
          toast.error(error.response.data.error || "User not found. Please check your email address.");
        } else if (error.response.status === 500) {
          // Check for specific email-related errors
          const errorMsg = error.response.data.error || "";
          if (errorMsg.includes("authentication failed") || errorMsg.includes("EAUTH")) {
            toast.error("Email server authentication failed. Please contact support with error code: EAUTH");
            console.error("Email authentication error. Check email credentials in config.env");
          } else if (errorMsg.includes("connect to email server") || errorMsg.includes("ESOCKET")) {
            toast.error("Could not connect to email server. Please try again later.");
            console.error("Email connection error. Check network and email server settings");
          } else if (errorMsg.includes("timed out") || errorMsg.includes("ETIMEDOUT")) {
            toast.error("Connection to email server timed out. Please try again later.");
            console.error("Email connection timeout. Check network and email server settings");
          } else {
            toast.error(errorMsg || "Server error. Please try again later.");
          }
        } else {
          toast.error(error.response.data.error || "Failed to send reset email");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("ForgotPassword: Network error - No response received");
        toast.error("Cannot connect to the server. Please check your internet connection and make sure the server is running.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("ForgotPassword: Other error:", error.message);
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      console.log("ForgotPassword: Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex vh-100 login-container">
      <ToastContainer />

      {/* Left Section */}
      <div className="w-50 d-flex flex-column justify-content-center align-items-center text-white bg-danger left-section animated-section">
        <h1 className="fw-bold slide-in">Forgot Password</h1>
        <p className="fade-in">We'll help you reset your password and get back to your account.</p>
      </div>

      {/* Right Section */}
      <div className="w-50 d-flex justify-content-center align-items-center right-section">
        <div className="card shadow p-4 login-card animated-card" style={{ width: "400px", height: "370px" }}>
          <h2 className="text-center text-danger fw-bold bounce-in">Forgot Password</h2>

          {emailSent ? (
            <div className="text-center mt-4">
              <div className="alert alert-success">
                <p>Password sent successfully!</p>
                {testMode ? (
                  <>
                    <p>This is a test email. Click the link below to view the email with your temporary password:</p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary mb-3"
                    >
                      View Email with Password
                    </a>
                    <p className="small text-muted">
                      Note: In a real implementation, the email would be sent directly to your inbox.
                    </p>
                  </>
                ) : (
                  <>
                    <p>We've sent a temporary password to your email address.</p>
                    <p>Please check your email inbox and use the temporary password to log in.</p>
                    <p>If you don't see the email in your inbox, please check your spam/junk folder.</p>
                    <p>We recommend changing your password after logging in for security reasons.</p>
                  </>
                )}
              </div>
              <Link to="/" className="btn btn-danger mt-3">
                Back to Login
              </Link>
            </div>
          ) : (
            <form className="fade-in-up" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control custom-input"
                  id="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="form-text">
                  We'll send a temporary password to this email address.
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-danger w-100 hover-effect"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Temporary Password"}
              </button>
              <div className="text-center mt-3">
                <Link to="/" className="text-decoration-none hover-link">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
