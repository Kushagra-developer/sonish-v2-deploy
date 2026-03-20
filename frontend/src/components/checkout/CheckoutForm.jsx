import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const CheckoutForm = ({ totalAmount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event) => {
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            return;
        }

        setIsProcessing(true);

        // Confirm the payment with Stripe
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your actual success page URL later!
                return_url: `${window.location.origin}/success`,
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`.
        if (error) {
            setErrorMessage(error.message);
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <PaymentElement className="mb-4" />

            <button
                disabled={isProcessing || !stripe || !elements}
                id="submit"
                className="w-full bg-charcoal text-white py-3 uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
            >
                <span id="button-text">
                    {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
                </span>
            </button>

            {/* Show any error or success messages */}
            {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}
        </form>
    );
};

export default CheckoutForm;