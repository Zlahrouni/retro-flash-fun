
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Frown, Smile, Target, Star, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RetroTypeSelection = () => {
  const navigate = useNavigate();

  const retroTypes = [
    {
      id: "mad-sad-glad",
      title: "Mad, Sad, Glad",
      description: "Identifiez ce qui vous rend fou, triste ou heureux",
      icon: Heart,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50 border-red-200",
      columns: ["Mad", "Sad", "Glad"]
    },
    {
      id: "start-stop-continue",
      title: "Start, Stop, Continue",
      description: "Définissez quoi commencer, arrêter et continuer",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      columns: ["Start", "Stop", "Continue"]
    },
    {
      id: "what-went-well",
      title: "What went well, To improve, Action items",
      description: "Rétrospective classique pour analyser le sprint",
      icon: Star,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 border-green-200",
      columns: ["What went well?", "What could be improved?", "Action items"]
    },
    {
      id: "liked-learned-lacked",
      title: "Liked, Learned, Lacked",
      description: "Explorez ce que vous avez aimé, appris et ce qui manquait",
      icon: Lightbulb,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
      columns: ["Liked", "Learned", "Lacked"]
    }
  ];

  const createBoard = (retroType: typeof retroTypes[0]) => {
    // Generate a unique board ID
    const boardId = `${Math.random().toString(36).substr(2, 9)}/${crypto.randomUUID()}`;
    navigate(`/board/${boardId}`, { state: { retroType } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RetroFlow
              </h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-800"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre type de rétrospective
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sélectionnez le format qui convient le mieux à votre équipe et vos objectifs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {retroTypes.map((retroType) => (
            <Card 
              key={retroType.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105"
            >
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${retroType.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <retroType.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">{retroType.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {retroType.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Colonnes incluses :</p>
                  {retroType.columns.map((column, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                      {column}
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => createBoard(retroType)}
                  className={`w-full bg-gradient-to-r ${retroType.color} hover:opacity-90 text-white group`}
                >
                  Créer ce type de board
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RetroTypeSelection;
