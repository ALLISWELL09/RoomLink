import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheckCircle } from "react-icons/fa";
import Header from './Header';
import Footer from './Footer';

export default function About() {
    return (
      <>
  <Header/>
  <div className="container my-5 mt-5">
      <div className="row align-items-center">
        {/* Left Image Section */}
        <div className="col-md-6">
          <img
            src="https://static.vecteezy.com/system/resources/previews/036/725/193/non_2x/ai-generated-real-estate-advertisment-background-with-copy-space-free-photo.jpg"
            alt="Team Meeting"
            className="img-fluid rounded shadow"
          />
        </div>

        {/* Right Text Section */}
        <div className="col-md-6">
          <h2 className="fw-bold">Why Choose Us?</h2>
          <p className="text-muted">
          Our platform connects students and tenants with verified property owners, offering detailed listings with photos, descriptions, prices, and amenities. With advanced search filters, real-time availability updates, and secure in-app rent payment options, we ensure a smooth and hassle-free renting experience.
          </p>

          {/* Bullet Points with Icons */}
          <ul className="list-unstyled">
            <li className="d-flex align-items-center mb-2">
              <FaCheckCircle className="text-danger me-2" />
              Seamless Rentals
            </li>
            <li className="d-flex align-items-center mb-2">
              <FaCheckCircle className="text-danger me-2" />
              Secure & Transparent
            </li>
            <li className="d-flex align-items-center">
              <FaCheckCircle className="text-danger me-2" />
              Community-Driven
            </li>
          </ul>

          {/* Call-to-Action Button */}
          <button className="btn btn-outline-danger fw-bold ">Connect Now</button>
        </div>
      </div>
    </div>
<Footer/>
      
      </>
    );
}
