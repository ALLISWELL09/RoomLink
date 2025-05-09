import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import '../css/login.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting registration with:', { username, email });

      // Call the owner registration API
      const response = await axios.post('http://localhost:4000/api/owner/register', {
        username,
        email,
        password
      });

      console.log('Registration response:', response.data);

      // Show success message and redirect to login
      alert('Registration successful! Please login with your credentials.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);

      // Handle different error scenarios
      if (err.response) {
        console.error('Server response error:', err.response.data);
        setError(err.response.data.error || 'Server error. Please try again later.');
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your internet connection.');
      } else {
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
                <i className="bi bi-person-plus me-2"></i>
                Owner Registration
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
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-person me-2 text-danger"></i>
                    Username
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-person-badge"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="py-2"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
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

                <Form.Group className="mb-3">
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
                  <Form.Text className="text-muted mt-1">
                    <i className="bi bi-info-circle me-1"></i>
                    Password must be at least 6 characters long.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <i className="bi bi-shield-lock me-2 text-danger"></i>
                    Confirm Password
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-lock-fill"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus-fill me-2"></i>
                      Register
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <div>
                Already have an account? <Link to="/login" className="auth-link fw-bold">Login here</Link>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
