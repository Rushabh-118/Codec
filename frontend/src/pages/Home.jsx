import { ArrowRight, MonitorCog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

// ------------------------ Navigation ------------------------
export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <MonitorCog className="text-[#F83002]" size={24} />
            <h1 className="text-2xl font-bold font-display">
              Co<span className="text-[#F83002]">dac</span>
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">
                  Welcome,{" "}
                  <span className="font-semibold text-[#F83002]">
                    {user.email}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
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
          </div>
        </div>
      </div>
    </nav>
  );
};

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
    <section className="flex items-center justify-center bg-gradient-to-b from-gray-50 to-white pt-16 pb-24">
      <div className="text-center px-4 max-w-3xl mx-auto">
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold bg-gray-100 rounded-full">
          Introducing Our Platform
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display leading-tight">
          Create Beautiful <br /> Digital Experiences
        </h1>
        <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Transform your ideas into reality with our powerful and intuitive
          platform
        </p>
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
    <section id="features" className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold bg-orange-100 text-orange-700 rounded-full">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 font-display">
            Everything You Need
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Our platform provides all the tools and features you need to succeed
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Thank you for your feedback!");
      setFormData({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 font-display">
            We'd Love Your Feedback
          </h2>
          <p className="text-gray-600">
            Your input helps us improve our platform
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-50 p-8 rounded-xl shadow-sm"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
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
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <MonitorCog className="text-white" size={28} />
          </div>
          <p className="text-xl font-semibold mb-4">
            Code <span className="text-orange-400">Together</span>, Create{" "}
            <span className="text-orange-400">Together</span>
          </p>
          <p className="text-gray-400 text-sm">
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