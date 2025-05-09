import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaCheckCircle, FaDownload, FaHome, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaReceipt } from "react-icons/fa";

const ThankYou = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get("roomId");
  const paymentId = queryParams.get("paymentId");

  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/room/getRoomsById/${roomId}`);
        setRoomDetails(response.data.room);
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  // Function to generate and download a professional invoice
  const generateInvoice = () => {
    const doc = new jsPDF();

    // 🏷️ Add Invoice Header with Red Theme
    doc.setFillColor(199, 0, 57); // Red color #C70039
    doc.rect(0, 0, 210, 40, "F"); // Full-width header
    doc.setTextColor(255, 255, 255); // White text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RoomLink Booking Invoice", 15, 25);

    // Add logo placeholder (if available)
    // doc.addImage(logoDataUrl, 'PNG', 160, 10, 30, 20);

    // 🏷️ Booking Details Section
    doc.setTextColor(0, 0, 0); // Reset color to black
    doc.setFontSize(12);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 15, 50);
    doc.text(`Payment ID: ${paymentId}`, 15, 60);

    // 📜 Invoice Table with Styling
    autoTable(doc, {
      startY: 75,
      head: [["Description", "Details"]],
      body: [
        ["Room Location", roomDetails?.location || "N/A"],
        ["Amount Paid", `Rs. ${roomDetails?.price || 0}`],
        ["Payment Status", "Paid ✅"],
        ["Booking Date", new Date().toLocaleDateString()],
      ],
      theme: "grid",
      styles: { fontSize: 12, cellPadding: 6 },
      headStyles: { fillColor: [199, 0, 57], textColor: 255, fontStyle: "bold" }, // Red header
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Light gray alternate rows
      tableLineColor: [199, 0, 57], // Table border color
      tableLineWidth: 0.5,
    });

    // Add a decorative red line
    doc.setDrawColor(199, 0, 57);
    doc.setLineWidth(1);
    doc.line(15, doc.internal.pageSize.height - 40, 195, doc.internal.pageSize.height - 40);

    // 🏷️ Footer with Company Branding
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text("Thank you for booking with RoomLink!", 15, doc.internal.pageSize.height - 30);
    doc.text("For support, contact us at support@roomlink.com", 15, doc.internal.pageSize.height - 20);

    // 💾 Save the PDF
    doc.save(`RoomLink_Invoice_${paymentId}.pdf`);
  };

  if (loading) return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="text-center p-5 shadow-lg rounded-4 animate__animated animate__fadeIn">
        <div className="spinner-border text-danger" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fs-5 text-danger">Loading booking details...</p>
        <div className="progress mt-3" style={{ height: "8px" }}>
          <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" style={{ width: "100%" }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container my-5" style={{ maxWidth: "800px" }}>
      {/* Success Card */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        {/* Success Header */}
        <div className="card-header bg-success text-white text-center p-4">
          <FaCheckCircle size={60} className="mb-3 animate__animated animate__bounceIn" />
          <h2 className="fw-bold mb-0 animate__animated animate__fadeIn animate__delay-1s">Thank You for Your Booking!</h2>
          <p className="mb-0 mt-2 animate__animated animate__fadeIn animate__delay-1s">Your payment was successful</p>
        </div>

        <div className="card-body p-4">
          {/* Booking Details */}
          <div className="bg-light p-4 rounded-4 mb-4 animate__animated animate__fadeInUp animate__delay-1s">
            <h4 className="text-center mb-4 fw-bold text-danger">Booking Details</h4>

            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-danger p-2 rounded-circle text-white me-3">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-muted mb-0">Room Location</p>
                    <h5 className="mb-0">{roomDetails?.location || "N/A"}</h5>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-danger p-2 rounded-circle text-white me-3">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <p className="text-muted mb-0">Amount Paid</p>
                    <h5 className="mb-0">Rs. {roomDetails?.price || "0"}</h5>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-danger p-2 rounded-circle text-white me-3">
                    <FaReceipt />
                  </div>
                  <div>
                    <p className="text-muted mb-0">Payment ID</p>
                    <h5 className="mb-0">{paymentId || "N/A"}</h5>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-danger p-2 rounded-circle text-white me-3">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <p className="text-muted mb-0">Booking Date</p>
                    <h5 className="mb-0">{new Date().toLocaleDateString()}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

         

          {/* Action Buttons */}
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4 animate__animated animate__fadeInUp animate__delay-2s">
            <button
              className="btn btn-danger btn-lg"
              onClick={generateInvoice}
              style={{
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FaDownload className="me-2" /> Download Invoice
            </button>

            <Link
              to="/home"
              className="btn btn-outline-success btn-lg"
              style={{
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FaHome className="me-2" /> Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
