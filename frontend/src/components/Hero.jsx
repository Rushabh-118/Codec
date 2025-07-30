import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import { ArrowRight, ChevronDown } from "lucide-react";
import SkeletonHero from "./SkeletonHero";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
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

const slideInVariants = {
  hidden: { x: -120, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });
  const [isLoading, setIsLoading] = useState(true);

  const texts = [
    "Anywhere",
    "Any Device",
    "One Platform",
    "The Web",
    "Your Browser",
  ];

  const [loopIndex, setLoopIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  useEffect(() => {
    if (charIndex < texts[loopIndex].length) {
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + texts[loopIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const hold = setTimeout(() => {
        setTypedText("");
        setCharIndex(0);
        setLoopIndex((prev) => (prev + 1) % texts.length);
      }, 2000);
      return () => clearTimeout(hold);
    }
  }, [charIndex, loopIndex, texts]);

  const handleGetStarted = () => {
    if (user) navigate("/api/create-room");
    else {
      toast.error("Please log in to continue");
      navigate("/login");
    }
  };

  if (isLoading) return <SkeletonHero />;

  return (
    <motion.section
      id="hero"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="relative min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center bg-no-repeat overflow-hidden pt-16 pb-24"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-gray-900/80" />
      
      {/* Gradient blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-purple-900 dark:opacity-20" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-blue-900 dark:opacity-20" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-indigo-900 dark:opacity-20" />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center gap-12 relative z-10 text-center">
        {/* Text Content */}
        <motion.div
          variants={containerVariants}
          className="w-full text-center px-4 lg:px-0"
        >
          <motion.span
            variants={itemVariants}
            className="inline-block px-4 py-2 mb-4 text-sm font-semibold bg-white/90 backdrop-blur-sm rounded-full shadow-sm dark:bg-gray-800/80 dark:text-gray-200 text-black border border-gray-100 dark:border-gray-700"
            whileHover={{ scale: 1.05 }}
          >
            🚀 Build Faster. Collaborate Better.
          </motion.span>

          <motion.h1
            variants={containerVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 font-display leading-tight text-white"
          >
            <span className="block">Develop from</span>
            <div className="relative h-20 md:h-24 mt-10 overflow-hidden font-mono">
              <span className="text-indigo-300 dark:text-indigo-300 text-4xl md:text-5xl">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </div>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-gray-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your workflow with our real-time collaborative platform
            designed for teams to code together seamlessly.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {[
              "⚡ Live Code Sharing",
              "👨‍💻 Multiplayer Editing",
              "🔒 Secure & Private",
            ].map((label, idx) => (
              <motion.span
                key={idx}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-800 text-sm font-medium rounded-full shadow-sm border border-gray-100 dark:bg-gray-800/80 dark:text-gray-200 dark:border-gray-700"
              >
                {label}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={handleGetStarted}
              whileHover={{
                scale: 1.05,
                y: -3,
                boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl transition-all hover:shadow-lg text-lg font-semibold overflow-hidden group"
            >
              <span className="relative z-10">Start Coding Now</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="ml-3 relative z-10"
              >
                <ArrowRight size={20} />
              </motion.span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-300 dark:text-gray-300 mb-2">
            Scroll down
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown
              className="text-gray-300 dark:text-gray-300"
              size={24}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;