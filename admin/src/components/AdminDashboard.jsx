import { useState, useEffect, useCallback } from 'react';
import { Container, Navbar, Nav, Row, Col, Card, Alert, Badge, ListGroup, Button, Spinner, Modal, Form, Table } from 'react-bootstrap';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalOwners: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // State for owner details modal
  const [showOwnersModal, setShowOwnersModal] = useState(false);
  const [ownersData, setOwnersData] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);



  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.warn('No admin token found in localStorage');
      return null;
    }
    return token;
  };

  // Function to fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        navigate('/admin/login');
        return;
      }

      // Fetch dashboard stats
      console.log('Fetching dashboard stats with token:', token);
      const statsResponse = await axios.get('http://localhost:4000/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true // Include cookies in the request
      });

      console.log('Dashboard data received:', statsResponse.data);

      if (!statsResponse.data) {
        console.error('No data received from the server');
        setError('No data received from the server. Please try again later.');
        setLoading(false);
        return;
      }

      // Fetch owners count
      let totalOwners = 0;
      try {
        const ownersResponse = await axios.get('http://localhost:4000/api/admin/owner', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true // Include cookies in the request
        });

        console.log('Owners data received:', ownersResponse.data);
        totalOwners = ownersResponse.data?.totalOwners || 0;
      } catch (ownerErr) {
        // If 404 "No owners found", that's okay - just set totalOwners to 0
        if (ownerErr.response && ownerErr.response.status === 404) {
          console.log('No owners found, setting count to 0');
          totalOwners = 0;
        } else {
          // For other errors, log but don't fail the whole dashboard
          console.error('Error fetching owners:', ownerErr);
        }
      }

      // Update stats with data from API
      setStats({
        totalUsers: Number(statsResponse.data.totalUsers) || 0,
        totalRooms: Number(statsResponse.data.totalRooms) || 0,
        totalBookings: Number(statsResponse.data.totalBookings) || 0,
        totalOwners: Number(totalOwners) || 0
      });

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);

      let errorMessage = 'Failed to load dashboard data. Please try again later.';
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        errorMessage = `Server error: ${err.response.status}. ${err.response.data.message || ''}`;

        // If unauthorized, redirect to login
        if (err.response.status === 401) {
          localStorage.removeItem('adminToken'); // Clear invalid token
          navigate('/admin/login');
        }
      } else if (err.request) {
        console.error('Error request:', err.request);
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        console.error('Error message:', err.message);
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Update active key based on current path
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path) {
      setActiveKey(path);
    }
  }, [location]);

  // Fetch dashboard statistics when component mounts
  useEffect(() => {
    if (activeKey === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeKey, fetchDashboardStats]);

  // Format the last updated time
  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000); // difference in seconds

    if (diff < 60) {
      return `${diff} seconds ago`;
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} minutes ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)} hours ago`;
    } else {
      return lastUpdated.toLocaleString();
    }
  };

  const handleSelect = (selectedKey) => {
    setActiveKey(selectedKey);
    navigate(`/admin/${selectedKey}`);
  };

  // Function to fetch owner details
  const fetchOwnerDetails = useCallback(async () => {
    setLoadingOwners(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoadingOwners(false);
        return;
      }

      // Fetch owners
      const ownersResponse = await axios.get('http://localhost:4000/api/admin/owner', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      console.log('Owners data for modal:', ownersResponse.data);

      if (ownersResponse.data && ownersResponse.data.owners) {
        // Fetch rooms to get property counts
        const roomsResponse = await axios.get('http://localhost:4000/api/admin/room', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        // Process owners data to add roomCount property
        const processedOwners = ownersResponse.data.owners.map(owner => {
          // Filter rooms by creatorId matching the owner's ID
          const ownerRooms = roomsResponse.data.rooms.filter(
            room => room.creatorId && room.creatorId.toString() === owner._id.toString()
          );

          return {
            ...owner,
            roomCount: ownerRooms.length
          };
        });

        setOwnersData(processedOwners);
        setShowOwnersModal(true);
      } else {
        setError('No owner data available');
      }
    } catch (err) {
      console.error('Error fetching owner details:', err);

      let errorMessage = 'Failed to load owner details. Please try again later.';
      if (err.response && err.response.status === 404) {
        errorMessage = 'No owners found in the system.';
      }

      setError(errorMessage);
    } finally {
      setLoadingOwners(false);
    }
  }, []);

  // Function to handle owner card click
  const handleOwnersCardClick = () => {
    handleSelect('owners');
  };

  // Function to close the owners modal
  const handleCloseOwnersModal = () => {
    setShowOwnersModal(false);
  };



  return (
    <div className="admin-dashboard">
      <Navbar bg="danger" variant="dark" expand="lg" className="shadow-sm rounded-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/admin/dashboard" className="d-flex align-items-center">
            <span className="me-2 fs-3">🏨</span>
            <span>RoomLink Admin Portal</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                to="/admin/dashboard"
                active={activeKey === 'dashboard'}
                className="text-white d-flex align-items-center rounded-pill px-3 mx-1"
              >
                <span className="me-1">📊</span> Dashboard
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/users"
                active={activeKey === 'users'}
                className="text-white d-flex align-items-center rounded-pill px-3 mx-1"
              >
                <span className="me-1">👥</span> Users
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/bookings"
                active={activeKey === 'bookings'}
                className="text-white d-flex align-items-center rounded-pill px-3 mx-1"
              >
                <span className="me-1">📅</span> Bookings
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/rooms"
                active={activeKey === 'rooms'}
                className="text-white d-flex align-items-center rounded-pill px-3 mx-1"
              >
                <span className="me-1">🛏️</span> Rooms
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/owners"
                active={activeKey === 'owners'}
                className="text-white d-flex align-items-center rounded-pill px-3 mx-1"
              >
                <span className="me-1">👨‍💼</span> Owners
              </Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link className="text-white d-flex align-items-center rounded-pill px-3 mx-1">
                <span className="me-1">👤</span> Admin
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/login"
                className="text-white d-flex align-items-center rounded-pill px-3 mx-1"
              >
                <span className="me-1">🚪</span> Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4 mb-5">
        {activeKey === 'dashboard' && (
          <div className="animate__animated animate__fadeIn">
            <Alert variant="info" className="mb-4 rounded-4 shadow-sm">
              <strong>Welcome to the Admin Dashboard!</strong> Here's an overview of your system.
            </Alert>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Dashboard Overview</h2>
              <div className="d-flex align-items-center">
                <small className="text-muted me-3">
                  Last updated: {formatLastUpdated()}
                </small>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={fetchDashboardStats}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <span className="me-2">🔄</span> Refresh Data
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="mb-4">
                <strong>Error:</strong> {error}
              </Alert>
            )}

            <Row>
              <Col lg={3} md={6} className="mb-4">
                <Card className="text-center h-100 border-danger shadow-sm hover-card rounded-4">
                  <Card.Body>
                    <div className="display-4 text-danger mb-2">👤</div>
                    <Card.Title>Users</Card.Title>
                    {loading ? (
                      <div className="py-3">
                        <Spinner animation="border" variant="danger" />
                      </div>
                    ) : (
                      <>
                        <Card.Text className="display-5 fw-bold">{stats.totalUsers}</Card.Text>
                        <div className="mt-2">
                          <Badge bg="info" className="rounded-pill">Real-time data</Badge>
                        </div>
                      </>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-danger text-white rounded-bottom" onClick={() => handleSelect('users')} style={{cursor: 'pointer'}}>
                    View Users
                  </Card.Footer>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <Card className="text-center h-100 border-danger shadow-sm hover-card rounded-4">
                  <Card.Body>
                    <div className="display-4 text-danger mb-2">👨‍💼</div>
                    <Card.Title>Owners</Card.Title>
                    {loading ? (
                      <div className="py-3">
                        <Spinner animation="border" variant="danger" />
                      </div>
                    ) : (
                      <>
                        <Card.Text className="display-5 fw-bold">{stats.totalOwners}</Card.Text>
                        <div className="mt-2">
                          <Badge bg="info" className="rounded-pill">Real-time data</Badge>
                        </div>
                      </>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-danger text-white rounded-bottom" onClick={handleOwnersCardClick} style={{cursor: 'pointer'}}>
                    View Owners
                  </Card.Footer>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <Card className="text-center h-100 border-danger shadow-sm hover-card rounded-4">
                  <Card.Body>
                    <div className="display-4 text-danger mb-2">🛏️</div>
                    <Card.Title>Rooms</Card.Title>
                    {loading ? (
                      <div className="py-3">
                        <Spinner animation="border" variant="danger" />
                      </div>
                    ) : (
                      <>
                        <Card.Text className="display-5 fw-bold">{stats.totalRooms}</Card.Text>
                        <div className="mt-2">
                          <Badge bg="info" className="rounded-pill">Real-time data</Badge>
                        </div>
                      </>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-danger text-white rounded-bottom" onClick={() => handleSelect('rooms')} style={{cursor: 'pointer'}}>
                    View Rooms
                  </Card.Footer>
                </Card>
              </Col>
              <Col lg={3} md={6} className="mb-4">
                <Card className="text-center h-100 border-danger shadow-sm hover-card rounded-4">
                  <Card.Body>
                    <div className="display-4 text-danger mb-2">📊</div>
                    <Card.Title>Bookings</Card.Title>
                    {loading ? (
                      <div className="py-3">
                        <Spinner animation="border" variant="danger" />
                      </div>
                    ) : (
                      <>
                        <Card.Text className="display-5 fw-bold">{stats.totalBookings}</Card.Text>
                        <div className="mt-2">
                          <Badge bg="info" className="rounded-pill">Real-time data</Badge>
                        </div>
                      </>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-danger text-white rounded-bottom" onClick={() => handleSelect('bookings')} style={{cursor: 'pointer'}}>
                    View Bookings
                  </Card.Footer>
                </Card>
              </Col>
            </Row>

            <div className="mt-4 p-3 bg-light rounded-4 shadow-sm">
              <h5 className="mb-3">Real-Time Data Information</h5>
              <p className="mb-2">
                <span className="badge bg-info me-2">ℹ️</span>
                The dashboard displays real-time data fetched directly from the database.
              </p>
              <p className="mb-0">
                <span className="badge bg-warning me-2">⚠️</span>
                Click the "Refresh Data" button to update the statistics with the latest information.
              </p>
            </div>
          </div>
        )}
        <Outlet />
      </Container>

      <footer className="bg-light py-3 mt-auto border-top">
        <Container className="text-center">
          <small className="text-muted">© 2023 Admin Portal. All rights reserved.</small>
        </Container>
      </footer>

      {/* Owners Details Modal */}
      <Modal show={showOwnersModal} onHide={handleCloseOwnersModal} size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Property Owners</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingOwners ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
              <p className="mt-3">Loading owners data...</p>
            </div>
          ) : ownersData.length === 0 ? (
            <Alert variant="info">No owners found in the system.</Alert>
          ) : (
            <>
              <p className="mb-3">Total Owners: <Badge bg="danger">{ownersData.length}</Badge></p>
              <Table striped bordered hover responsive>
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Properties</th>
                  </tr>
                </thead>
                <tbody>
                  {ownersData.map((owner, index) => (
                    <tr key={owner._id || index}>
                      <td>{index + 1}</td>
                      <td>{owner.name || owner.username || 'N/A'}</td>
                      <td>{owner.email || 'N/A'}</td>
                      <td>
                        <Badge bg="info" pill>
                          {owner.roomCount || 0}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseOwnersModal}>
            Close
          </Button>
          <Button variant="danger" onClick={() => handleSelect('owners')}>
            Go to Owners Management
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

