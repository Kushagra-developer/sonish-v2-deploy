import { motion } from 'framer-motion';

const Returns = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-offwhite min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif text-charcoal tracking-wide mb-4">Returns + Exchanges</h1>
                <div className="w-16 h-px bg-charcoal/30 mb-10"></div>

                <div className="space-y-6 text-sm md:text-base text-charcoal/80 font-light leading-relaxed">
                    <p>
                        At Sonish, we want you to be completely satisfied with your purchase. If for any reason you are not happy with an item, we offer hassle-free returns and exchanges within <strong>7 days</strong> from the date of delivery. To be eligible, the product must be unused, in its original condition, with all tags, labels, packaging, and accessories intact.
                    </p>

                    <h2 className="text-xl font-serif text-charcoal mt-8 mb-4">How to Initiate a Return or Exchange</h2>
                    <ol className="list-decimal pl-5 space-y-3">
                        <li>Contact our customer support team within 7 days of delivery via email at <strong>support@sonish.co.in</strong> or WhatsApp. Provide your order number, product details, and reason for return/exchange.</li>
                        <li>We will review your request and provide a Return Merchandise Authorization (RMA) number along with instructions for pickup or drop-off.</li>
                        <li>Pack the item securely in its original packaging and include the invoice copy.</li>
                        <li>Our logistics partner will collect the item from your provided address (free pickup in most cases).</li>
                    </ol>

                    <h2 className="text-xl font-serif text-charcoal mt-8 mb-4">Eligible Reasons & Process</h2>
                    <ul className="list-disc pl-5 space-y-3">
                        <li><strong>Return for Refund:</strong> Accepted for defects, wrong item delivered, damaged in transit, size/fit issues, or change of mind. Refunds processed to original payment method within 7–10 business days.</li>
                        <li><strong>Exchange:</strong> Available for size/color/style change (subject to stock availability). If the exchanged item is of higher value, you will pay the difference.</li>
                    </ul>

                    <p className="mt-6 text-xs text-charcoal/60">
                        *We do not accept returns or exchanges for personalized, customized, intimate apparel, hygiene-related products, or final-sale items.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Returns;