"use client";

import { useState, useRef } from "react";
import { X, Camera, Loader2, Save, Lock, User, Eye, EyeOff } from "lucide-react"; // Eye, EyeOff added
import api from "@/lib/axios";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  
  // Profile States
  const [name, setName] = useState(user?.name || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user?.image || `https://ui-avatars.com/api/?name=${user?.name}&background=random`);
  
  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm Password State

  // Eye Button States (for showing/hiding password)
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (selectedFile) formData.append("image", selectedFile);

      await api.put("/users/profile", formData, { headers: { "Content-Type": "multipart/form-data" } });
      window.location.reload(); 
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Frontend validation: check if passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }

    setIsLoading(true);

    try {
      await api.put("/users/change-password", { currentPassword, newPassword });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Hide password fields
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700/50 w-full max-w-md rounded-3xl shadow-2xl flex flex-col animate-scale-in overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-surface-700/50 flex justify-between items-center bg-surface-800/50">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-700 text-surface-400 transition">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-700/50">
          <button 
            onClick={() => {setActiveTab("profile"); setMessage({type:"", text:""});}}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "profile" ? "text-brand-400 border-b-2 border-brand-400" : "text-surface-400 hover:text-surface-200"}`}
          >
            <User size={16} /> Profile
          </button>
          <button 
            onClick={() => {setActiveTab("security"); setMessage({type:"", text:""});}}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "security" ? "text-brand-400 border-b-2 border-brand-400" : "text-surface-400 hover:text-surface-200"}`}
          >
            <Lock size={16} /> Security
          </button>
        </div>

        <div className="p-6">
          {message.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === "error" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
              {message.text}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img src={previewUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-surface-800 shadow-lg" />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-300">Display Name</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition disabled:opacity-50">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Profile
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-300">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 pr-11 text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200">
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-300">New Password</label>
                <div className="relative">
                  <input 
                    type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 pr-11 text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-surface-300">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 pr-11 text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading || !currentPassword || !newPassword || !confirmPassword} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl py-3 mt-2 flex items-center justify-center gap-2 transition disabled:opacity-50">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />} Change Password
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}