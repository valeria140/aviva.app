import { Dumbbell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MascotDisplayProps {
  size?: "small" | "large";
  profileImageUrl?: string;
  mascotName?: string;
  animated?: boolean;
}

export default function MascotDisplay({ 
  size = "small", 
  profileImageUrl, 
  mascotName = "Kiwi",
  animated = true 
}: MascotDisplayProps) {
  const sizeClasses = size === "large" ? "w-20 h-20" : "w-12 h-12";
  const iconSize = size === "large" ? 32 : 20;

  if (profileImageUrl) {
    return (
      <Avatar className={`${sizeClasses} ${animated ? "mascot-bounce" : ""}`}>
        <AvatarImage src={profileImageUrl} alt={`${mascotName} profile`} />
        <AvatarFallback className="theme-primary text-white">
          <Dumbbell size={iconSize} />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className={`${sizeClasses} theme-primary rounded-full flex items-center justify-center ${animated ? "mascot-bounce" : ""}`}>
      <Dumbbell className="text-white" size={iconSize} />
    </div>
  );
}
