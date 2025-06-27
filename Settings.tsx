import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Moon, Bell, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/BottomNavigation";
import ThemeSelector from "@/components/ThemeSelector";

export default function Settings() {
  const { user, isLoading: authLoading } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const { toast } = useToast();

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<{ darkMode: boolean; notificationsEnabled: boolean }>) => {
      await apiRequest("PUT", "/api/user/preferences", {
        currentTheme: user?.currentTheme || "matcha",
        darkMode: preferences.darkMode ?? user?.darkMode,
        notificationsEnabled: preferences.notificationsEnabled ?? user?.notificationsEnabled,
        mascotName: user?.mascotName || "Kiwi"
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    updatePreferencesMutation.mutate({ darkMode: enabled });
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    updatePreferencesMutation.mutate({ notificationsEnabled: enabled });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen theme-bg dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg dark:bg-gray-900 pb-20">
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configuración</h1>
        
        {/* Theme Selection */}
        <ThemeSelector />

        {/* Other Settings */}
        <Card className="mb-4 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Moon className="text-gray-600 dark:text-gray-400" size={20} />
                  <span className="text-gray-700 dark:text-gray-300">Modo oscuro</span>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="text-gray-600 dark:text-gray-400" size={20} />
                  <span className="text-gray-700 dark:text-gray-300">Notificaciones motivacionales</span>
                </div>
                <Switch
                  checked={user?.notificationsEnabled ?? true}
                  onCheckedChange={handleNotificationsToggle}
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full flex items-center justify-center space-x-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
            >
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentPage="settings" />
    </div>
  );
}
