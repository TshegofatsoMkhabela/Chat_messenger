import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore';
import assets from '../assets/assets';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Camera, User, FileText } from 'lucide-react';

const ProfilePage = () => {
  const { user: authUser } = useAuthStore()
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName || "")
  const [bio, setBio] = useState(authUser?.bio || "")
  const [selectedImg, setSelectedImg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const updateProfile = async (body) => {
    setIsLoading(true);
    try {
      const { data } = await axios.put("/api/users/update-profile", body);
      if (data.success) {
        useAuthStore.setState({ user: data.user });
        toast.success("Profile updated successfully")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile")
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate('/');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate('/');
    }
  }

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
      <div className='max-w-4xl w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex max-md:flex-col-reverse'>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-10 flex-1">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#2e0a45]">Profile Details</h3>
            <p className="text-zinc-500 text-sm">Update your personal information</p>
          </div>

          {/* Mobile Avatar Upload */}
          <div className="flex flex-col items-center gap-4 md:hidden">
            <div className="relative">
              <img src={selectedImg ? URL.createObjectURL(selectedImg) : authUser?.profilePic || assets.avatar_icon} alt="" className={`w-32 h-32 rounded-full object-cover border-4 border-gray-50 bg-gray-50`} />
              <label htmlFor="avatar-mobile" className='absolute bottom-0 right-0 bg-[#5a0f85] p-2 rounded-full cursor-pointer hover:bg-[#480c6b] transition text-white shadow-md'>
                <Camera className="w-5 h-5" />
                <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar-mobile' accept='.png, .jpg, .jpeg' hidden />
              </label>
            </div>
          </div>

          <div className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 flex items-center gap-2">
                <User className="size-4" /> Full Name
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                required
                className='w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a0f85]/50 focus:border-[#5a0f85] transition-all'
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Bio Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 flex items-center gap-2">
                <FileText className="size-4" /> Bio
              </label>
              <textarea
                onChange={(e) => setBio(e.target.value)}
                value={bio}
                required
                rows={4}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-slate-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5a0f85]/50 focus:border-[#5a0f85] transition-all resize-none"
                placeholder="Tell us a bit about yourself..."
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="mt-2 w-full bg-[#5a0f85] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-[#480c6b] transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2">
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Right Side / Image Section (Desktop) */}
        <div className='hidden md:flex flex-col items-center justify-center p-12 bg-gray-50/50 border-l border-gray-100 min-w-[320px]'>
          <div className="relative group">
            <img src={selectedImg ? URL.createObjectURL(selectedImg) : authUser?.profilePic || assets.avatar_icon} alt="" className={`w-40 h-40 rounded-full object-cover shadow-lg border-4 border-white ring-1 ring-gray-200 bg-white`} />
            <label htmlFor="avatar-desktop" className='absolute bottom-2 right-2 bg-[#5a0f85] p-3 rounded-full cursor-pointer hover:bg-[#480c6b] transition text-white shadow-xl group-hover:scale-110 active:scale-95'>
              <Camera className="w-5 h-5" />
              <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar-desktop' accept='.png, .jpg, .jpeg' hidden />
            </label>
          </div>
          <div className='text-center mt-6 space-y-1'>
            <p className="text-base font-bold text-[#2e0a45]">{name || "Your Name"}</p>
            <p className="text-sm font-medium text-zinc-400">Click the camera to update photo</p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ProfilePage
