import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get calendar range for the current month
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - 7); // Get some days from previous month
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + 7); // Get some days from next month

  // Fetch workout entries for the month
  const { data: workoutEntries, isLoading } = useQuery({
    queryKey: ["/api/workouts", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => fetch(`/api/workouts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
      credentials: "include",
    }).then(res => res.json()),
    retry: false,
  });

  // Create workout entry mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async ({ date, type }: { date: string; type: "trained" | "rested" }) => {
      await apiRequest("POST", "/api/workouts", {
        date,
        type,
        duration: type === "trained" ? 30 : 0, // Default 30 minutes for training
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/weekly"] });
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
        description: "No se pudo guardar la entrada",
        variant: "destructive",
      });
    },
  });

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    const today = new Date();
    
    // Don't allow marking future dates
    if (clickedDate > today) return;
    
    const dateString = clickedDate.toISOString().split('T')[0];
    
    // Find existing entry for this date
    const existingEntry = workoutEntries?.find((entry: any) => entry.date === dateString);
    
    if (existingEntry) {
      // Cycle through: trained -> rested -> no entry
      if (existingEntry.type === "trained") {
        createWorkoutMutation.mutate({ date: dateString, type: "rested" });
      } else {
        // Delete the entry to clear the day
        fetch(`/api/workouts/${existingEntry.id}`, {
          method: 'DELETE',
          credentials: 'include'
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
          queryClient.invalidateQueries({ queryKey: ["/api/stats/streak"] });
          queryClient.invalidateQueries({ queryKey: ["/api/stats/weekly"] });
        });
      }
    } else {
      // Create new "trained" entry
      createWorkoutMutation.mutate({ date: dateString, type: "trained" });
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get workout entry for a specific day
  const getWorkoutEntry = (day: number) => {
    const dateString = new Date(year, month, day).toISOString().split('T')[0];
    return workoutEntries?.find((entry: any) => entry.date === dateString);
  };

  // Check if day has a streak (consecutive training days)
  const hasStreak = (day: number) => {
    const dateString = new Date(year, month, day).toISOString().split('T')[0];
    const entry = workoutEntries?.find((entry: any) => entry.date === dateString);
    
    if (entry?.type !== "trained") return false;
    
    // Check if previous day was also trained
    const prevDate = new Date(year, month, day - 1);
    const prevDateString = prevDate.toISOString().split('T')[0];
    const prevEntry = workoutEntries?.find((entry: any) => entry.date === prevDateString);
    
    return prevEntry?.type === "trained";
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <Card className="mb-6 shadow-lg">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </h3>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigateMonth("prev")}
              className="p-1"
            >
              <ChevronLeft className="text-gray-500" size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigateMonth("next")}
              className="p-1"
            >
              <ChevronRight className="text-gray-500" size={16} />
            </Button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="w-8 h-8"></div>;
            }
            
            const clickedDate = new Date(year, month, day);
            const today = new Date();
            const isFutureDate = clickedDate > today;
            
            const workoutEntry = getWorkoutEntry(day);
            const isTrainedDay = workoutEntry?.type === "trained";
            const isRestedDay = workoutEntry?.type === "rested";
            const hasStreakFire = hasStreak(day);
            
            return (
              <Button
                key={day}
                variant="ghost"
                onClick={() => handleDayClick(day)}
                disabled={createWorkoutMutation.isPending || isFutureDate}
                className={`w-8 h-8 rounded-full text-sm relative transition-all duration-200 ${
                  isFutureDate
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : isTrainedDay 
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-md" 
                    : isRestedDay 
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
                    : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm"
                }`}
                title={
                  isFutureDate 
                    ? "No puedes marcar días futuros"
                    : isTrainedDay 
                    ? "Día entrenado (click para marcar descanso)"
                    : isRestedDay 
                    ? "Día de descanso (click para limpiar)"
                    : "Click para marcar como día entrenado"
                }
              >
                {day}
                {hasStreakFire && (
                  <Flame className="absolute -top-1 -right-1 text-orange-500 streak-fire" size={10} />
                )}
              </Button>
            );
          })}
        </div>
        
        {/* Calendar Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Entrené</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Descansé</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flame className="text-orange-500" size={12} />
              <span className="text-gray-600 dark:text-gray-400">Racha</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Toca un día para marcarlo: Sin marca → Entrené → Descansé → Sin marca
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
