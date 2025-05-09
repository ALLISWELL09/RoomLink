import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import '../css/login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting login with:', { email });

      // Call the owner login API
      const response = await axios.post('http://localhost:4000/api/owner/login', {
        email,
        password
      });

      console.log('Login response:', response.data);

      // Extract token and owner data
      const { token, ownerData } = response.data;

      if (!token || !ownerData) {
        throw new Error('Invalid response from server. Missing token or owner data.');
      }

      // Store token and owner ID in localStorage
      localStorage.setItem('ownerToken', token);
      localStorage.setItem('ownerId', ownerData.id);
      localStorage.setItem('ownerName', ownerData.username);
      localStorage.setItem('ownerEmail', ownerData.email);

      console.log('Login successful. Owner ID:', ownerData.id);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);

      // Handle different error scenarios
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server response error:', err.response.data);
        setError(err.response.data.error || 'Server error. Please try again later.');
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', err.message);
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="login-container">
      <Row className="justify-content-center align-items-center h-100">
        <Col md={6} lg={4}>
          <div className="text-center mb-4 animate__animated animate__fadeIn">
            <h2 className="text-danger fw-bold">RoomLink</h2>
            <p className="text-muted">Property Owner Portal</p>
          </div>

          <Card className="auth-card shadow-lg border-0">
            <Card.Header className="text-white text-center py-4">
              <h3 className="font-weight-bold my-1">
                <i className="bi bi-person-lock me-2"></i>
                Owner Login
              </h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert
                  variant="danger"
                  className="animate__animated animate__headShake"
                  style={{borderRadius: '8px'}}
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="mt-2">
                <Form.Group className="mb-4">
                  <Form.Label>
                    <i className="bi bi-envelope me-2 text-danger"></i>
                    Email Address
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-at"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="py-2"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <i className="bi bi-key me-2 text-danger"></i>
                    Password
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-lock"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="py-2"
                    />
                  </InputGroup>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-4 d-flex align-items-center justify-content-center"
                  disabled={loading}
                  style={{height: '48px'}}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <div className="mb-2">
                Don't have an account? <Link to="/register" className="auth-link fw-bold">Register here</Link>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
