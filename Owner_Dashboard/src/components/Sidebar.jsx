// Sidebar.jsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../css/sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const ownerName = localStorage.getItem('ownerName') || 'Owner';
    const ownerEmail = localStorage.getItem('ownerEmail') || 'owner@example.com';

    const handleLogout = () => {
        // Clear all owner-related data from localStorage
        localStorage.removeItem('ownerToken');
        localStorage.removeItem('ownerId');
        localStorage.removeItem('ownerName');
        localStorage.removeItem('ownerEmail');

        // Redirect to login page
        navigate('/login');
    };

    return (
        <div className="d-flex flex-column p-3 sidebar-container">
            <h4 className="mb-2 sidebar-header" style={{ color: 'rgba(255, 255, 255, 1)' }}>RoomLink</h4>

            {/* Owner info */}
            <div className="text-center mb-3">
                <div className="owner-avatar">
                    {ownerName.charAt(0).toUpperCase()}
                </div>
                <div className="text-white mt-2">
                    <div className="fw-bold">{ownerName}</div>
                    <small className="text-white-50">{ownerEmail}</small>
                </div>
            </div>

            <hr className="mb-4" style={{ borderColor: 'rgba(255, 255, 255, 0.8)', opacity: 1 }} />

            <div className='p-2'>
                <Nav defaultActiveKey="/home" className="flex-column">
                    <Nav.Link href="/dashboard" className='sidebar-link' style={{ color: 'rgba(255, 255, 255, 1)' }}>Dashboard</Nav.Link>
                    <Nav.Link href="/rooms" className='sidebar-link' style={{ color: 'rgba(255, 255, 255, 1)' }}>Rooms</Nav.Link>
                    <Nav.Link href="/booking" className='sidebar-link' style={{ color: 'rgba(255, 255, 255, 1)' }}>Bookings</Nav.Link>
                    <Nav.Link href="/profile" className='sidebar-link' style={{ color: 'rgba(255, 255, 255, 1)' }}>Profile</Nav.Link>
                </Nav>
            </div>

            <div className='mt-auto pt-3 text-center'>
                <button className='logoutbtn' onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
