import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Target, Plus, ExternalLink } from "lucide-react";

interface ActionItem {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: string;
    sourceCard?: {
        id: string;
        text: string;
        author: string;
        votes: number;
    };
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
    actions?: ActionItem[]; // NOUVEAU PROP
    onDeleteAction?: (actionId: string) => void; // NOUVEAU PROP
}

const ActionBoard = ({
                         boardData,
                         currentUsername,
                         isMaster,
                         retroId,
                         actions: externalActions = [], // NOUVEAU PROP avec valeur par défaut
                         onDeleteAction // NOUVEAU PROP
                     }: ActionBoardProps) => {
    const [internalActions, setInternalActions] = useState<ActionItem[]>([]);
    const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());

    // Utiliser les actions externes si fournies, sinon les actions internes
    const actions = externalActions.length > 0 ? externalActions : internalActions;

    // Fonction pour supprimer une action
    const deleteAction = (actionId: string) => {
        if (onDeleteAction) {
            // Utiliser la fonction externe si fournie
            onDeleteAction(actionId);
        } else {
            // Sinon utiliser l'état interne
            setInternalActions(prev => prev.filter(action => action.id !== actionId));
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
        myActions: actions.filter(a => a.createdBy === currentUsername).length
    };

    return (
        <div className="space-y-6">
            {/* En-tête avec statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total des actions</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <Target className="w-8 h-8 text-gray-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Depuis les cartes</p>
                                <p className="text-2xl font-bold text-green-600">{stats.fromCards}</p>
                            </div>
                            <ExternalLink className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Mes actions</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.myActions}</p>
                            </div>
                            <Plus className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                                        <div className="flex items-center space-x-3 mb-2">
                                            <Target className="w-5 h-5 text-green-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                                            {action.sourceCard && (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    Depuis une carte
                                                </Badge>
                                            )}
                                        </div>

                                        {action.description && (
                                            <p className="text-gray-600 mb-3">{action.description}</p>
                                        )}

                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <span>Créée par {action.createdBy}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <span>{new Date(action.createdAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>

                                        {/* Référence à la carte source (collapsible) */}
                                        {action.sourceCard && (
                                            <div className="mt-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleActionExpansion(action.id)}
                                                    className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                                                >
                                                    {expandedActions.has(action.id) ? (
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

                                                {expandedActions.has(action.id) && (
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
                                        {(action.createdBy === currentUsername || isMaster) && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteAction(action.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                Supprimer
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