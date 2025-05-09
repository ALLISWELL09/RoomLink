import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Row, Col, Card, Form, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { bhavnagarLocations } from '../data/locations';
import "../css/rooms.css";
import "../css/navbar.css";

export default function Rooms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // For add/edit room modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentRoom, setCurrentRoom] = useState(null);

  // For details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsRoom, setDetailsRoom] = useState(null);

  // Helper function to get appropriate icon for amenities
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase().trim();

    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return 'fas fa-wifi';
    if (amenityLower.includes('ac') || amenityLower.includes('air') || amenityLower.includes('conditioning')) return 'fas fa-snowflake';
    if (amenityLower.includes('tv') || amenityLower.includes('television')) return 'fas fa-tv';
    if (amenityLower.includes('laundry') || amenityLower.includes('washing')) return 'fas fa-tshirt';
    if (amenityLower.includes('kitchen') || amenityLower.includes('cook')) return 'fas fa-utensils';
    if (amenityLower.includes('parking')) return 'fas fa-parking';
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return 'fas fa-dumbbell';
    if (amenityLower.includes('security') || amenityLower.includes('guard')) return 'fas fa-shield-alt';
    if (amenityLower.includes('water') || amenityLower.includes('drinking')) return 'fas fa-tint';
    if (amenityLower.includes('furniture') || amenityLower.includes('furnished')) return 'fas fa-couch';
    if (amenityLower.includes('bathroom') || amenityLower.includes('toilet')) return 'fas fa-bath';
    if (amenityLower.includes('study') || amenityLower.includes('desk')) return 'fas fa-book';
    if (amenityLower.includes('balcony')) return 'fas fa-door-open';
    if (amenityLower.includes('cleaning') || amenityLower.includes('housekeeping')) return 'fas fa-broom';
    if (amenityLower.includes('food') || amenityLower.includes('meal')) return 'fas fa-hamburger';

    // Default icon if no match
    return 'fas fa-check-circle';
  };

  // Function to check if owner token exists and is valid
  const getAuthToken = () => {
    const token = localStorage.getItem('ownerToken');
    if (!token) {
      console.warn('No owner token found in localStorage');
      // The ProtectedRoute component will handle redirection
      return null;
    }
    return token;
  };

  // Fetch rooms from the backend
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    console.log('Fetching rooms...');
    setLoading(true);
    try {
      // Get token using our helper function
      const token = getAuthToken();
      console.log('Token available:', !!token);

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setRooms([]);
        setLoading(false);
        return;
      }

      // Log the request we're about to make
      console.log('Making request to:', 'http://localhost:4000/api/room/owner-rooms');
      console.log('With headers:', { Authorization: `Bearer ${token}` });

      const response = await axios.get('http://localhost:4000/api/room/owner-rooms', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Response received:', response);
      console.log('Rooms data:', response.data);

      // Check if we got an array
      if (Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} rooms`);
        setRooms(response.data);
      } else {
        console.error('Response data is not an array:', response.data);
        setRooms([]);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding a new room
  const handleAddRoom = () => {
    setCurrentRoom(null);
    setModalMode('add');
    setShowModal(true);
  };

  // Handle editing a room
  const handleEditRoom = (room) => {
    setCurrentRoom(room);
    setModalMode('edit');
    setShowModal(true);
  };

  // Handle viewing room details
  const handleViewDetails = (room) => {
    setDetailsRoom(room);
    setShowDetailsModal(true);
  };

  // Handle deleting a room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      const token = getAuthToken();

      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      console.log(`Deleting room with ID: ${roomId}`);
      await axios.delete(`http://localhost:4000/api/room/deleteRooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh the rooms list
      fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
      alert('Failed to delete room. Please try again.');
    }
  };

  // Handle toggling room availability
  const handleToggleAvailability = async (room) => {
    try {
      const token = getAuthToken();

      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      // Create FormData with updated availability (toggled from current state)
      const formData = new FormData();
      formData.append('title', room.title);
      formData.append('description', room.description);
      formData.append('location', room.location);
      formData.append('price', room.price);
      formData.append('gender', room.gender);
      formData.append('available', !room.available); // Toggle the current availability
      formData.append('amenities', room.amenities);
      formData.append('rating', room.rating);

      // Keep existing image
      if (room.image) {
        formData.append('keepExistingImage', 'true');
        formData.append('existingImageId', room.image.public_id);
        formData.append('existingImageUrl', room.image.url);
      }

      console.log(`Toggling availability for room ${room._id} from ${room.available} to ${!room.available}`);

      // Update the room in the database
      const response = await axios.put(
        `http://localhost:4000/api/room/updateRooms/${room._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Room availability update response:', response.data);

      // Update the local state to reflect the change immediately
      setRooms(rooms.map(r =>
        r._id === room._id ? { ...r, available: !r.available } : r
      ));

      // Show success message
      alert(`Room "${room.title}" is now ${!room.available ? 'Available' : 'Not Available'}`);


    } catch (err) {
      console.error('Error toggling room availability:', err);
      alert('Failed to update room availability. Please try again.');
    }
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const token = getAuthToken();

    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    try {
      setFormSubmitting(true);

      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('title', form.elements.title.value);
      formData.append('description', form.elements.description.value);
      formData.append('location', form.elements.location.value);
      formData.append('price', form.elements.price.value);
      formData.append('gender', form.elements.gender.value);
      formData.append('available', form.elements.available.value === 'true');
      formData.append('amenities', form.elements.amenities.value);
      formData.append('rating', form.elements.rating.value);

      let response;

      if (modalMode === 'add') {
        // For adding a new room, we must have an image
        if (!form.elements.image.files[0]) {
          alert('Please select an image for the room');
          setFormSubmitting(false);
          return;
        }

        // Add the image file to the form data
        formData.append('image', form.elements.image.files[0]);

        console.log('Adding new room with form data:', {
          title: form.elements.title.value,
          description: form.elements.description.value,
          location: form.elements.location.value,
          price: form.elements.price.value,
          gender: form.elements.gender.value,
          available: form.elements.available.value === 'true',
          amenities: form.elements.amenities.value,
          rating: form.elements.rating.value,
          image: 'File selected: ' + !!form.elements.image.files[0]
        });

        // Create new room
        try {
          console.log('Sending POST request to:', 'http://localhost:4000/api/room/createRooms');
          console.log('With token:', !!token);

          response = await axios.post(
            'http://localhost:4000/api/room/createRooms',
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          console.log('Room creation response:', response.data);
          alert('Room added successfully!');
        } catch (error) {
          console.error('Error in room creation:', error);
          console.error('Error response:', error.response?.data);
          throw error; // Re-throw to be caught by the outer catch block
        }
      } else {
        // Edit existing room
        if (form.elements.image.files[0]) {
          // If a new image is provided, use it
          formData.append('image', form.elements.image.files[0]);
          console.log('Using new image file for update');
        } else if (currentRoom?.image) {
          // If editing and no new image, keep the existing image
          // We need to handle this differently - don't append to formData
          // Instead, we'll add a flag to indicate we're keeping the existing image
          formData.append('keepExistingImage', 'true');
          formData.append('existingImageId', currentRoom.image.public_id);
          formData.append('existingImageUrl', currentRoom.image.url);
          console.log('Keeping existing image for update:', currentRoom.image);
        } else {
          alert('Please select an image for the room');
          setFormSubmitting(false);
          return;
        }

        console.log('Updating room with ID:', currentRoom._id);
        console.log('Form data keys:', [...formData.entries()].map(entry => `${entry[0]}: ${entry[1] instanceof File ? 'File' : entry[1]}`));

        try {
          response = await axios.put(
            `http://localhost:4000/api/room/updateRooms/${currentRoom._id}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          console.log('Room update response:', response.data);
          alert('Room updated successfully!');
        } catch (updateError) {
          console.error('Error in room update:', updateError);
          console.error('Error response:', updateError.response?.data);
          throw updateError; // Re-throw to be caught by the outer catch block
        }
      }

      console.log('Response:', response.data);

      // Reset form and close modal
      setShowModal(false);
      setCurrentRoom(null);
      setFormSubmitting(false);

      // Fetch rooms with a slight delay to ensure backend has processed the changes
      setTimeout(() => {
        fetchRooms();
      }, 500);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert(`Failed to ${modalMode === 'add' ? 'add' : 'update'} room. Please try again.`);
      setFormSubmitting(false);
    }
  };

  return (
    <div className='d-flex'>
      <div className='fixed-sidebar'>
        <Sidebar />
      </div>

      <div className='p-4 flex-grow-1 dashboard-container' style={{ marginLeft: '250px',width: '100%' }}>
        {/* Page Header */}
        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h4><i className="fas fa-door-open me-2"></i> Your Rooms</h4>
            <p className="mb-0 mt-1 text-white-50">Manage your property listings</p>
          </div>
          <Button
            variant="light"
            size="sm"
            onClick={fetchRooms}
            disabled={loading}
            className="rounded-pill px-3 py-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Refreshing...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt me-1"></i> Refresh
              </>
            )}
          </Button>
        </div>

        {/* Search and Add Room Section */}
        <div className="search-container">
          <Row className="align-items-center">
            <Col md={7} className="position-relative">
              <Form.Control
                type="text"
                placeholder="Find your rooms by title or area name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-room"
              />
              <i className="fas fa-search search-icon"></i>
            </Col>
            <Col md={5} className="text-end">
              <Button
                className="add-room-btn"
                onClick={handleAddRoom}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Please wait...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i> Add New Room
                  </>
                )}
              </Button>
            </Col>
          </Row>

          {filteredRooms.length > 0 && (
            <div className="mt-3 text-muted">
              <small>
                <i className="fas fa-info-circle me-1"></i>
                Showing {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'}
                {searchTerm && ` matching "${searchTerm}"`}
              </small>
            </div>
          )}
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div>
            <div className="text-center mb-4">
              <div className="spinner-border text-danger mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-danger fs-5">Loading your rooms...</p>
            </div>
            <Row>
              {Array(6).fill().map((_, index) => (
                <Col lg={4} md={6} key={index} className="mb-4">
                  <Card className="room-card h-100 skeleton-card">
                    <div className="skeleton-image"></div>
                    <Card.Body>
                      <div className="skeleton-text" style={{ width: "70%" }}></div>
                      <div className="skeleton-text" style={{ width: "50%" }}></div>
                      <div className="d-flex justify-content-between align-items-center my-3">
                        <div className="skeleton-text" style={{ width: "30%" }}></div>
                        <div className="skeleton-text" style={{ width: "25%" }}></div>
                      </div>
                      <div className="skeleton-text" style={{ width: "90%" }}></div>
                      <div className="skeleton-text" style={{ width: "60%" }}></div>
                      <div className="d-flex justify-content-between gap-2 mt-4">
                        <div className="skeleton-button" style={{ width: "48%" }}></div>
                        <div className="skeleton-button" style={{ width: "48%" }}></div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
        {error && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h5>Error Loading Rooms</h5>
            <p className="text-danger">{error}</p>
            <Button
              variant="outline-danger"
              size="sm"
              className="mt-3"
              onClick={fetchRooms}
            >
              <i className="fas fa-sync-alt me-1"></i> Try Again
            </Button>
          </div>
        )}

        {/* Debug Information - Remove in production */}
        {/* <div className="mb-3 p-3 border rounded bg-light">
          <h6>Debug Information:</h6>
          <p className="mb-1">Token Available: {getAuthToken() ? 'Yes' : 'No'}</p>
          <p className="mb-1">Owner ID: {localStorage.getItem('ownerId') || 'Not found'}</p>
          <p className="mb-1">Rooms Count: {rooms.length}</p>
          <p className="mb-1">Filtered Rooms Count: {filteredRooms.length}</p>
          <details>
            <summary>Room IDs (click to expand)</summary>
            <pre className="mt-2" style={{maxHeight: '100px', overflow: 'auto'}}>
              {JSON.stringify(rooms.map(r => ({id: r._id, title: r.title, ownerId: r.ownerId})), null, 2)}
            </pre>
          </details>
        </div> */}

        {/* Room Cards */}
        <Row>
          {!loading && filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Col lg={6} md={12} key={room._id} className="mb-4">
                <Card className="room-card h-100 expanded-card">
                  <div className="position-relative">
                    <div className="room-image-container">
                      <Card.Img
                        variant="top"
                        src={room.image?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={room.title}
                        className="room-image"
                      />
                      <div className="room-image-overlay"></div>
                    </div>



                    {/* Availability Badge */}
                    <span
                      className={`badge ${room.available ? 'badge-available' : 'badge-unavailable'} cursor-pointer`}
                      onClick={() => handleToggleAvailability(room)}
                      title="Click to toggle availability"
                    >
                      {room.available ? 'Available' : 'Not Available'} <i className="fas fa-exchange-alt ms-1" style={{ fontSize: '10px' }}></i>
                    </span>

                    {/* Gender Ribbon */}
                    {/* <div className={`gender-ribbon gender-${room.gender.toLowerCase()}`}>
                      <i className={`fas ${room.gender === 'Male' ? 'fa-mars' : room.gender === 'Female' ? 'fa-venus' : 'fa-venus-mars'}`}></i> {room.gender}
                    </div> */}

                    {/* Quick Actions Overlay */}

                  </div>

                  <Card.Body>
                    {/* Room Title with Rating */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title>{room.title}</Card.Title>
                      <div className="rating-badge">
                        <i className="fas fa-star"></i> {room.rating}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="room-location mb-2">
                      <i className="fas fa-map-marker-alt"></i> {room.location}
                    </div>

                    {/* Room Details Grid */}
                    <div className="room-details-grid mb-3">
                      <div className="detail-grid-item">
                        <div className="detail-icon">
                          <i className="fas fa-rupee-sign"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Price</div>
                          <div className="detail-value">₹{room.price}/mo</div>
                        </div>
                      </div>

                      <div className="detail-grid-item">
                        <div className="detail-icon">
                          <i className="fas fa-calendar-check"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Status</div>
                          <div className={`detail-value ${room.available ? 'text-success' : 'text-danger'}`}>
                            {room.available ? 'Available' : 'Unavailable'}
                          </div>
                        </div>
                      </div>

                      <div className="detail-grid-item">
                        <div className="detail-icon">
                          <i className="fas fa-venus-mars"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Gender</div>
                          <div className="detail-value">{room.gender}</div>
                        </div>
                      </div>

                      <div className="detail-grid-item">
                        <div className="detail-icon">
                          <i className="far fa-calendar-alt"></i>
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Created</div>
                          <div className="detail-value">{new Date(room.createdAt || Date.now()).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <div className="room-description mb-3">
                      <div className="section-label">
                        <i className="fas fa-align-left me-2"></i> Description
                      </div>
                      <p className="text-muted small">
                        {room.description.length > 120
                          ? `${room.description.substring(0, 120)}...`
                          : room.description}
                      </p>
                    </div>

                    {/* Amenities Section */}
                    <div className="room-amenities-section mb-3">
                      <div className="section-label">
                        <i className="fas fa-concierge-bell me-2"></i> Amenities
                      </div>
                      <div className="amenities-tags">
                        {room.amenities.split(',').map((amenity, index) => (
                          <span key={index} className="amenity-tag" title={amenity.trim()}>
                            <i className={`${getAmenityIcon(amenity.trim())} me-1`}></i>
                            {amenity.trim()}
                          </span>
                        ))}
                      </div>
                    </div>



                    {/* Action Buttons */}
                    <div className="d-flex justify-content-between gap-2 mt-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 action-btn"
                        onClick={() => handleEditRoom(room)}
                      >
                        <i className="fas fa-edit me-1"></i> Edit
                      </Button>
                      <Button
                        variant={room.available ? "outline-success" : "outline-warning"}
                        size="sm"
                        className="w-100 action-btn"
                        onClick={() => handleToggleAvailability(room)}
                      >
                        <i className={`fas ${room.available ? 'fa-check-circle' : 'fa-exclamation-circle'} me-1`}></i>
                        {room.available ? 'Available' : 'Unavailable'}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100 action-btn"
                        onClick={() => handleDeleteRoom(room._id)}
                      >
                        <i className="fas fa-trash me-1"></i> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            !loading && (
              <Col xs={12}>
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="fas fa-home"></i>
                  </div>
                  <h5>No Rooms Found</h5>
                  <p>
                    {searchTerm
                      ? `No rooms match your search for "${searchTerm}". Try a different search term or clear the search.`
                      : "You haven't added any rooms yet. Click the 'Add New Room' button to get started."}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="mt-3"
                      onClick={() => setSearchTerm("")}
                    >
                      <i className="fas fa-times me-1"></i> Clear Search
                    </Button>
                  )}
                </div>
              </Col>
            )
          )}
        </Row>
      </div>

      {/* Add/Edit Room Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        className="custom-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' ? (
              <><i className="fas fa-plus-circle me-2"></i> Add New Room</>
            ) : (
              <><i className="fas fa-edit me-2"></i> Edit Room</>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                type="text"
                placeholder="Enter room title"
                defaultValue={currentRoom?.title || ''}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                name="description"
                as="textarea"
                rows={3}
                placeholder="Enter room description"
                defaultValue={currentRoom?.description || ''}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <Form.Select
                    name="location"
                    defaultValue={currentRoom?.location || ''}
                    required
                  >
                    <option value="">Select location</option>
                    {bhavnagarLocations.map((location, index) => (
                      <option key={index} value={location}>
                        {location}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price (₹/month)</Form.Label>
                  <Form.Control
                    name="price"
                    type="number"
                    placeholder="Enter price"
                    defaultValue={currentRoom?.price || ''}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    defaultValue={currentRoom?.gender || ''}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Any">Any</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Availability</Form.Label>
                  <Form.Select
                    name="available"
                    defaultValue={currentRoom?.available ? 'true' : 'false'}
                    required
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Amenities</Form.Label>
              <Form.Control
                name="amenities"
                type="text"
                placeholder="Enter amenities (comma separated)"
                defaultValue={currentRoom?.amenities || ''}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating (1-5)</Form.Label>
              <Form.Control
                name="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                placeholder="Enter rating"
                defaultValue={currentRoom?.rating || ''}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                name="image"
                type="file"
                accept="image/*"
              />
              {modalMode === 'edit' && currentRoom?.image?.url && (
                <div className="mt-3">
                  <div className="current-image-preview">
                    <img
                      src={currentRoom.image.url}
                      alt="Current"
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="d-flex align-items-center mt-2">
                    <i className="fas fa-info-circle text-primary me-2"></i>
                    <p className="text-muted small mb-0">Current image (upload a new one to replace)</p>
                  </div>
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="outline-secondary"
                onClick={() => setShowModal(false)}
                disabled={formSubmitting}
                className="px-4"
              >
                <i className="fas fa-times me-2"></i> Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={formSubmitting}
                className="px-4"
              >
                {formSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {modalMode === 'add' ? 'Adding...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <i className={`fas ${modalMode === 'add' ? 'fa-plus' : 'fa-save'} me-2`}></i>
                    {modalMode === 'add' ? 'Add Room' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Room Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        className="custom-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-door-open me-2"></i> Room Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsRoom && (
            <div className="room-details">
              <div className="room-details-image mb-4">
                <img
                  src={detailsRoom.image?.url || 'https://via.placeholder.com/800x400?text=No+Image'}
                  alt={detailsRoom.title}
                  className="img-fluid rounded"
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                />
                <div className={`details-badge ${detailsRoom.available ? 'badge-available' : 'badge-unavailable'}`}>
                  {detailsRoom.available ? 'Available' : 'Not Available'}
                </div>
              </div>

              <h3 className="mb-3">{detailsRoom.title}</h3>

              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt text-danger me-2"></i>
                    <strong>Location:</strong> {detailsRoom.location}
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-rupee-sign text-danger me-2"></i>
                    <strong>Price:</strong> ₹{detailsRoom.price}/month
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-venus-mars text-danger me-2"></i>
                    <strong>Gender:</strong> {detailsRoom.gender}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-item">
                    <i className="fas fa-star text-warning me-2"></i>
                    <strong>Rating:</strong> {detailsRoom.rating}/5
                  </div>
                  <div className="detail-item">
                    <i className="far fa-calendar-alt text-danger me-2"></i>
                    <strong>Created:</strong> {new Date(detailsRoom.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-id-card text-danger me-2"></i>
                    <strong>ID:</strong> <small>{detailsRoom._id}</small>
                  </div>
                </div>
              </div>

              <div className="description-section mb-4">
                <h5 className="section-title"><i className="fas fa-align-left me-2"></i> Description</h5>
                <p>{detailsRoom.description}</p>
              </div>

              <div className="amenities-section mb-4">
                <h5 className="section-title"><i className="fas fa-concierge-bell me-2"></i> Amenities</h5>
                <div className="amenities-list">
                  {detailsRoom.amenities.split(',').map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <i className={`${getAmenityIcon(amenity.trim())} me-2`}></i>
                      {amenity.trim()}
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="outline-secondary"
                  className="me-2"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <i className="fas fa-times me-2"></i> Close
                </Button>
                <Button
                  variant="outline-primary"
                  className="me-2"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditRoom(detailsRoom);
                  }}
                >
                  <i className="fas fa-edit me-2"></i> Edit
                </Button>
                <Button
                  variant={detailsRoom.available ? "outline-danger" : "outline-success"}
                  onClick={() => {
                    handleToggleAvailability(detailsRoom);
                    setShowDetailsModal(false);
                  }}
                >
                  <i className={`fas ${detailsRoom.available ? 'fa-times-circle' : 'fa-check-circle'} me-2`}></i>
                  {detailsRoom.available ? 'Mark as Unavailable' : 'Mark as Available'}
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
