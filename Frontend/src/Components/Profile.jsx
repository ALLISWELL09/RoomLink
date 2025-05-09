import React, { useState, useEffect, useRef } from "react";
import { Card, Col, Row, Image, Spinner, Alert, Form, Button, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from './Header';
import Footer from './Footer';
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Styles/Profile.css";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    mobile_no: "",
    totalBookings: 0,
    joinedDate: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_no: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef(null);

  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No user token found in localStorage');
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
      const response = await axios.get('http://localhost:4000/api/user/profile', {
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

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile_no: user.mobile_no || "",
      });
    }
  }, [user]);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      // Reset form data to current user data when entering edit mode
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile_no: user.mobile_no || "",
      });
    }
  };

  // Handle profile image click to open modal
  const handleProfileImageClick = () => {
    if (editMode) {
      setShowImageModal(true);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      updateProfileImage(e.target.files[0]);
      setShowImageModal(false);
    }
  };

  // Update profile image
  const updateProfileImage = async (file) => {
    setUpdateLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setUpdateLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('profile_pic', file);

      const response = await axios.put('http://localhost:4000/api/user/profile/update', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        toast.success('Profile image updated successfully!');
        fetchProfileData(); // Refresh profile data
      }
    } catch (err) {
      console.error('Error updating profile image:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile image');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setUpdateLoading(false);
        return;
      }

      // Validate form data
      if (!formData.name.trim()) {
        toast.error('Name cannot be empty');
        setUpdateLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        toast.error('Email cannot be empty');
        setUpdateLoading(false);
        return;
      }

      if (!formData.mobile_no) {
        toast.error('Mobile number cannot be empty');
        setUpdateLoading(false);
        return;
      }

      const response = await axios.put('http://localhost:4000/api/user/profile/update', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        toast.success('Profile updated successfully!');
        setEditMode(false);
        fetchProfileData(); // Refresh profile data
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container my-5 profile-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-danger">My Profile</h2>
          <div>
            {!editMode && (
              <button
                className="btn btn-sm btn-outline-danger me-2"
                onClick={toggleEditMode}
                disabled={loading}
              >
                <i className="bi bi-pencil me-1"></i> Edit Profile
              </button>
            )}
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
        </div>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="danger" />
            <p className="mt-2">Loading profile data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : editMode ? (
          // Edit Mode - Show Form
          <Card className="shadow-sm p-4">
            <Form onSubmit={handleSubmit}>
              <Row className="align-items-center">
                <Col md={3} className="text-center">
                  <div className="position-relative">
                    <Image
                      src={user.profileImage}
                      roundedCircle
                      fluid
                      className="profile-image edit-mode"
                      onClick={handleProfileImageClick}
                      onError={(e) => {
                        e.target.onerror = null;
                        const name = user.name || "User";
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e74c3c&color=fff&size=150`;
                      }}
                    />
                    <div className="image-overlay">
                      <i className="bi bi-camera"></i>
                      <span>Change Photo</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </Col>
                <Col md={9}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="mobile_no"
                      value={formData.mobile_no}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Row className="mb-3">
                    {user.totalBookings !== undefined && (
                      <Col md={6}>
                        <strong>Total Bookings:</strong> {user.totalBookings}
                      </Col>
                    )}
                  </Row>

                  {user.joinedDate && (
                    <Row className="mb-4">
                      <Col md={6}>
                        <strong>Member Since:</strong> {user.joinedDate}
                      </Col>
                    </Row>
                  )}

                  <div className="d-flex gap-2">
                    <Button
                      variant="danger"
                      type="submit"
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={toggleEditMode}
                      disabled={updateLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card>
        ) : (
          // View Mode - Show Profile
          <Card className="shadow-sm p-4">
            <Row className="align-items-center">
              <Col md={3} className="text-center">
                <Image
                  src={user.profileImage}
                  roundedCircle
                  fluid
                  className="profile-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    // Generate avatar based on name if image fails to load
                    const name = user.name || "User";
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

                {user.mobile_no && (
                  <Row className="mb-3">
                    <Col>
                      <strong>Mobile:</strong> {user.mobile_no}
                    </Col>
                  </Row>
                )}

                <Row className="mb-3">
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

      {/* Modal for changing profile picture */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Select a new profile picture:</p>
          <Form.Group>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
}
