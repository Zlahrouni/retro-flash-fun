import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Heart, Target, Star, Lightbulb, User, Clipboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createBoard } from "@/services/boardService";
import { toast } from "@/hooks/use-toast";

const RetroTypeSelection = () => {
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateBoard = async () => {
    if (!boardName.trim() || !username.trim() || !selectedType) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs et sélectionner un type de board.",
        variant: "destructive"
      });
      return;
    }

    const retroType = retroTypes.find(type => type.id === selectedType);
    if (!retroType) return;

    setIsCreating(true);

    try {
      const boardId = await createBoard({
        name: boardName.trim(),
        username: username.trim(),
        type: selectedType,
        columns: retroType.columns
      });

      toast({
        title: "Board créé avec succès!",
        description: `Votre board "${boardName}" a été créé avec l'ID: ${boardId}`,
      });

      // Sauvegarder le nom du créateur dans localStorage
      localStorage.setItem(`username_${boardId}`, username.trim());

      // Rediriger vers le board avec un flag indiquant que c'est le créateur
      navigate(`/retro/${boardId}`, { state: { isCreator: true } });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le board. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
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
              Créer votre rétrospective
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Configurez votre board et choisissez le format qui convient le mieux à votre équipe
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            {/* Formulaire de configuration */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clipboard className="w-5 h-5 text-blue-600" />
                  <span>Configuration du board</span>
                </CardTitle>
                <CardDescription>
                  Définissez les informations de base pour votre rétrospective
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="board-name" className="text-sm font-medium">
                    Nom du board <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="board-name"
                      placeholder="Ex: Sprint 21, Rétrospective Q1..."
                      value={boardName}
                      onChange={(e) => setBoardName(e.target.value)}
                      className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Votre nom d'utilisateur <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        id="username"
                        placeholder="Ex: user123, alice.martin..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Types de rétrospective */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Choisissez votre type de rétrospective
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {retroTypes.map((retroType) => (
                  <Card
                      key={retroType.id}
                      className={`group hover:shadow-xl transition-all duration-300 border-2 cursor-pointer
                  ${selectedType === retroType.id
                          ? 'border-blue-500 bg-blue-50/80 shadow-lg'
                          : 'border-gray-200 bg-white/70 hover:bg-white/90'
                      } backdrop-blur-sm`}
                      onClick={() => setSelectedType(retroType.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${retroType.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <retroType.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-gray-900 flex items-center justify-between">
                        {retroType.title}
                        {selectedType === retroType.id && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {retroType.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Colonnes incluses :</p>
                        {retroType.columns.map((column, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                              {column}
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>

            {/* Bouton de création */}
            <div className="text-center">
              <Button
                  onClick={handleCreateBoard}
                  disabled={!boardName.trim() || !username.trim() || !selectedType || isCreating}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
              >
                {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Création en cours...
                    </>
                ) : (
                    <>
                      Créer le board
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                )}
              </Button>

              {(!boardName.trim() || !username.trim() || !selectedType) && (
                  <p className="text-sm text-gray-500 mt-3">
                    Veuillez remplir tous les champs et sélectionner un type de rétrospective
                  </p>
              )}
            </div>
          </div>
        </main>
      </div>
  );
};

export default RetroTypeSelection;