import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { MonitorCog } from "lucide-react";

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

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState("Free");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserPlan(parsedUser.plan || "Free");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userPlanUpdated", handleStorageChange);

    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userPlanUpdated", handleStorageChange);
    };
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

  const getPlanBadgeStyle = (plan) => {
    switch (plan) {
      case "Pro":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "Team":
        return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white";
      default:
        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/10 backdrop-blur-md shadow-md dark:bg-gray-800/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <MonitorCog className="text-[#3b82f6]" size={24} />
            </motion.div>
            <motion.h1
              onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
              className="text-2xl font-bold font-display text-black dark:text-white"
              whileHover={{ scale: 1.05 }}
            >
              Code<span className="text-[#3b82f6]">C</span>
            </motion.h1>
          </Link>

          <ul className="flex items-center gap-6">
            {["features", "testimonials", "pricing", "faq", "Feedback"].map((section) => (
              <motion.li key={section} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
                  className="text-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              </motion.li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-1 text-xs font-bold rounded-full ${getPlanBadgeStyle(userPlan)}`}
                >
                  {userPlan}
                </motion.div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome,{" "}
                  <span className="font-semibold text-[#F83002]">
                    {user.name ? user.name : user.email?.split("@")[0]}
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
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="text-sm text-gray-700 font-bold dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gray-900 dark:bg-white font-bold dark:text-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
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
                  <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-8.66h-1M4.34 12H3m15.07 6.07l-.71-.71M6.34 6.34l-.71-.71m12.02 0l-.71.71M6.34 17.66l-.71.71M12 5a7 7 0 100 14 7 7 0 000-14z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-gray-800 dark:text-gray-100" viewBox="0 0 20 20" fill="currentColor">
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

export default Navigation;
