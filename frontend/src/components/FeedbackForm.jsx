import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const itemVariants = {
  hidden: { y: 60, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const scaleUpVariants = {
  hidden: { scale: 0.85, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};


const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            outline: "none",
            fontSize: 28,
            color: (hover || rating) >= star ? "#fbbf24" : "#d1d5db",
            transition: "color 0.2s"
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

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
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5001/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rating }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      await response.json();
      toast.success("Thank you for your feedback!");
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
      className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title & Subtitle */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.h2
            whileHover={{ scale: 1.02 }}
            className="text-4xl font-extrabold mb-4 text-gray-800 tracking-tight font-display dark:text-white"
          >
            Share Your Feedback
          </motion.h2>
          {/* Lottie Animation */}
          <motion.div variants={scaleUpVariants} className="flex justify-center">
            <DotLottieReact
              src="https://lottie.host/77152b8e-09a3-4439-a2d8-414a11d40be6/uIN5YSUswm.lottie"
              autoplay
              style={{ width: 180, height: 180 }}
            />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your insights help us make the platform better for everyone.
          </p>
        </motion.div>

        {/* Feedback Form */}
        <motion.form
          variants={scaleUpVariants}
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl shadow-2xl 
                     bg-white/40 dark:bg-gray-800/40 
                     backdrop-blur-xl border border-white/20 dark:border-gray-700/40 
                     transition-all duration-300 hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)]"
        >
          {/* Name */}
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-blue-500">*</span>
            </label>
            <motion.input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300/40 dark:border-gray-600/50 rounded-lg 
                         text-black dark:text-white bg-white/60 dark:bg-gray-700/50 
                         placeholder-gray-400 focus:outline-none 
                         focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500/60 
                         transition-all duration-200"
            />
          </motion.div>

          {/* Email */}
          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-blue-500">*</span>
            </label>
            <motion.input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300/40 dark:border-gray-600/50 rounded-lg 
                         text-black dark:text-white bg-white/60 dark:bg-gray-700/50 
                         placeholder-gray-400 focus:outline-none 
                         focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500/60 
                         transition-all duration-200"
              whileFocus={{ scale: 1.01 }}
            />
          </motion.div>

          {/* Star Rating */}
          <motion.div variants={itemVariants}>
            <label className="block mb-2 font-medium">Your Rating:</label>
            <StarRating rating={rating} setRating={setRating} />
          </motion.div>

          {/* Message */}
          <motion.div variants={itemVariants}>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message <span className="text-blue-500">*</span>
            </label>
            <motion.textarea
              name="message"
              id="message"
              rows="4"
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300/40 dark:border-gray-600/50 rounded-lg 
                         text-black dark:text-white bg-white/60 dark:bg-gray-700/50 
                         placeholder-gray-400 focus:outline-none 
                         focus:ring-4 focus:ring-blue-500/40 focus:border-blue-500/60 
                         transition-all duration-200"
              whileFocus={{ scale: 1.01 }}
            ></motion.textarea>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting || rating === 0}
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
}

export default FeedbackForm;