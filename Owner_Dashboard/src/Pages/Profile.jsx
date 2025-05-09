import React, { useState, useEffect } from "react";
import { Card, Col, Row, Image, Spinner, Alert } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "../css/profile.css";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    totalRooms: 0,
    totalBookings: 0,
    joinedDate: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('ownerToken');
    if (!token) {
      console.warn('No owner token found in localStorage');
      return null;
    }
    return token;
  };

  // Function to fetch profile data
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch profile data
      console.log('Fetching profile data with token:', token);
      const response = await axios.get('http://localhost:4000/api/owner/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Profile data received:', response.data);

      if (response.data) {
        // Filter out any undefined or null values
        const filteredData = Object.fromEntries(
          Object.entries(response.data).filter(([_, value]) =>
            value !== null && value !== undefined && value !== ''
          )
        );
        setUser(filteredData);
      } else {
        setError('No profile data received from the server');
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.response?.data?.error || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="p-4 flex-grow-1 profile-container">
        <div className="d-flex justify-content-between align-items-center">
          <h4>Profile</h4>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={fetchProfileData}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Refreshing...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-repeat me-1"></i> Refresh
              </>
            )}
          </button>
        </div>
        <hr className="mb-4" />

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="danger" />
            <p className="mt-2">Loading profile data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Card className="shadow-sm p-4">
            <Row className="align-items-center">
              <Col md={3} className="text-center">
                <Image
                  src={user.profileImage}
                  roundedCircle
                  fluid
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    // Generate avatar based on name if image fails to load
                    const name = user.name || "Owner";
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e74c3c&color=fff&size=150`;
                  }}
                />
                {user.name && <p className="mt-3 fw-semibold">{user.name}</p>}
              </Col>
              <Col md={9}>
                {user.email && (
                  <Row className="mb-3">
                    <Col>
                      <strong>Email:</strong> {user.email}
                    </Col>
                  </Row>
                )}

                <Row className="mb-3">
                  {user.totalRooms !== undefined && (
                    <Col md={6}>
                      <strong>Total Rooms:</strong> {user.totalRooms}
                    </Col>
                  )}
                  {user.totalBookings !== undefined && (
                    <Col md={6}>
                      <strong>Total Bookings:</strong> {user.totalBookings}
                    </Col>
                  )}
                </Row>

                {user.joinedDate && (
                  <Row>
                    <Col md={6}>
                      <strong>Member Since:</strong> {user.joinedDate}
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </div>
  );
}
