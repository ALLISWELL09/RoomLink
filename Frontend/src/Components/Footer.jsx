import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faMapMarkerAlt, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import "./Styles/Footer.css";

const Footer = () => {
  return (
    <footer className="bg-black text-light pt-5 pb-4">
      <div className="container">
        <div className="row">
          {/* About RoomLink */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="fw-bold text-uppercase">About RoomLink</h5>
            <p className="small">RoomLink helps students and job aspirants find comfortable and affordable accommodation easily. Connecting tenants with trusted property owners effortlessly.</p>
          </div>


                  <div className="col-lg-2 col-md-6 mb-4">
                    <h5 className="fw-bold text-uppercase">Quick Links</h5>
                    <ul className="list  ">
                      <li><a href="#" className="footer-link">Home</a></li>
                      <li><a href="#" className="footer-link">About Us</a></li>
                      <li><a href="#" className="footer-link">Explore Rooms</a></li>
                      <li><a href="#" className="footer-link">Contact Us</a></li>
                      <li><a href="#" className="footer-link">Feedback</a></li>
                    </ul>
                  </div>

                  {/* Contact Information */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="fw-bold text-uppercase">Contact Us</h5>
            <p><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /> 123, Bhavnagar, India</p>
            <p><FontAwesomeIcon icon={faPhone} className="me-2" /> +91 98765 43210</p>
            <p><FontAwesomeIcon icon={faEnvelope} className="me-2" /> support@roomlink.com</p>
          </div>

          {/* Social Media */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="fw-bold text-uppercase">Follow Us</h5>
            <div className="d-flex">
              <a href="#" className="social-icon"><FontAwesomeIcon icon={faFacebook} /></a>
              <a href="#" className="social-icon"><FontAwesomeIcon icon={faTwitter} /></a>
              <a href="#" className="social-icon"><FontAwesomeIcon icon={faInstagram} /></a>
              <a href="#" className="social-icon"><FontAwesomeIcon icon={faLinkedin} /></a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center border-top pt-3">
          <p className="mb-0">&copy; {new Date().getFullYear()} RoomLink. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
