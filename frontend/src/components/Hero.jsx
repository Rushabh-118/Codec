import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
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
  hidden: { x: 120, opacity: 0 },
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

  const texts = ["Anywhere", "Any Device", "One Platform", "The Web", "Your Browser"];
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
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-24"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-blue-900/70 to-purple-900/70"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15)_0%,transparent_25%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.15)_0%,transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center gap-12 relative z-10">
        {/* Left text content */}
        <motion.div
          variants={containerVariants}
          className="flex-1 text-center lg:text-left"
        >
          <motion.span
            variants={itemVariants}
            className="inline-block px-4 py-2 mb-4 text-sm font-semibold bg-white/10 backdrop-blur-md rounded-full shadow-lg dark:bg-gray-800/80 text-white border border-white/20 dark:border-gray-700"
            whileHover={{ scale: 1.05 }}
          >
            🚀 Build Faster. Collaborate Better.
          </motion.span>

          <motion.h1
            variants={containerVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 font-display leading-tight text-white"
          >
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Develop from</span>
            <div className="relative h-20 md:h-24 mt-10 overflow-hidden">
              <span className="text-indigo-300 text-4xl md:text-5xl font-mono font-medium">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </div>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed"
          >
            Transform your workflow with our real-time collaborative platform
            designed for teams to code together seamlessly.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
          >
            {["⚡ Live Code Sharing", "👨‍💻 Multiplayer Editing", "🔒 Secure & Private"].map((label, idx) => (
              <motion.span
                key={idx}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium rounded-full shadow-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                {label}
              </motion.span>
            ))}
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
                boxShadow: "0 10px 25px rgba(79, 70, 229, 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
              className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl transition-all hover:shadow-xl text-lg font-semibold overflow-hidden group"
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

        {/* Right side image */}
        <motion.div
          variants={slideInVariants}
          className="flex-1 flex justify-center lg:justify-end"
        >
          <div className="relative">
            <img
              src="/hero_image.svg"
              alt="Hero Illustration"
              className="max-w-lg lg:max-w-xl xl:max-w-2xl object-contain relative z-10 drop-shadow-2xl"
            />
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full -z-0"></div>
          </div>
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
          {/* Mouse Shape */}
          <motion.div
            className="w-8 h-12 border-2 border-gray-300 rounded-full flex justify-center"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Wheel */}
            <motion.div
              className="w-1 h-3 bg-gray-300 rounded-full mt-2"
              animate={{ y: [0, 6, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Animated Chevrons */}
          <div className="flex flex-col items-center mt-1">
            {[0, 0.2].map((delay, idx) => (
              <motion.div
                key={idx}
                animate={{ y: [0, 5], opacity: [0.3, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay,
                  ease: "easeInOut",
                }}
              >
                <ChevronDown className="text-gray-300" size={18} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
