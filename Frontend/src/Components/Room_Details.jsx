import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {Link} from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaMapMarkerAlt, FaMoneyBillWave, FaBed, FaStar,
  FaUser, FaPhone, FaEnvelope, FaCheckCircle,
  FaRestroom
} from "react-icons/fa";
import Header from "./Header";

// Custom CSS styles
const styles = {
  heroImage: {
    height: "400px",
    objectFit: "cover",
    transition: "transform 0.3s ease"
  },
  heroCard: {
    overflow: "hidden"
  },
  badge: {
    fontSize: "0.9rem",
    fontWeight: "500",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  amenityItem: {
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default"
  },
  bookingCard: {
    top: "20px",
    transition: "transform 0.2s ease"
  },
  bookButton: {
    transition: "all 0.2s ease",
    fontWeight: "600"
  }
};

export default function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);

  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        console.log("Fetching room details for ID:", id);
        const response = await axios.get(`http://localhost:4000/api/room/getRoomsById/${id}`);

        console.log("API Response:", response.data);

        if (response.data && response.data.room) {
          setRoom(response.data.room); // Adjusting in case data is wrapped inside "room"
        } else {
          setError("Room details not found.");
        }
      } catch (err) {
        console.error("Error fetching room details:", err);
        setError("Failed to load room details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  // Check if user has already purchased this room
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token found, user not logged in");
        return;
      }

      setCheckingPurchase(true);
      try {
        // Get user's booked rooms
        const response = await axios.get('http://localhost:4000/api/user/booked', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("User's booked rooms:", response.data);

        // Check if this room is in the user's booked rooms
        if (response.data && response.data.roomsData) {
          const isPurchased = response.data.roomsData.some(room => room._id === id);
          setAlreadyPurchased(isPurchased);
          console.log("Room already purchased:", isPurchased);
        }
      } catch (err) {
        console.error("Error checking purchase status:", err);
        // If we get a 400 error with "This User has not booked any room", it means the user hasn't booked any rooms
        if (err.response && err.response.status === 400 &&
            err.response.data.error === "This User has not booked any room") {
          setAlreadyPurchased(false);
        }
      } finally {
        setCheckingPurchase(false);
      }
    };

    if (room && room._id) {
      checkPurchaseStatus();
    }
  }, [id, room]);

  useEffect(() => {
    console.log("Updated Room State:", room);
  }, [room]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container my-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border text-primary mb-4" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="text-center text-muted">Loading room details...</h3>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container my-5 text-center" style={{ minHeight: "60vh" }}>
          <div className="alert alert-danger p-5 shadow-sm rounded-4 d-inline-block">
            <h3 className="mb-3">Error</h3>
            <p className="mb-0 fs-5">{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!room || Object.keys(room).length === 0) {
    return (
      <>
        <Header />
        <div className="container my-5 text-center" style={{ minHeight: "60vh" }}>
          <div className="alert alert-warning p-5 shadow-sm rounded-4 d-inline-block">
            <h3 className="mb-3">Not Found</h3>
            <p className="mb-0 fs-5">Room details not found.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container my-5">
        {/* Hero Section with Image and Quick Info */}
        <div className="card border-0 overflow-hidden shadow-lg rounded-4 mb-5" style={styles.heroCard}>
          <div className="position-relative">
            <img
              src={room.image.url || "https://via.placeholder.com/1200x600"}
              alt={room.title || "Room"}
              className="card-img-top"
              style={styles.heroImage}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            />
            <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between">
              <span
                className={`badge ${room.available ? 'bg-success' : 'bg-danger'} px-3 py-2 rounded-pill shadow`}
                style={styles.badge}
              >
                {room.available ? "Available" : "Not Available"}
              </span>
              <span
                className="badge bg-info px-3 py-2 rounded-pill shadow"
                style={styles.badge}
              >
                <FaRestroom className="me-1" /> {room.gender || "Any"}
              </span>
            </div>
            <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-white p-3">
              <h1 className="display-6 fw-bold">{room.title || "Room Details"}</h1>
              <p className="mb-0"><FaMapMarkerAlt className="me-2" /> {room.location || "Location not available"}</p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column - Details */}
          <div className="col-lg-8">
            {/* Description Card */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
              <div className="card-body p-4">
                <h3 className="card-title border-bottom pb-3 mb-3">About this accommodation</h3>
                <p className="card-text fs-5">{room.description || "No description available."}</p>
              </div>
            </div>

            {/* Amenities Section */}
            {room.amenities && (
              <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div className="card-body p-4">
                  <h3 className="card-title border-bottom pb-3 mb-4">🏡 Amenities</h3>
                  <div className="row g-3">
                    {room.amenities.split(',').map((amenity, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div
                          className="d-flex align-items-center p-3 rounded-4 bg-light h-100"
                          style={styles.amenityItem}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                            <FaCheckCircle className="text-success" />
                          </div>
                          <span className="fw-medium">{amenity.trim()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Room Details Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-4">
                <h3 className="card-title border-bottom pb-3 mb-4">Room Details</h3>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-4">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                        <FaMapMarkerAlt className="text-primary" />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Location</h6>
                        <p className="fw-semibold fs-5 mb-0">{room.location}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                        <FaMoneyBillWave className="text-success" />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Monthly Rent</h6>
                        <p className="fw-semibold fs-5 mb-0 text-success">Rs. {room.price}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-4">
                      <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                        <FaRestroom className="text-info" />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Gender Preference</h6>
                        <p className="fw-semibold fs-5 mb-0">{room.gender}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                        <FaStar className="text-warning" />
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Rating</h6>
                        <div className="d-flex align-items-center">
                          <p className="fw-semibold fs-5 mb-0 me-2">{room.rating}/5</p>
                          <div>
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={i < Math.floor(room.rating) ? "text-warning" : "text-muted"} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="col-lg-4">
            <div
              className="card border-0 shadow-lg rounded-4 sticky-top"
              style={styles.bookingCard}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="card-body p-4">
                <h3 className="card-title text-center mb-4">Book This Room</h3>
                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 mb-3">
                  <span className="fw-medium">Price:</span>
                  <span className="fw-bold fs-4 text-success">Rs. {room.price}/month</span>
                </div>
                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 mb-4">
                  <span className="fw-medium">Rating:</span>
                  <div className="d-flex align-items-center">
                    <span className="fw-bold me-2">{room.rating}/5</span>
                    <FaStar className="text-warning" />
                  </div>
                </div>
                {checkingPurchase ? (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 mb-0">Checking booking status...</p>
                  </div>
                ) : alreadyPurchased ? (
                  <div className="alert alert-info text-center py-3 mb-0">
                    <div className="mb-2"><FaCheckCircle className="me-2" />Already Booked</div>
                    <p className="small mb-0">You have already booked this room. You cannot book the same room twice.</p>
                  </div>
                ) : room.available ? (
                  <>
                    <Link
                      to={`/booking/${id}`}
                      className="btn btn-success w-100 fw-semibold py-3 rounded-pill shadow-sm mb-3 d-flex align-items-center justify-content-center"
                      style={styles.bookButton}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                      }}
                    >
                      <span className="fs-5">📩 Book Now</span>
                    </Link>
                    <p className="text-center text-muted small mt-3 mb-0">Secure booking • Instant confirmation</p>
                  </>
                ) : (
                  <div className="alert alert-danger text-center py-3 mb-0">
                    <div className="mb-2"><FaUser className="me-2" />Room Not Available</div>
                    <p className="small mb-0">This room is currently occupied and cannot be booked.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
