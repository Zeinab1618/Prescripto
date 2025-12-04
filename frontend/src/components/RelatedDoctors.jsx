import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({speciality, docId}) => {
    const {doctors} = useContext(AppContext)
    const navigate = useNavigate()
    const [relDoc, setRelDocs] = useState([])

    useEffect(() => {
        if(doctors && doctors.length > 0 && speciality){
            // Filter doctors by speciality and exclude current doctor
            const doctorsData = doctors.filter((doc) => 
                doc.speciality === speciality && doc._id !== docId
            )
            setRelDocs(doctorsData)
        } else {
            setRelDocs([])
        }
    }, [doctors, speciality, docId])

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
            <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>
            
            {relDoc.length > 0 ? (
                <>
                    <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                        {relDoc.slice(0,5).map((item, index) => (
                            <div
                                onClick={() => {
                                    if (item.available) {
                                        navigate(`/appointment/${item._id}`);
                                        window.scrollTo(0, 0);
                                    }
                                }}
                                className={`border border-blue-200 rounded-xl overflow-hidden transition-all duration-500 ${item.available ? "cursor-pointer hover:-translate-y-2" : "cursor-not-allowed opacity-50"}`}
                                key={item._id || index}
                            >
                                <img 
                                    className='w-full h-48 object-cover bg-blue-50' 
                                    src={item.image} 
                                    alt={item.name} 
                                /> 
                                <div className='p-4'>
                                    <div className='flex items-center gap-2 text-sm'>
                                        {item.available ? (
                                            <>
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                <span className="text-green-500">Available</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                <span className="text-red-500">Unavailable</span>
                                            </>
                                        )}
                                    </div>
                                    <p className='text-gray-900 text-lg font-medium truncate'>{item.name}</p>
                                    <p className='text-gray-600 text-sm truncate'>{item.speciality}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => { 
                            navigate('/doctors'); 
                            window.scrollTo(0, 0); 
                        }} 
                        className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:bg-blue-100 transition-colors'
                    >
                        More Doctors
                    </button>
                </>
            ) : (
                <div className='text-center py-10'>
                    <p className='text-gray-500'>No related doctors found</p>
                    <button 
                        onClick={() => { 
                            navigate('/doctors'); 
                            window.scrollTo(0, 0); 
                        }} 
                        className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-5 hover:bg-blue-100 transition-colors'
                    >
                        Browse All Doctors
                    </button>
                </div>
            )}
        </div>
    )
}

export default RelatedDoctors