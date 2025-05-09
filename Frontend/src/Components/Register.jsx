import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile_no: "",
    role: "user", // Default role is set to "user" (Student)
    profile_pic: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG and JPG files are allowed");
      return;
    }

    setFormData({ ...formData, profile_pic: file });

    // Preview Image
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.mobile_no) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true); // Start loading
    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);
    formDataObj.append("mobile_no", formData.mobile_no);
    formDataObj.append("role", "user"); // Always set role to "user" (Student)
    formDataObj.append("profile_pic", formData.profile_pic);

    try {
      const res = await axios.post("http://localhost:4000/api/user/register", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.user) {
        toast.success("User Registered Successfully!");

        setFormData({ name: "", email: "", password: "", mobile_no: "", role: "user", profile_pic: null }); // Reset form with role still as "user"
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error registering user");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="w-100 vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 h-100 shadow-lg overflow-hidden">
        <ToastContainer /> {/* Ensure this is inside your component */}

        {/* Left Section */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center text-white p-5"
             style={{ background: "linear-gradient(45deg, #ff416c, #ff4b2b)" }}>
          <h1 className="fw-bold">Welcome to RoomLink</h1>
          <p>Your gateway to the best and easy student accommodation.</p>
        </div>

        {/* Right Section */}
        <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
          <h2 className="text-danger fw-bold mb-4">Student Registration</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Role is fixed to Student (user) */}
            <div className="mb-3">
              <p className="text-info mb-0"><i className="bi bi-info-circle"></i> Registering as a Student</p>
              <input type="hidden" name="role" value="user" />
            </div>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-control" placeholder="Enter your full name"
                     value={formData.name} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Profile Photo</label>
              <input type="file" accept="image/png, image/jpeg, image/jpg" className="form-control"
                     onChange={handleImageChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Mobile Number</label>
              <input type="tel" name="mobile_no" className="form-control" placeholder="Enter your mobile number"
                     value={formData.mobile_no} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" placeholder="Enter your email"
                     value={formData.email} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" placeholder="Enter your password"
                     value={formData.password} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-danger w-100" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
          <div className="mt-3 text-center">
            <p>Already have an account? <a href="/" className="text-danger text-decoration-none">Login here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
