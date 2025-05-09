import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

const reviewsData = [
  {
    name: "Rahul Sharma",
    rating: 4.5,
    comment: "Great hostel with all facilities!",
    date: "Jan 5, 2024",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Aisha Patel",
    rating: 4,
    comment: "Affordable and clean, highly recommend!",
    date: "Feb 10, 2024",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Rahul Sharma",
    rating: 4.5,
    comment: "Great hostel with all facilities!",
    date: "Jan 5, 2024",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },

];

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;

  return (
    <>
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon key={i} icon={faStar} className="text-warning me-1" />
      ))}
      {halfStar && <FontAwesomeIcon icon={faStarHalfAlt} className="text-warning me-1" />}
    </>
  );
};

const Rating = () => {
  const [reviews, setReviews] = useState(reviewsData);
  const [newReview, setNewReview] = useState({ name: "", rating: "", comment: "", profilePic: "" });





return (
    <div className="container mt-4">
        <h3 className="mb-3 text-center ">Reviews & Ratings</h3>
        <div className="row">
            {reviews.map((review, index) => (
                <div key={index} className="col-md-4 mb-4">
                    <div className="p-3 border rounded shadow-sm bg-light d-flex align-items-start flex-column">
                        <img
                            src={review.profilePic || "https://via.placeholder.com/50"}
                            alt="profile"
                            className="rounded-circle mb-2"
                            width="50"
                            height="50"
                        />
                        <div>
                            <h5 className="mb-1">{review.name}</h5>
                            <div>
                                <StarRating rating={review.rating} /> <span className="ms-2">{review.rating}/5</span>
                            </div>
                            <p className="mb-1">{review.comment}</p>
                            <small className="text-muted">{review.date}</small>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
};

export default Rating;
