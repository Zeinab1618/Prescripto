import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)
  const [localAppointments, setLocalAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (dToken) {
      fetchDashData()
    }
  }, [dToken])

  // Fetch dashboard data
  const fetchDashData = async () => {
    setIsLoading(true)
    await getDashData()
    setIsLoading(false)
  }

  // Update local appointments when dashData changes
  useEffect(() => {
    if (dashData?.latestAppointments) {
      setLocalAppointments([...dashData.latestAppointments])
    }
  }, [dashData])

  // Handle cancel button click
  const handleCancelClick = async (appointment) => {
    if (appointment.isCompleted) {
      toast.error('Cannot cancel a completed appointment')
      return
    }
    
    try {
      await cancelAppointment(appointment._id)
      
      // Update local state immediately
      setLocalAppointments(prev => 
        prev.map(item => 
          item._id === appointment._id 
            ? { ...item, cancelled: true, isCompleted: false }
            : item
        )
      )
      
      // Refresh dashboard data in background
      setTimeout(() => {
        getDashData()
      }, 300)
      
    } catch (error) {
      toast.error('Failed to cancel appointment')
    }
  }

  // Handle complete button click with payment check
  const handleCompleteClick = async (appointment) => {
    if (!appointment.payment) {
      toast.error('Cannot mark as complete until payment is made')
      return
    }
    
    try {
      await completeAppointment(appointment._id)
      
      // Update local state immediately
      setLocalAppointments(prev => 
        prev.map(item => 
          item._id === appointment._id 
            ? { ...item, isCompleted: true, cancelled: false }
            : item
        )
      )
      
      // Refresh dashboard data in background
      setTimeout(() => {
        getDashData()
      }, 300)
      
    } catch (error) {
      toast.error('Failed to complete appointment')
    }
  }

  return (
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        {/* Earnings Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>
              {currency}{dashData?.earnings || 0}
            </p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>

        {/* Appointments Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>
              {dashData?.appointments || 0}
            </p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>

        {/* Patients Card */}
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>
              {dashData?.patients || 0}
            </p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings Section */}
      <div className='bg-white mt-8'>
        <div className='flex items-center gap-2.5 px-4 py-4 rounded-t border'>
          <img className='w-5' src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
          {isLoading && (
            <span className="ml-2 text-sm text-gray-500">Updating...</span>
          )}
        </div>
        
        <div className='border border-t-0'>
          {localAppointments.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              {isLoading ? 'Loading appointments...' : 'No recent appointments'}
            </div>
          ) : (
            localAppointments.map((item, index) => (
              <div className='flex items-center justify-between px-6 py-3 hover:bg-gray-50 border-b' key={index}>
                <div className='flex items-center gap-3'>
                  <img className='rounded-full w-10 h-10 object-cover' src={item.userData?.image || assets.patients_icon} alt="" />
                  <div>
                    <p className='text-gray-800 font-medium'>{item.userData?.name || 'Patient'}</p>
                    <p className='text-gray-600 text-sm'>{slotDateFormat(item.slotDate)}</p>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className='flex gap-2'>
                  {item.cancelled ? (
                    <span className='text-red-600 text-xs font-medium px-3 py-1.5 bg-red-50 rounded'>
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className='text-green-600 text-xs font-medium px-3 py-1.5 bg-green-50 rounded'>
                      Completed
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCancelClick(item)}
                        className='w-10 h-10 cursor-pointer hover:opacity-80 flex items-center justify-center'
                        title="Cancel Appointment"
      
                      >
                        <img
                          className='w-10'
                          src={assets.cancel_icon}
                          alt="Cancel Appointment"
                        />
                      </button>
                      <button
                        onClick={() => handleCompleteClick(item)}
                        className='w-10 h-10 cursor-pointer hover:opacity-80 flex items-center justify-center'
                        title="Mark as Complete"
                      >
                        <img
                          className='w-10'
                          src={assets.tick_icon}
                          alt="Mark as Complete"
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard