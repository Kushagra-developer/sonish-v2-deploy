import { motion } from 'framer-motion';

const About = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-offwhite min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs tracking-widest uppercase text-charcoal/50 mb-3 block">Established 2025</span>
                    <h1 className="text-4xl md:text-6xl font-serif text-charcoal tracking-wide mb-6">
                        Designed to Make You<br />Feel Beautiful
                    </h1>
                    <div className="w-16 h-px bg-charcoal/30 mx-auto mb-8"></div>
                    <p className="text-lg text-charcoal/80 font-light leading-relaxed">
                        Welcome to our classic clothing store, where we believe that timeless style never goes out of fashion.
                        Our collection features classic pieces that are both stylish and versatile, perfect for building a wardrobe that will last for years.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="my-20 p-10 bg-white shadow-sm border border-charcoal/5">
                    <h2 className="text-2xl font-serif text-charcoal mb-4 text-center">Our Mission</h2>
                    <p className="text-charcoal/70 font-light leading-relaxed text-center">
                        Our mission is to empower people through sustainable fashion. We want everyone to look and feel good,
                        while also doing our part to help the environment. We believe that fashion should be stylish, affordable and accessible to everyone.
                        Body positivity and inclusivity are values that are at the heart of our brand.
                    </p>
                </div>

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
                    <div className="text-center">
                        <h3 className="text-sm tracking-widest uppercase text-charcoal mb-3 font-semibold">High-Quality Materials</h3>
                        <p className="text-sm text-charcoal/60 font-light">
                            Crafted with precision and excellence, our apparel is meticulously engineered using premium materials to ensure unmatched comfort and durability.
                        </p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-sm tracking-widest uppercase text-charcoal mb-3 font-semibold">Laconic Design</h3>
                        <p className="text-sm text-charcoal/60 font-light">
                            Simplicity refined. Our clothing embodies the essence of minimalistic design, delivering effortless style that speaks volumes.
                        </p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-sm tracking-widest uppercase text-charcoal mb-3 font-semibold">Various Sizes</h3>
                        <p className="text-sm text-charcoal/60 font-light">
                            Designed for every body and anyone, we embrace diversity with a wide range of sizes and shapes, celebrating the beauty of individuality.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default About;