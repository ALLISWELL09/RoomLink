import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaRupeeSign, FaUser, FaSearch, FaFilter, FaHome } from "react-icons/fa";

// Custom CSS styles
const styles = {
  pageContainer: {
    backgroundColor: "#f8f9fa",
    minHeight: "calc(100vh - 80px)",
    paddingBottom: "3rem"
  },
  filterCard: {
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease"
  },
  sectionTitle: {
    color: "#dc3545",
    fontWeight: "600",
    position: "relative",
    paddingBottom: "10px"
  },
  roomCard: {
    height: "100%",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    borderRadius: "12px",
    overflow: "hidden",
    border: "none"
  },
  roomImage: {
    height: "200px",
    objectFit: "cover",
    transition: "transform 0.5s ease"
  },
  badge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "500",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  amenityTag: {
    background: "#f8f9fa",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem",
    border: "1px solid #e9ecef",
    transition: "background 0.2s ease"
  },
  viewButton: {
    borderRadius: "8px",
    padding: "0.6rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 5px rgba(220,53,69,0.2)"
  },
  locationIcon: {
    background: "#dc3545",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "12px",
    color: "white"
  },
  skeletonCard: {
    height: "100%",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    border: "none"
  },
  skeletonImage: {
    height: "200px",
    backgroundColor: "#e9ecef",
    animation: "pulse 1.5s infinite ease-in-out"
  },
  skeletonText: {
    height: "20px",
    backgroundColor: "#e9ecef",
    marginBottom: "10px",
    borderRadius: "4px",
    animation: "pulse 1.5s infinite ease-in-out"
  }
};

export default function Explore_Room() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialLocation = queryParams.get("location") || "";
  const initialBudget = queryParams.get("budget") || 20000;

  const [allRooms, setAllRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchLocation, setSearchLocation] = useState(initialLocation);
  const [maxPrice, setMaxPrice] = useState(initialBudget);
  const [selectedGender, setSelectedGender] = useState("All");
  const [loading, setLoading] = useState(true);

  // Fetch room data from API
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:4000/api/room/getRooms");
        console.log("Response is:", response.data);
        setAllRooms(response.data);
        setFilteredRooms(response.data);
      } catch (error) {
        console.log("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Apply filters when inputs change
  useEffect(() => {
    const filtered = allRooms.filter(
      (room) =>
        room.location.toLowerCase().includes(searchLocation.toLowerCase()) &&
        room.price <= Number(maxPrice) &&
        (selectedGender === "All" || room.gender === selectedGender)
    );
    setFilteredRooms(filtered);
  }, [searchLocation, maxPrice, selectedGender, allRooms]);

  // Skeleton loading component
  const RoomSkeleton = () => (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm" style={styles.skeletonCard}>
        <div style={styles.skeletonImage}></div>
        <div className="card-body p-4">
          <div style={{...styles.skeletonText, width: "70%"}}></div>
          <div style={{...styles.skeletonText, width: "50%"}}></div>
          <div style={{...styles.skeletonText, width: "90%"}}></div>
          <div style={{...styles.skeletonText, width: "100%"}}></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div style={styles.pageContainer}>
        <div className="container py-4" style={{ maxWidth: "1200px" }}>
          {/* Page Title */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex align-items-center">
                <FaHome size={28} className="text-danger me-3" />
                <h2 className="mb-0" style={{fontWeight: "700"}}>Explore Rooms</h2>
              </div>
              <p className="text-muted mt-2">Find your perfect room with our advanced filters</p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="card p-4 mb-5" style={styles.filterCard}>
            <h5 className="mb-4" style={styles.sectionTitle}>
              <FaFilter className="me-2" /> Filter Options
            </h5>
            <div className="row g-4">
              {/* Search by Location */}
              <div className="col-md-4">
                <label className="form-label fw-medium">Location</label>
                <div className="input-group">
                  <span className="input-group-text bg-danger text-white">
                    <FaMapMarkerAlt />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter area name in Bhavnagar..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Max Price Filter */}
              <div className="col-md-4">
                <label className="form-label fw-medium">Budget: ₹{maxPrice}</label>
                <div className="px-2">
                  <input
                    type="range"
                    className="form-range"
                    min="1000"
                    max="20000"
                    step="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{ accentColor: "#dc3545" }}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">₹1,000</small>
                    <small className="text-muted">₹20,000</small>
                  </div>
                </div>
              </div>

              {/* Gender Filter */}
              <div className="col-md-4">
                <label className="form-label fw-medium">Gender Preference</label>
                <div className="input-group">
                  <span className="input-group-text bg-danger text-white">
                    <FaUser />
                  </span>
                  <select
                    className="form-select"
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                  >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">
              <span className="text-danger fw-bold">{filteredRooms.length}</span> {filteredRooms.length === 1 ? 'Room' : 'Rooms'} Found
            </h5>
            <div className="text-muted small">
              <FaSearch className="me-1" /> Showing results for {searchLocation ? `"${searchLocation}"` : 'all locations'}
            </div>
          </div>

          {/* Display Filtered Rooms or Loading Skeletons */}
          <div className="row">
            {loading ? (
              // Show skeleton loading when fetching data
              Array(6).fill().map((_, index) => <RoomSkeleton key={index} />)
            ) : filteredRooms.length > 0 ? (
              // Show rooms when data is available
              filteredRooms.map((room) => (
                <div key={room._id || room.id} className="col-md-4 mb-4">
                  <div
                    className="card shadow-sm"
                    style={styles.roomCard}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={room.image.url}
                        className="card-img-top"
                        alt={room.title}
                        style={styles.roomImage}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      <div
                        className={`badge ${room.available ? 'bg-success' : 'bg-danger'}`}
                        style={styles.badge}
                      >
                        {room.available ? "Available" : "Occupied"}
                      </div>
                    </div>

                    <div className="card-body p-4">
                      <h5 className="card-title mb-3" style={{ fontWeight: "600" }}>
                        {room.title}
                      </h5>

                      <div className="room-details mb-4">
                        {/* Price and Gender */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center">
                            <FaRupeeSign className="text-danger me-1" />
                            <span className="fw-bold">₹{room.price.toLocaleString()}</span>
                            <span className="text-muted ms-1">/month</span>
                          </div>

                          <span className="badge bg-light text-dark border">
                            <FaUser className="me-1" />
                            {room.gender}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="location-section p-3 mb-3 bg-light rounded">
                          <div className="d-flex align-items-center">
                            <div style={styles.locationIcon}>
                              <FaMapMarkerAlt />
                            </div>
                            <div>
                              <div className="text-muted small">Location</div>
                              <div className="fw-medium">{room.location}</div>
                            </div>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="amenities-section">
                          <div className="text-muted small mb-2">Amenities:</div>
                          <div className="d-flex flex-wrap gap-2">
                            {room.amenities.split(',').map((amenity, index) => (
                              <span
                                key={index}
                                style={styles.amenityTag}
                                onMouseOver={(e) => e.target.style.background = '#e9ecef'}
                                onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
                              >
                                {amenity.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Link
                        className="btn btn-danger w-100"
                        to={`/room_details/${room._id}`}
                        style={styles.viewButton}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Show message when no rooms match the filters
              <div className="col-12 text-center py-5">
                <div className="mb-4">
                  <FaSearch size={40} className="text-muted" />
                </div>
                <h5 className="text-muted">No rooms found matching your criteria</h5>
                <p className="text-muted">Try adjusting your filters to see more results</p>
              </div>
            )}
          </div>

          {/* Pagination removed as requested */}
        </div>
      </div>

      {/* CSS for skeleton animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
}
