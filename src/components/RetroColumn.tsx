import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Lock } from "lucide-react";
import RetroCard from "./RetroCard";

interface RetroCardData {
    id: string;
    text: string;
    author: string;
    votes: number;
    hasVoted: boolean;
    highlighted?: boolean; // Nouveau champ pour la mise en évidence
}

interface Column {
    id: string;
    title: string;
    color: string;
    cards: RetroCardData[];
}

interface RetroColumnProps {
    column: Column;
    cards: RetroCardData[];
    onAddCard: (columnId: string, text: string) => void;
    onDeleteCard: (columnId: string, cardId: string) => void;
    onVoteCard: (columnId: string, cardId: string) => void;
    onHighlightCard?: (columnId: string, cardId: string) => void; // Nouvelle fonction pour la mise en évidence
    cardsVisible: boolean;
    votingEnabled: boolean;
    addingDisabled: boolean;
    currentUsername: string;
    userCanVote?: boolean; // Indique si l'utilisateur peut encore voter
    isMaster?: boolean; // Indique si l'utilisateur est admin
    showHighlightButtons?: boolean; // Contrôle l'affichage des boutons de mise en évidence
}

const RetroColumn = ({
                         column,
                         cards,
                         onAddCard,
                         onDeleteCard,
                         onVoteCard,
                         onHighlightCard,
                         cardsVisible,
                         votingEnabled,
                         addingDisabled,
                         currentUsername,
                         userCanVote = true,
                         isMaster = false,
                         showHighlightButtons = false
                     }: RetroColumnProps) => {
    const [newCardText, setNewCardText] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddCard = () => {
        if (newCardText.trim() && !addingDisabled) {
            onAddCard(column.id, newCardText.trim());
            setNewCardText("");
            setIsAdding(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAddCard();
        } else if (e.key === "Escape") {
            setIsAdding(false);
            setNewCardText("");
        }
    };

    // Sort cards by votes (highest first), puis par statut de mise en évidence
    const sortedCards = [...cards].sort((a, b) => {
        // Prioriser les cartes mises en évidence
        if (a.highlighted && !b.highlighted) return -1;
        if (!a.highlighted && b.highlighted) return 1;
        // Puis trier par votes
        return b.votes - a.votes;
    });

    // Compter les cartes mises en évidence dans cette colonne
    const highlightedCount = cards.filter(card => card.highlighted).length;

    return (
        <Card className={`${column.color} border-2 h-fit min-h-[400px]`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span>{column.title}</span>
                        {highlightedCount > 0 && (
                            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-300 flex items-center space-x-1">
                                <span>⭐</span>
                                <span>{highlightedCount}</span>
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-normal text-gray-600 bg-white/60 px-2 py-1 rounded-full">
            {cards.length}
          </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Cards */}
                {cardsVisible && sortedCards.map((card) => (
                    <RetroCard
                        key={card.id}
                        card={card}
                        onDelete={() => onDeleteCard(column.id, card.id)}
                        onVote={() => onVoteCard(column.id, card.id)}
                        onHighlight={onHighlightCard ? () => onHighlightCard(column.id, card.id) : undefined}
                        votingEnabled={votingEnabled}
                        currentUsername={currentUsername}
                        canVote={userCanVote || card.hasVoted} // Peut voter si limite non atteinte OU si déjà voté (pour retirer le vote)
                        isMaster={isMaster}
                        showHighlightButton={showHighlightButtons}
                    />
                ))}

                {/* Message quand les cartes sont masquées */}
                {!cardsVisible && (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Les cartes sont masquées</p>
                    </div>
                )}

                {/* Message quand il n'y a pas de cartes visibles */}
                {cardsVisible && sortedCards.length === 0 && cards.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-700">
                                <span className="font-medium">Aucune carte en évidence dans cette colonne</span>
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                Toutes les cartes sont masquées car seules les cartes en évidence sont affichées.
                            </p>
                        </div>
                    </div>
                )}

                {/* Add Card Section */}
                {!addingDisabled && (
                    <div className="mt-4">
                        {isAdding ? (
                            <div className="space-y-2">
                                <Input
                                    value={newCardText}
                                    onChange={(e) => setNewCardText(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Tapez votre idée..."
                                    className="text-sm"
                                    autoFocus
                                />
                                <div className="flex space-x-2">
                                    <Button size="sm" onClick={handleAddCard} disabled={!newCardText.trim()}>
                                        Ajouter
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => {
                                        setIsAdding(false);
                                        setNewCardText("");
                                    }}>
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsAdding(true)}
                                className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-white/60"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter une carte
                            </Button>
                        )}
                    </div>
                )}

                {/* Message quand l'ajout de cartes est désactivé */}
                {addingDisabled && (
                    <div className="mt-4 p-3 text-center text-sm text-gray-500 bg-white/40 rounded-lg border border-gray-300">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                            <Lock className="w-4 h-4" />
                            <span className="font-medium">Ajout de cartes désactivé</span>
                        </div>
                        <p className="text-xs text-gray-400">
                            L'administrateur a désactivé l'ajout de nouvelles cartes
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RetroColumn;