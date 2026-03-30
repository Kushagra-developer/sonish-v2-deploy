import { motion } from 'framer-motion';

const Shipping = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-offwhite min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif text-charcoal tracking-wide mb-4">Shipping Policy</h1>
                <div className="w-16 h-px bg-charcoal/30 mb-10"></div>

                <div className="space-y-6 text-sm md:text-base text-charcoal/80 font-light leading-relaxed">
                    <p>
                        We ship all orders across India using reliable logistics services to ensure safe and timely delivery. Orders are typically processed and dispatched within <strong>1–3 business days</strong> (Monday to Saturday, excluding public holidays) after successful payment confirmation.
                    </p>

                    <h2 className="text-xl font-serif text-charcoal mt-8 mb-4">Shipping Costs</h2>
                    <p>
                        There are <strong>no additional shipping charges</strong> applied to any order, regardless of value, weight, destination, or location within India. Cash on Delivery (COD) is available in most pin codes with no extra handling fee.
                    </p>

                    <h2 className="text-xl font-serif text-charcoal mt-8 mb-4">Estimated Delivery Times</h2>
                    <ul className="list-disc pl-5 space-y-3">
                        <li><strong>2–4 business days</strong> for most metro cities and major urban areas</li>
                        <li><strong>4–7 business days</strong> for Tier-2 and Tier-3 cities</li>
                        <li><strong>7–10 business days</strong> for remote, hilly regions, North-East states, and islands</li>
                    </ul>

                    <p className="mt-8">
                        These timelines are approximate and may vary slightly due to external factors. In the rare case of a lost, damaged, or undelivered package, we will investigate promptly and offer a full refund or reshipment at our discretion. For any questions, contact our support team at <strong>connect@sonish.co.in</strong>.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Shipping;