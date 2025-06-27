import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

export default function Landing() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 theme-bg dark:bg-gray-900">
      <Card className="w-full max-w-md fade-in">
        <CardContent className="pt-6">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 theme-primary rounded-full flex items-center justify-center mascot-bounce">
              <Dumbbell className="text-3xl text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">AVIVA</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tu compañero de fitness personal</p>
          </div>

          {/* Auth Options */}
          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full theme-primary text-white py-3 font-semibold theme-primary-hover transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? "Iniciando..." : "Iniciar Sesión / Crear Cuenta"}
            </Button>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>• Si ya tienes cuenta: inicia sesión directamente</p>
              <p>• Si eres nuevo: se creará tu cuenta automáticamente</p>
              <p className="font-medium">¡Comienza tu viaje fitness hoy!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
