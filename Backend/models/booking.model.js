import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
        required: true
    },
    roomId: {
        type: mongoose.Types.ObjectId,
        ref: "Rooms",
        required: true
    },
    creatorId: {
        type: mongoose.Types.ObjectId,
        ref: "admin"
    },
    paymentId: {
        type: String,
        ref: "Payment"
    },
    amount: {
        type: Number
    },
    duration: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Cancelled"],
        default: "Confirmed"
    }
}, { timestamps: true });

// Use "payments" as the collection name
const booking = mongoose.model("payments", bookingSchema);
console.log("Booking model initialized with collection name:", booking.collection.name);
export default booking;