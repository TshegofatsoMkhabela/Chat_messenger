import React, { useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/useChatStore'

const RightSidebar = () => {

    const { selectedUser, messages } = useChatStore()
    const { logout, onlineUsers } = useAuthStore()
    const [msgImages, setMsgImages] = useState([])

    // Get all the images from the messages and set them to state
    useEffect(() => {
        setMsgImages(
            (messages || []).filter(msg => msg.image).map(msg => msg.image)
        )
    }, [messages])

    return selectedUser && (
        <div className={`bg-white text-slate-700 w-full h-full border-l border-[#e5e7eb] flex flex-col ${selectedUser ? "max-md:hidden" : ""}`}>

            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto no-scrollbar pb-10'>
                <div className='pt-16 flex flex-col items-center gap-3 text-xs font-light mx-auto'>
                    <img src={selectedUser?.profilePic || assets.avatar_icon} alt=""
                        className='w-24 aspect-[1/1] rounded-full object-cover shadow-lg border-4 border-white ring-1 ring-gray-100' />
                    <h1 className='px-10 text-xl font-bold mx-auto flex items-center gap-2 text-[#2e0a45]'>
                        {onlineUsers.includes(selectedUser._id) && <p className='w-2 h-2 rounded-full bg-green-500'></p>}
                        {selectedUser.fullName}
                    </h1>
                    <p className='px-10 mx-auto text-slate-500 font-medium text-center'>{selectedUser.bio}</p>
                </div>

                <hr className="border-gray-200 my-6 mx-5" />

                <div className="px-5 text-xs text-slate-500 font-medium">
                    <p className='mb-3'>Media</p>
                    <div className='max-h-[300px] grid grid-cols-2 gap-3'>
                        {msgImages.map((url, index) => (
                            <div key={index} onClick={() => window.open(url)} className='cursor-pointer rounded-xl overflow-hidden shadow-sm hover:scale-105 transition-transform aspect-square'>
                                <img src={url} alt="" className='h-full w-full object-cover' />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Footer */}
            <div className='p-6 bg-white border-t border-gray-100'>
                <button onClick={() => logout()} className='w-full bg-[#5a0f85] text-white hover:bg-[#480c6b] text-sm font-medium py-3 rounded-xl cursor-pointer shadow-lg shadow-purple-200 transition-all active:scale-95'>
                    Logout
                </button>
            </div>

        </div>
    )
}

export default RightSidebar
