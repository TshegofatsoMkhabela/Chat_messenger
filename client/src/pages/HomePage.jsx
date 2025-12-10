import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/authStore'
import NoChatSelected from '../components/NoChatSelected'

const HomePage = () => {

  const { selectedUser, selectedGroup, isRightSidebarOpen } = useChatStore()
  const { user } = useAuthStore()

  // Derived states
  // Check if any chat is selected (User or Group)
  const isChatSelected = !!(selectedUser || selectedGroup);
  // Right sidebar is currently only designed for Direct Messages (User Info)
  const showRightSidebar = selectedUser && isRightSidebarOpen;

  // Prevent rendering if user is logged out (redirect handled by App.jsx, but this prevents crash)
  if (!user) return null;

  return (
    <div className='w-full h-full'>
      <div className={`h-full grid grid-cols-1 relative 
        ${showRightSidebar ? 'lg:grid-cols-[1fr_2fr_1fr]' : 'lg:grid-cols-[1fr_3fr]'} 
        ${isChatSelected ? 'md:grid-cols-[2fr_3fr]' : 'md:grid-cols-[1fr_3fr]'}`}>

        <Sidebar />

        {!isChatSelected ? <NoChatSelected /> : <ChatContainer />}

        {/* Right Sidebar - only show if open, on large screens, and valid for current chat type */}
        {showRightSidebar && (
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  )
}
export default HomePage
