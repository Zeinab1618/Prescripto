import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch user's appointments
  const fetchAppointments = async () => {
    if (!token) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.get(backendUrl + '/api/user/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAppointments(response.data.appointments || []);
      } else {
        console.log('Backend error:', response.data.message);
      }
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const {data} = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        {appointmentId},
        {headers: { Authorization: `Bearer ${token}` }}
      )
      if(data.success){
        toast.success(data.message)
        fetchAppointments()
        getDoctorsData()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, [token, backendUrl]);

  // Function to extract date from slotId
  const getDateFromSlotId = (slotId) => {
    if (!slotId) return 'Date not set';
    
    const parts = slotId.split('_');
    if (parts.length >= 5) {
      const day = parts[2];
      const month = parts[3];
      const year = parts[4];
      return `${day}/${month}/${year}`;
    }
    
    return 'Invalid date format';
  };

  // Format date for booking date
  const formatBookingDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Get overall appointment status
  const getAppointmentStatus = (appointment) => {
    if (appointment.cancelled) {
      return { 
        text: 'Cancelled', 
        color: 'bg-red-100 text-red-800'
      };
    }
    
    if (appointment.isCompleted) {
      return { 
        text: 'Completed', 
        color: 'bg-green-100 text-green-800'
      };
    }
    
    if (appointment.payment) {
      return { 
        text: 'In Progress', 
        color: 'bg-blue-100 text-blue-800'
      };
    }
    
    return { 
      text: 'Pending Payment', 
      color: 'bg-yellow-100 text-yellow-800'
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Appointments</h1>
      
      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No appointments booked yet.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Book an Appointment
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {appointments.map((appointment, index) => {
            const status = getAppointmentStatus(appointment);
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {appointment.docData?.name || 'Doctor'}
                    </h2>
                    <p className="text-gray-600">{appointment.docData?.speciality || 'Specialist'}</p>
                  </div>
                  <div className={`px-4 py-1 rounded-full text-sm font-medium mt-2 md:mt-0 ${status.color}`}>
                    {status.text}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Appointment Date & Time</p>
                    <p className="font-medium">
                      {getDateFromSlotId(appointment.slotId)} at {appointment.slotTime || 'Time not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booked On</p>
                    <p className="font-medium">
                      {formatBookingDate(appointment.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fees</p>
                    <p className="font-medium">${appointment.amount || '0'}</p>
                  </div>
                </div>
                
                {/* Status Details Section - Only show when payment is made */}
                {appointment.payment && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-4">
                      {/* Payment Status - Always show when payment is made */}
                      <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-medium">Payment: Paid & Confirmed</span>
                      </div>
                      
                      {/* Appointment Status - Only show when payment is made */}
                      {!appointment.cancelled && (
                        <div className={`px-3 py-1.5 rounded-lg ${
                          appointment.isCompleted
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          <span className="text-sm font-medium">
                            Status: {appointment.isCompleted ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {/* Cancel Appointment Button - Only show if NOT paid and NOT cancelled and NOT completed */}
                  {!appointment.cancelled && !appointment.payment && !appointment.isCompleted && (
                    <button 
                      onClick={() => cancelAppointment(appointment._id)} 
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  )}
                  
                  {/* Status Messages */}
                  {appointment.payment && !appointment.cancelled && !appointment.isCompleted && (
                    <div className="text-blue-700 text-sm bg-blue-50 px-4 py-2 rounded-lg">
                      Payment confirmed. Waiting for doctor to complete the appointment.
                    </div>
                  )}
                  
                  {appointment.isCompleted && (
                    <div className="text-green-700 text-sm bg-green-50 px-4 py-2 rounded-lg">
                      Appointment completed successfully!
                    </div>
                  )}
                  
                  {appointment.cancelled && (
                    <div className="text-red-700 text-sm bg-red-50 px-4 py-2 rounded-lg">
                      This appointment has been cancelled.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default MyAppointments