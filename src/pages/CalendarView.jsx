// import React from 'react'
import axios from "axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
} from "date-fns";
import { useEffect, useState, useContext } from "react";
import { BsCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);

  // Fetch events and user's tickets from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsResponse, ticketsResponse] = await Promise.all([
          axios.get("https://ems-backend-9cfa.onrender.com/events", {
            withCredentials: true,
          }),
          user
            ? axios.get(
                `https://ems-backend-9cfa.onrender.com/tickets/user/${user._id}`,
                {
                  withCredentials: true,
                }
              )
            : Promise.resolve({ data: [] }),
        ]);

        setEvents(eventsResponse.data);
        setUserTickets(ticketsResponse.data);
        console.log("userTickets", ticketsResponse.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Create an array of empty cells to align days correctly
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, index) => (
    <div
      key={`empty-${index}`}
      className="p-2 bg-white ring-4 ring-background"
    ></div>
  ));

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        format(new Date(event.eventDate), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
  };

  // Get event color based on user role and event ownership/booking
  const getEventColor = (event) => {
    if (!user) return "bg-primary"; // Default color for non-logged in users

    if (user.role === "organizer") {
      // For organizers, show different colors based on event status
      if (event.organizer?._id === user._id) {
        switch (event.status) {
          case "approved":
            return "bg-green-600"; // Green for approved events
          case "pending":
            return "bg-yellow-500"; // Yellow for pending events
          case "rejected":
            return "bg-red-600"; // Red for rejected events
          default:
            return "bg-primary";
        }
      }
      return "bg-primary"; // Other events in primary color
    }

    if (user.role === "user") {
      // For regular users, show green if they have a ticket for the event
      const hasTicket = userTickets.some(
        (ticket) => ticket.eventId._id == event._id
      );
      return hasTicket ? "bg-green-600" : "bg-primary";
    }

    // For venue owners, show all events in primary color
    return "bg-primary";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <BsCaretLeftFill className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <BsFillCaretRightFill className="w-6 h-6" />
            </button>
          </div>

          {/* Legend for event status colors */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            {user?.role === "organizer" ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Approved Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Pending Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Rejected Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span>Other Events</span>
                </div>
              </>
            ) : user?.role === "user" ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Events with Tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span>Available Events</span>
                </div>
              </>
            ) : user?.role === "venue_owner" ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                  <span>Events at Your Venues</span>
                </div>
              </>
            ) : null}
          </div>

          <div className="grid grid-cols-7">
            {emptyCells.concat(
              daysInMonth.map((date) => {
                const dayEvents = getEventsForDate(date);
                return (
                  <div
                    key={date.toISOString()}
                    className={`p-2 relative top-0 pb-20 sm:pb-24 ring-4 bg-white ring-background flex flex-col items-start justify-start
                    ${
                      dayEvents.length > 0
                        ? "hover:bg-gray-50 transition-colors"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className="font-bold">{format(date, "dd")}</div>
                      {dayEvents.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-8 w-full">
                      {dayEvents.map((event) => (
                        <div key={event._id} className="mt-1">
                          <Link
                            to={"/event/" + event._id}
                            className="block hover:bg-blue-50 rounded transition-colors"
                          >
                            <div
                              className={`text-white ${getEventColor(
                                event
                              )} rounded p-1 font-bold text-xs md:text-sm md:p-2`}
                            >
                              {event.title.toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {format(new Date(event.eventDate), "h:mm a")}
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
