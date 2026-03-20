import { motion } from 'framer-motion';

const Contact = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-offwhite min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-6xl mx-auto">

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif text-charcoal tracking-wide mb-4">Contact Us</h1>
                    <div className="w-16 h-px bg-charcoal/30 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

                    {/* Contact Details Form side */}
                    <div className="bg-white p-8 md:p-12 shadow-sm border border-charcoal/5">
                        <h2 className="text-2xl font-serif text-charcoal mb-6">Get in Touch</h2>
                        <p className="text-charcoal/60 font-light mb-10">
                            If you’ve got great products you're making or looking to work with us, drop us a line.
                        </p>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs tracking-widest uppercase text-charcoal/50 mb-1">WhatsApp</h3>
                                <p className="text-lg text-charcoal">+91 9123920055</p>
                            </div>
                            <div>
                                <h3 className="text-xs tracking-widest uppercase text-charcoal/50 mb-1">Email</h3>
                                <p className="text-lg text-charcoal">connect@sonish.co.in</p>
                            </div>
                            <div>
                                <h3 className="text-xs tracking-widest uppercase text-charcoal/50 mb-1">Location</h3>
                                <p className="text-lg text-charcoal">Kolkata, West Bengal, India</p>
                            </div>
                        </div>
                    </div>

                    {/* Map Side */}
                    <div className="h-[500px] w-full bg-gray-200">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.33439927708!2d88.26495085!3d22.5354063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277a33c2005a5%3A0xc364e03f0b240!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Sonish Location Kolkata"
                            className="grayscale contrast-125 opacity-90" // This CSS makes the Google map look moody and premium
                        ></iframe>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default Contact;