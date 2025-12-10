import React, { useState, useRef } from "react";
import { X, Image, Upload, QrCode } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import QRCode from "react-qr-code";

const EditGroupModal = ({ isOpen, onClose }) => {
    const { selectedGroup, updateGroup } = useChatStore();
    const [name, setName] = useState(selectedGroup?.name || "");
    const [imagePreview, setImagePreview] = useState(selectedGroup?.groupPic || "");
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const [activeTab, setActiveTab] = useState("edit"); // "edit" or "qr"

    // Sync state when modal opens or group changes
    React.useEffect(() => {
        if (isOpen && selectedGroup) {
            setName(selectedGroup.name);
            setImagePreview(selectedGroup.groupPic || "");
        }
    }, [isOpen, selectedGroup]);

    if (!isOpen || !selectedGroup) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            // toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            await updateGroup(selectedGroup._id, {
                name: name.trim(),
                groupPic: imagePreview,
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const inviteLink = `${window.location.origin}/join/${selectedGroup._id}`;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#2e0a45]">Group Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                    <button
                        onClick={() => setActiveTab("edit")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "edit" ? "bg-white text-[#5a0f85] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Edit Details
                    </button>
                    <button
                        onClick={() => setActiveTab("qr")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "qr" ? "bg-white text-[#5a0f85] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <QrCode size={16} />
                        QR Invite
                    </button>
                </div>

                {activeTab === "edit" ? (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-purple-50 border-2 border-dashed border-purple-200 flex items-center justify-center">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Group Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Image size={32} className="text-purple-300" />
                                    )}
                                </div>

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Upload size={20} className="text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">Click to change group icon</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Group Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter group name"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a0f85]/20 focus:border-[#5a0f85] transition-all"
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 rounded-xl bg-[#5a0f85] text-white font-medium hover:bg-[#480c6b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col items-center space-y-6 py-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                            <QRCode
                                size={200}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={inviteLink}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="font-medium text-[#2e0a45]">Scan to Join Group</p>
                            <p className="text-xs text-gray-500 max-w-[200px] break-all">{inviteLink}</p>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(inviteLink);
                                // Toast ideally
                            }}
                            className="text-sm text-[#5a0f85] hover:underline cursor-pointer"
                        >
                            Copy Link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditGroupModal;
