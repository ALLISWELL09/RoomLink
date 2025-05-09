import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import {
  FaDownload, FaSpinner, FaExclamationTriangle, FaMapMarkerAlt,
  FaRupeeSign, FaCalendarAlt, FaInfoCircle, FaUser, FaCalendarCheck,
  FaMoneyBillWave, FaIdCard, FaTimes, FaStar, FaRestroom, FaCheck,
  FaWifi, FaShower, FaUtensils, FaLightbulb, FaCouch, FaFan
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Badge } from 'react-bootstrap';

const BookedRooms = () => {
  const [bookedRooms, setBookedRooms] = useState([]);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookedRooms = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to view your booked rooms");
        setLoading(false);
        navigate('/');
        return;
      }

      try {
        const response = await axios.get('http://localhost:4000/api/user/booked', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.roomsData) {
          setBookedRooms(response.data.roomsData);
          setBookingDetails(response.data.booked);
        } else {
          setBookedRooms([]);
          setBookingDetails([]);
        }
      } catch (err) {
        console.error("Error fetching booked rooms:", err);
        if (err.response && err.response.status === 400 &&
            err.response.data.error === "This User has not booked any room") {
          setError("You haven't booked any rooms yet.");
        } else {
          setError("Failed to load your booked rooms. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookedRooms();
  }, [navigate]);

  // Find booking details for a specific room
  const getBookingForRoom = (roomId) => {
    return bookingDetails.find(booking => booking.roomId === roomId);
  };

  // Handle opening the details modal
  const handleViewDetails = (room) => {
    const booking = getBookingForRoom(room._id);
    if (!booking) {
      alert("Booking details not found");
      return;
    }

    setSelectedRoom(room);
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Handle closing the details modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedRoom(null);
    setSelectedBooking(null);
  };

  // Generate and download invoice for a room
  const generateInvoice = (room) => {
    setGeneratingInvoice(true);

    const booking = getBookingForRoom(room._id);
    if (!booking) {
      alert("Booking details not found");
      setGeneratingInvoice(false);
      return;
    }

    const doc = new jsPDF();
    const invoiceDate = new Date().toLocaleDateString();
    const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}`;

    // Add Invoice Header with Red Theme
    doc.setFillColor(199, 0, 57); // Red color #C70039
    doc.rect(0, 0, 210, 40, "F"); // Full-width header
    doc.setTextColor(255, 255, 255); // White text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RoomLink Booking Invoice", 15, 25);

    // Add invoice number and date
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoiceNumber}`, 150, 15);
    doc.text(`Date: ${invoiceDate}`, 150, 22);

    // Customer and Payment Information Section
    doc.setTextColor(0, 0, 0); // Reset color to black
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Booking Information", 15, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Payment ID: ${booking.paymentId || 'N/A'}`, 15, 65);
    doc.text(`Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 15, 72);
    doc.text(`Booking Status: Confirmed`, 15, 79);

    // Room Details Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Room Details", 15, 95);

    // Invoice Table with Styling
    autoTable(doc, {
      startY: 100,
      head: [["Description", "Details"]],
      body: [
        ["Room Title", room.title || 'N/A'],
        ["Room Location", room.location || 'N/A'],
        ["Gender Preference", room.gender || 'N/A'],
        ["Rating", `${room.rating || 0}/5`],
        ["Amenities", room.amenities ? room.amenities.split(',').map(a => a.trim()).join(', ') : 'N/A'],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [199, 0, 57], textColor: 255, fontStyle: "bold" }, // Red header
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Light gray alternate rows
      tableLineColor: [199, 0, 57], // Table border color
      tableLineWidth: 0.5,
    });

    // Payment Details Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Payment Details", 15, doc.autoTable.previous.finalY + 20);

    // Payment Table
    autoTable(doc, {
      startY: doc.autoTable.previous.finalY + 25,
      head: [["Item", "Duration", "Rate", "Amount"]],
      body: [
        [
          "Room Rent",
          `${booking.duration || 1} ${booking.duration === 1 ? 'Month' : 'Months'}`,
          `Rs. ${room.price}/month`,
          `Rs. ${booking.amount || (room.price * (booking.duration || 1))}`
        ],
        ["", "", "Total Amount", `Rs. ${booking.amount || (room.price * (booking.duration || 1))}`]
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [199, 0, 57], textColor: 255, fontStyle: "bold" }, // Red header
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Light gray alternate rows
      tableLineColor: [199, 0, 57], // Table border color
      tableLineWidth: 0.5,
      foot: [["", "", "Payment Status", "Paid ✅"]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" }
    });

    // Add a decorative red line
    doc.setDrawColor(199, 0, 57);
    doc.setLineWidth(1);
    doc.line(15, doc.internal.pageSize.height - 40, 195, doc.internal.pageSize.height - 40);

    // Footer with Company Branding
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text("Thank you for booking with RoomLink!", 15, doc.internal.pageSize.height - 30);
    doc.text("For support, contact us at support@roomlink.com", 15, doc.internal.pageSize.height - 20);
    doc.text("This is a computer-generated invoice and does not require a signature.", 15, doc.internal.pageSize.height - 10);

    // Save the PDF
    doc.save(`RoomLink_Invoice_${room.title}_${invoiceNumber}.pdf`);
    setGeneratingInvoice(false);
  };

  return (
    <>
      <Header />
      <div className="container py-5 min-vh-100">
        <h2 className="text-center mb-4">Your Booked Rooms</h2>

        {loading ? (
          <div className="text-center py-5">
            <FaSpinner className="fa-spin mb-3" size={40} color="#dc3545" />
            <p>Loading your booked rooms...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <FaExclamationTriangle size={40} color="#dc3545" className="mb-3" />
            <p className="text-danger">{error}</p>
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() => navigate('/explore_room')}
            >
              Explore Rooms to Book
            </button>
          </div>
        ) : bookedRooms.length === 0 ? (
          <div className="text-center py-5">
            <p>You haven't booked any rooms yet.</p>
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() => navigate('/explore_room')}
            >
              Explore Rooms to Book
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {bookedRooms.map((room) => {
              const booking = getBookingForRoom(room._id);
              return (
                <div className="col-md-6 col-lg-4" key={room._id}>
                  <div className="card h-100 shadow-sm hover-shadow">
                    <div className="position-relative">
                      <img
                        src={room.image?.url}
                        className="card-img-top"
                        alt={room.title}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded">
                        Booked
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{room.title}</h5>

                      <div className="d-flex align-items-center mb-2">
                        <FaMapMarkerAlt className="text-secondary me-2" />
                        <span>{room.location}</span>
                      </div>

                      <div className="d-flex align-items-center mb-2">
                        <FaRupeeSign className="text-secondary me-2" />
                        <span>Rs. {booking?.amount || room.price}</span>
                      </div>

                      {booking && (
                        <div className="d-flex align-items-center mb-3">
                          <FaCalendarAlt className="text-secondary me-2" />
                          <span>Duration: {booking.duration || 1} {booking.duration === 1 ? 'Month' : 'Months'}</span>
                        </div>
                      )}

                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-outline-primary mb-2"
                          onClick={() => handleViewDetails(room)}
                        >
                          <FaInfoCircle className="me-2" />
                          View Details
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={() => generateInvoice(room)}
                          disabled={generatingInvoice}
                        >
                          {generatingInvoice ? (
                            <>
                              <FaSpinner className="fa-spin me-2" />
                              Generating Invoice...
                            </>
                          ) : (
                            <>
                              <FaDownload className="me-2" />
                              Download Invoice
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={handleCloseModal}
        centered
        size="lg"
      >
        <Modal.Header className="bg-light">
          <Modal.Title className="text-danger">
            <FaInfoCircle className="me-2" />
            Booking Details
          </Modal.Title>
          <Button
            variant="light"
            onClick={handleCloseModal}
            className="border-0 bg-transparent"
          >
            <FaTimes />
          </Button>
        </Modal.Header>

        <Modal.Body>
          {selectedRoom && selectedBooking && (
            <div className="room-details">
              {/* Hero Section with Image */}
              <div className="position-relative mb-4">
                <img
                  src={selectedRoom.image?.url}
                  alt={selectedRoom.title}
                  className="img-fluid rounded shadow"
                  style={{ width: "100%", height: "300px", objectFit: "cover" }}
                />
                <div className="position-absolute top-0 end-0 m-3">
                  <Badge bg="danger" className="px-3 py-2 fs-6">Booked</Badge>
                </div>
                <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-white p-3">
                  <h3 className="fw-bold mb-1">{selectedRoom.title}</h3>
                  <p className="mb-0"><FaMapMarkerAlt className="me-2" /> {selectedRoom.location}</p>
                </div>
              </div>

              {/* Description */}
              <div className="card border-0 shadow-sm rounded mb-4">
                <div className="card-body">
                  <h5 className="card-title border-bottom pb-2 mb-3">About this accommodation</h5>
                  <p className="card-text">{selectedRoom.description}</p>
                </div>
              </div>

              {/* Room Details */}
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <h5 className="border-bottom pb-2 mb-3">Room Details</h5>
                </div>

                {/* Price */}
                <div className="col-md-4">
                  <div className="d-flex align-items-center p-3 border rounded h-100">
                    <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                      <FaRupeeSign className="text-success" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Monthly Rent</small>
                      <span className="fw-bold text-success">Rs. {selectedBooking.amount || selectedRoom.price}</span>
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="col-md-4">
                  <div className="d-flex align-items-center p-3 border rounded h-100">
                    <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                      <FaRestroom className="text-info" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Gender Preference</small>
                      <span className="fw-bold">{selectedRoom.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="col-md-4">
                  <div className="d-flex align-items-center p-3 border rounded h-100">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                      <FaStar className="text-warning" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Rating</small>
                      <div className="d-flex align-items-center">
                        <span className="fw-bold me-2">{selectedRoom.rating}/5</span>
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < Math.floor(selectedRoom.rating) ? "text-warning" : "text-muted"}
                            size={14}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              {selectedRoom.amenities && (
                <div className="card border-0 shadow-sm rounded mb-4">
                  <div className="card-body">
                    <h5 className="card-title border-bottom pb-2 mb-3">Amenities</h5>
                    <div className="row g-3">
                      {selectedRoom.amenities.split(',').map((amenity, index) => {
                        // Choose an icon based on the amenity name
                        let icon = <FaCheck />;
                        const amenityLower = amenity.trim().toLowerCase();
                        if (amenityLower.includes('wifi')) icon = <FaWifi />;
                        else if (amenityLower.includes('bathroom') || amenityLower.includes('shower')) icon = <FaShower />;
                        else if (amenityLower.includes('kitchen') || amenityLower.includes('food')) icon = <FaUtensils />;
                        else if (amenityLower.includes('light') || amenityLower.includes('electricity')) icon = <FaLightbulb />;
                        else if (amenityLower.includes('furniture') || amenityLower.includes('sofa')) icon = <FaCouch />;
                        else if (amenityLower.includes('fan') || amenityLower.includes('ac') || amenityLower.includes('air')) icon = <FaFan />;

                        return (
                          <div key={index} className="col-md-6 col-lg-4">
                            <div className="d-flex align-items-center p-2 bg-light rounded">
                              <div className="text-danger me-2">{icon}</div>
                              <span>{amenity.trim()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Details */}
              <div className="card border-0 shadow-sm rounded">
                <div className="card-body">
                  <h5 className="card-title border-bottom pb-2 mb-3">Booking Information</h5>
                  <div className="row g-3">
                    {/* Duration */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 border rounded">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                          <FaCalendarAlt className="text-primary" />
                        </div>
                        <div>
                          <small className="text-muted d-block">Duration</small>
                          <span className="fw-bold">{selectedBooking.duration || 1} {selectedBooking.duration === 1 ? 'Month' : 'Months'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment ID */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 border rounded">
                        <div className="rounded-circle bg-secondary bg-opacity-10 p-2 me-3">
                          <FaIdCard className="text-secondary" />
                        </div>
                        <div>
                          <small className="text-muted d-block">Payment ID</small>
                          <span className="fw-bold text-truncate d-block" style={{maxWidth: "200px"}}>
                            {selectedBooking.paymentId || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Date */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 border rounded">
                        <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                          <FaCalendarCheck className="text-info" />
                        </div>
                        <div>
                          <small className="text-muted d-block">Booking Date</small>
                          <span className="fw-bold">{new Date(selectedBooking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 border rounded">
                        <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                          <FaUser className="text-success" />
                        </div>
                        <div>
                          <small className="text-muted d-block">Status</small>
                          <Badge bg="success" className="px-3 py-2">Confirmed</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          {selectedRoom && (
            <Button
              variant="danger"
              onClick={() => {
                generateInvoice(selectedRoom);
                handleCloseModal();
              }}
            >
              <FaDownload className="me-2" />
              Download Invoice
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
};

export default BookedRooms;
