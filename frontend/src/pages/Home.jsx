import { ArrowRight, MonitorCog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

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
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/10 backdrop-blur-md shadow-md dark:bg-gray-800/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <MonitorCog className="text-[#F83002]" size={24} />
            <h1 className="text-2xl font-bold font-display dark:text-white">
              Co<span className="text-[#F83002]">dac</span>
            </h1>
          </Link>

          {/* Navigation links */}
          <ul className="flex items-center gap-6">
            <li>
              <button
                onClick={() =>
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Features
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  document.getElementById("Feedback")?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Feedback
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Footer
              </button>
            </li>
          </ul>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Auth controls */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, <span className="font-semibold text-[#F83002]">{user.email}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Dark mode toggle (new version with icons) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 transition-colors duration-300 relative group"
              aria-label="Toggle dark mode"
            >
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 transform group-hover:rotate-180">
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
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};;

// ------------------------ Hero ------------------------
const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/api/create-room");
    } else {
      toast.error("Please log in to continue");
      navigate("/login");
    }
  };

  return (
    <section className="min-h-[110vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white pt-16 pb-24 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center px-4 max-w-4xl mx-auto">
        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200">
          Build Faster. Collaborate Better.
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 font-display leading-tight dark:text-white">
          Create Beautiful <br /> Digital Experiences
        </h1>
        <p className="text-gray-600 text-lg md:text-xl mb-6 max-w-2xl mx-auto dark:text-gray-300">
          Transform your ideas into reality with our powerful and intuitive platform.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <span className="px-4 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full dark:bg-purple-900 dark:text-purple-300">
            Real-Time Collaboration
          </span>
          <span className="px-4 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full dark:bg-red-900 dark:text-red-300">
            Code with Friends
          </span>
          <span className="px-4 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full dark:bg-green-900 dark:text-green-300">
            Fast & Secure
          </span>
          <span className="px-4 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
            Real-Time Sync
          </span>
        </div>

        <button
          onClick={handleGetStarted}
          className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all hover:scale-105 hover:shadow-md"
        >
          Get Started
          <ArrowRight size={20} className="ml-2" />
        </button>
      </div>
    </section>
  );
};

// ------------------------ Features ------------------------
const Features = () => {
  const features = [
    {
      title: "Intuitive Design",
      description: "Clean and modern interface that puts user experience first",
      icon: "✨",
    },
    {
      title: "Powerful Tools",
      description: "Advanced features to help you achieve your goals faster",
      icon: "⚡",
    },
    {
      title: "Seamless Integration",
      description: "Works perfectly with your existing workflow and tools",
      icon: "🔗",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-orange-100 text-orange-700 rounded-full dark:bg-orange-800 dark:text-orange-300">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 font-display dark:text-white">
            Everything You Need
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto dark:text-gray-300">
            Our platform provides all the tools and features you need to succeed
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all dark:bg-gray-800"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ------------------------ Feedback ------------------------
const FeedbackForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <section id="Feedback" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 font-display dark:text-white">
            We'd Love Your Feedback
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your input helps us improve our platform
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-50 p-8 rounded-xl shadow-sm dark:bg-gray-800"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              id="message"
              rows="4"
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

// ------------------------ Footer ------------------------
const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-12 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <MonitorCog className="text-white" size={28} />
          </div>
          <p className="text-xl font-semibold mb-4">
            Code <span className="text-orange-400">Together</span>, Create{" "}
            <span className="text-orange-400">Together</span>
          </p>
          <p className="text-gray-400 text-sm dark:text-gray-300">
            &copy; {new Date().getFullYear()} CCE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// ------------------------ Home ------------------------
const Home = () => {
  return (
    <div className="overflow-x-hidden">
      <Navigation />
      <Hero />
      <Features />
      <FeedbackForm />
      <Footer />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Home;
