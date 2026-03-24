import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BrowseProjects from "./pages/BrowseProjects";
import PostProject from "./pages/PostProject";
import ProjectDetails from "./pages/ProjectDetails";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<BrowseProjects />} />
        <Route path="/post-project" element={<PostProject />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;