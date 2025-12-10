import React, { useEffect, useRef } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/useChatStore'
import MessageInput from './MessageInput'
import { MessageSquare, ArrowLeft, TriangleAlert, Pencil } from 'lucide-react'
import EditGroupModal from './EditGroupModal'

const ChatContainer = () => {

    const { messages, getMessages, getGroupMessages, isMessagesLoading, selectedUser, selectedGroup, subscribeToMessages, unsubscribeFromMessages, isRightSidebarOpen, toggleRightSidebar } = useChatStore();
    const { user } = useAuthStore();
    const scrollEnd = useRef()
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    useEffect(() => {
        if (selectedUser?._id) {
            getMessages(selectedUser._id);
        } else if (selectedGroup?._id) {
            getGroupMessages(selectedGroup._id);
        }

        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [selectedUser?._id, selectedGroup?._id, getMessages, getGroupMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])


    // Fallback if nothing selected
    if (!selectedUser && !selectedGroup) {
        return (
            <div className='flex flex-col items-center justify-center gap-4 h-full bg-slate-50 text-slate-400 grayscale opacity-80 max-md:hidden'>
                <img src={assets.logo_icon} className='max-w-24 opacity-20' alt="" />
                <p className='text-xl font-medium text-slate-400'>Select a chat to start messaging</p>
            </div>
        )
    }

    const isGroup = !!selectedGroup;
    const chatTitle = isGroup ? selectedGroup.name : selectedUser.fullName;
    const chatImage = isGroup ? null : (selectedUser.profilePic || assets.avatar_icon);
    const chatSubtitle = isGroup ? `${selectedGroup.members.length} members` : null;

    return (
        <div className='h-full overflow-hidden relative bg-slate-50 flex flex-col'>
            {/* ------- header ------- */}
            <div className='flex items-center gap-3 py-3 px-4 border-b border-gray-200 bg-white'>
                {(isGroup && !selectedGroup.groupPic) ? (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#5a0f85] font-semibold text-lg border border-gray-100">
                        {chatTitle.charAt(0).toUpperCase()}
                    </div>
                ) : (
                    <img src={isGroup ? selectedGroup.groupPic : chatImage} alt="" className="w-10 h-10 object-cover rounded-full border border-gray-100" />
                )}

                <div className='flex-1'>
                    <p className='text-lg font-medium text-[#2e0a45] flex items-center gap-2'>
                        {chatTitle}
                        {isGroup && selectedGroup?.admin === user?._id && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className='p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#5a0f85]'
                                title='Edit Group Info'
                            >
                                <Pencil size={14} />
                            </button>
                        )}
                    </p>
                    {chatSubtitle && <p className='text-xs text-gray-500'>{chatSubtitle}</p>}
                </div>

                <button onClick={() => useChatStore.setState({ selectedUser: null, selectedGroup: null })} className='md:hidden'>
                    <ArrowLeft className='size-6 text-gray-500' />
                </button>
                <button
                    onClick={toggleRightSidebar}
                    className={`max-md:hidden transition-all ${isRightSidebarOpen ? 'text-[#5a0f85] bg-purple-100' : 'text-gray-400 hover:text-[#5a0f85] hover:bg-gray-100'} p-2 rounded-lg`}
                >
                    <MessageSquare size={20} />
                </button>
            </div>

            {/* ------- chat area ------- */}
            <div className='flex-1 overflow-y-scroll p-4 pb-6 space-y-2'>
                {isMessagesLoading ? (
                    <div className='flex flex-col gap-4 justify-center items-center h-full opacity-50'>
                        <div className='w-full h-12 bg-gray-100 rounded-xl animate-pulse'></div>
                        <div className='w-full h-12 bg-gray-100 rounded-xl animate-pulse delay-75'></div>
                        <div className='w-full h-12 bg-gray-100 rounded-xl animate-pulse delay-150'></div>
                    </div>
                ) : (
                    (messages || []).map((msg, index) => {
                        if (!msg) return null; // Basic guard

                        // Check ownership
                        const isMyMessage = msg.senderId?._id === user?._id || msg.senderId === user?._id;

                        const senderName = msg.senderId?.fullName || "Unknown";
                        const senderPic = msg.senderId?.profilePic || assets.avatar_icon;

                        return (
                            <div key={index} className={`flex items-end gap-2 max-w-[80%] ${isMyMessage ? 'ml-auto flex-row-reverse' : ''}`}>

                                {/* Avatar (only for others) */}
                                {!isMyMessage && (
                                    <img
                                        src={senderPic}
                                        alt=""
                                        className='w-8 h-8 rounded-full object-cover mb-1 bg-gray-100'
                                        title={senderName}
                                    />
                                )}

                                <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                    {/* Sender Name in Group Chat (only for others) */}
                                    {isGroup && !isMyMessage && (
                                        <span className="text-[10px] text-gray-500 ml-1 mb-0.5">{senderName}</span>
                                    )}

                                    {msg.image && (
                                        <img src={msg.image} alt="" className='max-w-[280px] border border-gray-200 rounded-xl overflow-hidden mb-1' />
                                    )}

                                    {msg.text && (
                                        <div className="relative group">
                                            <p className={`p-3 px-4 text-sm font-normal rounded-2xl shadow-sm mb-1 break-words max-w-full
                                        ${isMyMessage
                                                    ? 'bg-[#5a0f85] text-white rounded-br-none'
                                                    : 'bg-gray-200 text-slate-700 rounded-bl-none'}
                                        ${msg.isScam && !isMyMessage ? 'border-2 border-orange-300' : ''}
                                        `}>
                                                {msg.text}
                                            </p>

                                            {/* Warning Icon without Tooltip */}
                                            {msg.isScam && !isMyMessage && (
                                                <div className="absolute -right-7 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-orange-50 rounded-full text-orange-400 cursor-help shadow-sm" title="Suspected Scam">
                                                    <TriangleAlert size={12} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <p className='text-[10px] text-gray-400 px-1 opacity-70'>{formatMessageTime(msg.createdAt)}</p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={scrollEnd}></div>
            </div>

            {/* ------- input area ------- */}
            <MessageInput />

            {/* Edit Group Modal */}
            <EditGroupModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </div>
    )
}

export default ChatContainer
