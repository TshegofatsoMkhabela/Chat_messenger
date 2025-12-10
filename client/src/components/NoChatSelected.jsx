import React from 'react'
import assets from '../assets/assets'

const NoChatSelected = () => {
    return (
        <div className='flex flex-col items-center justify-center gap-4 h-full bg-slate-50 text-slate-400 grayscale opacity-80 max-md:hidden'>
            <img src={assets.logo_icon} className='max-w-24 opacity-20' alt="" />
            <p className='text-xl font-medium text-slate-400'>Select a chat to start messaging</p>
        </div>
    )
}

export default NoChatSelected
