import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {

  const {docId} = useParams() 
  const {doctors, currentSymbol, backendUrl, token, getDoctorsData} = useContext(AppContext)

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSolts, setDocSolts] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
  setDocSolts([])
  
  if (!docInfo) return

  const now = new Date()
  const availableDays = []
  
  // Always show 7 days starting from today or tomorrow based on time
  const startDay = now.getHours() >= 21 ? 1 : 0
  
  for(let dayOffset = startDay; dayOffset < 7 + startDay; dayOffset++) {
    const dateForDay = new Date(now)
    dateForDay.setDate(now.getDate() + dayOffset)
    dateForDay.setHours(0, 0, 0, 0)
    
    let startHour = 10
    let startMinute = 0
    
    // If it's today (and we're showing today), adjust start time
    if (dayOffset === 0 && startDay === 0) {
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      // If between 10 AM and 9 PM, find next available slot
      if (currentHour >= 10 && currentHour < 21) {
        // Round up to next 30-minute interval
        if (currentMinute <= 30) {
          startHour = currentHour
          startMinute = 30
        } else {
          startHour = currentHour + 1
          startMinute = 0
        }
        
        // If this takes us past 9 PM, skip today
        if (startHour >= 21) {
          continue
        }
      }
      // If before 10 AM, keep 10:00 AM start
    }
    
    // Create start time
    const startTime = new Date(dateForDay)
    startTime.setHours(startHour, startMinute, 0, 0)
    
    // End time is always 9 PM
    const endTime = new Date(dateForDay)
    endTime.setHours(21, 0, 0, 0)
    
    let timeSlots = []
    let slotTime = new Date(startTime)
    
    while(slotTime < endTime) {
      const formattedTime = slotTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      const day = slotTime.getDate()
      const month = slotTime.getMonth() + 1
      const year = slotTime.getFullYear()
      const slotDate = `${day}_${month}_${year}`
      
      // Check if slot is available
      const isSlotAvailable = !docInfo.slots_booked || 
                              !docInfo.slots_booked[slotDate] || 
                              !docInfo.slots_booked[slotDate].includes(formattedTime)
      
      if(isSlotAvailable) {
        timeSlots.push({
          datetime: new Date(slotTime),
          time: formattedTime,
          slotDate: slotDate
        })
      }
      
      slotTime.setMinutes(slotTime.getMinutes() + 30)
    }
    
    // Only add if there are slots available
    if (timeSlots.length > 0) {
      availableDays.push(timeSlots)
    }
  }
  
  setDocSolts(availableDays)
}

  const bookAppointment = async () => {
    try {
      console.log("=== BOOK APPOINTMENT ===");
    
      // Get the selected slot date
      const selectedDate = docSolts[slotIndex][0].datetime
      let day = selectedDate.getDate()
      let month = selectedDate.getMonth() + 1
      let year = selectedDate.getFullYear()

      const slotDate = day + '_' + month + '_' + year
    
      // Debug logging
      console.log("Selected date components:", { day, month, year })
      console.log("slotDate to send:", slotDate)
      console.log("slotTime:", slotTime)
      console.log("docId:", docId)
    
      // Validate we have all required data
      if (!slotDate || slotDate.includes('undefined') || slotDate.includes('NaN')) {
        console.error('❌ ERROR: Invalid date calculation')
        toast.error('Please select a valid date')
        return
      }
    
      if (!slotTime) {
        toast.error('Please select a time slot')
        return
      }
    
      if (!docId) {
        toast.error('Doctor information not found')
        return
      }
    
      // Send booking request
      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment', 
        {
          docId,        
          slotDate, 
          slotTime,
          slotId: `slot_${docId}_${slotDate}_${slotTime.replace(':', '')}`
        }, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )    
    
      console.log('Backend response:', data)
    
      if(data.success){
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log('Booking error:', error)
      console.log('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || error.message || "Failed to book appointment")
    }
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  useEffect(() => {
    console.log(docSolts);
  }, [docSolts])


  return docInfo && (
    <div>
      {/*----------------- Doctor Details ---------------------*/}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name} 
            <img src={assets.verified_icon} alt=""/>
          </p>

          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rouned-full'>{docInfo.experience}</button>
          </div>
          
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w[700px] mt-1'>{docInfo.about}</p>
          </div>

          <p className='text-gray-500 font-medium mt-4'>
            Appoiment fee: <span className='text-gray-600'>{currentSymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* ------- Booking slots ------- */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking slots</p>

        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSolts.length && docSolts.map((item,index)=>(
              <div 
                onClick={() => setSlotIndex(index)} 
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white': 'border border-gray-200'}`} 
                key={index}
              > 
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSolts.length && docSolts[slotIndex].map((item,index)=>(
            <p 
              onClick={() => setSlotTime(item.time)} 
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}  
              key={index}
            >
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>

        <button 
          onClick={bookAppointment}
          className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'
        >
          Book an appointment
        </button>
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality}/>
    </div>
  )
}

export default Appointment
