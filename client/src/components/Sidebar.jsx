import { MoreVertical, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import assets from '../assets/assets'
import CreateGroupModal from './CreateGroupModal';
// Duplicates removed
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/useChatStore';
// Duplicate import removed

const Sidebar = () => {

    const { getUsers, users, selectedUser, setSelectedUser, groups, getGroups, setSelectedGroup, selectedGroup } = useChatStore();
    const { onlineUsers, logout } = useAuthStore();
    const [unseenMessages, setUnseenMessages] = useState({});
    const [input, setInput] = useState("");
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    const navigate = useNavigate();

    const filteredUsers = users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase()));

    // Simple verification for groups filter if needed, for now show all
    const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(input.toLowerCase()));

    useEffect(() => {
        getUsers();
        getGroups();
    }, [getUsers, getGroups]);

    return (
        <div className={`bg-white h-full p-5 border-r border-[#e5e7eb] overflow-y-scroll ${selectedUser || selectedGroup ? "max-md:hidden" : ''}`}>
            <div className='pb-5'>
                <div className='flex justify-between items-center'>
                    <img src={assets.logo} alt="logo" className='max-w-40' />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsGroupModalOpen(true)}
                            className='p-2 bg-purple-50 hover:bg-purple-100 rounded-full text-[#5a0f85] transition-colors'
                            title="Create Group"
                        >
                            <Plus size={20} />
                        </button>
                        <div className="relative py-2 group">
                            <button className='opacity-80 hover:opacity-100 transition-opacity'>
                                <MoreVertical className='size-5 text-[#2e0a45]' />
                            </button>
                            <div className='absolute top-full right-0 z-20 w-32 p-3 rounded-xl bg-white border border-gray-200 shadow-lg text-slate-700 hidden group-hover:block'>
                                <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm hover:text-[#5a0f85] font-medium'>Edit Profile</p>
                                <hr className="my-2 border-t border-gray-100" />
                                <p onClick={() => logout()} className='cursor-pointer text-sm hover:text-[#5a0f85] font-medium'>Logout</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bg-gray-100/70 rounded-xl flex items-center gap-2 py-3 px-4 mt-5 transition-all focus-within:ring-2 focus-within:ring-[#5a0f85]/20'>
                    <img src={assets.search_icon} alt="Search" className='w-3 opacity-50 brightness-0' />
                    <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='bg-transparent border-none outline-none text-slate-700 text-sm placeholder-gray-400 flex-1' placeholder='Search User or Group...' />
                </div>

            </div>

            <div className='flex flex-col gap-1'>
                {/* Groups Section */}
                {filteredGroups.length > 0 && (
                    <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-400 mb-2 px-2 uppercase tracking-wider">Groups</p>
                        {filteredGroups.map((group, index) => (
                            <div onClick={() => { setSelectedGroup(group); setUnseenMessages(prev => ({ ...prev, [group._id]: 0 })) }} // Clear unseen logic needed for groups later
                                key={group._id} className={`relative flex items-center gap-2 p-3 pl-4 rounded-xl cursor-pointer transition-colors max-sm:text-sm group ${selectedGroup?._id === group._id ? 'bg-[#5a0f85]/10' : 'hover:bg-gray-50'}`}>
                                {group.groupPic ? (
                                    <img src={group.groupPic} alt="" className="w-[40px] h-[40px] rounded-full object-cover border border-purple-200" />
                                ) : (
                                    <div className="w-[40px] h-[40px] rounded-full bg-purple-100 flex items-center justify-center text-[#5a0f85] font-semibold text-lg border border-purple-200">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className='flex flex-col leading-5'>
                                    <p className={`font-medium ${selectedGroup?._id === group._id ? 'text-[#5a0f85]' : 'text-[#2e0a45]'}`}>{group.name}</p>
                                    <span className='text-slate-400 text-xs'>{group.members.length} members</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Users Section */}
                {filteredUsers.length > 0 && <p className="text-xs font-semibold text-gray-400 mb-2 px-2 uppercase tracking-wider">Direct Messages</p>}
                {filteredUsers.map((user, index) => (
                    <div onClick={() => { setSelectedUser(user); setUnseenMessages(prev => ({ ...prev, [user._id]: 0 })) }}
                        key={index} className={`relative flex items-center gap-2 p-3 pl-4 rounded-xl cursor-pointer transition-colors max-sm:text-sm group ${selectedUser?._id === user._id ? 'bg-[#5a0f85]/10' : 'hover:bg-gray-50'}`}>
                        <img src={user?.profilePic || assets.avatar_icon} alt="" className='w-[40px] aspect-[1/1] rounded-full object-cover shadow-sm' />
                        <div className='flex flex-col leading-5'>
                            <p className={`font-medium ${selectedUser?._id === user._id ? 'text-[#5a0f85]' : 'text-[#2e0a45]'}`}>{user.fullName}</p>
                            {
                                onlineUsers.includes(user._id)
                                    ? <span className='text-green-500 text-xs font-medium'>Online</span>
                                    : <span className='text-slate-400 text-xs'>Offline</span>
                            }
                        </div>
                        {unseenMessages[user._id] > 0 && <p className='absolute top-1/2 -translate-y-1/2 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-[#5a0f85] text-white shadow-md'>{unseenMessages[user._id]}</p>}
                    </div>
                ))}
            </div>

            <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
        </div >
    )
}

export default Sidebar
