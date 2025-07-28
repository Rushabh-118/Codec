import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const itemVariants = {
  hidden: { y: 60, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const scaleUpVariants = {
  hidden: { scale: 0.85, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5001/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      await response.json();
      toast.success("Thank you for your feedback!");
      setFormData({ name: "", email: "", message: "" });
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
      className="py-20 bg-white dark:bg-gray-900"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.h2
            whileHover={{ scale: 1.02 }}
            className="text-3xl font-bold mb-4 text-gray-800 font-display dark:text-white"
          >
            We'd Love Your Feedback
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 dark:text-gray-300"
          >
            Your input helps us improve our platform
          </motion.p>
        </motion.div>

        <motion.form
          variants={scaleUpVariants}
          onSubmit={handleSubmit}
          className="space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-lg dark:from-gray-800 dark:to-gray-700"
          whileHover={{
            boxShadow:
              "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          }}
        >
          <motion.div variants={itemVariants}>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
            >
              Name <span className="text-[#3b82f6]">*</span>
            </label>
            <motion.input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 text-black rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              whileFocus={{ scale: 1.01, borderColor: "#f97316" }}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
            >
              Email <span className="text-[#3b82f6]">*</span>
            </label>
            <motion.input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 text-black rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              whileFocus={{ scale: 1.01, borderColor: "#f97316" }}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
            >
              Message <span className="text-[#3b82f6]">*</span>
            </label>
            <motion.textarea
              name="message"
              id="message"
              rows="4"
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-black dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              whileFocus={{ scale: 1.01, borderColor: "#f97316" }}
            ></motion.textarea>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#0060fa] text-white rounded-md hover:from-[#3b82f6] hover:to-[#0060fa] transition-colors disabled:opacity-70"
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
