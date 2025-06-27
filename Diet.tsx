import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/BottomNavigation";

export default function Diet() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  
  const [dietData, setDietData] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
    snacks: "",
    waterIntake: 0,
  });

  // Fetch today's diet entry
  const { data: dietEntry, isLoading: dietLoading } = useQuery({
    queryKey: [`/api/diet/${today}`],
    retry: false,
  });

  // Update diet mutation
  const updateDietMutation = useMutation({
    mutationFn: async (data: typeof dietData) => {
      await apiRequest("POST", "/api/diet", {
        ...data,
        date: today,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/diet/${today}`] });
      toast({
        title: "Dieta actualizada",
        description: "Los cambios se han guardado correctamente",
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
        description: "No se pudo actualizar la dieta",
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

  useEffect(() => {
    if (dietEntry) {
      setDietData({
        breakfast: dietEntry.breakfast || "",
        lunch: dietEntry.lunch || "",
        dinner: dietEntry.dinner || "",
        snacks: dietEntry.snacks || "",
        waterIntake: dietEntry.waterIntake || 0,
      });
    }
  }, [dietEntry]);

  const handleSave = () => {
    updateDietMutation.mutate(dietData);
  };

  const handleWaterIntakeChange = (change: number) => {
    const newIntake = Math.max(0, Math.min(12, dietData.waterIntake + change));
    setDietData(prev => ({ ...prev, waterIntake: newIntake }));
  };

  if (authLoading || dietLoading) {
    return (
      <div className="min-h-screen theme-bg dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const waterGoal = 8;
  const waterProgress = (dietData.waterIntake / waterGoal) * 100;

  return (
    <div className="min-h-screen theme-bg dark:bg-gray-900 pb-20">
      <div className="p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Dieta</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.history.back()}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Diet Planning Section */}
        <Card className="mb-4 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Plan Alimenticio</h3>
              <Button 
                onClick={handleSave}
                disabled={updateDietMutation.isPending}
                className="theme-primary text-white px-4 py-2 text-sm font-medium"
              >
                {updateDietMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
            
            {/* Meal Cards */}
            <div className="space-y-3">
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Desayuno</h4>
                  <span className="text-sm text-gray-500">~350 kcal</span>
                </div>
                <Textarea
                  value={dietData.breakfast}
                  onChange={(e) => setDietData(prev => ({ ...prev, breakfast: e.target.value }))}
                  placeholder="Describe tu desayuno..."
                  className="w-full text-sm bg-transparent border-none resize-none focus:outline-none"
                  rows={2}
                />
              </div>
              
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Almuerzo</h4>
                  <span className="text-sm text-gray-500">~450 kcal</span>
                </div>
                <Textarea
                  value={dietData.lunch}
                  onChange={(e) => setDietData(prev => ({ ...prev, lunch: e.target.value }))}
                  placeholder="Describe tu almuerzo..."
                  className="w-full text-sm bg-transparent border-none resize-none focus:outline-none"
                  rows={2}
                />
              </div>
              
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Cena</h4>
                  <span className="text-sm text-gray-500">~300 kcal</span>
                </div>
                <Textarea
                  value={dietData.dinner}
                  onChange={(e) => setDietData(prev => ({ ...prev, dinner: e.target.value }))}
                  placeholder="Describe tu cena..."
                  className="w-full text-sm bg-transparent border-none resize-none focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Snacks</h4>
                  <span className="text-sm text-gray-500">~150 kcal</span>
                </div>
                <Textarea
                  value={dietData.snacks}
                  onChange={(e) => setDietData(prev => ({ ...prev, snacks: e.target.value }))}
                  placeholder="Describe tus snacks..."
                  className="w-full text-sm bg-transparent border-none resize-none focus:outline-none"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Intake */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Hidratación</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Droplets className="text-blue-500" size={16} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Meta: {waterGoal} vasos</span>
                </div>
                <Progress value={waterProgress} className="w-full" />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-500">{dietData.waterIntake}/{waterGoal}</p>
                <p className="text-xs text-gray-500">vasos</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWaterIntakeChange(-1)}
                disabled={dietData.waterIntake === 0}
              >
                -
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWaterIntakeChange(1)}
                disabled={dietData.waterIntake >= 12}
              >
                +
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentPage="diet" />
    </div>
  );
}
