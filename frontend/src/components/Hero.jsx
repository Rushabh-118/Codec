import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import picture from "../assets/hero_image.svg";
import { ArrowRight, ChevronDown } from "lucide-react";

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
  const [currentLoopIndex, setCurrentLoopIndex] = useState(0);

  const loopingTexts = [
    "Real-Time Collaboration",
    "Multiplayer Coding",
    "Live Code Sharing",
    "Instant Sync",
    "Team Development"
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoopIndex((prev) => (prev + 1) % loopingTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/api/create-room");
    } else {
      toast.error("Please log in to continue");
      navigate("/login");
    }
  };

  if (isLoading) {
    return null; // Or a loading skeleton if desired
  }

  return (
    <motion.section
      id="hero"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden pt-16 pb-24"
    >
      <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-purple-900 dark:opacity-20"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-blue-900 dark:opacity-20"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-indigo-900 dark:opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-12 relative z-10">
        <motion.div
          variants={slideInVariants}
          className="w-full lg:w-1/2 flex justify-center lg:justify-start order-1"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.4,
            }}
            className="relative"
          >
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl opacity-20 blur-xl dark:opacity-15"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.img
              src={picture}
              alt="Collaborative code editor interface"
              loading="lazy"
              className="relative max-w-full h-auto rounded-xl shadow-2xl border-8 border-white/50 dark:border-gray-800/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.6,
              }}
              className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
              whileHover={{
                y: -5,
                rotate: 3,
              }}
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl">
                👨‍💻
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 1,
                duration: 0.6,
              }}
              className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
              whileHover={{
                y: -5,
                rotate: -3,
              }}
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 text-2xl">
                👩‍💻
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="w-full lg:w-1/2 text-center lg:text-left px-4 lg:px-0 order-2"
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
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 font-display leading-tight text-gray-900 dark:text-white"
          >
            <span className="block">The Ultimate</span>
            <div className="relative h-20 md:h-24 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentLoopIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute left-0 text-indigo-600 dark:text-indigo-400"
                >
                  {loopingTexts[currentLoopIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="block">Code Editor</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto lg:mx-0 dark:text-gray-300 leading-relaxed"
          >
            Transform your workflow with our real-time collaborative platform designed for teams to code together seamlessly.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
          >
            <motion.span
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-800 text-sm font-medium rounded-full shadow-sm border border-gray-100 dark:bg-gray-800/80 dark:text-gray-200 dark:border-gray-700"
            >
              ⚡ Live Code Sharing
            </motion.span>
            <motion.span
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-800 text-sm font-medium rounded-full shadow-sm border border-gray-100 dark:bg-gray-800/80 dark:text-gray-200 dark:border-gray-700"
            >
              👨‍💻 Multiplayer Editing
            </motion.span>
            <motion.span
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-800 text-sm font-medium rounded-full shadow-sm border border-gray-100 dark:bg-gray-800/80 dark:text-gray-200 dark:border-gray-700"
            >
              🔒 Secure & Private
            </motion.span>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
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
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="ml-3 relative z-10"
              >
                <ArrowRight size={20} />
              </motion.span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Scroll down
          </span>
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <ChevronDown className="text-gray-500 dark:text-gray-400" size={24} />
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full h-16 md:h-24"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className="fill-current text-indigo-100 dark:text-gray-800"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            className="fill-current text-indigo-100 dark:text-gray-800"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-current text-indigo-50 dark:text-gray-900"
          ></path>
        </svg>
      </div>
    </motion.section>
  );
};

export default Hero;
