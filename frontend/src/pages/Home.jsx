import { ArrowRight, MonitorCog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import picture from "../assets/hero_image.png";

// Advanced Animation Variants
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

const slideUpVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
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

const rotateVariants = {
  hidden: { rotate: -10, opacity: 0 },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "backOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const letterAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "backOut",
    },
  },
};

// Skeleton Loading Components (unchanged)
const SkeletonNav = () => (
  <nav className="fixed w-full z-50 bg-white/10 backdrop-blur-md shadow-md dark:bg-gray-800/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="w-24 h-6 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>

        <div className="flex items-center gap-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-md"
            ></div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  </nav>
);

const SkeletonHero = () => (
  <section className="min-h-[110vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white pt-16 pb-24 dark:from-gray-900 dark:to-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center md:items-start gap-12">
      {/* Left Image Skeleton */}
      <div className="w-full md:w-1/2">
        <div className="w-full h-96 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
      </div>

      {/* Right Content Skeleton */}
      <div className="w-full md:w-1/2 space-y-6">
        <div className="w-48 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="w-full h-12 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        <div className="w-3/4 h-6 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        <div className="flex flex-wrap gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-24 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"
            ></div>
          ))}
        </div>
        <div className="w-40 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  </section>
);

// ------------------------ Navigation ------------------------
export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 10,
      }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/10 backdrop-blur-md shadow-md dark:bg-gray-800/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MonitorCog className="text-[#F83002]" size={24} />
            </motion.div>
            <motion.h1
              onClick={() =>
                document
                  .getElementById("hero")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-2xl font-bold font-display text-black dark:text-white"
              whileHover={{ scale: 1.05 }}
            >
              Co<span className="text-[#F83002]">deC</span>
            </motion.h1>
          </Link>

          <ul className="flex items-center gap-6">
            {["features", "Feedback", "testimonials", "pricing", "faq"].map(
              (section) => (
                <motion.li
                  key={section}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() =>
                      document
                        .getElementById(section)
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="text-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                </motion.li>
              )
            )}
          </ul>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome,{" "}
                  <span className="font-semibold text-[#F83002]">
                    {user.email.split("@")[0]}
                  </span>
                </span>
                <motion.button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded hover:bg-slate-900 text-white bg-blue-600 transition-colors"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}

            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.15, rotate: 15 }}
              whileTap={{ scale: 0.85 }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 transition-colors duration-300 relative group"
              aria-label="Toggle dark mode"
            >
              <motion.div
                animate={darkMode ? "moon" : "sun"}
                variants={{
                  sun: { rotate: 0, opacity: 1 },
                  moon: { rotate: 180, opacity: 1 },
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {darkMode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v1m0 16v1m8.66-8.66h-1M4.34 12H3m15.07 6.07l-.71-.71M6.34 6.34l-.71-.71m12.02 0l-.71.71M6.34 17.66l-.71.71M12 5a7 7 0 100 14 7 7 0 000-14z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-800 dark:text-gray-100"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.293 13.293a8 8 0 01-10.586-10.586 8 8 0 1010.586 10.586z" />
                  </svg>
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

// ------------------------ Hero ------------------------
const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });
  const [isLoading, setIsLoading] = useState(true);
  const title = "Create Beautiful Digital Experiences";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Simulate loading delay
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

  const handleGetStarted = () => {
    if (user) {
      navigate("/api/create-room");
    } else {
      toast.error("Please log in to continue");
      navigate("/login");
    }
  };

  if (isLoading) {
    return <SkeletonHero />;
  }

  return (
    <motion.section
      id="hero"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="min-h-[110vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white pt-16 pb-24 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center md:items-start gap-12">
        {/* Left Image */}
        <motion.div
          variants={slideInVariants}
          className="w-full md:w-1/2 flex justify-center md:justify-start"
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
            <motion.img
              src={picture}
              alt="Hero"
              loading="lazy"
              className="max-w-full h-auto rounded-xl shadow-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.6,
              }}
              className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
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
              className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
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

        {/* Right Content */}
        <motion.div
          variants={containerVariants}
          className="w-full md:w-1/2 text-center md:text-left px-4 md:px-0"
        >
          <motion.span
            variants={itemVariants}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-black rounded-full dark:bg-gray-700 dark:text-gray-200"
            whileHover={{ scale: 1.05 }}
          >
            Build Faster. Collaborate Better.
          </motion.span>

          <motion.h1
            variants={containerVariants}
            className="text-4xl md:text-6xl font-bold mb-4 font-display leading-tight text-gray-900 dark:text-white"
          >
            {title.split(" ").map((word, wordIndex) => (
              <motion.span
                key={wordIndex}
                variants={staggerContainer}
                className="inline-block mr-2"
              >
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={letterIndex}
                    variants={letterAnimation}
                    custom={letterIndex}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
                {wordIndex < title.split(" ").length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-lg md:text-xl mb-6 max-w-2xl dark:text-gray-300"
          >
            Transform your ideas into reality with our powerful and intuitive
            platform.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center md:justify-start gap-4 mb-6"
          >
            <motion.span
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full dark:bg-purple-900 dark:text-purple-300"
            >
              Real-Time Collaboration
            </motion.span>
            <motion.span
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full dark:bg-red-900 dark:text-red-300"
            >
              Code with Friends
            </motion.span>
            <motion.span
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full dark:bg-green-900 dark:text-green-300"
            >
              Fast & Secure
            </motion.span>
            <motion.span
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full dark:bg-blue-900 dark:text-blue-300"
            >
              Real-Time Sync
            </motion.span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              onClick={handleGetStarted}
              whileHover={{
                scale: 1.05,
                y: -3,
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full transition-all hover:shadow-md text-lg font-semibold"
            >
              Get Started
              <motion.span
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="ml-3"
              >
                <ArrowRight size={20} />
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

// ------------------------ Features ------------------------
const Features = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const features = [
    {
      title: "Intuitive Design",
      description: "Clean and modern interface that puts user experience first",
      icon: "✨",
      color: "bg-purple-100 dark:bg-purple-900/50",
      textColor: "text-purple-600 dark:text-purple-300",
      delay: 0.1,
    },
    {
      title: "Powerful Tools",
      description: "Advanced features to help you achieve your goals faster",
      icon: "⚡",
      color: "bg-blue-100 dark:bg-blue-900/50",
      textColor: "text-blue-600 dark:text-blue-300",
      delay: 0.2,
    },
    {
      title: "Seamless Integration",
      description: "Works perfectly with your existing workflow and tools",
      icon: "🔗",
      color: "bg-green-100 dark:bg-green-900/50",
      textColor: "text-green-600 dark:text-green-300",
      delay: 0.3,
    },
    {
      title: "Real-time Collaboration",
      description: "Work simultaneously with your team in perfect sync",
      icon: "👥",
      color: "bg-orange-100 dark:bg-orange-900/50",
      textColor: "text-orange-600 dark:text-orange-300",
      delay: 0.4,
    },
    {
      title: "Secure & Private",
      description: "Enterprise-grade security for your peace of mind",
      icon: "🔒",
      color: "bg-red-100 dark:bg-red-900/50",
      textColor: "text-red-600 dark:text-red-300",
      delay: 0.5,
    },
    {
      title: "Cross-platform",
      description: "Works seamlessly across all your devices",
      icon: "📱",
      color: "bg-yellow-100 dark:bg-yellow-900/50",
      textColor: "text-yellow-600 dark:text-yellow-300",
      delay: 0.6,
    },
  ];

  return (
    <motion.section
      id="features"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInVariants}
      className="py-20 bg-gray-100 dark:bg-gray-900 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-orange-100 text-orange-700 rounded-full dark:bg-orange-800 dark:text-orange-300"
          >
            Features
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 font-display dark:text-white"
          >
            Everything You Need
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-700 max-w-2xl mx-auto dark:text-gray-300"
          >
            Our platform provides all the tools and features you need to succeed
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={slideUpVariants}
              custom={feature.delay}
              initial="hidden"
              animate="visible"
              whileHover={{
                y: -10,
                scale: 1.03,
                boxShadow:
                  "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              }}
              className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all dark:bg-gray-800"
            >
              <motion.div
                className={`w-16 h-16 ${feature.color} ${feature.textColor} rounded-full flex items-center justify-center text-2xl mb-6`}
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

// ------------------------ Feedback ------------------------
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
              Name <span className="text-red-500">*</span>
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
              Email <span className="text-red-500">*</span>
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
              Message <span className="text-red-500">*</span>
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
              className="w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-70"
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

// ------------------------ Testimonials ------------------------
const Testimonials = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      quote:
        "This platform has completely transformed how our team collaborates. The real-time features are incredible!",
      name: "Sarah Johnson",
      role: "Lead Developer",
      avatar: "👩‍💻",
      color: "bg-purple-100 dark:bg-purple-900",
    },
    {
      quote:
        "I've tried many collaboration tools, but none come close to the seamless experience this provides.",
      name: "Michael Chen",
      role: "Product Manager",
      avatar: "👨‍💼",
      color: "bg-blue-100 dark:bg-blue-900",
    },
    {
      quote:
        "As a freelancer, this tool helps me work with clients in real-time, making feedback loops much faster.",
      name: "David Wilson",
      role: "UI/UX Designer",
      avatar: "👨‍🎨",
      color: "bg-green-100 dark:bg-green-900",
    },
  ];

  return (
    <motion.section
      id="testimonials"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInVariants}
      className="py-20 bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-blue-100 text-blue-700 rounded-full dark:bg-blue-800 dark:text-blue-300">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 font-display dark:text-white">
            Trusted by Developers Worldwide
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto dark:text-gray-300">
            Don't just take our word for it - hear what our users have to say
          </p>
        </motion.div>

        <motion.div variants={containerVariants} className="relative h-96">
          <AnimatePresence mode="wait">
            {testimonials.map(
              (testimonial, i) =>
                activeIndex === i && (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                    className={`absolute inset-0 ${testimonial.color} p-8 rounded-3xl shadow-lg flex flex-col items-center justify-center text-center`}
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-6xl mb-6"
                    >
                      {testimonial.avatar}
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl text-gray-800 dark:text-gray-200 italic mb-6 max-w-2xl"
                    >
                      "{testimonial.quote}"
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <span className="block font-medium text-gray-900 dark:text-white">
                        {testimonial.name}
                      </span>
                      <span className="block text-sm text-gray-600 dark:text-gray-300">
                        {testimonial.role}
                      </span>
                    </motion.div>
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="flex justify-center gap-2 mt-8"
        >
          {testimonials.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveIndex(i)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`w-3 h-3 rounded-full ${
                activeIndex === i
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

// ------------------------ Pricing ------------------------
const Pricing = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const stripePromise = loadStripe(
    "pk_test_51Qir0GSAr3AIYJYDvsWQeUu1nqEzqEWY5HYBkWxeijRYjVzw02BMpWy3j1xQbN5WYVyZi8FUZT6NIav7WiP9Q5Fp005ZV3WYa6"
  );

  const handleCheckout = async (plan) => {
    setSelectedPlan(plan);

    if (plan === "Free") {
      toast.success("Free plan selected! No payment required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await res.json();
      const stripe = await stripePromise;

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      toast.error("Payment failed: " + error.message);
    } finally {
      setSelectedPlan(null);
    }
  };

  return (
    <motion.section
      id="pricing"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInVariants}
      className="py-20 bg-white dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-green-100 text-green-700 rounded-full dark:bg-green-800 dark:text-green-300">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 font-display dark:text-white">
            Simple & Transparent Pricing (INR)
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto dark:text-gray-300">
            Choose the perfect plan for your needs. No hidden fees.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-8 items-end"
        >
          {[
            {
              plan: "Free",
              price: 0,
              features: [
                "1 Room",
                "Basic Support",
                "Limited Collaboration",
                "Community Access",
              ],
              description: "Perfect for individuals",
              color:
                "from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600",
              textColor: "text-gray-800 dark:text-gray-200",
              delay: 0.1,
            },
            {
              plan: "Pro",
              price: 799,
              features: [
                "Unlimited Rooms",
                "Priority Support",
                "Advanced Tools",
                "Team Collaboration",
              ],
              popular: true,
              description: "For professional developers",
              color:
                "from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800",
              textColor: "text-white",
              delay: 0.2,
            },
            {
              plan: "Team",
              price: 2499,
              features: [
                "Unlimited Rooms",
                "Team Management",
                "Analytics Dashboard",
                "Admin Controls",
                "Dedicated Support",
              ],
              description: "Best for teams & organizations",
              color:
                "from-purple-500 to-indigo-600 dark:from-purple-700 dark:to-indigo-800",
              textColor: "text-white",
              delay: 0.3,
            },
          ].map((tier, i) => (
            <motion.div
              key={i}
              variants={slideUpVariants}
              custom={tier.delay}
              onHoverStart={() => setHoveredPlan(i)}
              onHoverEnd={() => setHoveredPlan(null)}
              className={`relative rounded-2xl overflow-hidden shadow-lg transition-all ${
                tier.popular
                  ? "transform md:scale-[1.03] ring-4 ring-blue-400"
                  : ""
              }`}
            >
              {tier.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-1 text-xs font-bold uppercase tracking-wide"
                >
                  Most Popular
                </motion.div>
              )}

              <motion.div
                animate={{
                  scale: hoveredPlan === i ? 1.02 : 1,
                }}
                className={`bg-gradient-to-br ${tier.color} p-1`}
              >
                <div
                  className={`bg-white dark:bg-gray-800 p-8 rounded-xl text-gray-900 dark:text-white"`}
                >
                  <h3 className="text-2xl font-semibold mb-2">{tier.plan}</h3>

                  <div className="mb-6">
                    <p className="text-4xl font-bold mb-1">
                      ₹{tier.price.toLocaleString("en-IN")}
                      <span className="text-lg font-normal"> /mo</span>
                    </p>
                    {tier.price > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        + GST as applicable
                      </p>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {tier.description}
                  </p>

                  <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-8">
                    {tier.features.map((f, j) => (
                      <motion.li
                        key={j}
                        whileHover={{ x: 5 }}
                        className="flex items-start gap-2"
                      >
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>{f}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button
                    onClick={() => handleCheckout(tier.plan)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={selectedPlan === tier.plan}
                    className={`w-full py-3 rounded-lg font-medium transition ${
                      tier.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    }`}
                  >
                    {selectedPlan === tier.plan ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="inline-block"
                      >
                        ⏳
                      </motion.span>
                    ) : tier.price === 0 ? (
                      "Get Started"
                    ) : (
                      "Subscribe Now"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 text-center text-gray-600 dark:text-gray-300"
        >
          <p>All prices in Indian Rupees (INR). Enterprise plans available.</p>
          <p className="mt-2 text-sm">
            Need help choosing?{" "}
            <button
              onClick={() =>
                document
                  .getElementById("Feedback")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Contact us
            </button>
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

// ------------------------ FAQ ------------------------
const FAQ = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <motion.section
      id="faq"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInVariants}
      className="py-20 bg-gray-100 dark:bg-gray-900"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-yellow-100 text-yellow-700 rounded-full dark:bg-yellow-800 dark:text-yellow-300">
            FAQ
          </span>
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto dark:text-gray-300">
            Find answers to common questions about our platform
          </p>
        </motion.div>

        <motion.div variants={containerVariants} className="space-y-4">
          {[
            {
              q: "Is it free to use?",
              a: "Yes, we offer a free tier for all users with basic features. You can upgrade to our Pro or Team plans for additional functionality.",
            },
            {
              q: "Can I invite friends to collaborate?",
              a: "Absolutely! Collaboration is at the core of our platform. You can invite as many collaborators as you need, depending on your plan.",
            },
            {
              q: "Is my code safe and secure?",
              a: "Yes, all sessions are encrypted and secure. We use industry-standard security measures to protect your data and code.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, PayPal, and bank transfers for our paid plans.",
            },
            {
              q: "Can I cancel my subscription anytime?",
              a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={slideUpVariants}
              className="overflow-hidden rounded-lg"
            >
              <motion.button
                onClick={() => toggleFAQ(i)}
                className="w-full text-left p-6 bg-white dark:bg-gray-800 shadow hover:shadow-md transition-all flex justify-between items-center"
                whileHover={{ scale: 1.01 }}
              >
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.q}
                </h4>
                <motion.div
                  animate={{ rotate: activeIndex === i ? 180 : 0 }}
                  className="ml-4"
                >
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </motion.div>
              </motion.button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: activeIndex === i ? "auto" : 0,
                  opacity: activeIndex === i ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="px-6 bg-white dark:bg-gray-800 overflow-hidden"
              >
                <p className="pb-6 text-gray-700 dark:text-gray-300">
                  {item.a}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

// ------------------------ CTA ------------------------
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
      {/* Animated background elements */}
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

// ------------------------ Footer ------------------------
const Footer = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.footer
      id="footer"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInVariants}
      className="bg-gray-900 text-white py-16 dark:bg-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          <motion.div variants={itemVariants} className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <motion.div whileHover={{ rotate: 15, scale: 1.1 }}>
                <MonitorCog className="text-white" size={28} />
              </motion.div>
              <h3 className="text-2xl font-bold">
                Code<span className="text-orange-400">Collab</span>
              </h3>
            </div>
            <p className="text-gray-400 dark:text-gray-300 mb-6">
              The ultimate platform for real-time code collaboration and team
              productivity.
            </p>
            <div className="flex gap-4">
              {["twitter", "github", "linkedin", "discord"].map((social, i) => (
                <motion.a
                  key={i}
                  variants={itemVariants}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                >
                  {social === "twitter" && "🐦"}
                  {social === "github" && "💻"}
                  {social === "linkedin" && "🔗"}
                  {social === "discord" && "💬"}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Testimonials", "FAQ"],
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "Blog", "Contact"],
            },
            {
              title: "Legal",
              links: ["Privacy", "Terms", "Security", "Cookie Policy"],
            },
          ].map((column, i) => (
            <motion.div key={i} variants={containerVariants}>
              <motion.h4
                variants={itemVariants}
                className="text-lg font-semibold mb-6"
              >
                {column.title}
              </motion.h4>
              <ul className="space-y-3">
                {column.links.map((link, j) => (
                  <motion.li key={j} variants={itemVariants}>
                    <motion.a
                      whileHover={{
                        x: 5,
                        color: "#f97316",
                        scale: 1.05,
                      }}
                      className="text-gray-400 hover:text-orange-400 dark:text-gray-300 dark:hover:text-orange-400 transition-colors"
                    >
                      {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 dark:text-gray-300"
        >
          <p>
            &copy; {new Date().getFullYear()} CodeCollab. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

// ------------------------ Home ------------------------
const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="overflow-x-hidden">
        <SkeletonNav />
        <SkeletonHero />
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <Navigation />
      <Hero />
      <Features />
      <FeedbackForm />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Home;
