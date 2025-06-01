
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shuffle, ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const questions = [
  "Quel est ton talent artistique caché?",
  "Si tu pouvais avoir un super-pouvoir pour une journée, lequel choisirais-tu?",
  "Quel est le livre qui t'a le plus marqué récemment?",
  "Si tu devais décrire ta journée parfaite, à quoi ressemblerait-elle?",
  "Quelle est la chose la plus insolite que tu aies jamais mangée?",
  "Si tu pouvais rencontrer une personnalité historique, qui serait-ce?",
  "Quel est ton film ou série culte que tu peux regarder en boucle?",
  "Si tu pouvais apprendre une nouvelle compétence instantanément, laquelle serait-ce?",
  "Quel est l'endroit le plus incroyable que tu aies visité?",
  "Si tu étais un animal, lequel serais-tu et pourquoi?",
  "Quelle est ta tradition familiale préférée?",
  "Si tu pouvais organiser un dîner avec 3 personnes (vivantes ou décédées), qui inviterais-tu?",
  "Quel est ton hobby le plus inhabituel?",
  "Si tu pouvais retourner à n'importe quelle époque, laquelle choisirais-tu?",
  "Quelle est la chose la plus spontanée que tu aies jamais faite?",
  "Si tu devais créer une nouvelle fête nationale, quelle serait-elle?",
  "Quel est ton plat réconfortant ultime?",
  "Si tu pouvais avoir une conversation avec ton moi d'il y a 10 ans, que lui dirais-tu?",
  "Quelle est la compétence la plus bizarre que tu possèdes?",
  "Si tu pouvais être invisible pendant une heure, qu'est-ce que tu ferais?"
];

const Icebreaker = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(
    questions[Math.floor(Math.random() * questions.length)]
  );
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);

  const generateNewQuestion = () => {
    let newQuestion;
    do {
      newQuestion = questions[Math.floor(Math.random() * questions.length)];
    } while (newQuestion === currentQuestion && questions.length > 1);
    
    setQuestionHistory(prev => [currentQuestion, ...prev].slice(0, 5));
    setCurrentQuestion(newQuestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Question Fun Express
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Brisez la glace avec votre équipe!
            </h2>
            <p className="text-lg text-gray-600">
              Une question amusante pour créer des liens et dynamiser vos réunions.
            </p>
          </div>

          {/* Current Question Card */}
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="text-sm font-medium text-purple-100 uppercase tracking-wide">
                Question du moment
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pb-8">
              <p className="text-2xl md:text-3xl font-bold leading-relaxed">
                {currentQuestion}
              </p>
            </CardContent>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full"></div>
          </Card>

          {/* Action Button */}
          <Button
            onClick={generateNewQuestion}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold group"
          >
            <Shuffle className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" />
            Nouvelle question
          </Button>

          {/* Question History */}
          {questionHistory.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Questions précédentes
              </h3>
              <div className="space-y-3">
                {questionHistory.map((question, index) => (
                  <Card key={index} className="bg-white/60 backdrop-blur-sm border-purple-100">
                    <CardContent className="py-3">
                      <p className="text-gray-700">{question}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Conseils d'utilisation</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Laissez chaque participant répondre à tour de rôle</p>
              <p>• Encouragez les réponses spontanées et authentiques</p>
              <p>• Parfait pour commencer une rétrospective ou une réunion d'équipe</p>
              <p>• Générez une nouvelle question si celle-ci ne convient pas au groupe</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Icebreaker;
