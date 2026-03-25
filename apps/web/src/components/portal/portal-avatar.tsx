type PortalAvatarProps = {
  className?: string;
  name: string;
  photoUrl?: string | null;
  sizeClassName?: string;
  textClassName?: string;
};

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "?";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function PortalAvatar({
  className = "",
  name,
  photoUrl,
  sizeClassName = "h-12 w-12",
  textClassName = "text-sm",
}: PortalAvatarProps) {
  if (photoUrl) {
    return (
      <img
        alt={name}
        className={`${sizeClassName} rounded-full border border-line object-cover ${className}`}
        src={photoUrl}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${sizeClassName} inline-flex items-center justify-center rounded-full border border-line bg-[#eef4f8] font-bold text-[#35596e] ${textClassName} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
