import React, { useContext } from "react";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from "./context/AdminContext";
import { DoctorContext } from "./context/DoctorContext";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointements from "./pages/Admin/AllAppointements";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const location = useLocation();
  
  // Check current path to determine which login form to show
  const isDoctorLoginPage = location.pathname === "/doctor-login";

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      <ToastContainer />
      
      {/* Show layout only if logged in */}
      {aToken || dToken ? (
        <>
          <Navbar />
          <div className="flex items-start">
            <Sidebar />
            <div className="flex-1 p-5">
              <Routes>
                {/* Admin Routes */}
                {aToken && (
                  <>
                    <Route path="/" element={<Navigate to="/admin-dashboard" />} />
                    <Route path="/admin-dashboard" element={<Dashboard />} />
                    <Route path="/all-appointements" element={<AllAppointements />} />
                    <Route path="/add-doctor" element={<AddDoctor />} />
                    <Route path="/doctor-list" element={<DoctorsList />} />
                    <Route path="*" element={<Navigate to="/admin-dashboard" />} />
                  </>
                )}
                
                {/* Doctor Routes */}
                {dToken && (
                  <>
                    <Route path="/" element={<Navigate to="/doctor-dashboard" />} />
                    <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                    <Route path="/doctor-appointments" element={<DoctorAppointments />} />
                    <Route path="/doctor-profile" element={<DoctorProfile />} />
                    <Route path="*" element={<Navigate to="/doctor-dashboard" />} />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </>
      ) : (
        // Show login when not logged in
        <Routes>
          <Route path="/" element={<Navigate to="/admin-login" />} />
          <Route path="/admin-login" element={<Login isAdmin={true} />} />
          <Route path="/doctor-login" element={<Login isDoctor={true} />} />
          <Route path="*" element={<Navigate to="/admin-login" />} />
        </Routes>
      )}
    </div>
  );
};

export default App;