import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, ArrowRight, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const createRetrospective = () => {
    navigate("/retro");
  };

  const startIcebreaker = () => {
    navigate("/icebreaker");
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
                REKAP
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Améliorez votre équipe avec des activités collaboratives
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez le type d'activité qui convient le mieux à votre équipe pour favoriser la collaboration et l'amélioration continue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Retrospective Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Rétrospective</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Organisez une session de rétrospective collaborative avec votre équipe pour identifier les points d'amélioration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Colonnes personnalisables (What went well, To improve, Action items)
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Système de votes pour prioriser
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Paramètres de visibilité avancés
                </div>
              </div>
              <Button 
                onClick={createRetrospective}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white group"
              >
                Créer une rétrospective
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Icebreaker Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Icebreaker</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Brisez la glace avec des questions amusantes et engageantes pour dynamiser votre équipe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Questions Fun Express générées aléatoirement
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Parfait pour commencer une réunion
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Favorise la cohésion d'équipe
                </div>
              </div>
              <Button 
                onClick={startIcebreaker}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white group"
              >
                Commencer un icebreaker
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Fonctionnalités avancées pour vos équipes
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Collaboration en temps réel</h4>
              <p className="text-sm text-gray-600">Travaillez ensemble simultanément sur le même board</p>
            </div>
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm">
              <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Cartes anonymes</h4>
              <p className="text-sm text-gray-600">Option pour masquer l'identité des contributeurs</p>
            </div>
            <div className="p-6 rounded-xl bg-white/60 backdrop-blur-sm">
              <Target className="w-8 h-8 text-pink-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Votes et priorisation</h4>
              <p className="text-sm text-gray-600">Identifiez les points les plus importants</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
