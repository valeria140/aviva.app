import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StreakCounter() {
  // Fetch streak data
  const { data: streakData, isLoading } = useQuery({
    queryKey: ["/api/stats/streak"],
    retry: false,
  });

  if (isLoading) {
    return (
      <Card className="mb-6 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Flame className="text-orange-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Racha actual</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">...</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Mejor racha</p>
              <p className="text-lg font-semibold theme-accent">...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <Flame className="text-orange-500 streak-fire" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Racha actual</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {streakData?.current || 0} días
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Mejor racha</p>
            <p className="text-lg font-semibold theme-accent">
              {streakData?.best || 0} días
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
