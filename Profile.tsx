import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, Calendar, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/BottomNavigation";
import MascotDisplay from "@/components/MascotDisplay";
import PhotoUpload from "@/components/PhotoUpload";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [userName, setUserName] = useState("");

  // Fetch weekly stats
  const { data: weeklyStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/weekly"],
    retry: false,
  });

  // Fetch streak data
  const { data: streakData, isLoading: streakLoading } = useQuery({
    queryKey: ["/api/stats/streak"],
    retry: false,
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

  useEffect(() => {
    if (user) {
      setUserName(user.firstName || "Usuario");
    }
  }, [user]);

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
        {/* Profile Header */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              {/* Mascot/Profile Image */}
              <div className="relative">
                <MascotDisplay 
                  size="large" 
                  profileImageUrl={user?.profileImageUrl}
                  mascotName={user?.mascotName || "Kiwi"}
                />
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full text-white text-xs"
                  onClick={() => setShowPhotoUpload(true)}
                >
                  <Camera size={12} />
                </Button>
              </div>
              <div className="flex-1">
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-xl font-bold bg-transparent border-none text-gray-900 dark:text-white focus:outline-none p-0"
                />
                <p className="text-gray-600 dark:text-gray-400">
                  Miembro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Enero 2024'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-sm"
                  onClick={() => setShowPhotoUpload(true)}
                >
                  Cambiar foto de perfil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resumen Semanal</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 theme-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="theme-accent text-xl" size={24} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : weeklyStats?.trainedDays || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Días entrenados</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 theme-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="theme-accent text-xl" size={24} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : weeklyStats?.totalHours || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Horas totales</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Racha activa</span>
                <div className="flex items-center space-x-2">
                  <Flame className="text-orange-500 streak-fire" size={16} />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {streakLoading ? "..." : `${streakData?.current || 0} días`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload Modal */}
        {showPhotoUpload && (
          <PhotoUpload onClose={() => setShowPhotoUpload(false)} />
        )}
      </div>

      <BottomNavigation currentPage="profile" />
    </div>
  );
}
