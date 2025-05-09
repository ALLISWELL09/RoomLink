import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

const GetInTouch = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="container py-5">
      <h3 className="text-center mb-4">Get in Touch</h3>
      <div className="row">
        {/* Contact Info */}
        <div className="col-md-5">
          <div className="p-4 shadow-sm bg-light rounded">
            <h5>Contact Information</h5>
            <p><FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-2" /> 123, Bhavnagar, India</p>
            <p><FontAwesomeIcon icon={faPhone} className="text-danger me-2" /> +91 98765 43210</p>
            <p><FontAwesomeIcon icon={faEnvelope} className="text-danger me-2" /> contact@roomlink.com</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="col-md-7">
          <div className="p-4 shadow-sm bg-white rounded">
            <h5>Send Us a Message</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  name="message"
                  rows="4"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-danger w-100">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;
