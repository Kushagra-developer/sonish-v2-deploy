import { motion } from 'framer-motion';

const FAQ = () => {
    const categories = [
        {
            title: "Shopping Information",
            questions: ["How do I find a product?", "Can I save products to my wishlist?", "How do I know if a product is in stock?", "Can I purchase products as a guest?"]
        },
        {
            title: "Payment Information",
            questions: ["What payment methods do you accept?", "Is my payment information secure?", "Can I use a coupon code?", "What happens if my payment fails?"]
        },
        {
            title: "Order Returns",
            questions: ["What is your return policy?", "How do I return an item?", "Who pays for the return shipping?", "Can I exchange an item?"]
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-offwhite dark:bg-charcoal transition-colors duration-300"
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-serif text-charcoal dark:text-offwhite tracking-wide mb-4 text-center">FAQ</h1>
                <div className="w-16 h-px bg-charcoal/30 dark:bg-offwhite/30 mx-auto mb-16"></div>

                <div className="space-y-16">
                    {categories.map((category, idx) => (
                        <div key={idx}>
                            <h2 className="text-2xl font-serif text-charcoal dark:text-offwhite mb-6 border-b border-charcoal/10 dark:border-offwhite/10 pb-4">{category.title}</h2>
                            <ul className="space-y-4">
                                {category.questions.map((q, qIdx) => (
                                    <li key={qIdx} className="text-charcoal/80 dark:text-offwhite/80 font-light hover:text-gold dark:hover:text-gold cursor-pointer transition-colors flex justify-between items-center group">
                                        <span>{q}</span>
                                        <span className="text-xl group-hover:rotate-45 transition-transform">+</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default FAQ;