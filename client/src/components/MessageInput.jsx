import React, { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { sendMessage, sendGroupMessage, selectedGroup } = useChatStore();

    const handleImageChange = (e) => {
        // ... same logic
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // ... removeImage same logic

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;

        try {
            if (selectedGroup) {
                await sendGroupMessage({
                    text: text.trim(),
                    image: imagePreview,
                });
            } else {
                await sendMessage({
                    text: text.trim(),
                    image: imagePreview,
                });
            }

            // Clear form
            setText("");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="p-4 w-full bg-white border-t border-gray-200">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center text-white bg-slate-400 hover:bg-slate-600 transition-colors"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2 items-center">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md bg-white border border-gray-300 text-slate-900 placeholder-slate-400 p-3 outline-none focus:ring-2 focus:ring-[#5a0f85]/50 focus:border-[#5a0f85]"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-[#5a0f85]" : "text-gray-400 hover:text-[#5a0f85]"}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={24} />
                    </button>
                </div>
                <button
                    type="submit"
                    className="btn btn-sm btn-circle sm:btn-md bg-[#5a0f85] hover:bg-[#480c6b] text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                    disabled={!text.trim() && !imagePreview}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};
export default MessageInput;
