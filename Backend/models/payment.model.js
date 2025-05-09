import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    paymentId: { type: String, default: null },
    signature: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["Pending", "Success", "Failed"], default: "Pending" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to user
    createdAt: { type: Date, default: Date.now },
});


const Payment =  mongoose.model("Payment", paymentSchema);
export default Payment;