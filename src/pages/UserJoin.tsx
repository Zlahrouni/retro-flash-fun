import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, User, ArrowRight, AlertCircle } from "lucide-react";
import { getBoard } from "@/services/boardService";
import { toast } from "@/hooks/use-toast";

const UserJoin = () => {
    const { retroId } = useParams<{ retroId: string }>();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [boardExists, setBoardExists] = useState(true);
    const [boardName, setBoardName] = useState("");
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        // Vérifier si l'utilisateur a déjà un nom sauvegardé
        const savedUsername = localStorage.getItem(`username_${retroId}`);
        if (savedUsername) {
            setUsername(savedUsername);
        }

        // Vérifier que le board existe
        const checkBoard = async () => {
            if (!retroId) {
                setBoardExists(false);
                setLoading(false);
                return;
            }

            try {
                const boardData = await getBoard(retroId);
                if (!boardData) {
                    setBoardExists(false);
                } else if (!boardData.isActive) {
                    setBoardExists(false);
                } else {
                    setBoardName(boardData.name);
                    setBoardExists(true);
                }
            } catch (error) {
                console.error("Erreur lors de la vérification du board:", error);
                setBoardExists(false);
            } finally {
                setLoading(false);
            }
        };

        checkBoard();
    }, [retroId]);

    const handleJoinBoard = async () => {
        if (!username.trim()) {
            toast({
                title: "Nom requis",
                description: "Veuillez saisir votre nom d'utilisateur.",
                variant: "destructive"
            });
            return;
        }

        setJoining(true);

        try {
            // Sauvegarder le nom d'utilisateur dans localStorage
            localStorage.setItem(`username_${retroId}`, username.trim());

            // TODO: Ajouter l'utilisateur à la liste des participants du board dans Firebase

            toast({
                title: "Bienvenue !",
                description: `Vous rejoignez le board en tant que ${username.trim()}`,
            });

            // Rediriger vers le board
            navigate(`/retro/${retroId}`);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de rejoindre le board. Veuillez réessayer.",
                variant: "destructive"
            });
        } finally {
            setJoining(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleJoinBoard();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <Card className="w-96 text-center">
                    <CardContent className="p-8">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Vérification du board...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!boardExists) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <Card className="w-96 text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center space-x-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <span>Board introuvable</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-gray-600 mb-4">
                            Ce board n'existe pas ou n'est plus actif.
                        </p>
                        <Button onClick={() => navigate("/")} variant="outline">
                            Retour à l'accueil
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                RetroFlow
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Rejoindre le board
                        </h2>
                        <p className="text-lg text-gray-600">
                            Vous êtes sur le point de rejoindre :
                        </p>
                        <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100">
                            <h3 className="text-xl font-semibold text-blue-900">{boardName}</h3>
                            <p className="text-sm text-gray-600 mt-1">ID: {retroId}</p>
                        </div>
                    </div>

                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-blue-600" />
                                <span>Votre nom d'utilisateur</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium">
                                    Comment souhaitez-vous apparaître dans le board ?
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="username"
                                        placeholder="Ex: Alice, user123, alice.martin..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="pl-10 w-full text-lg py-3"
                                        autoFocus
                                        disabled={joining}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Ce nom sera visible par tous les participants du board
                                </p>
                            </div>

                            <Button
                                onClick={handleJoinBoard}
                                disabled={!username.trim() || joining}
                                size="lg"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                            >
                                {joining ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Connexion...
                                    </>
                                ) : (
                                    <>
                                        Rejoindre le board
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>

                            {!username.trim() && (
                                <p className="text-sm text-gray-500 text-center">
                                    Veuillez saisir votre nom d'utilisateur
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info supplémentaire */}
                    <div className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100">
                        <h4 className="font-semibold text-gray-900 mb-2">💡 À savoir</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>• Votre nom sera sauvegardé pour ce board</p>
                            <p>• Vous pourrez ajouter des cartes et voter</p>
                            <p>• Collaborez en temps réel avec votre équipe</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserJoin;