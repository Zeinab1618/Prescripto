import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {

  const { aToken, appointments, getAllAppointments, cancelAppointment, updatePaymentStatus } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
  
  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  const handlePaymentUpdate = async (appointmentId) => {
    if (window.confirm("Mark this appointment as paid?")) {
      await updatePaymentStatus(appointmentId)
    }
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>
      <div className='bg-white border round text-sm max-h-[88vh] min-h-[60vh] overflow-y-scroll'>
        {/* Updated grid with 9 columns for better spacing */}
        <div className='hidden sm:grid grid-cols-[0.5fr_2.5fr_1fr_2.5fr_2.5fr_1fr_1.5fr_1.5fr] grid-flow-col py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p className="text-center">Payment Status</p>
          <p className="text-center">Actions</p>
        </div>
        
        {appointments.reverse().map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2.5fr_1fr_2.5fr_2.5fr_1fr_1.5fr_1.5fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index + 1}</p>
            
            <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full' src={item.userData.image} alt="" />
              <p>{item.userData.name}</p>
            </div>
            
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            
            <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full bg-gray-200' src={item.docData.image} alt="" />
              <p>{item.docData.name}</p>
            </div>
            
            <p>{currency}{item.amount}</p>
            
            {/* Payment Status Column - Centered with more width */}
            <div className="flex justify-center">
              {item.cancelled ? (
                <span className="text-gray-400 text-xs">N/A</span>
              ) : item.payment ? (
                <span className="text-green-600 text-xs font-medium bg-green-50 px-3 py-1.5 rounded">
                  Paid
                </span>
              ) : (
                <button
                  onClick={() => handlePaymentUpdate(item._id)}
                  className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded transition-colors"
                >
                  Mark as Paid
                </button>
              )}
            </div>
            
            {/* Actions Column - Centered with more width */}
            <div className="flex justify-center">
              {item.cancelled ? (
                <span className='text-red-400 text-xs font-medium px-3 py-1.5'>Cancelled</span>
              ) : item.payment ? (
                <span className="text-gray-300">—</span>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className='w-8 h-8 cursor-pointer hover:opacity-80'
                  src={assets.cancel_icon}
                  alt="Cancel"
                  title="Cancel Appointment"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllAppointments