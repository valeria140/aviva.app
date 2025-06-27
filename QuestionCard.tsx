import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Question {
  id: number;
  title: string;
  options: string[];
}

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
}

export default function QuestionCard({ question, selectedAnswer, onAnswerSelect }: QuestionCardProps) {
  return (
    <Card className="shadow-lg slide-in">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {question.title}
        </h2>
        
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const optionLetter = String.fromCharCode(97 + index); // a, b, c, d
            const isSelected = selectedAnswer === option;
            
            return (
              <Button
                key={index}
                variant="outline"
                onClick={() => onAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? "border-opacity-60 theme-primary text-white" 
                    : "border-gray-200 dark:border-gray-600 hover:border-opacity-60"
                }`}
              >
                <span className="text-gray-800 dark:text-gray-200">
                  {optionLetter}) {option}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
