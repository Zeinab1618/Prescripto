import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)
  
  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  // Handle cancel appointment with dashboard refresh
  const handleCancelAppointment = async (appointmentId) => {
    await cancelAppointment(appointmentId)
    // Refresh dashboard data after cancellation
    getDashData()
  }

  return dashData && (
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.doctor_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.doctors}</p>
            <p className='text-gray-400'>Doctors</p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>

      <div className='bg-white mt-8'>
        <div className='flex items-center gap-2.5 px-4 py-4 rounded-t border'>
          <img className='w-5' src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>
        <div className='border border-t-0'>
          {dashData.latestAppointments.map((item, index) => (
            <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100 border-b' key={index}>
              <img className='rounded-full w-10 h-10 object-cover' src={item.docData?.image || assets.doctor_icon} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.docData?.name || 'Doctor'}</p>
                <p className='text-gray-600'>{slotDateFormat(item.slotDate)}</p>
              </div>
              
              {/* Status Display Logic */}
              {item.cancelled ? (
                <span className='text-red-600 text-xs font-medium px-3 py-1.5 bg-red-50 rounded'>
                  Cancelled
                </span>
              ) : item.isCompleted ? (
                <span className='text-green-600 text-xs font-medium px-3 py-1.5 bg-green-50 rounded'>
                  Completed
                </span>
              ) : (
                <button
                  onClick={() => handleCancelAppointment(item._id)}
                  className='w-10 h-10 cursor-pointer hover:opacity-80 flex items-center justify-center'
                  title="Cancel Appointment"
                >
                  <img 
                    className='w-10'
                    src={assets.cancel_icon} 
                    alt="Cancel Appointment" 
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard