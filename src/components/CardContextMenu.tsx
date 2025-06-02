// src/components/CardContextMenu.tsx
import { useState } from "react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Copy,
    Plus,
    Target,
    Users,
    Calendar,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Card {
    id: string;
    text: string;
    author: string;
    votes: number;
    hasVoted: boolean;
}

interface CardContextMenuProps {
    children: React.ReactNode;
    card: Card;
    columnTitle: string;
    currentUsername: string;
    isMaster: boolean;
    boardParticipants: string[];
    actionsEnabled: boolean;
    onDuplicateToActions: (card: Card, columnTitle: string) => Promise<void>;
    onCreateDirectAction: (
        card: Card,
        columnTitle: string,
        actionData: {
            title: string;
            description?: string;
            assignedTo: string[];
            dueDate?: string;
            priority: 'low' | 'medium' | 'high';
        }
    ) => Promise<void>;
}

const CardContextMenu = ({
                             children,
                             card,
                             columnTitle,
                             currentUsername,
                             isMaster,
                             boardParticipants,
                             onDuplicateToActions,
                             onCreateDirectAction
                         }: CardContextMenuProps) => {
    const [showActionDialog, setShowActionDialog] = useState(false);
    const [actionForm, setActionForm] = useState({
        title: '',
        description: '',
        assignedTo: [currentUsername],
        dueDate: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });
    const [isCreating, setIsCreating] = useState(false);

    // Réinitialiser le formulaire quand on ouvre le dialog
    const openActionDialog = () => {
        setActionForm({
            title: `Action basée sur: ${card.text.substring(0, 50)}${card.text.length > 50 ? '...' : ''}`,
            description: '',
            assignedTo: [currentUsername],
            dueDate: '',
            priority: 'medium'
        });
        setShowActionDialog(true);
    };

    const handleDuplicateToActions = async () => {
        try {
            await onDuplicateToActions(card, columnTitle);
            toast({
                title: "Carte dupliquée",
                description: "La carte a été ajoutée aux actions en attente.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de dupliquer la carte vers les actions.",
                variant: "destructive"
            });
        }
    };

    const handleCreateDirectAction = async () => {
        if (!actionForm.title.trim()) {
            toast({
                title: "Titre requis",
                description: "Veuillez saisir un titre pour l'action.",
                variant: "destructive"
            });
            return;
        }

        setIsCreating(true);

        try {
            await onCreateDirectAction(card, columnTitle, {
                title: actionForm.title,
                description: actionForm.description,
                assignedTo: actionForm.assignedTo,
                dueDate: actionForm.dueDate,
                priority: actionForm.priority
            });

            toast({
                title: "Action créée",
                description: isMaster
                    ? "L'action a été créée et approuvée automatiquement."
                    : "Votre proposition d'action a été envoyée à l'administrateur.",
            });

            setShowActionDialog(false);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de créer l'action.",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleAssignedToChange = (participant: string, checked: boolean) => {
        setActionForm(prev => ({
            ...prev,
            assignedTo: checked
                ? [...prev.assignedTo, participant]
                : prev.assignedTo.filter(p => p !== participant)
        }));
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    {children}
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                    <ContextMenuItem onClick={handleDuplicateToActions}>
                        <Copy className="w-4 h-4 mr-2" />
                        Dupliquer vers les actions
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem onClick={openActionDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Créer une action directe
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <Target className="w-4 h-4 mr-2" />
                            Actions rapides
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            <ContextMenuItem
                                onClick={() => onCreateDirectAction(card, columnTitle, {
                                    title: `Améliorer: ${card.text.substring(0, 30)}...`,
                                    assignedTo: ['all'],
                                    priority: 'medium'
                                })}
                            >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Action d'amélioration
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() => onCreateDirectAction(card, columnTitle, {
                                    title: `Continuer: ${card.text.substring(0, 30)}...`,
                                    assignedTo: [card.author],
                                    priority: 'low'
                                })}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Continuer cette pratique
                            </ContextMenuItem>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                </ContextMenuContent>
            </ContextMenu>

            {/* Dialog de création d'action directe */}
            <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Plus className="w-5 h-5" />
                            <span>Créer une Action</span>
                        </DialogTitle>
                        <DialogDescription>
                            Créez une action basée sur cette carte : "{card.text.substring(0, 50)}..."
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Carte source */}
                        <div className="p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-600">Carte source</span>
                                <span className="text-xs text-gray-500">{columnTitle}</span>
                            </div>
                            <p className="text-sm text-gray-800">{card.text}</p>
                            <p className="text-xs text-gray-500 mt-1">Par {card.author}</p>
                        </div>

                        {/* Formulaire d'action */}
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="action-title">Titre de l'action *</Label>
                                <Input
                                    id="action-title"
                                    value={actionForm.title}
                                    onChange={(e) => setActionForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Ex: Organiser une formation sur..."
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="action-description">Description (optionnel)</Label>
                                <Textarea
                                    id="action-description"
                                    value={actionForm.description}
                                    onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Décrivez l'action à entreprendre..."
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="action-date">Date d'échéance</Label>
                                    <Input
                                        id="action-date"
                                        type="date"
                                        value={actionForm.dueDate}
                                        onChange={(e) => setActionForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="action-priority">Priorité</Label>
                                    <select
                                        id="action-priority"
                                        value={actionForm.priority}
                                        onChange={(e) => setActionForm(prev => ({ ...prev, priority: e.target.value as any }))}
                                        className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                                    >
                                        <option value="low">Faible</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Élevée</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Assigné à</Label>
                                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                                    {boardParticipants.map(participant => (
                                        <div key={participant} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`assign-${participant}`}
                                                checked={actionForm.assignedTo.includes(participant)}
                                                onChange={(e) => handleAssignedToChange(participant, e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <label
                                                htmlFor={`assign-${participant}`}
                                                className="text-sm cursor-pointer flex items-center space-x-1"
                                            >
                                                <span>{participant}</span>
                                                {participant === currentUsername && (
                                                    <span className="text-xs text-blue-600">(moi)</span>
                                                )}
                                            </label>
                                        </div>
                                    ))}

                                    <div className="flex items-center space-x-2 pt-1 border-t">
                                        <input
                                            type="checkbox"
                                            id="assign-all"
                                            checked={actionForm.assignedTo.includes('all')}
                                            onChange={(e) => handleAssignedToChange('all', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="assign-all" className="text-sm cursor-pointer flex items-center space-x-1">
                                            <Users className="w-3 h-3" />
                                            <span>Toute l'équipe</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Information sur l'approbation */}
                        {!isMaster && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    💡 Votre proposition sera envoyée à l'administrateur pour approbation.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowActionDialog(false)}
                            disabled={isCreating}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateDirectAction}
                            disabled={!actionForm.title.trim() || actionForm.assignedTo.length === 0 || isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Création...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {isMaster ? 'Créer l\'action' : 'Proposer l\'action'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CardContextMenu;