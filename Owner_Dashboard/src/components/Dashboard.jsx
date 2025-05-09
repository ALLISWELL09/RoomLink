import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import { Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/dashboard.css";

// Chart colors
const COLORS = ["#4a6fdc", "#ffc107", "#dc3545", "#28a745"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('pie');

  // Owner information from localStorage
  const ownerName = localStorage.getItem('ownerName') || 'Owner';
  const ownerEmail = localStorage.getItem('ownerEmail') || 'owner@example.com';

  // Function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('ownerToken');
    if (!token) {
      console.warn('No owner token found in localStorage');
      return null;
    }
    return token;
  };

  // Function to fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch dashboard stats
      console.log('Fetching dashboard stats with token:', token);
      const statsResponse = await axios.get('http://localhost:4000/api/owner/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Dashboard data received:', statsResponse.data);

      if (!statsResponse.data) {
        console.error('No data received from the server');
        setError('No data received from the server. Please try again later.');
        setLoading(false);
        return;
      }

      // Ensure all required data is present and properly parsed as numbers
      const data = {
        totalProperties: Number(statsResponse.data.totalProperties) || 0,
        totalBookings: Number(statsResponse.data.totalBookings) || 0,
        totalCustomers: Number(statsResponse.data.totalCustomers) || 0,
        totalRevenue: Number(statsResponse.data.totalRevenue) || 0
      };

      // Log the raw data for debugging
      console.log('Raw data from API:', statsResponse.data);

      // Log each value for debugging
      console.log('Total Properties:', data.totalProperties);
      console.log('Total Bookings:', data.totalBookings);
      console.log('Total Customers:', data.totalCustomers);
      console.log('Total Revenue:', data.totalRevenue);

      // Real-time data fetched successfully

      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);

      // More detailed error message
      let errorMessage = 'Failed to load dashboard data. Please try again later.';
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        errorMessage = `Server error: ${err.response.status}. ${err.response.data.message || ''}`;
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  // Real-time data is directly used in the charts instead of using a separate variable

  return (
    <div className="d-flex">
      <div className='fixed-sidebar'>
        <Sidebar />
      </div>

      <div className="p-4 flex-grow-1 dashboard-container" style={{marginLeft: '250px', width: "100%" }}>
        <div className="dashboard-header">
          <h4 className="dashboard-title">Owner Dashboard</h4>
          <div className="d-flex align-items-center">
            <Button
              variant="outline-danger"
              size="sm"
              className="me-3 d-flex align-items-center"
              onClick={fetchDashboardData}
              disabled={loading}
              style={{ borderRadius: '50px', padding: '8px 15px' }}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <div className="text-end">
              <strong style={{ fontSize: '16px' }}>{ownerName}</strong>
              <br />
              <small className="text-muted">{ownerEmail}</small>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center my-5 p-5">
            <div className="spinner-grow text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ fontSize: '18px', color: '#666' }}>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="border-0 shadow-sm">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        ) : (
          <>
            <Row className="g-4 mb-4">
              <Col md={3}>
                <Card body className="info-card animate__animated animate__fadeInUp" style={{ animationDelay: '0.1s' }}>
                  <i className="bi bi-house-door icon"></i>
                  <div className="label">
                    <i className="bi bi-house-door me-2" style={{ color: '#4a6fdc' }}></i>
                    Total Rooms
                  </div>
                  <div className="number" style={{ color: '#4a6fdc' }}>
                    {Number(stats.totalProperties) || 0}
                  </div>
                </Card>
              </Col>
              <Col md={3}>
                <Card body className="info-card animate__animated animate__fadeInUp" style={{ animationDelay: '0.2s' }}>
                  <i className="bi bi-calendar-check icon"></i>
                  <div className="label">
                    <i className="bi bi-calendar-check me-2" style={{ color: '#ffc107' }}></i>
                    Total Bookings
                  </div>
                  <div className="number" style={{ color: '#ffc107' }}>
                    {Number(stats.totalBookings) || 0}
                  </div>
                </Card>
              </Col>
              <Col md={3}>
                <Card body className="info-card animate__animated animate__fadeInUp" style={{ animationDelay: '0.3s' }}>
                  <i className="bi bi-people icon"></i>
                  <div className="label">
                    <i className="bi bi-people me-2" style={{ color: '#dc3545' }}></i>
                    Unique Customers
                  </div>
                  <div className="number" style={{ color: '#dc3545' }}>
                    {Number(stats.totalCustomers) || 0}
                  </div>
                </Card>
              </Col>
              <Col md={3}>
                <Card body className="info-card animate__animated animate__fadeInUp" style={{ animationDelay: '0.4s' }}>
                  <i className="bi bi-currency-rupee icon"></i>
                  <div className="label">
                    <i className="bi bi-currency-rupee me-2" style={{ color: '#28a745' }}></i>
                    Revenue
                  </div>
                  <div className="number" style={{ color: '#28a745' }}>
                    ₹{Number(stats.totalRevenue) || 0}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Debug information - remove in production */}

        </>
        )}

        {!loading && !error && (
          <Row className="g-4 mb-4">
            <Col md={12}>
              <div className="d-flex justify-content-end">
                <Button
                  variant="danger"
                  className="me-2 d-flex align-items-center animate__animated animate__fadeInDown"
                  onClick={() => navigate('/rooms')}
                  style={{ borderRadius: '50px', padding: '10px 20px', animationDelay: '0.2s' }}
                >
                  <i className="bi bi-plus-circle me-2"></i> Add New Room
                </Button>
                <Button
                  variant="outline-danger"
                  className="d-flex align-items-center animate__animated animate__fadeInDown"
                  onClick={() => navigate('/booking')}
                  style={{ borderRadius: '50px', padding: '10px 20px', animationDelay: '0.3s' }}
                >
                  <i className="bi bi-list-ul me-2"></i> View All Bookings
                </Button>
              </div>
            </Col>
          </Row>
        )}

        {!loading && !error && (
          <Row className="g-4">
            <Col md={6}>
              <Card className="chart-container animate__animated animate__fadeInUp" style={{ animationDelay: '0.5s' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="section-heading">Property Overview</h5>
                      <p className="text-muted mb-0">Real-time summary of your properties and bookings</p>
                    </div>
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-sm btn-outline-danger me-3 d-flex align-items-center"
                        onClick={fetchDashboardData}
                        disabled={loading}
                        style={{ borderRadius: '50px', padding: '5px 10px' }}
                      >
                        <i className="bi bi-arrow-repeat me-1"></i>
                        <small>Refresh</small>
                      </button>
                      <div className="text-end">
                        <small className="d-block text-muted">Last updated:</small>
                        <small className="d-block fw-bold">{formatLastUpdated()}</small>
                      </div>
                    </div>
                  </div>

                  <div className="chart-tabs mb-3">
                    <ul className="nav nav-pills">
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'pie' ? 'active' : ''}`}
                          onClick={() => setActiveTab('pie')}
                        >
                          <i className="bi bi-pie-chart me-1"></i> Pie Chart
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === 'bar' ? 'active' : ''}`}
                          onClick={() => setActiveTab('bar')}
                        >
                          <i className="bi bi-bar-chart me-1"></i> Bar Chart
                        </button>
                      </li>
                    </ul>
                  </div>

                  {loading ? (
                    <div className="text-center my-4 py-4">
                      <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem', opacity: '0.7' }}>
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3" style={{ color: '#666' }}>Updating chart data...</p>
                    </div>
                  ) : stats.totalProperties > 0 ? (
                    <>
                      {activeTab === 'pie' && (
                        <div>
                          <div className="mb-4 text-center">
                            <div className="alert alert-info">
                              <i className="bi bi-info-circle me-2"></i>
                              Showing real-time data from the database
                            </div>
                          </div>

                          <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Available Rooms', value: Number(stats.totalProperties) || 0 },
                                  { name: 'Total Bookings', value: Number(stats.totalBookings) || 0 },
                                  { name: 'Unique Customers', value: Number(stats.totalCustomers) || 0 },
                                  { name: 'Revenue', value: Number(stats.totalRevenue) || 0 }
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={40}
                                paddingAngle={5}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                              >
                                <Cell fill={COLORS[0]} />
                                <Cell fill={COLORS[1]} />
                                <Cell fill={COLORS[2]} />
                                <Cell fill={COLORS[3]} />
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {activeTab === 'bar' && (
                        <div>
                          <div className="mb-4 text-center">
                            <div className="alert alert-info">
                              <i className="bi bi-info-circle me-2"></i>
                              Showing real-time data from the database
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="row text-center">
                              <div className="col-3">
                                <div className="card p-3" style={{ backgroundColor: COLORS[0], color: 'white' }}>
                                  <h3>{Number(stats.totalProperties) || 0}</h3>
                                  <div>Available Rooms</div>
                                </div>
                              </div>
                              <div className="col-3">
                                <div className="card p-3" style={{ backgroundColor: COLORS[1], color: 'white' }}>
                                  <h3>{Number(stats.totalBookings) || 0}</h3>
                                  <div>Total Bookings</div>
                                </div>
                              </div>
                              <div className="col-3">
                                <div className="card p-3" style={{ backgroundColor: COLORS[2], color: 'white' }}>
                                  <h3>{Number(stats.totalCustomers) || 0}</h3>
                                  <div>Unique Customers</div>
                                </div>
                              </div>
                              <div className="col-3">
                                <div className="card p-3" style={{ backgroundColor: COLORS[3], color: 'white' }}>
                                  <h3>₹{Number(stats.totalRevenue) || 0}</h3>
                                  <div>Revenue</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4 text-center">
                            <div className="alert alert-warning">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              The bar chart has been simplified to ensure accurate data display
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-12">
                              <table className="table table-bordered">
                                <thead className="table-light">
                                  <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>
                                      <span style={{ color: COLORS[0], fontWeight: 'bold' }}>
                                        <i className="bi bi-house-door me-2"></i>
                                        Available Rooms
                                      </span>
                                    </td>
                                    <td className="text-end fw-bold">{Number(stats.totalProperties) || 0}</td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <span style={{ color: COLORS[1], fontWeight: 'bold' }}>
                                        <i className="bi bi-calendar-check me-2"></i>
                                        Total Bookings
                                      </span>
                                    </td>
                                    <td className="text-end fw-bold">{Number(stats.totalBookings) || 0}</td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <span style={{ color: COLORS[2], fontWeight: 'bold' }}>
                                        <i className="bi bi-people me-2"></i>
                                        Unique Customers
                                      </span>
                                    </td>
                                    <td className="text-end fw-bold">{Number(stats.totalCustomers) || 0}</td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <span style={{ color: COLORS[3], fontWeight: 'bold' }}>
                                        <i className="bi bi-currency-rupee me-2"></i>
                                        Revenue
                                      </span>
                                    </td>
                                    <td className="text-end fw-bold">₹{Number(stats.totalRevenue) || 0}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="text-center mt-3">
                            <p className="text-muted">
                              <small>
                                <i className="bi bi-info-circle me-1"></i>
                                The table view ensures accurate representation of all metrics
                              </small>
                            </p>
                          </div>
                        </div>
                      )}






                    </>
                  ) : (
                    <div className="text-center my-5 py-4 animate__animated animate__fadeIn" style={{ animationDelay: '0.6s' }}>
                      <i className="bi bi-house-slash" style={{ fontSize: '48px', color: '#dc3545', opacity: '0.5' }}></i>
                      <p className="mt-3 mb-4">No properties found. Add your first property to see real-time statistics.</p>
                      <Button
                        variant="danger"
                        onClick={() => navigate('/rooms')}
                        className="mt-2 animate__animated animate__pulse animate__infinite animate__slower"
                        style={{ borderRadius: '50px', padding: '10px 20px' }}
                      >
                        <i className="bi bi-plus-circle me-2"></i> Add Property
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="gradient-card animate__animated animate__fadeInUp" style={{ animationDelay: '0.6s' }}>
                <Card.Body className="p-4">
                  <h5 className="section-heading">Quick Actions</h5>
                  <p className="text-muted mb-4">Manage your properties efficiently</p>

                  <div className="d-grid gap-3 mt-4">
                    <button
                      className="quick-action-btn primary animate__animated animate__fadeInRight"
                      style={{ animationDelay: '0.7s' }}
                      onClick={() => navigate('/rooms')}
                    >
                      <i className="bi bi-house-door"></i> Manage Properties
                    </button>

                    <button
                      className="quick-action-btn success animate__animated animate__fadeInRight"
                      style={{ animationDelay: '0.8s' }}
                      onClick={() => navigate('/booking')}
                    >
                      <i className="bi bi-calendar-check"></i> View Bookings
                    </button>

                    <button
                      className="quick-action-btn info animate__animated animate__fadeInRight"
                      style={{ animationDelay: '0.9s' }}
                      onClick={() => navigate('/profile')}
                    >
                      <i className="bi bi-person-gear"></i> Update Profile
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
