import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const JoinGroupPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { joinGroup, groups, setSelectedGroup } = useChatStore();

    useEffect(() => {
        const handleJoin = async () => {
            if (!groupId) return;

            // Check if already member
            const existingGroup = groups.find(g => g._id === groupId);
            if (existingGroup) {
                toast.success("You are already a member!");
                setSelectedGroup(existingGroup);
                navigate("/");
                return;
            }

            const success = await joinGroup(groupId);
            if (success) {
                // success returns the group object
                setSelectedGroup(success);
                navigate("/");
            } else {
                // If failed, maybe redirect home after timeout
                setTimeout(() => navigate("/"), 2000);
            }
        };

        handleJoin();
    }, [groupId, joinGroup, navigate, groups, setSelectedGroup]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader className="size-10 animate-spin text-[#5a0f85]" />
            <h2 className="text-xl font-semibold text-[#2e0a45]">Joining Group...</h2>
        </div>
    );
};

export default JoinGroupPage;
