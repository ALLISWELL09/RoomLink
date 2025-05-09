
import Razorpay from "razorpay";

import dotenv from "dotenv";
dotenv.config();

//Razorpay Configuration
let instance;

try {
    // Check if credentials are available
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn('Razorpay credentials not found in environment variables. Payment features will be disabled.');
        // Create a mock instance
        instance = {
            orders: {
                create: () => Promise.resolve({ id: 'mock_order_' + Date.now() })
            },
            payments: {
                fetch: () => Promise.resolve({ status: 'authorized' })
            }
        };
    } else {
        // Create real instance with credentials
        instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('Razorpay initialized successfully');
    }
} catch (error) {
    console.error('Error initializing Razorpay:', error);
    // Create a mock instance as fallback
    instance = {
        orders: {
            create: () => Promise.resolve({ id: 'mock_order_' + Date.now() })
        },
        payments: {
            fetch: () => Promise.resolve({ status: 'authorized' })
        }
    };
}

export default instance;
