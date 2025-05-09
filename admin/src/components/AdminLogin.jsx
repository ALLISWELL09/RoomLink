import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import 'animate.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Remove withCredentials to avoid CORS issues
      const response = await axios.post('http://localhost:4000/api/admin/login', {
        email,
        password
      });

      localStorage.setItem('adminToken', response.data.token);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Just reset loading state without showing error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <div className="text-center mb-4 animate__animated animate__fadeInDown">
              <h1 className="text-danger fw-bold mb-0">🏨 RoomLink</h1>
              <p className="text-muted">Admin Portal</p>
            </div>

            <Card className="border-0 shadow-lg rounded-4 overflow-hidden animate__animated animate__fadeInUp">
              <Card.Header className="bg-danger text-white py-3">
                <h3 className="mb-0 text-center">Admin Login</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>
                      <span className="me-2 text-danger">✉️</span>
                      Email Address
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <span className="text-danger">@</span>
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="py-2 border-start-0"
                        placeholder="Enter your email"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <span className="me-2 text-danger">🔒</span>
                      Password
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <span className="text-danger">🔑</span>
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="py-2 border-start-0"
                        placeholder="Enter your password"
                      />
                    </InputGroup>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="danger"
                      type="submit"
                      disabled={loading}
                      className="py-2 rounded-pill"
                      size="lg"
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
                          Logging in...
                        </>
                      ) : (
                        <>
                          <span className="me-2">➡️</span>
                          Login to Dashboard
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
              <Card.Footer className="bg-light text-center py-3">
                <small className="text-muted">Secure Admin Access Only</small>
              </Card.Footer>
            </Card>

            <div className="text-center mt-4 animate__animated animate__fadeIn animate__delay-1s">
              <p className="text-muted small">
                © {new Date().getFullYear()} RoomLink Admin Portal. All rights reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;



