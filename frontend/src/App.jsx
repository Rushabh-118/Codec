import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import Editor1 from "./Editor";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./middleware/protectedRoute";

// Loader component
const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col gap-4 w-full h-full items-center justify-center z-50 bg-white bg-opacity-60">
      <div className="w-44 h-44 border-[14px] border-transparent text-blue-400 text-6xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
        <div className="w-32 h-32 border-[10px] border-transparent text-red-400 text-4xl animate-spin flex items-center justify-center border-t-red-400 rounded-full" />
      </div>
    </div>
  );
}

// Success component with redirect and toast
const Success = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Update user plan in localStorage and dispatch events
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Try to get the last selected plan from sessionStorage (set before redirect)
      const lastPlan = sessionStorage.getItem("lastSelectedPlan");
      if (lastPlan && (lastPlan === "Pro" || lastPlan === "Team")) {
        user.plan = lastPlan;
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("userPlanUpdated"));
        sessionStorage.removeItem("lastSelectedPlan");
      }
    }
    toast.success("Payment Successful! 🎉");
    const timer = setTimeout(() => navigate("/"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="text-center text-green-600 p-10">
      Payment Successful! 🎉
      <br />
      Redirecting to Home...
      <Loader />
    </div>
  );
};

// Cancel component with redirect and toast
const Cancel = () => {
  const navigate = useNavigate();
  useEffect(() => {
    toast.error("Payment Cancelled. ❌");
    const timer = setTimeout(() => navigate("/"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="text-center text-red-600 p-10">
      Payment Cancelled. ❌<br />
      Redirecting to Home...
      <Loader />
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route
          path="/api/create-room"
          element={
            <ProtectedRoute>
              <Editor1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/api/editor"
          element={
            <ProtectedRoute>
              <Editor1 />
            </ProtectedRoute>
          }
        />
        <Route path="/success" element={
          <ProtectedRoute>
            <Success />
          </ProtectedRoute>
          }
        />
        <Route path="/cancel" element={
          <ProtectedRoute>
            <Cancel />
          </ProtectedRoute>
        }
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
