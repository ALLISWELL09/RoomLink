import razorpay from '../config/razorpay.js';
import Payment from '../models/payment.model.js';
import crypto from 'crypto';



export const createOrder = async (req,res) => {

    try {
        const {amount,currency,userId} = req.body;

        const option = {
            amount: amount*100,
            currency: currency || "INR",
            receipt: `"order_rcpt_${Date.now()}"`,
            payment_capture: 1,


        }

        const order = await razorpay.orders.create(option)

        const payment = new Payment({
            userId: userId,
            orderId: order.id,
            amount: amount,
            currency: order.currency,
            status: "Pending",

        })

        const savedPayment = await payment.save();
        if(!savedPayment){
            return res.status(400).json({message: "Payment Failed"});
        }

        res.status(200).json({message: "Order Created", order: order});

    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});

    }

}

export const verifyPayment = async (req,res)=>{
    try {
        const { order_id, payment_id, signature } = req.body;
        console.log(`Verifying payment: order_id=${order_id}, payment_id=${payment_id}`);

        const body = order_id + "|" + payment_id;
        const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

        if (expectedSignature === signature) {
            console.log("Payment signature verified successfully");

            // Update payment status in the database
            const updatedPayment = await Payment.findOneAndUpdate(
                { orderId: order_id },
                {
                    paymentId: payment_id,
                    signature: signature,
                    status: "Success",
                },
                { new: true }
            );

            console.log(`Updated payment record: ${updatedPayment._id}`);

            res.status(200).json({
                success: true,
                message: "Payment Verified",
                payment: {
                    id: payment_id,
                    orderId: order_id,
                    amount: updatedPayment.amount
                }
            });
        } else {
            console.log("Payment signature verification failed");

            await Payment.findOneAndUpdate(
                { orderId: order_id },
                { status: "Failed" }
            );

            return res.status(400).json({ success: false, message: "Invalid Payment Signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
}
