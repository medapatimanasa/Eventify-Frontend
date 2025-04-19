import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaTicketAlt,
} from "react-icons/fa";

export default function EventGallery() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log("Fetching events from:", `https://ems-backend-9cfa.onrender.com/events`);
      const response = await axios.get(
        `https://ems-backend-9cfa.onrender.com/events`,
        {
          withCredentials: true,
        }
      );
      console.log("Events response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setEvents(response.data);
      } else {
        setEvents([]);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching events:", err);
      if (err.response?.status === 401) {
        setError("Please log in to view events");
      } else if (err.response?.status === 403) {
        setError("You don&apos;t have permission to view events");
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.details ||
            "Failed to load events. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }
  if (error == "")
    if (error) {
      return (
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-red-500 mb-6 text-lg">{error}</div>
              <button
                onClick={fetchEvents}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Amazing Events
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and book tickets for your favorite events. From concerts to
            conferences, we&apos;ve got you covered.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-gray-50 rounded-lg shadow-lg">
              <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">
                No events available at the moment.
              </p>
              <p className="text-gray-500 mt-2">
                Check back later for new events!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link
                key={event._id}
                to={`/event/${event._id}`}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6"
              >
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300 text-gray-900">
                  {event.title}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <FaCalendarAlt className="mr-2 text-primary" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <FaMapMarkerAlt className="mr-2 text-primary" />
                    <span>{event.venue?.name || "Location TBD"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <FaUsers className="mr-2 text-primary" />
                    <span>{event.expectedAttendees} attendees</span>
                  </div>
                </div>
                <div className="mt-6">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                      event.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : event.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <Link
            to="/my-events"
            className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            View All Events
            <svg
              className="ml-3 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
