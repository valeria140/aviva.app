import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Heart, Dumbbell, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/BottomNavigation";

interface Exercise {
  name: string;
  description: string;
  duration: number;
  type: "cardio" | "strength" | "flexibility";
}

export default function Routine() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: "",
    description: "",
    duration: 0,
    type: "cardio"
  });
  const [weeklySchedule, setWeeklySchedule] = useState<boolean[]>([true, true, false, true, true, false, false]);

  // Fetch user routines
  const { data: routines, isLoading: routinesLoading } = useQuery({
    queryKey: ["/api/routines"],
    retry: false,
  });

  // Create routine mutation
  const createRoutineMutation = useMutation({
    mutationFn: async (routineData: any) => {
      await apiRequest("POST", "/api/routines", routineData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      setNewExercise({ name: "", description: "", duration: 0, type: "cardio" });
      toast({
        title: "Rutina guardada",
        description: "Tu rutina se ha actualizado correctamente",
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
        description: "No se pudo guardar la rutina",
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

  const handleSaveRoutine = () => {
    if (!newExercise.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del ejercicio es requerido",
        variant: "destructive",
      });
      return;
    }

    const exercises = [newExercise];
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const activeDays = weeklySchedule.map((isActive, index) => isActive ? index : -1).filter(day => day >= 0);

    createRoutineMutation.mutate({
      name: "Mi Rutina Personalizada",
      description: "Rutina creada por el usuario",
      exercises,
      duration: totalDuration,
      daysOfWeek: activeDays,
      isActive: true,
    });
  };

  const toggleDay = (dayIndex: number) => {
    setWeeklySchedule(prev => 
      prev.map((active, index) => index === dayIndex ? !active : active)
    );
  };

  if (authLoading || routinesLoading) {
    return (
      <div className="min-h-screen theme-bg dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const dayNames = ["L", "M", "M", "J", "V", "S", "D"];
  const currentRoutine = routines?.[0];

  return (
    <div className="min-h-screen theme-bg dark:bg-gray-900 pb-20">
      <div className="p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Rutina</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.history.back()}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Today's Workout */}
        {currentRoutine && (
          <Card className="mb-4 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Rutina Actual</h3>
                <span className="text-sm theme-accent font-medium">{currentRoutine.duration} min</span>
              </div>
              
              {/* Exercise List */}
              <div className="space-y-3">
                {currentRoutine.exercises?.map((exercise: Exercise, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      exercise.type === 'cardio' ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {exercise.type === 'cardio' ? 
                        <Heart className="text-red-500" size={20} /> : 
                        <Dumbbell className="text-blue-500" size={20} />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{exercise.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{exercise.duration} minutos</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                      <Edit size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Routine Editor */}
        <Card className="mb-4 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Crear Nuevo Ejercicio</h3>
              <Button 
                onClick={handleSaveRoutine}
                disabled={createRoutineMutation.isPending}
                className="theme-primary text-white px-4 py-2 text-sm font-medium"
              >
                {createRoutineMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <Input 
                  placeholder="Nombre del ejercicio" 
                  value={newExercise.name}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full font-medium bg-transparent border-none text-gray-900 dark:text-white focus:outline-none mb-2"
                />
                <Textarea 
                  placeholder="Descripción, series, repeticiones..."
                  value={newExercise.description}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none resize-none focus:outline-none" 
                  rows={2}
                />
                <div className="flex items-center space-x-4 mt-2">
                  <Input 
                    type="number"
                    placeholder="Duración (min)"
                    value={newExercise.duration || ""}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="flex-1"
                  />
                  <select 
                    value={newExercise.type}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, type: e.target.value as Exercise['type'] }))}
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="cardio">Cardio</option>
                    <option value="strength">Fuerza</option>
                    <option value="flexibility">Flexibilidad</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Horario Semanal</h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              {dayNames.map((day, index) => (
                <div key={index} className="text-xs text-gray-500 dark:text-gray-400">{day}</div>
              ))}
              
              {weeklySchedule.map((isActive, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleDay(index)}
                  className={`w-8 h-8 rounded-full text-xs ${
                    isActive 
                      ? 'bg-green-100 dark:bg-green-900 text-green-600' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                  }`}
                >
                  {isActive ? "✓" : "−"}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentPage="routine" />
    </div>
  );
}
