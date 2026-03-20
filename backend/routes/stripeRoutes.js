import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
// Initialize Stripe with your Secret Key from the .env file
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/stripe/create-payment-intent
// @access  Public (for now)
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { items, totalAmount } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Stripe expects amounts in cents! (e.g., $50.00 = 5000)
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Send the secret token back to the React frontend
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Stripe Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;