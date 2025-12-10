import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { X, Search, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import assets from '../assets/assets';

const CreateGroupModal = ({ isOpen, onClose }) => {
    const { users, createGroup, setSelectedGroup } = useChatStore();
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMember = (userId) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedMembers(prev => [...prev, userId]);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return toast.error("Group name is required");
        if (selectedMembers.length < 1) return toast.error("Select at least one member"); // Or 2? 1 is fine for testing

        setIsLoading(true);
        const newGroup = await createGroup({
            name: groupName,
            members: selectedMembers
        });
        setIsLoading(false);

        if (newGroup) {
            setSelectedGroup(newGroup);
            setGroupName("");
            setSelectedMembers([]);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">Create New Group</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                    {/* Group Name Input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Group Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Weekend Trip"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5a0f85] focus:ring-2 focus:ring-[#5a0f85]/20 transition-all text-gray-800 placeholder-gray-400"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    {/* Member Selection */}
                    <div className="flex flex-col gap-2 flex-1 min-h-0">
                        <label className="text-sm font-medium text-gray-700">Add Members ({selectedMembers.length})</label>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5a0f85] focus:ring-2 focus:ring-[#5a0f85]/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* User List */}
                        <div className="flex flex-col gap-1 mt-2 max-h-60 overflow-y-auto">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => {
                                const isSelected = selectedMembers.includes(user._id);
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleMember(user._id)}
                                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-[#5a0f85] bg-purple-50' : 'border-transparent hover:bg-gray-50'}`}
                                    >
                                        <div className="relative">
                                            <img src={user.profilePic || assets.avatar_icon} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-[#5a0f85] rounded-full p-0.5 border-2 border-white">
                                                    <Check size={10} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${isSelected ? 'text-[#5a0f85]' : 'text-gray-700'}`}>{user.fullName}</p>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <p className="text-center text-gray-400 text-sm py-4">No users found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isLoading || !groupName.trim() || selectedMembers.length === 0}
                        className="px-6 py-2 text-sm font-medium text-white bg-[#5a0f85] hover:bg-[#480c6b] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {isLoading ? "Creating..." : "Create Group"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateGroupModal;
