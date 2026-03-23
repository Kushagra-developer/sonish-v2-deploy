import { motion } from 'framer-motion';

const Privacy = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-offwhite min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif text-charcoal tracking-wide mb-4">Privacy Policy</h1>
                <div className="w-16 h-px bg-charcoal/30 mb-10"></div>

                <div className="space-y-8 text-sm md:text-base text-charcoal/80 font-light leading-relaxed">
                    <p>
                        Sonish.co.in (“we,” “us,” or “our”) is committed to protecting your privacy and handling your personal data responsibly in full compliance with the Digital Personal Data Protection Act, 2023 (DPDPA), the Digital Personal Data Protection Rules, 2025, and other applicable Indian laws. This Privacy Policy explains how we collect, use, store, share, and safeguard your personal data.
                    </p>

                    <h2 className="text-xl font-serif text-charcoal mt-8 mb-4">Data Collection & Usage</h2>
                    <p>
                        Personal data includes any information relating to an identified or identifiable individual, such as your name, email address, phone number, delivery/billing address, payment information, IP address, device details, browsing activity, and order history. We collect only the minimum data necessary to provide our Services, process orders, enhance your shopping experience, and meet legal obligations.
                    </p>
                    <p>
                        We process your personal data for legitimate and specified purposes, including fulfilling and delivering your orders, processing payments, providing customer support, sending essential transactional communications, detecting and preventing fraud, and complying with statutory requirements. We do not sell, rent, or trade your personal data to third parties for marketing purposes.
                    </p>

                    <h2 className="text-xl font-serif text-charcoal mt-8 mb-4">Your Rights</h2>
                    <p>
                        As a data principal under the DPDPA, you have rights including access to your data, correction of inaccuracies, erasure (subject to legal retention obligations), restriction of processing, and the ability to nominate a representative. You may also withdraw consent or raise grievances at any time.
                    </p>

                    <h2 className="text-xl font-serif text-charcoal mt-8 mb-4">Contact & Updates</h2>
                    <p>
                        To exercise these rights or for any privacy-related questions, contact our Grievance Officer at <strong>support@sonish.co.in</strong> or via WhatsApp. This Privacy Policy may be updated periodically to reflect changes in our practices, technology, or legal requirements. This Policy is governed by the laws of India.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Privacy;