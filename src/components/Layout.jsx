import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Layout = () => {
  const { user } = useUser();

  useEffect(() => {
    console.log("Current user:", user);
    console.log("User role:", user?.role);
  }, [user]);

  return (
    <div className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-800">
            Eventify
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                to="/calendar"
                className="text-gray-600 hover:text-gray-900"
              >
                Calendar
              </Link>
              {user?.role === "venueOwner" && (
                <>
                  <Link
                    to="/my-venues"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    My Venues
                  </Link>
                  <Link
                    to="/add-venue"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Add Venue
                  </Link>
                  <Link
                    to="/venue-requests"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Venue Requests
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{user.name}</span>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Profile
                </Link>
                <Link
                  to="/logout"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
