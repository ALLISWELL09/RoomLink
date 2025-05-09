import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import BannerImage from "../../Images/banner.jpg";
import { bhavnagarLocations } from "../../data/locations";
import {
  faMapMarkerAlt,
  faRupeeSign,
  faHome,
  faSearch
} from "@fortawesome/free-solid-svg-icons";


// Custom CSS to fix dropdown appearance
const dropdownStyles = `
  /* Remove default arrow and use custom styling */
  .form-select {
    appearance: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e") !important;
    background-repeat: no-repeat !important;
    background-position: right 0.75rem center !important;
    background-size: 16px 12px !important;
    z-index: 1050 !important;
  }

  /* Ensure dropdown options are visible */
  .form-select option {
    background-color: white;
    color: black;
    padding: 8px 12px;
  }

  /* Remove default arrow in IE10+ */
  .form-select::-ms-expand {
    display: none !important;
  }
`;

const Banner = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    location: "",
    budget: "",
  });

  // Handle input change
  const handleSearch = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  // Handle search button
  const handleSearchButton = () => {
    const { location, budget } = search;

    if (location === "" || budget === "") {
      alert("Please fill all the fields");
    } else {
      // Pass the location as is, without forcing any case
      // The Explore_Room component already does case-insensitive filtering
      navigate(`/explore_room?location=${location}&budget=${budget}`);
    }
  };

  return (
    <div
      className="position-relative d-flex align-items-center justify-content-center vh-100 text-white"
      style={{
        background: `url(${BannerImage}) center/cover no-repeat`,
      }}
    >
      {/* Add custom styles for dropdown */}
      <style>{dropdownStyles}</style>
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-75"></div>

      <div className="text-center position-relative z-2 p-4 rounded">
        <h1 className="fw-bold mb-4">Simplifying Your Search for Space.</h1>

        <div className="bg-white text-dark rounded shadow p-3 d-flex align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center border-end pe-3">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-secondary me-2" />
            <select
              className="form-select border-0 shadow-none w-100"
              name="location"
              value={search.location}
              onChange={handleSearch}
            >
              <option value="" disabled>Select Location</option>
              {bhavnagarLocations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex align-items-center border-end pe-3">
            <FontAwesomeIcon icon={faRupeeSign} className="text-secondary me-2" />
            <input
              type="number"
              className="form-control border-0 shadow-none"
              name="budget"
              value={search.budget}
              onChange={handleSearch}
              placeholder="Enter your budget"
            />
          </div>

          <div className="d-flex align-items-center border-end pe-3">
            <FontAwesomeIcon icon={faHome} className="text-secondary me-2" />
            <select className="form-select border-0 shadow-none">
              <option value="pg">PG</option>
            </select>
          </div>

          <button
            className="btn btn-danger px-4"
            onClick={handleSearchButton}
          >
            <FontAwesomeIcon icon={faSearch} className="me-2" />
            <b>Search</b>
          </button>
        </div>

        <p className="mt-3">
          <span className="badge bg-danger me-2">New</span>
          <span className="fw-semibold">Join our growing community of students finding their perfect stay!</span>
        </p>
      </div>
    </div>
  );
};

export default Banner;
