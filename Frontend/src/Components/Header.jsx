import React from 'react'
import Image from "../Images/logo.png"
import { Link } from 'react-router-dom'
import {  Routes, Route } from "react-router-dom";
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react';




export default function Header() {

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
  useEffect(()=>{

    if(!token){
      navigate("/")
    }
  },[navigate]);

  const handleLogout = ()=>{
    localStorage.removeItem('token');
    navigate('/');
  }


return (
    <header>
        <nav className="navbar navbar-expand-lg bg-light shadow-sm">
            <div className="container">
                {/* Navbar toggler for mobile */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Centered brand/logo */}
                <a className="navbar-brand mx-auto fw-bolder fs-4" href="#">
                    <img src={Image} alt="RoomLink Logo" style={{ height: "50px", marginRight: "5px" }} />
                    RoomLink
                </a>

                {/* Navbar links */}
                <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                    <ul className="navbar-nav gap-4">
                        <li className="nav-item "><a className="nav-link text-danger" href="/home"><b>Home</b></a></li>
                        <li className="nav-item"><a className="nav-link text-danger" href="/about"><b>About Us</b></a></li>
                        <li className="nav-item"><a className="nav-link text-danger" href="/explore_room"><b>Explore Room</b></a></li>
                        <li className="nav-item"><a className="nav-link text-danger" href="/contact_us"><b>Contact Us</b></a></li>
                        <li className="nav-item"><a className="nav-link text-danger" href="/feedback"><b>Feedback</b></a></li>
                        {token && (
                            <>
                                <li className="nav-item"><a className="nav-link text-danger" href="/booked-rooms"><b>Booked Rooms</b></a></li>
                                <li className="nav-item"><a className="nav-link text-danger" href="/profile"><b>Profile</b></a></li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Login button */}

                {token ?(

                <button onClick={handleLogout} className="btn btn-danger d-flex align-items-center login-btn fw-bold" style={{ height: "40px" }}>Logout</button>
                ):
                (
                <Link to={'/'}  className="btn btn-danger d-flex align-items-center login-btn fw-bold" style={{ height: "40px" }}>Login</Link>
                )}
            </div>
        </nav>
        <style jsx>{`
            .navbar-nav .nav-link {
                position: relative;
                overflow: hidden;
                transition: color 0.3s;
                color: #343a40;
            }

            .navbar-nav .nav-link::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 2px;
                bottom: 0;
                left: -100%;
                background-color: #dc3545;
                transition: left 0.3s;
            }

            .navbar-nav .nav-link:hover::before {
                left: 0;
            }

            .navbar-nav .nav-link:hover {
                color: #dc3545;
            }

            .navbar-brand {
                color: #dc3545;
            }

            .navbar-toggler-icon {
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28220, 53, 69, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
            }

            .login-btn {
                transition: box-shadow 0.3s;
            }

            .login-btn:hover {
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
        `}</style>
    </header>
)
}
