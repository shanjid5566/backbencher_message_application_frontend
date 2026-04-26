"use client";

import Image from "next/image";

interface AvatarProps {
  user: any; // User type flexibility for both formats (user.image and user.avatarUrl)
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  className?: string;
}

const sizeCls = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-14 h-14",
};

const dotSizeCls = {
  sm: "w-2 h-2 border",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
  xl: "w-3.5 h-3.5 border-2",
};

export default function Avatar({
  user,
  size = "md",
  showStatus = false,
  className = "",
}: AvatarProps) {
  
  // 💡 Helper function to format image URL correctly (fixes the 404 error)
  const getImageUrl = (imagePath?: string | null, fallbackName?: string) => {
    if (!imagePath) return `https://ui-avatars.com/api/?name=${fallbackName || "User"}&background=random`;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5000/${imagePath.replace(/\\/g, "/")}`;
  };

  const finalImageUrl = getImageUrl(user?.avatarUrl || user?.image, user?.name);

  return (
    <div className={`relative flex-shrink-0 ${sizeCls[size]} ${className}`}>
      {/* Avatar Image */}
      <div
        className={`${sizeCls[size]} rounded-full overflow-hidden bg-slate-700 ring-2 ring-slate-700`}
      >
        <Image
          src={finalImageUrl}
          alt={user?.name || "User Avatar"} // 🔴 Fixes the missing "alt" property error
          width={56}
          height={56}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>

      {/* Online Status Dot */}
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full border-surface-900
            ${dotSizeCls[size]}
            ${user?.isOnline ? "bg-online border-[#0b0d14]" : "bg-surface-600 border-[#0b0d14]"}
          `}
          aria-label={user?.isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}