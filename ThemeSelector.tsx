import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const themes = [
  {
    id: "matcha" as const,
    name: "Matcha Blossom",
    color: "hsl(120, 25%, 50%)",
  },
  {
    id: "sparkles" as const,
    name: "Sparkles", 
    color: "hsl(280, 69%, 58%)",
  },
  {
    id: "coffee" as const,
    name: "Blue Coffee",
    color: "hsl(180, 25%, 25%)",
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="mb-4 shadow-lg">
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Seleccionar Tema</h3>
        <div className="space-y-3">
          {themes.map((themeOption) => (
            <Button
              key={themeOption.id}
              variant="outline"
              onClick={() => setTheme(themeOption.id)}
              className={`w-full flex items-center justify-between p-3 ${
                theme === themeOption.id 
                  ? "border-2 border-opacity-60" 
                  : "border border-gray-200 dark:border-gray-600"
              }`}
              style={{
                borderColor: theme === themeOption.id ? themeOption.color : undefined,
                backgroundColor: theme === themeOption.id ? `${themeOption.color}10` : undefined,
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: themeOption.color }}
                ></div>
                <span className="text-gray-700 dark:text-gray-300">{themeOption.name}</span>
              </div>
              {theme === themeOption.id && (
                <Check size={16} style={{ color: themeOption.color }} />
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
