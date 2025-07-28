import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import { ArrowRight } from "lucide-react";

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

const CTA = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const handleGetStarted = () => {
    if (user) {
      navigate("/api/create-room");
    } else {
      toast.error("Please log in to continue");
      navigate("/login");
    }
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInVariants}
      className="relative py-32 overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
    >
      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full opacity-10 dark:opacity-5"
      />
      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        className="absolute bottom-0 right-0 w-64 h-64 bg-orange-400 rounded-full opacity-10 dark:opacity-5"
      />

      <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
        <motion.div variants={itemVariants} className="mb-8">
          <motion.span
            whileHover={{ scale: 1.1 }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-white text-orange-600 rounded-full shadow dark:bg-gray-800 dark:text-orange-400"
          >
            Ready to get started?
          </motion.span>
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white tracking-tight"
        >
          Transform Your Coding{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            Collaboration
          </span>
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Join thousands of developers who are building better together with our
          platform.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4"
        >
          <motion.button
            onClick={handleGetStarted}
            whileHover={{
              scale: 1.05,
              y: -3,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg transition-all duration-300"
          >
            <span>Start Coding Now</span>
            <motion.div
              animate={{
                x: [0, 5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              <ArrowRight size={20} />
            </motion.div>
          </motion.button>

          <motion.button
            onClick={() =>
              document
                .getElementById("pricing")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold px-8 py-4 rounded-full shadow transition-all duration-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            <span>View Pricing</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CTA;
