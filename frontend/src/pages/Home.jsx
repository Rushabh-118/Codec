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
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-display font-bold text-xl flex items-center gap-2">
            <MonitorCog />
            <h1 className="text-2xl font-bold">
              Co<span className="text-[#F83002]">dac</span>
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Welcome,{" "}
                  <span className="text-[#F83002] font-semibold">{user.email}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-32 text-center">
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold bg-gray-100 rounded-full animate-fade-in">
          Introducing Our Platform
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 animate-fade-up">
          Create Beautiful <br /> Digital Experiences
        </h1>
        <p
          className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Transform your ideas into reality with our powerful and intuitive
          platform
        </p>
        <button
          onClick={handleGetStarted}
          className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors animate-fade-up hover:scale-105 hover:shadow-md"
          style={{ animationDelay: "0.3s" }}
        >
          Get Started
          <ArrowRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// ------------------------ Features ------------------------
const Features = () => {
  const features = [
    {
      title: "Intuitive Design",
      description: "Clean and modern interface that puts user experience first",
    },
    {
      title: "Powerful Tools",
      description: "Advanced features to help you achieve your goals faster",
    },
    {
      title: "Seamless Integration",
      description: "Works perfectly with your existing workflow and tools",
    },
  ];
  return (
    <section
      id="features"
      className="py-24 bg-gray-100 border-t-4 border-orange-500"
      style={{ minHeight: "400px" }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold bg-orange-100 text-orange-700 rounded-full">
            Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Everything you need
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Our platform provides all the tools and features you need to succeed
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="font-display text-xl font-semibold mb-3 text-gray-900">
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

// ------------------------ Footer ------------------------
const Footer = () => {
  return (
    <footer
      className="bg-gray-900 text-white py-12 mt-24 border-t-4 border-orange-600"
      style={{ fontSize: "1rem" }}
    >
      <div className="container mx-auto px-4 text-center">
        <p className="mb-2 font-semibold">
          Code <b>Together</b>, Create <b>Together</b>
        </p>
        <p className="text-sm opacity-80">&copy; 2025 CCE. All rights reserved.</p>
      </div>
    </footer>
  );
};

// ------------------------ Home ------------------------
const Home = () => {
  return (
    <div>
      <Navigation />
      <Hero />
      <Features />
      <Footer />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Home;
