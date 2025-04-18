import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";

export default function VenueRequestsPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("");

  useEffect(() => {
    if (user?.role !== "venue_owner") {
      navigate("/");
    } else {
      fetchVenueRequests();
    }
  }, [user, navigate]);

  const fetchVenueRequests = async () => {
    try {
      console.log("Fetching venue requests...");
      const response = await axios.get(
        `https://ems-backend-9cfa.onrender.com/event/venue-requests`,
        {
          withCredentials: true,
        }
      );
      console.log("Received response:", response.data);
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching venue requests:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.details ||
          "Failed to fetch venue requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      // Map the action to the correct status value
      const status = action === "approve" ? "approved" : "rejected";

      const response = await axios.patch(
        `https://ems-backend-9cfa.onrender.com/vevent/${requestId}/venue-request`,
        { action: status },
        { withCredentials: true }
      );

      if (response.data) {
        // Close the modal
        setShowModal(false);
        // Refresh the requests list
        await fetchVenueRequests();
      }
    } catch (err) {
      console.error("Error updating request:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.details ||
          "Failed to update request"
      );
    }
  };

  const openModal = (request, action) => {
    setSelectedRequest(request);
    setAction(action);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Venue Requests</h1>
          <button
            onClick={() => navigate("/my-venues")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Back to Venues
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 text-lg">No venue requests found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {request.title}
                    </h2>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        request.venueRequest.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.venueRequest.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.venueRequest.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(request.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{request.eventTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Attendees</p>
                      <p className="font-medium">{request.expectedAttendees}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-medium">₹{request.budget}</p>
                    </div>
                  </div>

                  {request.venueRequest.status === "pending" && (
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => openModal(request, "approve")}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openModal(request, "reject")}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {action === "approve" ? "Approve Request" : "Reject Request"}
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to {action} this request for{" "}
                  <span className="font-semibold">{selectedRequest.title}</span>
                  ?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction(selectedRequest._id, action)}
                    className={`px-4 py-2 text-white rounded transition-colors ${
                      action === "approve"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
