
import React from 'react'
import Home from './Components/Home'
import { Routes,Route } from 'react-router-dom'
import About from './Components/About'
import Contact from './Components/Contact'
import Feedback from './Components/Feedback'
import Explore_Room from './Components/Explore_Room'
import Room_Details from './Components/Room_Details'
import Login from './Components/login'
import Register from './Components/Register'
import Booking from './Components/Booking'
import Thankyou from './Components/Thankyou'
import Profile from './Components/Profile'
import BookedRooms from './Components/BookedRooms'
import ForgotPassword from './Components/ForgotPassword'
import ResetPassword from './Components/ResetPassword'


function App() {

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/home" index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact_us" element={<Contact />} />
        <Route path="/explore_room" element={<Explore_Room />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="room_details/:id" element={<Room_Details />} />
        <Route path="booking/:id" element={<Booking />} />
        <Route path="thank-you" element={<Thankyou />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/booked-rooms" element={<BookedRooms />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </div>
  )
}

export default App
