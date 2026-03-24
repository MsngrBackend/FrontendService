import { useEffect, useState } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const COLORS = [
  "bg-[#FF4655]",
  "bg-[#22D3A5]",
  "bg-[#4ECDC4]",
  "bg-[#45B7D1]",
  "bg-[#F0A500]",
  "bg-[#DDA0DD]",
  "bg-[#96CEB4]",
  "bg-[#FF8C42]",
];

const colorForName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return COLORS[hash % COLORS.length] ?? COLORS[0]!;
};

export const Avatar = ({ src, name, size = 40, className = "" }: AvatarProps) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const style = { width: size, height: size, fontSize: size * 0.38 };
  const displayName = name ?? "?";

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={displayName}
        style={style}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  const initials = getInitials(displayName);
  const color = colorForName(displayName);

  return (
    <div
      style={style}
      className={`${color} rounded-full flex items-center justify-center shrink-0 text-white font-semibold ${className}`}
    >
      {initials}
    </div>
  );
};
