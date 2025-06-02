import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Target, Plus, ExternalLink, UserCheck, Users, Trash2 } from "lucide-react";
import ActionAssignment from "./ActionAssignment";
import { ActionData, subscribeToActions, deleteAction as deleteActionService, updateActionAssignment } from "@/services/actionsService";
import { toast } from "@/hooks/use-toast";

// Utiliser ActionData du service au lieu de ActionItem local
interface ActionItem extends ActionData {
    // Interface de compatibilité qui étend ActionData
}

interface BoardData {
    name: string;
    isActive: boolean;
    createdBy: string;
    participants: string[];
    columns: string[];
    hideCardsFromOthers: boolean;
    votingEnabled: boolean;
    votesPerParticipant: number;
    addingCardsDisabled: boolean;
    actionCreationEnabled: boolean;
}

interface ActionBoardProps {
    boardData: BoardData | null;
    currentUsername: string;
    isMaster: boolean;
    retroId: string;
    isOnlineMode?: boolean; // NOUVEAU PROP pour détecter si on est en ligne
}

const ActionBoard = ({
                         boardData,
                         currentUsername,
                         isMaster,
                         retroId,
                         isOnlineMode = false // NOUVEAU PROP avec valeur par défaut
                     }: ActionBoardProps) => {
    const [actions, setActions] = useState<ActionData[]>([]);
    const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // S'abonner aux actions en temps réel si on est en mode online
    useEffect(() => {
        if (!isOnlineMode || retroId === "local") {
            setLoading(false);
            return;
        }

        const unsubscribe = subscribeToActions(retroId, (actionsData) => {
            setActions(actionsData);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, [retroId, isOnlineMode]);

    // Fonction pour supprimer une action
    const deleteAction = async (actionId: string) => {
        if (!isOnlineMode || retroId === "local") {
            toast({
                title: "Action non disponible",
                description: "La suppression d'actions n'est disponible qu'en mode en ligne.",
                variant: "destructive"
            });
            return;
        }

        try {
            await deleteActionService(retroId, actionId);
            toast({
                title: "Action supprimée",
                description: "L'action a été supprimée avec succès.",
            });
        } catch (error) {
            console.error("Erreur lors de la suppression de l'action:", error);
            toast({
                title: "Erreur",
                description: "Impossible de supprimer l'action. Veuillez réessayer.",
                variant: "destructive"
            });
        }
    };

    // Fonction pour assigner une action
    const handleAssignAction = async (actionId: string, assignedTo?: string) => {
        if (!isOnlineMode || retroId === "local") {
            toast({
                title: "Action non disponible",
                description: "L'assignation d'actions n'est disponible qu'en mode en ligne.",
                variant: "destructive"
            });
            return;
        }

        try {
            await updateActionAssignment({
                boardId: retroId,
                actionId,
                assignedTo
            });

            const assignmentText = assignedTo
                ? assignedTo === "all-team"
                    ? "à toute l'équipe"
                    : `à ${assignedTo}`
                : "comme non assignée";

            toast({
                title: "Assignation mise à jour",
                description: `L'action a été assignée ${assignmentText}.`,
            });
        } catch (error) {
            console.error("Erreur lors de l'assignation:", error);
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour l'assignation. Veuillez réessayer.",
                variant: "destructive"
            });
        }
    };

    // Fonction pour toggle l'expansion d'une action
    const toggleActionExpansion = (actionId: string) => {
        setExpandedActions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(actionId)) {
                newSet.delete(actionId);
            } else {
                newSet.add(actionId);
            }
            return newSet;
        });
    };

    // Statistiques des actions
    const stats = {
        total: actions.length,
        fromCards: actions.filter(a => a.sourceCard).length,
        myActions: actions.filter(a => a.createdBy === currentUsername).length,
        assigned: actions.filter(a => a.assignedTo).length,
        assignedToMe: actions.filter(a => a.assignedTo === currentUsername || a.assignedTo === "all-team").length
    };

    // Obtenir les participants pour l'assignation
    const participants = boardData ? boardData.participants : [currentUsername];
    console.log("Participants:", boardData?.participants);
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des actions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec statistiques */}


            {/* Titre et informations */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Plan d'Actions</h2>
                    <p className="text-gray-600 mt-1">
                        Actions créées depuis les cartes en évidence de votre rétrospective
                    </p>
                </div>
                {boardData?.actionCreationEnabled && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Création d'actions activée
                    </Badge>
                )}
            </div>

            {/* Message d'information si la création d'actions est désactivée */}
            {!boardData?.actionCreationEnabled && (
                <Card className="bg-blue-50/80 backdrop-blur-sm border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-800 mb-1">Création d'actions désactivée</h4>
                                <p className="text-sm text-blue-700">
                                    {isMaster
                                        ? "Activez la création d'actions dans les paramètres pour permettre la transformation des cartes en évidence en actions concrètes."
                                        : "L'administrateur doit activer la création d'actions pour que vous puissiez transformer les cartes en évidence en actions."
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Liste des actions */}
            <div className="space-y-4">
                {actions.length === 0 ? (
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-12 text-center">
                            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Aucune action créée
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {boardData?.actionCreationEnabled
                                    ? "Transformez vos cartes en évidence en actions concrètes en cliquant sur le bouton 🎯 sur les cartes."
                                    : "Les actions apparaîtront ici une fois que l'administrateur aura activé la création d'actions."
                                }
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    actions.map((action) => (
                        <Card key={action.id} className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <Target className="w-5 h-5 text-green-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>

                                            {/* Badges */}
                                            <div className="flex items-center space-x-2">
                                                {action.sourceCard && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        Depuis une carte
                                                    </Badge>
                                                )}

                                                {/* Badge d'assignation */}
                                                {action.assignedTo && (
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            action.assignedTo === "all-team"
                                                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                : "bg-green-50 text-green-700 border-green-200"
                                                        }
                                                    >
                                                        {action.assignedTo === "all-team" ? (
                                                            <>
                                                                <Users className="w-3 h-3 mr-1" />
                                                                Toute l'équipe
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="w-3 h-3 mr-1" />
                                                                {action.assignedTo}
                                                            </>
                                                        )}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {action.description && (
                                            <p className="text-gray-600 mb-3">{action.description}</p>
                                        )}

                                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                                            <div className="flex items-center space-x-1">
                                                <span>Créée par {action.createdBy}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <span>{action.createdAt.toDate().toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>

                                        {/* Assignation (seulement pour l'admin) */}
                                        {isMaster && isOnlineMode && (
                                            <div className="mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-gray-700">Assigné à :</span>
                                                    <ActionAssignment
                                                        currentAssignment={action.assignedTo}
                                                        participants={participants}
                                                        onAssign={(assignedTo) => handleAssignAction(action.id!, assignedTo)}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Affichage de l'assignation pour les non-admins */}
                                        {!isMaster && action.assignedTo && (
                                            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-2 text-sm">
                                                    {action.assignedTo === "all-team" ? (
                                                        <>
                                                            <Users className="w-4 h-4 text-blue-600" />
                                                            <span className="text-blue-700 font-medium">Assigné à toute l'équipe</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck className="w-4 h-4 text-green-600" />
                                                            <span className="text-green-700 font-medium">Assigné à {action.assignedTo}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Référence à la carte source (collapsible) */}
                                        {action.sourceCard && (
                                            <div className="mt-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleActionExpansion(action.id!)}
                                                    className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                                                >
                                                    {expandedActions.has(action.id!) ? (
                                                        <>
                                                            <ChevronUp className="w-4 h-4 mr-1" />
                                                            Masquer la carte source
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-4 h-4 mr-1" />
                                                            Voir la carte source
                                                        </>
                                                    )}
                                                </Button>

                                                {expandedActions.has(action.id!) && (
                                                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-blue-800 font-medium mb-1">
                                                                    Carte source :
                                                                </p>
                                                                <p className="text-sm text-blue-700 italic mb-2">
                                                                    "{action.sourceCard.text}"
                                                                </p>
                                                                <div className="flex items-center space-x-4 text-xs text-blue-600">
                                                                    <span>Par {action.sourceCard.author}</span>
                                                                    <span>{action.sourceCard.votes} vote(s)</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                        {(action.createdBy === currentUsername || isMaster) && isOnlineMode && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteAction(action.id!)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Guide d'utilisation */}
            <Card className="bg-gray-50/80 backdrop-blur-sm border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                        <Target className="w-5 h-5" />
                        <span>Comment créer des actions depuis les cartes</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">📋 Étapes pour créer une action</h4>
                            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                                <li>L'administrateur doit activer la "Création d'actions" dans les paramètres</li>
                                <li>Mettez en évidence les cartes importantes avec l'icône ⭐</li>
                                <li>Cliquez sur le bouton 🎯 qui apparaît sur les cartes en évidence</li>
                                <li>Définissez un titre et une description pour votre action</li>
                                <li>L'action apparaîtra dans cet onglet avec une référence à la carte source</li>
                            </ol>
                        </div>

                        <div className="p-4 bg-white/60 rounded-lg border border-gray-200">
                            <h5 className="font-medium text-gray-800 mb-2">💡 Conseil</h5>
                            <p className="text-sm text-gray-600">
                                Les actions créées depuis les cartes gardent une référence vers la carte originale.
                                Cela permet de tracer l'origine de chaque action et de maintenir le contexte de la rétrospective.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ActionBoard;