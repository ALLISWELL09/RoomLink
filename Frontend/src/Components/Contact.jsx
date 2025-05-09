import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { FaPhone, FaEnvelope, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaQuestionCircle, FaUserClock, FaShieldAlt, FaHandshake } from 'react-icons/fa'

// Custom CSS styles
const styles = {
  pageContainer: {
    backgroundColor: '#f8f9fa',
    paddingTop: '2rem',
    paddingBottom: '3rem'
  },
  sectionTitle: {
    color: '#dc3545',
    fontWeight: '700',
    position: 'relative',
    marginBottom: '2rem',
    paddingBottom: '0.5rem'
  },
  titleUnderline: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '50px',
    height: '3px',
    backgroundColor: '#dc3545'
  },
  contactCard: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: 'none',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    height: '100%'
  },
  contactIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    color: 'white',
    fontSize: '1.5rem',
    marginBottom: '1.5rem'
  },

  socialIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    margin: '0 10px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  faqCard: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: 'none',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  },
  valueCard: {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    height: '100%'
  },
  valueIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    color: '#dc3545',
    fontSize: '2rem',
    marginBottom: '1.5rem'
  }
}

export default function Contact() {
  return (
    <>
      <Header />

      <div style={styles.pageContainer}>
        {/* Hero Section */}
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3">Get in Touch</h1>
            <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: '700px' }}>
              We value your feedback and inquiries. Our team is here to help you find the perfect accommodation and answer any questions you may have.
            </p>
            <div className="d-flex justify-content-center">
              <div className="bg-danger" style={{ height: '4px', width: '80px' }}></div>
            </div>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="container mb-5">
          <div className="row g-4">
            {/* Phone */}
            <div className="col-md-4">
              <div
                className="card p-4 text-center"
                style={styles.contactCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                }}
              >
                <div className="d-flex justify-content-center">
                  <div style={styles.contactIcon}>
                    <FaPhone />
                  </div>
                </div>
                <h4 className="mb-3 fw-bold">Call Us</h4>
                <p className="text-muted mb-2">Our support team is available 24/7</p>
                <p className="fw-bold fs-5 mb-0 text-danger">+91 9876543210</p>
                <p className="fw-bold fs-5 mb-0 text-danger">+91 8765432109</p>
              </div>
            </div>

            {/* Email */}
            <div className="col-md-4">
              <div
                className="card p-4 text-center"
                style={styles.contactCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                }}
              >
                <div className="d-flex justify-content-center">
                  <div style={styles.contactIcon}>
                    <FaEnvelope />
                  </div>
                </div>
                <h4 className="mb-3 fw-bold">Email Us</h4>
                <p className="text-muted mb-2">We'll respond within 24 hours</p>
                <p className="fw-bold fs-5 mb-0 text-danger">support@roomlink.com</p>
                <p className="fw-bold fs-5 mb-0 text-danger">info@roomlink.com</p>
              </div>
            </div>

            {/* Office Hours */}
            <div className="col-md-4">
              <div
                className="card p-4 text-center"
                style={styles.contactCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                }}
              >
                <div className="d-flex justify-content-center">
                  <div style={styles.contactIcon}>
                    <FaClock />
                  </div>
                </div>
                <h4 className="mb-3 fw-bold">Working Hours</h4>
                <p className="text-muted mb-2">Our office working hours</p>
                <p className="fw-bold mb-0">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="fw-bold mb-0">Saturday: 10:00 AM - 4:00 PM</p>
                <p className="fw-bold mb-0">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="container mb-5">
          <div className="row mb-4">
            <div className="col-12">
              <h2 style={styles.sectionTitle}>
                Why Choose Us
                <div style={styles.titleUnderline}></div>
              </h2>
            </div>
          </div>

          <div className="row g-4">
            {/* Value 1 */}
            <div className="col-md-3">
              <div
                className="card p-4 text-center"
                style={styles.valueCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                }}
              >
                <div className="d-flex justify-content-center">
                  <div style={styles.valueIcon}>
                    <FaUserClock />
                  </div>
                </div>
                <h5 className="fw-bold mb-3">24/7 Support</h5>
                <p className="text-muted mb-0">Our dedicated team is available round the clock to assist you with any queries.</p>
              </div>
            </div>

            {/* Value 2 */}
            <div className="col-md-3">
              <div
                className="card p-4 text-center"
                style={styles.valueCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                }}
              >
                <div className="d-flex justify-content-center">
                  <div style={styles.valueIcon}>
                    <FaShieldAlt />
                  </div>
                </div>
                <h5 className="fw-bold mb-3">Secure Booking</h5>
                <p className="text-muted mb-0">Your data and payments are protected with industry-standard security measures.</p>
              </div>
            </div>

            {/* Value 3 */}
            <div className="col-md-3">
              <div
                className="card p-4 text-center"
                style={styles.valueCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                }}
              >
                <div className="d-flex justify-content-center">
                  <div style={styles.valueIcon}>
                    <FaHandshake />
                  </div>
                </div>
                <h5 className="fw-bold mb-3">Trusted Partners</h5>
                <p className="text-muted mb-0">We work with verified property owners to ensure quality accommodations.</p>
              </div>
            </div>

            {/* Value 4 */}
            <div className="col-md-3">
              <div
                className="card p-4 text-center"
                style={styles.valueCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                }}
              >
                <div className="d-flex justify-content-center">
                  <div style={styles.valueIcon}>
                    <FaQuestionCircle />
                  </div>
                </div>
                <h5 className="fw-bold mb-3">Expert Advice</h5>
                <p className="text-muted mb-0">Get personalized recommendations based on your specific requirements.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container mb-5">
          <div className="row mb-4">
            <div className="col-12">
              <h2 style={styles.sectionTitle}>
                Frequently Asked Questions
                <div style={styles.titleUnderline}></div>
              </h2>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="accordion" id="faqAccordion">
                {/* FAQ Item 1 */}
                <div className="accordion-item border-0 mb-3" style={styles.faqCard}>
                  <h2 className="accordion-header">
                    <button className="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      How do I book a room through RoomLink?
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Booking a room is simple! Browse available rooms, select one that meets your requirements, and click on the "Book Now" button. Follow the instructions to complete your booking with secure payment options.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 2 */}
                <div className="accordion-item border-0 mb-3" style={styles.faqCard}>
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      What payment methods do you accept?
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      We accept various payment methods including credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our trusted payment gateways.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 3 */}
                <div className="accordion-item border-0 mb-3" style={styles.faqCard}>
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      Can I cancel my booking?
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Yes, you can cancel your booking according to our cancellation policy. Cancellations made 48 hours before check-in are eligible for a full refund. Please contact our support team for assistance with cancellations.
                    </div>
                  </div>
                </div>

                {/* FAQ Item 4 */}
                <div className="accordion-item border-0" style={styles.faqCard}>
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                      How can I list my property on RoomLink?
                    </button>
                  </h2>
                  <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      To list your property, create an account as a property owner, complete your profile, and submit your property details. Our team will review your listing and get in touch with you for verification before making it live on our platform.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="container mb-5">
          <div className="text-center">
            <h3 className="mb-4">Connect With Us</h3>
            <div className="d-flex justify-content-center">
              <a
                href="#"
                style={{...styles.socialIcon, backgroundColor: '#3b5998'}}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(59, 89, 152, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="#"
                style={{...styles.socialIcon, backgroundColor: '#1da1f2'}}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(29, 161, 242, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                style={{...styles.socialIcon, backgroundColor: '#e1306c'}}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(225, 48, 108, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="#"
                style={{...styles.socialIcon, backgroundColor: '#0077b5'}}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 119, 181, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
