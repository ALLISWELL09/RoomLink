import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaMapMarkerAlt, FaMoneyBillWave,
  FaRestroom, FaStar, FaCheckCircle,
  FaArrowLeft, FaShieldAlt
} from "react-icons/fa";
import Header from "./Header";

// Custom CSS styles
const styles = {
  pageContainer: {
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    paddingBottom: "3rem"
  },
  roomImage: {
    height: "200px",
    objectFit: "cover",
    borderRadius: "8px"
  },
  formControl: {
    borderRadius: "8px",
    padding: "0.75rem",
    border: "1px solid #dee2e6"
  },
  payButton: {
    transition: "all 0.3s ease",
    fontWeight: "600"
  },
  summaryCard: {
    borderRadius: "12px",
    overflow: "hidden"
  }
};


const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/room/getRoomsById/${id}`,{
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        if (response.data && response.data.room) {
          setRoom(response.data.room);

          // Check if room is available
          if (!response.data.room.available) {
            setError("This room is not available for booking.");
          }
        } else {
          setError("Room details not found.");
        }
      } catch (err) {
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
        setError("Please log in to book a room.");
        return;
      }

      try {
        // Get user's booked rooms
        const response = await axios.get('http://localhost:4000/api/user/booked', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Check if this room is in the user's booked rooms
        if (response.data && response.data.roomsData) {
          const isPurchased = response.data.roomsData.some(room => room._id === id);
          if (isPurchased) {
            setAlreadyPurchased(true);
            setError("You have already booked this room. You cannot book the same room twice.");
          }
        }
      } catch (err) {
        console.error("Error checking purchase status:", err);
        // If we get a 400 error with "This User has not booked any room", it means the user hasn't booked any rooms
        // This is not an error for our purposes
        if (!(err.response && err.response.status === 400 &&
            err.response.data.error === "This User has not booked any room")) {
          setError("Error checking booking status. Please try again later.");
        }
      }
    };

    if (room && room._id) {
      checkPurchaseStatus();
    }
  }, [id, room]);

  // Form state
  const [formData, setFormData] = useState({
    duration: "1"
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Calculate total amount
  const calculateTotal = () => {
    return room.price * parseInt(formData.duration);
  };

  const handlePayment = async () => {
    // Check if user has already purchased this room
    if (alreadyPurchased) {
      alert("You have already booked this room. You cannot book the same room twice.");
      return;
    }

    // Check if room is available
    if (room && !room.available) {
      alert("This room is not available for booking.");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to book a room.");
      return;
    }

    setPaymentLoading(true);
    try {
      // Calculate total amount based on duration
      const totalAmount = calculateTotal();

      // Get user ID from token (you might need to implement a function to decode the token)
      // For now, we'll use the token for authentication in the backend

      // Create an order on the backend
      const { data } = await axios.post("http://localhost:4000/api/payment/order", {
        amount: totalAmount,
        currency: "INR",
        userId: "67cdbb45e123ccfa9406822e", // This should be replaced with the actual user ID
      });

      if (!data.order) {
        alert("Error creating payment order.");
        return;
      }

      // Open Razorpay Payment Modal
      const options = {
        key: `rzp_test_7wStS7YUnReJ6E`, // Add key to .env file
        amount: data.order.amount,
        currency: data.order.currency,
        name: "RoomLink",
        description: `Room Booking - ${room.title} for ${formData.duration} month(s)`,
        order_id: data.order.id,
        handler: async (response) => {
          console.log("Payment Success:", response);

          try {
            // Verify payment on the backend
            await axios.post("http://localhost:4000/api/payment/verify", {
              order_id: data.order.id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            // Get the user token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
              console.error("User token not found. User might not be logged in.");
              alert("Please log in to complete your booking.");
              return;
            }

            // Calculate total amount based on duration
            const totalAmount = calculateTotal();

            // Purchase the room with payment details
            const purchaseResponse = await axios.post(
              `http://localhost:4000/api/room/buy/${id}`,
              {
                paymentId: response.razorpay_payment_id,
                amount: totalAmount,
                duration: parseInt(formData.duration)
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            console.log("Room purchase response:", purchaseResponse.data);

            alert("Payment Successful! Room booked successfully.");
            navigate(`/thank-you?roomId=${id}&paymentId=${response.razorpay_payment_id}`);
          } catch (error) {
            console.error("Error completing booking:", error);

            // Check if it's already purchased by this user
            if (error.response && error.response.status === 400 &&
                error.response.data.error === "User already Purchased this room") {
              alert("You have already booked this room. You cannot book the same room twice.");
            } else {
              alert("Payment was successful, but there was an error completing your booking. Please contact support.");
            }
          }
        },

        theme: { color: "#28a745" },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert("Payment failed. Please try again.");
        console.error("Payment Failed:", response.error);
        setPaymentLoading(false);
      });
      rzp1.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment failed, please try again.");
      setPaymentLoading(false);
    }
  };

  // Loading states
  if (loading) {
    return (
      <>
        <Header />
        <div className="container my-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border text-primary mb-4" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="text-center text-muted">Loading booking details...</h3>
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

  return (
    <>
      <Header />
      <div style={styles.pageContainer}>
        <div className="container py-5">
          {/* Back button */}
          <Link to={`/room_details/${id}`} className="btn btn-outline-secondary mb-4">
            <FaArrowLeft className="me-2" /> Back to Room Details
          </Link>

          <div className="row g-4">
            {/* Left Column - Booking Form */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-header bg-white p-4 border-0">
                  <h2 className="card-title fw-bold text-primary mb-0">Booking Details</h2>
                </div>
                <div className="card-body p-4">
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <img
                        src={room.image.url}
                        alt={room.title}
                        className="img-fluid w-100 mb-3 mb-md-0"
                        style={styles.roomImage}
                      />
                    </div>
                    <div className="col-md-8">
                      <h4 className="fw-bold">{room.title}</h4>
                      <p className="text-muted mb-2">
                        <FaMapMarkerAlt className="me-2" />{room.location}
                      </p>
                      <p className="mb-2">
                        <FaMoneyBillWave className="me-2 text-success" />
                        <span className="fw-semibold text-success">Rs. {room.price}/month</span>
                      </p>
                      <p className="mb-2">
                        <FaRestroom className="me-2 text-info" />
                        <span>Gender: {room.gender}</span>
                      </p>
                      <p className="mb-0">
                        <FaStar className="me-2 text-warning" />
                        <span>Rating: {room.rating}/5</span>
                      </p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Duration Selection */}
                  <h4 className="mb-4">Booking Options</h4>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="duration" className="form-label">Duration (months)</label>
                        <select
                          className="form-select"
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          style={styles.formControl}
                        >
                          <option value="1">1 Month</option>
                          <option value="3">3 Months</option>
                          <option value="6">6 Months</option>
                          <option value="12">12 Months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-4">
                  <h4 className="card-title mb-4">Room Amenities</h4>
                  <div className="row g-3">
                    {room.amenities.split(',').map((amenity, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="d-flex align-items-center p-3 rounded-4 bg-light">
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
            </div>

            {/* Right Column - Payment Summary */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{...styles.summaryCard, top: "20px"}}>
                <div className="card-header bg-primary text-white p-4 border-0">
                  <h3 className="card-title mb-0">Payment Summary</h3>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Room Rent</span>
                    <span className="fw-semibold">Rs. {room.price}/month</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Duration</span>
                    <span className="fw-semibold">{formData.duration} month(s)</span>
                  </div>
                  <hr className="my-3" />
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="fw-bold">Total Amount</span>
                    <span className="fw-bold fs-4 text-success">Rs. {calculateTotal()}</span>
                  </div>

                  <button
                    className="btn btn-success w-100 fw-semibold py-3 rounded-pill mb-3"
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    style={styles.payButton}
                  >
                    {paymentLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </button>

                  <div className="d-flex align-items-center justify-content-center text-muted small">
                    <FaShieldAlt className="me-2" />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Booking;
