import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Section Fade-In
const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

// Staggered Items
const itemVariants = {
  hidden: { y: 60, opacity: 0, scale: 0.95 },
  visible: (i = 0) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.1,
    },
  }),
};

// Subtle Scale-Up
const scaleUpVariants = {
  hidden: { scale: 0.85, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

// Fancy Star Rating Component
const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1 mb-4" role="radiogroup" aria-label="Star Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = (hover || rating) >= star;
        return (
          <motion.button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`text-4xl transition-all duration-300 focus:outline-none
              ${isActive
                ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                : "text-gray-300 hover:text-yellow-300"
              }`}
          >
            ★
          </motion.button>
        );
      })}
    </div>
  );
};

const FeedbackForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rating }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      await response.json();
      toast.success("Thank you for your feedback! 🎉");
      setFormData({ name: "", email: "", message: "" });
      setRating(0);
    } catch (error) {
      toast.error("Submission failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      id="Feedback"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInVariants}
      className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 
                 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div variants={itemVariants} custom={0} className="text-center mb-12">
          <motion.h2
            whileHover={{ scale: 1.03 }}
            className="text-4xl font-extrabold mb-4 text-gray-800 tracking-tight 
                       font-display dark:text-white"
          >
            Share Your Feedback
          </motion.h2>

          {/* Lottie */}
          <motion.div variants={scaleUpVariants} className="flex justify-center">
            <DotLottieReact
              src="https://lottie.host/77152b8e-09a3-4439-a2d8-414a11d40be6/uIN5YSUswm.lottie"
              autoplay
              loop
              style={{ width: 180, height: 180 }}
            />
          </motion.div>

          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your insights help us make the platform better for everyone.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          variants={scaleUpVariants}
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl shadow-2xl 
                     bg-white/40 dark:bg-gray-800/40 
                     backdrop-blur-xl border border-white/20 dark:border-gray-700/40 
                     transition-all duration-300 hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)]"
        >
          {/* Name */}
          <motion.div variants={itemVariants} custom={1}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-blue-500">*</span>
            </label>
            <motion.input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              whileFocus={{ scale: 1.01 }}
              className="w-full px-4 py-3 border border-gray-300/40 dark:border-gray-600/50 rounded-lg 
                         text-black dark:text-white bg-white/60 dark:bg-gray-700/50 
                         placeholder-gray-400 focus:outline-none 
                         focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500/60 
                         transition-all duration-200"
            />
          </motion.div>

          {/* Email */}
          <motion.div variants={itemVariants} custom={2}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-blue-500">*</span>
            </label>
            <motion.input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              whileFocus={{ scale: 1.01 }}
              className="w-full px-4 py-3 border border-gray-300/40 dark:border-gray-600/50 rounded-lg 
                         text-black dark:text-white bg-white/60 dark:bg-gray-700/50 
                         placeholder-gray-400 focus:outline-none 
                         focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500/60 
                         transition-all duration-200"
            />
          </motion.div>

          {/* Rating */}
          <motion.div variants={itemVariants} custom={3}>
            <label className="block mb-2 font-medium">Your Rating:</label>
            <StarRating rating={rating} setRating={setRating} />
          </motion.div>

          {/* Message */}
          <motion.div variants={itemVariants} custom={4}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message <span className="text-blue-500">*</span>
            </label>
            <motion.textarea
              name="message"
              rows="4"
              required
              value={formData.message}
              onChange={handleChange}
              whileFocus={{ scale: 1.01 }}
              className="w-full px-4 py-3 border border-gray-300/40 dark:border-gray-600/50 rounded-lg 
                         text-black dark:text-white bg-white/60 dark:bg-gray-700/50 
                         placeholder-gray-400 focus:outline-none 
                         focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500/60 
                         transition-all duration-200"
            />
          </motion.div>

          {/* Submit */}
          <motion.div variants={itemVariants} custom={5} className="pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center px-6 py-3 
                         rounded-lg text-white font-semibold tracking-wide 
                         bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 
                         hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 
                         focus:ring-4 focus:ring-blue-500/40 transition-all duration-300 
                         shadow-lg hover:shadow-[0_15px_40px_-10px_rgba(59,130,246,0.5)] 
                         disabled:opacity-70"
            >
              {isSubmitting ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
              ) : (
                "Submit Feedback"
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.section>
  );
};

export default FeedbackForm;
