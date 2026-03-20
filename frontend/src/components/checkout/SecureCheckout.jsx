import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm'; // Make sure this path points to your CheckoutForm.jsx!

// Initialize Stripe outside of a component's render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SecureCheckout = ({ cartTotal }) => {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        // Ask your backend to create a PaymentIntent as soon as this component loads
        const fetchPaymentIntent = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/stripe/create-payment-intent`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ totalAmount: cartTotal }),
                });

                const data = await response.json();
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error("Error fetching secret:", error);
            }
        };

        // Only fetch if there is actually a total to charge!
        if (cartTotal > 0) {
            fetchPaymentIntent();
        }
    }, [cartTotal]);

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#000000', // Matches your charcoal aesthetic
        },
    };

    return (
        <div className="p-4 border-t border-gray-200 mt-4">
            <h3 className="font-serif text-xl text-charcoal mb-4">Secure Checkout</h3>

            {/* Only render the form once the backend gives us the secret token! */}
            {clientSecret ? (
                <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                    <CheckoutForm totalAmount={cartTotal} />
                </Elements>
            ) : (
                <div className="text-sm text-gray-500 animate-pulse">Initializing secure payment gateway...</div>
            )}
        </div>
    );
};

export default SecureCheckout;