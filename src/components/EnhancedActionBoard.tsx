import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CheckSquare,
    Plus,
    Calendar,
    User,
    Target,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    PlayCircle,
    Crown,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    SortAsc,
    SortDesc,
    Edit3
} from "lucide-react";
import {
    ActionData,
    subscribeToActions,
    createAction,
    updateAction,
    approveAction,
    rejectAction,
    deleteAction,
    getActionStatistics
} from "@/services/actionsService";
import { toast } from "@/hooks/use-toast";

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
    actionsEnabled: boolean;
}

interface EnhancedActionBoardProps {
    boardData: BoardData | null;
    currentUsername: string;
    isMaster: boolean;
    retroId: string;
    isOnlineMode?: boolean;
}

const EnhancedActionBoard = ({
                                 boardData,
                                 currentUsername,
                                 isMaster,
                                 retroId,
                                 isOnlineMode = false
                             }: EnhancedActionBoardProps) => {
    const [actions, setActions] = useState<ActionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [filterBy, setFilterBy] = useState<'all' | 'assigned' | 'created'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // États pour l'édition d'actions
    const [editingAction, setEditingAction] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        assignedTo: [] as string[],
        dueDate: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    // Charger les actions depuis Firebase
    useEffect(() => {
        if (!isOnlineMode || retroId === 'local') {
            setLoading(false);
            return;
        }

        const unsubscribe = subscribeToActions(retroId, (actionsData) => {
            setActions(actionsData);
            setLoading(false);
        });

        return unsubscribe;
    }, [retroId, isOnlineMode]);

    // Calculer les statistiques
    const stats = getActionStatistics(actions);

    // Filtrer les actions selon l'onglet actif
    const getFilteredActions = () => {
        let filtered = actions;

        // Filtrer par onglet
        switch (activeTab) {
            case 'pending':
                filtered = actions.filter(action => !action.isApproved);
                break;
            case 'approved':
                filtered = actions.filter(action => action.isApproved);
                break;
            case 'all':
            default:
                break;
        }

        // Filtrer par utilisateur
        switch (filterBy) {
            case 'assigned':
                filtered = filtered.filter(action =>
                    action.assignedTo.includes(currentUsername) ||
                    action.assignedTo.includes('all')
                );
                break;
            case 'created':
                filtered = filtered.filter(action => action.createdBy === currentUsername);
                break;
        }

        // Trier
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'date':
                    comparison = a.createdAt.toMillis() - b.createdAt.toMillis();
                    break;
                case 'priority':
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    comparison = (priorityOrder[a.priority || 'medium']) - (priorityOrder[b.priority || 'medium']);
                    break;
                case 'status':
                    const statusOrder = { 'proposed': 1, 'todo': 2, 'in-progress': 3, 'done': 4 };
                    comparison = statusOrder[a.status] - statusOrder[b.status];
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    };

    // Fonctions de gestion des actions
    const handleApproveAction = async (actionId: string) => {
        if (!isMaster || !isOnlineMode) return;

        try {
            await approveAction({ boardId: retroId, actionId, approvedBy: currentUsername });
            toast({
                title: "Action approuvée",
                description: "L'action a été approuvée et ajoutée au plan d'actions.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible d'approuver l'action.",
                variant: "destructive"
            });
        }
    };

    const handleRejectAction = async (actionId: string) => {
        if (!isMaster || !isOnlineMode) return;

        try {
            await rejectAction(retroId, actionId);
            toast({
                title: "Action rejetée",
                description: "L'action a été rejetée et supprimée.",
                variant: "destructive"
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de rejeter l'action.",
                variant: "destructive"
            });
        }
    };

    const handleUpdateStatus = async (actionId: string, newStatus: ActionData['status']) => {
        if (!isOnlineMode) return;

        try {
            await updateAction({ boardId: retroId, actionId, status: newStatus });
            toast({
                title: "Statut mis à jour",
                description: "Le statut de l'action a été mis à jour.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour le statut.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteAction = async (actionId: string) => {
        if (!isOnlineMode) return;

        try {
            await deleteAction(retroId, actionId);
            toast({
                title: "Action supprimée",
                description: "L'action a été supprimée.",
                variant: "destructive"
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de supprimer l'action.",
                variant: "destructive"
            });
        }
    };

    const startEditAction = (action: ActionData) => {
        setEditingAction(action.id!);
        setEditForm({
            title: action.title,
            description: action.description || '',
            assignedTo: action.assignedTo,
            dueDate: action.dueDate || '',
            priority: action.priority || 'medium'
        });
    };

    const saveEditAction = async () => {
        if (!editingAction || !isOnlineMode) return;

        try {
            await updateAction({
                boardId: retroId,
                actionId: editingAction,
                title: editForm.title,
                description: editForm.description,
                assignedTo: editForm.assignedTo,
                dueDate: editForm.dueDate,
                priority: editForm.priority
            });

            setEditingAction(null);
            toast({
                title: "Action mise à jour",
                description: "Les modifications ont été sauvegardées.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de sauvegarder les modifications.",
                variant: "destructive"
            });
        }
    };

    // Fonctions utilitaires
    const getStatusIcon = (status: ActionData['status']) => {
        switch (status) {
            case 'proposed':
                return <MessageSquare className="w-4 h-4 text-orange-500" />;
            case 'todo':
                return <Clock className="w-4 h-4 text-gray-500" />;
            case 'in-progress':
                return <PlayCircle className="w-4 h-4 text-blue-500" />;
            case 'done':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: ActionData['priority']) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: ActionData['status'], isApproved: boolean) => {
        if (!isApproved) {
            return 'bg-orange-100 text-orange-800';
        }

        switch (status) {
            case 'todo':
                return 'bg-gray-100 text-gray-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'done':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatAssignees = (assignedTo: string[]) => {
        if (assignedTo.includes('all')) {
            return 'Toute l\'équipe';
        }
        return assignedTo.join(', ');
    };

    const handleAssignedToChange = (participant: string, checked: boolean) => {
        setEditForm(prev => ({
            ...prev,
            assignedTo: checked
                ? [...prev.assignedTo, participant]
                : prev.assignedTo.filter(p => p !== participant)
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Chargement des actions...</span>
            </div>
        );
    }

    const filteredActions = getFilteredActions();

    return (
        <div className="space-y-6">
            {/* En-tête avec statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total</p>
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
                                <p className="text-sm font-medium text-orange-600">En attente</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.proposed}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-orange-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Approuvées</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">En cours</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                            </div>
                            <PlayCircle className="w-8 h-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Terminées</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.done}</p>
                            </div>
                            <CheckSquare className="w-8 h-8 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header avec filtres et tri */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Plan d'Actions</h2>
                    <p className="text-gray-600 mt-1">
                        Actions générées à partir des cartes de la rétrospective
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Filtre par utilisateur */}
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value as any)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value="all">Toutes les actions</option>
                        <option value="assigned">Mes actions</option>
                        <option value="created">Créées par moi</option>
                    </select>

                    {/* Tri */}
                    <div className="flex items-center space-x-1">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="date">Date</option>
                            <option value="priority">Priorité</option>
                            <option value="status">Statut</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Onglets */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="pending" className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>En attente ({stats.proposed})</span>
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approuvées ({stats.approved})</span>
                    </TabsTrigger>
                    <TabsTrigger value="all" className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Toutes ({stats.total})</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {/* Message si aucune action */}
                    {filteredActions.length === 0 ? (
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-12 text-center">
                                <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {activeTab === 'pending' ? 'Aucune action en attente' :
                                        activeTab === 'approved' ? 'Aucune action approuvée' :
                                            'Aucune action définie'}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {activeTab === 'pending' ?
                                        'Les propositions d\'actions apparaîtront ici une fois créées depuis l\'onglet Board.' :
                                        'Commencez par créer des actions depuis l\'onglet Board en faisant un clic droit sur les cartes.'
                                    }
                                </p>
                                {activeTab === 'pending' && (
                                    <p className="text-sm text-blue-600">
                                        💡 Astuce: Faites un clic droit sur une carte dans l'onglet Board pour créer une action.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        /* Liste des actions */
                        <div className="space-y-4">
                            {filteredActions.map((action) => (
                                <Card key={action.id} className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all">
                                    <CardContent className="p-6">
                                        {editingAction === action.id ? (
                                            /* Mode édition */
                                            <div className="space-y-4">
                                                <Input
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                    className="font-semibold"
                                                    placeholder="Titre de l'action"
                                                />
                                                <Textarea
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Description..."
                                                    rows={2}
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Assigné à</label>
                                                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                                                            {boardData?.participants.map(participant => (
                                                                <div key={participant} className="flex items-center space-x-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`edit-assign-${participant}`}
                                                                        checked={editForm.assignedTo.includes(participant)}
                                                                        onChange={(e) => handleAssignedToChange(participant, e.target.checked)}
                                                                        className="rounded border-gray-300"
                                                                    />
                                                                    <label htmlFor={`edit-assign-${participant}`} className="text-sm cursor-pointer">
                                                                        {participant}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700">Date d'échéance</label>
                                                        <Input
                                                            type="date"
                                                            value={editForm.dueDate}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                                            className="mt-1"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700">Priorité</label>
                                                        <select
                                                            value={editForm.priority}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as any }))}
                                                            className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                                                        >
                                                            <option value="low">Faible</option>
                                                            <option value="medium">Moyenne</option>
                                                            <option value="high">Élevée</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-3">
                                                    <Button size="sm" onClick={saveEditAction}>
                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                        Sauvegarder
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => setEditingAction(null)}>
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Annuler
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Mode affichage */
                                            <div>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            {getStatusIcon(action.status)}
                                                            <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>

                                                            <Badge className={getPriorityColor(action.priority)}>
                                                                {action.priority === 'high' ? 'Élevée' :
                                                                    action.priority === 'medium' ? 'Moyenne' : 'Faible'}
                                                            </Badge>

                                                            <Badge className={getStatusColor(action.status, action.isApproved)}>
                                                                {!action.isApproved ? 'En attente' :
                                                                    action.status === 'todo' ? 'À faire' :
                                                                        action.status === 'in-progress' ? 'En cours' :
                                                                            action.status === 'done' ? 'Terminée' : 'Proposée'}
                                                            </Badge>
                                                        </div>

                                                        {action.description && (
                                                            <p className="text-gray-600 mb-3">{action.description}</p>
                                                        )}

                                                        {/* Carte source */}
                                                        <div className="p-3 bg-gray-50 rounded-lg mb-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-gray-600">Basée sur la carte :</span>
                                                                <span className="text-xs text-gray-500">{action.linkedNoteColumn}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-800">{action.linkedNoteContent}</p>
                                                        </div>

                                                        {/* Informations */}
                                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                            <div className="flex items-center space-x-1">
                                                                <User className="w-4 h-4" />
                                                                <span>{formatAssignees(action.assignedTo)}</span>
                                                            </div>
                                                            {action.dueDate && (
                                                                <div className="flex items-center space-x-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>{new Date(action.dueDate).toLocaleDateString('fr-FR')}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center space-x-1">
                                                                <span>Créée par {action.createdBy}</span>
                                                            </div>
                                                            {action.isApproved && action.approvedBy && (
                                                                <div className="flex items-center space-x-1">
                                                                    <Crown className="w-4 h-4 text-yellow-600" />
                                                                    <span>Approuvée par {action.approvedBy}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {/* Actions pour les propositions (admin seulement) */}
                                                        {!action.isApproved && isMaster && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApproveAction(action.id!)}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                                                    Approuver
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleRejectAction(action.id!)}
                                                                >
                                                                    <ThumbsDown className="w-4 h-4 mr-1" />
                                                                    Rejeter
                                                                </Button>
                                                            </>
                                                        )}

                                                        {/* Actions pour les actions approuvées */}
                                                        {action.isApproved && (
                                                            <>
                                                                {action.status !== 'done' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleUpdateStatus(action.id!,
                                                                            action.status === 'todo' ? 'in-progress' : 'done'
                                                                        )}
                                                                    >
                                                                        {action.status === 'todo' ? (
                                                                            <>
                                                                                <PlayCircle className="w-4 h-4 mr-1" />
                                                                                Démarrer
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                                Terminer
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                )}

                                                                {(action.createdBy === currentUsername || isMaster) && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => startEditAction(action)}
                                                                    >
                                                                        <Edit3 className="w-4 h-4 mr-1" />
                                                                        Modifier
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Suppression */}
                                                        {(action.createdBy === currentUsername || isMaster) && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDeleteAction(action.id!)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Supprimer
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </Tabs>

            {/* Information sur le mode */}
            {!isOnlineMode && (
                <Card className="bg-blue-50/80 backdrop-blur-sm border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-800 mb-1">Mode de démonstration</h4>
                                <p className="text-sm text-blue-700">
                                    Vous êtes en mode local. En mode en ligne, les actions seront synchronisées
                                    en temps réel avec tous les participants et sauvegardées dans la base de données.
                                    Utilisez le clic droit sur les cartes pour créer des actions.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Guide d'utilisation */}
            <Card className="bg-gray-50/80 backdrop-blur-sm border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                        <CheckSquare className="w-5 h-5" />
                        <span>Guide d'utilisation du Plan d'Actions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">🎯 Créer des actions depuis les cartes</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• <strong>Clic droit</strong> sur une carte dans l'onglet Board</li>
                                <li>• <strong>"Dupliquer vers les actions"</strong> pour une proposition simple</li>
                                <li>• <strong>"Créer une action directe"</strong> pour définir tous les détails</li>
                                <li>• Les actions créées par l'admin sont automatiquement approuvées</li>
                                <li>• Les autres participants créent des propositions</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">⚡ Workflow des actions</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• <span className="font-medium text-orange-600">En attente:</span> Proposition à valider par l'admin</li>
                                <li>• <span className="font-medium text-gray-600">À faire:</span> Action approuvée, pas encore démarrée</li>
                                <li>• <span className="font-medium text-blue-600">En cours:</span> Action en cours de réalisation</li>
                                <li>• <span className="font-medium text-green-600">Terminée:</span> Action complètement réalisée</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-white/60 rounded-lg border border-gray-200">
                        <h5 className="font-medium text-gray-800 mb-2">💡 Astuce pour les administrateurs</h5>
                        <p className="text-sm text-gray-600">
                            En tant qu'administrateur, vous pouvez <strong>approuver</strong> ou <strong>rejeter</strong> les propositions d'actions
                            des participants. Les actions approuvées passent automatiquement au statut "À faire" et peuvent être suivies
                            par toute l'équipe. Encouragez vos participants à créer des actions concrètes à partir des points d'amélioration identifiés.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EnhancedActionBoard;