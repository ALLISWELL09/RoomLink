import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaStar, FaMapMarkerAlt, FaRupeeSign, FaRestroom, FaCheck } from "react-icons/fa";

// Custom CSS for card animations and effects
const cardStyles = {
  card: {
    transition: "all 0.3s ease",
    borderRadius: "12px",
    overflow: "hidden",
    height: "100%",
    border: "none"
  },
  cardHover: {
    transform: "translateY(-10px)",
    boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    height: "200px"
  },
  image: {
    transition: "transform 0.5s ease",
    height: "100%",
    width: "100%",
    objectFit: "cover"
  },
  imageHover: {
    transform: "scale(1.05)"
  },
  overlay: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
    padding: "20px 15px 10px",
    color: "white"
  },
  badge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: "1"
  },
  gender: {
    position: "absolute",
    top: "10px",
    left: "10px",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: "1",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "white"
  },
  cardBody: {
    padding: "20px"
  },
  price: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#dc3545"
  },
  location: {
    fontSize: "14px",
    color: "#6c757d",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center"
  },
  rating: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px"
  },
  starIcon: {
    color: "#ffc107",
    marginRight: "2px"
  },
  button: {
    borderRadius: "50px",
    padding: "8px 20px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    width: "100%"
  },
  buttonHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 5px 15px rgba(220, 53, 69, 0.3)"
  }
};


// const hostels = [
//   {
//     id: 1,
//     name: "Green Nest Hostel",
//     location: "Ahmedabad, Gujarat",
//     price: 4500,
//     roomType: "Shared Room",
//     rating: 4.5,
//     reviews: 120,
//     image: "https://yt3.googleusercontent.com/ytc/AIdro_nwR0ez6QXuhtkwhjQi3fANblOxuLiLFQ6wNCvU_F7_Eg=s900-c-k-c0x00ffffff-no-rj",
//   },
//   {
//     id: 2,
//     name: "Blue Sky PG",
//     location: "Surat, Gujarat",
//     price: 5500,
//     roomType: "Single Room",
//     rating: 4.2,
//     reviews: 85,
//     image: "https://content.jdmagicbox.com/comp/bhavnagar/d9/0278px278.x278.170603121710.u8d9/catalogue/t-k-hostel-sardarnagar-bhavnagar-hostels-4eqeveo3y7.jpg",
//   },
//   {
//     id: 3,
//     name: "Sunrise Hostel",
//     location: "Rajkot, Gujarat",
//     price: 4000,
//     roomType: "PG",
//     rating: 4.0,
//     reviews: 60,
//     image: "https://content.jdmagicbox.com/comp/bhavnagar/q1/0278px278.x278.170602221815.e9q1/catalogue/samras-government-boys-hostel-vidhya-nagar-bhavnagar-hostels-0uFcEGIGYO.jpg",
//   },
// ];


export default function HostelList() {
  const [rooms, setRooms] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:4000/api/room/getRooms");
        console.log("Response is: ", response.data);
        setRooms(response.data);
        setError(null);
      } catch (error) {
        console.log("Error is: ", error);
        setError("Failed to load hostels. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Function to render star ratings
  const renderStars = (rating) => {
    return (
      <div className="d-flex align-items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            style={{
              color: i < Math.floor(rating) ? "#ffc107" : "#e4e5e9",
              marginRight: "2px"
            }}
            size={14}
          />
        ))}
        <span className="ms-1 text-muted">({rating})</span>
      </div>
    );
  };

  // Function to determine if a room should be featured
  // Currently not using featured badges as per requirement
  const isFeatured = () => {
    return false;
  };

  return (
    <div className="container my-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold mb-2">🏠 Discover Your Perfect Stay</h2>
        <p className="text-muted">Browse our selection of quality accommodations</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading available hostels...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      ) : rooms.length > 0 ? (
        <div className="row g-4">
          {rooms.slice(0, 3).map((room, index) => (
            <div className="col-md-4 mb-4" key={room._id || index}>
              <div
                className="card shadow-sm h-100"
                style={{
                  ...cardStyles.card,
                  ...(hoveredCard === index ? cardStyles.cardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={cardStyles.imageContainer}>
                  {/* Gender Badge */}
                  {room.gender && (
                    <div style={cardStyles.gender}>
                      <FaRestroom className="me-1" />
                      {room.gender}
                    </div>
                  )}

                  {/* Featured Badge */}
                  {isFeatured(room, index) && (
                    <div
                      style={{
                        ...cardStyles.badge,
                        backgroundColor: "#dc3545",
                        color: "white"
                      }}
                    >
                      Featured
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div
                    style={{
                      ...cardStyles.badge,
                      backgroundColor: room.available ? "#28a745" : "#dc3545",
                      color: "white",
                      top: "10px"
                    }}
                  >
                    {room.available ? "Available" : "Booked"}
                  </div>

                  {/* Room Image */}
                  {room.image && room.image.url ? (
                    <img
                      src={room.image.url}
                      alt={room.title}
                      style={{
                        ...cardStyles.image,
                        ...(hoveredCard === index ? cardStyles.imageHover : {})
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        ...cardStyles.image,
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      No Image Available
                    </div>
                  )}

                  {/* Image Overlay with Title */}
                  <div style={cardStyles.overlay}>
                    <h5 className="fw-bold mb-0">{room.title}</h5>
                  </div>
                </div>

                <div style={cardStyles.cardBody}>
                  {/* Location */}
                  <div style={cardStyles.location}>
                    <FaMapMarkerAlt className="text-danger me-2" />
                    {room.location}
                  </div>

                  {/* Rating */}
                  <div style={cardStyles.rating}>
                    {renderStars(room.rating)}
                  </div>

                  {/* Price */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div style={cardStyles.price}>
                      <FaRupeeSign size={14} /> {room.price}
                      <span className="text-muted" style={{ fontSize: "14px" }}>/month</span>
                    </div>

                    {/* Amenities Preview */}
                    {room.amenities && (
                      <div className="text-muted" style={{ fontSize: "13px" }}>
                        <FaCheck className="text-success me-1" />
                        {room.amenities.split(',').length} amenities
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/room_details/${room._id}`}
                    className="btn btn-danger"
                    style={{
                      ...cardStyles.button,
                      ...(hoveredCard === index ? cardStyles.buttonHover : {})
                    }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="alert alert-info">
            <h4>No Hostels Available</h4>
            <p>Check back later for new listings.</p>
          </div>
        </div>
      )}

      {/* View More Button */}
      {rooms.length > 3 && (
        <div className="text-center mt-4">
          <Link to="/explore_room" className="btn btn-outline-danger px-4 py-2">
            View More Hostels
          </Link>
        </div>
      )}
    </div>
  );
}
