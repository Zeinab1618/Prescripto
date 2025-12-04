import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
  
  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  // Get payment status badge
  const getPaymentStatus = (appointment) => {
    if (appointment.cancelled) {
      return { 
        text: 'Cancelled', 
        color: 'bg-red-100 text-red-800',
        width: 'w-20'
      }
    }
    
    if (appointment.payment) {
      return { 
        text: 'Paid', 
        color: 'bg-green-100 text-green-800',
        width: 'w-12'
      }
    }
    
    return { 
      text: 'Pending Payment', 
      color: 'bg-yellow-100 text-yellow-800',
      width: 'w-28'
    }
  }

  // Handle complete button click with payment check
  const handleCompleteClick = (appointment) => {
    if (!appointment.payment) {
      toast.error('Cannot mark as complete until payment is made')
      return
    }
    completeAppointment(appointment._id)
  }

  // Handle cancel button click
  const handleCancelClick = (appointment) => {
    if (appointment.isCompleted) {
      toast.error('Cannot cancel a completed appointment')
      return
    }
    cancelAppointment(appointment._id)
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>
      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        {/* Header with centered text alignment */}
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1.2fr_0.8fr_2fr_0.8fr_1fr] gap-1 py-3 px-6 border-b'>
          <p className='text-center'>#</p>
          <p className='text-left'>Patient</p>
          <p className='text-center'>Payment Status</p>
          <p className='text-center'>Age</p>
          <p className='text-center'>Date & Time</p>
          <p className='text-center'>Fees</p>
          <p className='text-center'>Action</p>
        </div>
        
        {appointments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No appointments found
          </div>
        ) : (
          appointments.reverse().map((item, index) => {
            const paymentStatus = getPaymentStatus(item)
            
            return (
              <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid sm:grid-cols-[0.5fr_2fr_1.2fr_0.8fr_2fr_0.8fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
                <p className='max-sm:hidden text-center'>{index + 1}</p>
                
                <div className='flex items-center gap-2'>
                  <img className='w-8 rounded-full' src={item.userData.image} alt="" /> 
                  <p>{item.userData.name}</p>
                </div>
                
                {/* Payment Status Badge - Centered */}
                <div className='flex justify-center'>
                  <div className={`text-xs inline-flex items-center justify-center rounded ${paymentStatus.color} ${paymentStatus.width} h-6`}>
                    <span className="px-2 text-center leading-tight">{paymentStatus.text}</span>
                  </div>
                </div>
                
                <p className='max-sm:hidden text-center'>{calculateAge(item.userData.dob)}</p>
                
                <div className="min-w-[120px] text-center">
                  <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
                </div>
                
                <p className="font-medium text-center">{currency}{item.amount}</p>
                
                {/* Action Buttons - Centered */}
                <div className='flex justify-center'>
                  {item.cancelled ? (
                    <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                  ) : item.isCompleted ? (
                    <p className='text-green-400 text-xs font-medium'>Completed</p>
                  ) : (
                    <>
                      <img 
                        onClick={() => handleCancelClick(item)} 
                        className='w-10 cursor-pointer hover:opacity-80' 
                        src={assets.cancel_icon} 
                        alt="Cancel Appointment" 
                        title="Cancel Appointment"
                      />
                      <img 
                        onClick={() => handleCompleteClick(item)} 
                        className='w-10 cursor-pointer hover:opacity-80' 
                        src={assets.tick_icon} 
                        alt="Mark as Complete" 
                        title={item.payment ? "Mark as Complete" : "Payment pending - cannot complete"}
                      />
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default DoctorAppointments