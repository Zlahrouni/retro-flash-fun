import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
    PlayCircle
} from "lucide-react";

interface ActionItem {
    id: string;
    title: string;
    description: string;
    assignee: string;
    dueDate: string;
    status: 'todo' | 'in-progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high';
    createdBy: string;
    createdAt: string;
    sourceCard?: string; // ID de la carte qui a généré cette action
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
}

interface ActionBoardProps {
    boardData: BoardData | null;
    currentUsername: string;
    isMaster: boolean;
    retroId: string;
}

const ActionBoard = ({
                         boardData,
                         currentUsername,
                         isMaster,
                         retroId
                     }: ActionBoardProps) => {
    const [actions, setActions] = useState<ActionItem[]>([
        {
            id: '1',
            title: 'Améliorer la communication équipe',
            description: 'Mettre en place des standup meetings quotidiens pour améliorer la communication entre les membres de l\'équipe.',
            assignee: 'Admin',
            dueDate: '2024-07-15',
            status: 'in-progress',
            priority: 'high',
            createdBy: 'Admin',
            createdAt: '2024-06-01',
            sourceCard: 'card-123'
        },
        {
            id: '2',
            title: 'Documentation technique',
            description: 'Rédiger la documentation technique manquante pour le nouveau module de paiement.',
            assignee: 'User1',
            dueDate: '2024-07-20',
            status: 'todo',
            priority: 'medium',
            createdBy: 'User1',
            createdAt: '2024-06-02'
        },
        {
            id: '3',
            title: 'Formation sur les nouvelles technologies',
            description: 'Organiser une session de formation sur React 18 et ses nouvelles fonctionnalités.',
            assignee: 'User2',
            dueDate: '2024-07-10',
            status: 'completed',
            priority: 'low',
            createdBy: 'Admin',
            createdAt: '2024-05-28'
        }
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newAction, setNewAction] = useState({
        title: '',
        description: '',
        assignee: currentUsername,
        dueDate: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    // Statistiques des actions
    const stats = {
        total: actions.length,
        todo: actions.filter(a => a.status === 'todo').length,
        inProgress: actions.filter(a => a.status === 'in-progress').length,
        completed: actions.filter(a => a.status === 'completed').length,
        blocked: actions.filter(a => a.status === 'blocked').length,
        myActions: actions.filter(a => a.assignee === currentUsername).length
    };

    // Fonctions pour gérer les actions
    const addAction = () => {
        if (!newAction.title.trim()) return;

        const action: ActionItem = {
            id: Date.now().toString(),
            title: newAction.title,
            description: newAction.description,
            assignee: newAction.assignee,
            dueDate: newAction.dueDate,
            status: 'todo',
            priority: newAction.priority,
            createdBy: currentUsername,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setActions(prev => [...prev, action]);
        setNewAction({
            title: '',
            description: '',
            assignee: currentUsername,
            dueDate: '',
            priority: 'medium'
        });
        setShowAddForm(false);
    };

    const updateActionStatus = (actionId: string, newStatus: ActionItem['status']) => {
        setActions(prev =>
            prev.map(action =>
                action.id === actionId ? { ...action, status: newStatus } : action
            )
        );
    };

    const deleteAction = (actionId: string) => {
        setActions(prev => prev.filter(action => action.id !== actionId));
    };

    // Fonction pour obtenir l'icône de statut
    const getStatusIcon = (status: ActionItem['status']) => {
        switch (status) {
            case 'todo':
                return <Clock className="w-4 h-4 text-gray-500" />;
            case 'in-progress':
                return <PlayCircle className="w-4 h-4 text-blue-500" />;
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'blocked':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    // Fonction pour obtenir la couleur de priorité
    const getPriorityColor = (priority: ActionItem['priority']) => {
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

    const getStatusColor = (status: ActionItem['status']) => {
        switch (status) {
            case 'todo':
                return 'bg-gray-100 text-gray-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'blocked':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête avec statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
                                <p className="text-sm font-medium text-gray-600">À faire</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.todo}</p>
                            </div>
                            <Clock className="w-8 h-8 text-gray-400" />
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
                                <p className="text-sm font-medium text-green-600">Terminées</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">Bloquées</p>
                                <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Mes actions</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.myActions}</p>
                            </div>
                            <User className="w-8 h-8 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bouton d'ajout d'action */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Plan d'Actions</h2>
                    <p className="text-gray-600 mt-1">
                        Gérez les actions décidées lors de votre rétrospective
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nouvelle action</span>
                </Button>
            </div>

            {/* Formulaire d'ajout d'action */}
            {showAddForm && (
                <Card className="bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>Nouvelle Action</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Titre *</label>
                            <Input
                                value={newAction.title}
                                onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ex: Améliorer la documentation..."
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <Textarea
                                value={newAction.description}
                                onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Décrivez l'action à entreprendre..."
                                className="mt-1"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Assigné à</label>
                                <select
                                    value={newAction.assignee}
                                    onChange={(e) => setNewAction(prev => ({ ...prev, assignee: e.target.value }))}
                                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                                >
                                    {boardData?.participants.map(participant => (
                                        <option key={participant} value={participant}>{participant}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Date d'échéance</label>
                                <Input
                                    type="date"
                                    value={newAction.dueDate}
                                    onChange={(e) => setNewAction(prev => ({ ...prev, dueDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Priorité</label>
                                <select
                                    value={newAction.priority}
                                    onChange={(e) => setNewAction(prev => ({ ...prev, priority: e.target.value as any }))}
                                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                                >
                                    <option value="low">Faible</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="high">Élevée</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button onClick={addAction} disabled={!newAction.title.trim()}>
                                Créer l'action
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewAction({
                                        title: '',
                                        description: '',
                                        assignee: currentUsername,
                                        dueDate: '',
                                        priority: 'medium'
                                    });
                                }}
                            >
                                Annuler
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Liste des actions */}
            <div className="space-y-4">
                {actions.length === 0 ? (
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-12 text-center">
                            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Aucune action définie
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Commencez par créer votre première action pour transformer vos réflexions en résultats concrets.
                            </p>
                            <Button onClick={() => setShowAddForm(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Créer ma première action
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    actions.map((action) => (
                        <Card key={action.id} className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            {getStatusIcon(action.status)}
                                            <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                                            <Badge className={getPriorityColor(action.priority)}>
                                                {action.priority === 'high' ? 'Élevée' : action.priority === 'medium' ? 'Moyenne' : 'Faible'}
                                            </Badge>
                                            <Badge className={getStatusColor(action.status)}>
                                                {action.status === 'todo' ? 'À faire' :
                                                    action.status === 'in-progress' ? 'En cours' :
                                                        action.status === 'completed' ? 'Terminée' : 'Bloquée'}
                                            </Badge>
                                        </div>

                                        {action.description && (
                                            <p className="text-gray-600 mb-3">{action.description}</p>
                                        )}

                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <User className="w-4 h-4" />
                                                <span>{action.assignee}</span>
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
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                        {action.status !== 'completed' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => updateActionStatus(action.id,
                                                    action.status === 'todo' ? 'in-progress' : 'completed'
                                                )}
                                            >
                                                {action.status === 'todo' ? 'Démarrer' : 'Terminer'}
                                            </Button>
                                        )}

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

            {/* Information sur la fonctionnalité */}
            {retroId === 'local' && (
                <Card className="bg-blue-50/80 backdrop-blur-sm border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-800 mb-1">Mode de démonstration</h4>
                                <p className="text-sm text-blue-700">
                                    Vous êtes en mode local. En mode en ligne, les actions seront synchronisées
                                    en temps réel avec tous les participants et sauvegardées dans la base de données.
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
                        <span>Guide d'utilisation des actions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">📝 Créer des actions efficaces</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Utilisez des titres clairs et actionables</li>
                                <li>• Définissez un responsable pour chaque action</li>
                                <li>• Fixez des échéances réalistes</li>
                                <li>• Priorisez selon l'impact et l'urgence</li>
                                <li>• Ajoutez des descriptions détaillées si nécessaire</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">🔄 Suivi des actions</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• <span className="font-medium">À faire:</span> Action créée, pas encore démarrée</li>
                                <li>• <span className="font-medium">En cours:</span> Action en cours de réalisation</li>
                                <li>• <span className="font-medium">Terminée:</span> Action complètement réalisée</li>
                                <li>• <span className="font-medium">Bloquée:</span> Action suspendue pour diverses raisons</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-white/60 rounded-lg border border-gray-200">
                        <h5 className="font-medium text-gray-800 mb-2">💡 Conseil</h5>
                        <p className="text-sm text-gray-600">
                            Transformez les insights de votre rétrospective en actions concrètes.
                            Une bonne action doit être <strong>Spécifique</strong>, <strong>Mesurable</strong>,
                            <strong>Atteignable</strong>, <strong>Pertinente</strong> et <strong>Temporelle</strong> (SMART).
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ActionBoard;