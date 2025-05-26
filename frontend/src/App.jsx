import "./App.css";
import { Routes, Route } from "react-router-dom";
import Editor1 from "./Editor";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import Signup from "./components/Signup";


const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/api/create-room" element={<Editor1 />} />
        <Route path="/api/editor" element={<Editor1 />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
