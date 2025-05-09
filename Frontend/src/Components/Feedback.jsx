import React from 'react'
import { motion } from "framer-motion";
import Header from './Header';
import Footer from './Footer';

export default function Feedback() {
  return (
    <>
    <Header/>
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <motion.div
        className="w-50 p-4 shadow-lg rounded bg-white"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center fw-bold text-danger fw-semibold">We Value Your Feedback!</h2>
        <p className="text-center text-muted">
          Help us improve by sharing your experience.
        </p>
        <hr />

        <form>
          {/* Name */}
          <motion.div
            className="mb-3"
            whileHover={{ scale: 1.05 }}
            whileFocus={{ scale: 1.02 }}
          >
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" placeholder="Enter your name" required />
          </motion.div>

          {/* Email */}
          <motion.div
            className="mb-3"
            whileHover={{ scale: 1.05 }}
            whileFocus={{ scale: 1.02 }}
          >
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter your email" required />
          </motion.div>

          {/* Rating */}
          <motion.div className="mb-3" whileHover={{ scale: 1.05 }}>
            <label className="form-label">Rate Your Experience</label>
            <div className="d-flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.span
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  className="fs-4 text-warning"
                  role="button"
                >
                  ★
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            className="mb-3"
            whileHover={{ scale: 1.05 }}
            whileFocus={{ scale: 1.02 }}
          >
            <label className="form-label">Your Feedback</label>
            <textarea className="form-control" rows="4" placeholder="Write your message..." required></textarea>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            className="d-grid"
            whileHover={{ scale: 1.05 }}
          >
            <button type="submit" className="btn btn-danger fw-bold">
              Submit Feedback
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
    
    <Footer/>
    </>
  )
}
