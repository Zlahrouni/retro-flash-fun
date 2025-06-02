import { useState, createElement } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    onCreateAction: (actionTitle: string, actionDescription: string, sourceCardId: string, sourceCardText: string) => void;
}

const ActionFromCard = ({ card, onCreateAction }: ActionFromCardProps) => {
    const [open, setOpen] = useState(false);
    const [actionTitle, setActionTitle] = useState("");
    const [actionDescription, setActionDescription] = useState("");

    const handleCreateAction = () => {
        if (!actionTitle.trim()) return;

        onCreateAction(
            actionTitle.trim(),
            actionDescription.trim(),
            card.id,
            card.text
        );

        // Reset form
        setActionTitle("");
        setActionDescription("");
        setOpen(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleCreateAction();
        }
        if (e.key === "Escape") {
            handleCancel();
        }
    };

    const handleCancel = () => {
        setOpen(false);
        setActionTitle("");
        setActionDescription("");
    };

    if (open) {
        return createElement("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            },
            createElement(Card, {
                    className: "w-full max-w-md mx-4 bg-white"
                },
                createElement(CardHeader, {},
                    createElement(CardTitle, {
                            className: "flex items-center justify-between"
                        },
                        createElement("div", {
                                className: "flex items-center space-x-2"
                            },
                            createElement(Target, {
                                className: "w-5 h-5 text-green-600"
                            }),
                            createElement("span", {}, "Créer une action")
                        ),
                        createElement(Button, {
                                variant: "ghost",
                                size: "sm",
                                onClick: handleCancel,
                                className: "h-6 w-6 p-0"
                            },
                            createElement(X, {
                                className: "w-4 h-4"
                            })
                        )
                    )
                ),
                createElement(CardContent, {
                        className: "space-y-4"
                    },
                    // Référence à la carte source
                    createElement("div", {
                            className: "p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        },
                        createElement(Label, {
                            className: "text-sm font-medium text-blue-800"
                        }, "Basé sur la carte :"),
                        createElement("p", {
                            className: "text-sm text-blue-700 mt-1 italic"
                        }, `"${card.text}"`),
                        createElement("p", {
                            className: "text-xs text-blue-600 mt-1"
                        }, `Par ${card.author} • ${card.votes} vote(s)`)
                    ),

                    // Titre de l'action
                    createElement("div", {
                            className: "space-y-2"
                        },
                        createElement(Label, {
                                htmlFor: "action-title",
                                className: "text-sm font-medium"
                            },
                            "Titre de l'action ",
                            createElement("span", {
                                className: "text-red-500"
                            }, "*")
                        ),
                        createElement(Input, {
                            id: "action-title",
                            value: actionTitle,
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setActionTitle(e.target.value),
                            onKeyDown: handleKeyPress,
                            placeholder: "Ex: Améliorer la communication d'équipe...",
                            className: "w-full",
                            autoFocus: true
                        })
                    ),

                    // Description de l'action
                    createElement("div", {
                            className: "space-y-2"
                        },
                        createElement(Label, {
                            htmlFor: "action-description",
                            className: "text-sm font-medium"
                        }, "Description (optionnel)"),
                        createElement(Textarea, {
                            id: "action-description",
                            value: actionDescription,
                            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setActionDescription(e.target.value),
                            onKeyDown: handleKeyPress,
                            placeholder: "Décrivez les étapes ou détails de cette action...",
                            className: "w-full",
                            rows: 3
                        }),
                        createElement("p", {
                            className: "text-xs text-gray-500"
                        }, "Ctrl/Cmd + Entrée pour créer • Echap pour annuler")
                    ),

                    // Boutons
                    createElement("div", {
                            className: "flex space-x-3 pt-4"
                        },
                        createElement(Button, {
                                onClick: handleCreateAction,
                                disabled: !actionTitle.trim(),
                                className: "flex-1"
                            },
                            createElement(Plus, {
                                className: "w-4 h-4 mr-2"
                            }),
                            "Créer l'action"
                        ),
                        createElement(Button, {
                            variant: "outline",
                            onClick: handleCancel
                        }, "Annuler")
                    )
                )
            )
        );
    }

    return createElement(Button, {
            size: "sm",
            variant: "outline",
            onClick: () => setOpen(true),
            className: "h-6 w-6 p-0 text-green-600 border-green-200 hover:bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity",
            title: "Créer une action depuis cette carte"
        },
        createElement(Target, {
            className: "w-3 h-3"
        })
    );
};

export default ActionFromCard;