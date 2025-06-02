import { useState, createElement, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Target, X } from "lucide-react";

interface RetroCardData {
    id: string;
    text: string;
    author: string;
    votes: number;
    hasVoted: boolean;
    highlighted?: boolean;
}

interface ActionFromCardProps {
    card: RetroCardData;
    onCreateAction: (
        actionTitle: string,
        actionDescription: string,
        sourceCardId: string,
        sourceCardText: string
    ) => Promise<void>;
}

const ActionFromCard = ({ card, onCreateAction }: ActionFromCardProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [actionTitle, setActionTitle] = useState<string>("");
    const [actionDescription, setActionDescription] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false);

    const handleCreateAction = async () => {
        if (!actionTitle.trim() || isCreating) return;
        setIsCreating(true);
        try {
            await onCreateAction(actionTitle.trim(), actionDescription.trim(), card.id, card.text);
            setActionTitle("");
            setActionDescription("");
            setOpen(false);
        } catch (error) {
            console.error("Erreur lors de la création de l'action:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleCreateAction();
        if (e.key === "Escape") handleCancel();
    };

    const handleCancel = () => {
        if (isCreating) return;
        setOpen(false);
        setActionTitle("");
        setActionDescription("");
    };

    return createElement(Fragment, null,
        createElement(Button, {
            size: "sm",
            variant: "outline",
            onClick: () => setOpen(true),
            className: "h-6 w-6 p-0 text-green-600 border-green-200 hover:bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity",
            title: "Créer une action depuis cette carte"
        }, createElement(Target, { className: "w-3 h-3" })),

        createElement(Dialog, {
                open,
                onOpenChange: (v: boolean) => !isCreating && setOpen(v)
            },
            createElement(DialogContent, {
                    className: "max-w-lg",
                    onKeyDown: handleKeyPress
                },
                createElement(DialogHeader, null,
                    createElement(DialogTitle, {
                            className: "flex items-center justify-between"
                        },
                        createElement("div", { className: "flex items-center space-x-2" },
                            createElement(Target, { className: "w-5 h-5 text-green-600" }),
                            "Créer une action"
                        ),
                    )
                ),

                // Carte source
                createElement("div", { className: "space-y-4" },
                    createElement("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm" },
                        createElement(Label, { className: "text-blue-800" }, "Basé sur la carte :"),
                        createElement("p", { className: "text-blue-700 italic mt-1" }, `"${card.text}"`),
                        createElement("p", { className: "text-xs text-blue-600 mt-1" },
                            `Par ${card.author} • ${card.votes} vote(s)`)
                    ),

                    // Titre
                    createElement("div", { className: "space-y-1" },
                        createElement(Label, { htmlFor: "action-title" },
                            "Titre de l'action ",
                            createElement("span", { className: "text-red-500" }, "*")
                        ),
                        createElement(Input, {
                            id: "action-title",
                            value: actionTitle,
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setActionTitle(e.target.value),
                            placeholder: "Ex: Améliorer la communication d'équipe...",
                            autoFocus: true,
                            disabled: isCreating
                        })
                    ),

                    // Description
                    createElement("div", { className: "space-y-1" },
                        createElement(Label, { htmlFor: "action-description" }, "Description (optionnel)"),
                        createElement(Textarea, {
                            id: "action-description",
                            value: actionDescription,
                            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setActionDescription(e.target.value),
                            placeholder: "Décrivez les étapes ou détails de cette action...",
                            rows: 3,
                            disabled: isCreating
                        }),
                        createElement("p", { className: "text-xs text-gray-500" },
                            "Ctrl/Cmd + Entrée pour créer • Échap pour annuler"
                        )
                    ),

                    // Boutons
                    createElement("div", { className: "flex justify-end space-x-3 pt-2" },
                        createElement(Button, {
                            onClick: handleCancel,
                            variant: "outline",
                            disabled: isCreating
                        }, "Annuler"),
                        createElement(Button, {
                                onClick: handleCreateAction,
                                disabled: !actionTitle.trim() || isCreating
                            },
                            isCreating
                                ? createElement(Fragment, null,
                                    createElement("div", {
                                        className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                                    }),
                                    "Création..."
                                )
                                : createElement(Fragment, null,
                                    createElement(Plus, { className: "w-4 h-4 mr-2" }),
                                    "Créer l'action"
                                )
                        )
                    )
                )
            )
        )
    );
};

export default ActionFromCard;
