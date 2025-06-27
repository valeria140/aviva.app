import { useLocation } from "wouter";
import { Home, User, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  currentPage: "home" | "profile" | "settings" | "diet" | "routine";
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, navigate] = useLocation();

  const navItems = [
    { id: "home", icon: Home, label: "Inicio", path: "/" },
    { id: "profile", icon: User, label: "Perfil", path: "/profile" },
    { id: "settings", icon: SettingsIcon, label: "Ajustes", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  isActive 
                    ? "theme-primary text-white" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
