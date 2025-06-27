import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import QuestionCard from "@/components/QuestionCard";

const questions = [
  {
    id: 1,
    title: "¿Qué te motivó a descargar esta app?",
    options: [
      "Quiero empezar a hacer ejercicio",
      "Necesito una rutina personalizada", 
      "Busco motivación diaria",
      "Me la recomendaron"
    ]
  },
  {
    id: 2,
    title: "¿Cuál es tu objetivo principal?",
    options: [
      "Bajar de peso",
      "Ganar masa muscular",
      "Mejorar mi salud", 
      "Reducir estrés y ansiedad"
    ]
  },
  {
    id: 3,
    title: "¿Con qué frecuencia haces ejercicio?",
    options: [
      "Nunca",
      "1-2 veces por semana",
      "3-5 veces por semana",
      "Todos los días"
    ]
  },
  {
    id: 4,
    title: "¿Qué tipo de ejercicio prefieres?",
    options: [
      "Cardio",
      "Fuerza o pesas",
      "Yoga o pilates",
      "Rutinas mixtas"
    ]
  },
  {
    id: 5,
    title: "¿Cuánto tiempo puedes dedicar al ejercicio al día?",
    options: [
      "Menos de 15 minutos",
      "15-30 minutos",
      "30-60 minutos",
      "Más de una hora"
    ]
  },
  {
    id: 6,
    title: "¿Tienes alguna limitación física o lesión?",
    options: [
      "Sí",
      "No",
      "Prefiero no decirlo"
    ]
  },
  {
    id: 7,
    title: "¿Dónde prefieres hacer ejercicio?",
    options: [
      "En casa",
      "En el gimnasio",
      "Al aire libre",
      "No tengo preferencia"
    ]
  },
  {
    id: 8,
    title: "¿Qué te ayuda a mantenerte motivado?",
    options: [
      "Música",
      "Ver progreso",
      "Retos o metas",
      "Recompensas o premios"
    ]
  },
  {
    id: 9,
    title: "¿Utilizas algún accesorio o equipo?",
    options: [
      "Pesas o mancuernas",
      "Banda elástica",
      "Bicicleta o caminadora",
      "Ninguno"
    ]
  },
  {
    id: 10,
    title: "¿Te gustaría recibir notificaciones motivacionales?",
    options: [
      "Sí, todos los días",
      "Una vez por semana",
      "Solo si me estoy atrasando",
      "No, gracias"
    ]
  }
];

export default function Onboarding() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const submitSurveyMutation = useMutation({
    mutationFn: async (surveyData: Record<string, string>) => {
      await apiRequest("POST", "/api/survey", {
        question1: surveyData.question1,
        question2: surveyData.question2,
        question3: surveyData.question3,
        question4: surveyData.question4,
        question5: surveyData.question5,
        question6: surveyData.question6,
        question7: surveyData.question7,
        question8: surveyData.question8,
        question9: surveyData.question9,
        question10: surveyData.question10,
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Configuración completada!",
        description: "Ya puedes comenzar tu viaje fitness",
      });
      // Force refresh to update user auth state
      window.location.href = "/";
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
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    },
  });

  const handleAnswer = (answer: string) => {
    const questionKey = `question${currentQuestion + 1}`;
    setAnswers(prev => ({ ...prev, [questionKey]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitSurveyMutation.mutate(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionKey = `question${currentQuestion + 1}`;
  const hasAnswer = !!answers[currentQuestionKey];

  return (
    <div className="min-h-screen theme-bg dark:bg-gray-900">
      <div className="p-6 max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Question Card */}
        <QuestionCard
          question={questions[currentQuestion]}
          selectedAnswer={answers[currentQuestionKey]}
          onAnswerSelect={handleAnswer}
        />

        {/* Navigation Buttons */}
        <div className="flex space-x-4 mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasAnswer || submitSurveyMutation.isPending}
            className="flex-1 theme-primary text-white theme-primary-hover"
          >
            {submitSurveyMutation.isPending 
              ? "Guardando..." 
              : currentQuestion === questions.length - 1 
                ? "Finalizar" 
                : "Siguiente"
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
