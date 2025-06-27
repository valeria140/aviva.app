import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Bell, Apple, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/BottomNavigation";
import Calendar from "@/components/Calendar";
import StreakCounter from "@/components/StreakCounter";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check if user has completed onboarding
  const { data: surveyResponse, isLoading: surveyLoading } = useQuery({
    queryKey: ["/api/survey"],
    retry: false,
  });

  useEffect(() => {
    if (!authLoading && !surveyLoading && !surveyResponse) {
      navigate("/onboarding");
    }
  }, [surveyResponse, authLoading, surveyLoading, navigate]);

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

  if (authLoading || surveyLoading) {
    return (
      <div className="min-h-screen theme-bg dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const userName = user?.firstName || "Usuario";

  return (
    <div className="min-h-screen theme-bg dark:bg-gray-900 pb-20">
      <div className="p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ¡Hola, {userName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Sigamos con tu rutina</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Widget */}
        <Calendar />

        {/* Streak Counter */}
        <StreakCounter />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Diet Card */}
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Apple className="text-green-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Dieta</h4>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/diet")}
                className="w-full text-xs theme-primary text-white py-2 font-medium theme-primary-hover transition-all duration-200"
              >
                Ver más
              </Button>
            </CardContent>
          </Card>

          {/* Routine Card */}
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Dumbbell className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Rutina</h4>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/routine")}
                className="w-full text-xs theme-primary text-white py-2 font-medium theme-primary-hover transition-all duration-200"
              >
                Editar rutina
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation currentPage="home" />
    </div>
  );
}
