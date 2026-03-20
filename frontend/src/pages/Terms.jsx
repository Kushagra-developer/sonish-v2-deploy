import { motion } from 'framer-motion';

const Terms = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-offwhite min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif text-charcoal tracking-wide mb-4">Terms & Conditions</h1>
                <div className="w-16 h-px bg-charcoal/30 mb-10"></div>

                <div className="space-y-8 text-sm md:text-base text-charcoal/80 font-light leading-relaxed">
                    <p>
                        These Terms and Conditions govern your access to and use of the website sonish.co.in. By accessing, browsing, or placing an order, you agree to be bound by these Terms, our Privacy Policy, Return & Exchange Policy, and Shipping Policy.
                    </p>

                    <div>
                        <h3 className="text-lg font-serif text-charcoal mb-2">1. Use of the Website and Account</h3>
                        <p>You must be at least 18 years old or have the legal capacity to enter into contracts to use our Services. You agree to provide accurate, current, and complete information during registration or checkout. We reserve the right to suspend or terminate accounts for any violation of these Terms.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif text-charcoal mb-2">2. Orders, Payment, and Pricing</h3>
                        <p>All orders placed are subject to availability and acceptance by us. Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We use secure payment gateways for transactions; all payments are non-refundable except as provided in our Return & Exchange Policy.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif text-charcoal mb-2">3. Intellectual Property</h3>
                        <p>All content on sonish.co.in, including text, graphics, logos, images, product descriptions, videos, and software, is the property of Sonish or its licensors and is protected by Indian and international copyright and trademark laws.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif text-charcoal mb-2">4. Limitation of Liability</h3>
                        <p>To the maximum extent permitted by law, Sonish, its owners, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif text-charcoal mb-2">5. Governing Law</h3>
                        <p>These Terms are governed by the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Terms;