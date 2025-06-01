
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import RetroCard from "./RetroCard";

interface Card {
  id: string;
  text: string;
  author: string;
  votes: number;
  hasVoted: boolean;
}

interface Column {
  id: string;
  title: string;
  color: string;
  cards: Card[];
}

interface RetroColumnProps {
  column: Column;
  cards: Card[];
  onAddCard: (columnId: string, text: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onVoteCard: (columnId: string, cardId: string) => void;
  cardsVisible: boolean;
  votingEnabled: boolean;
  addingDisabled: boolean;
}

const RetroColumn = ({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onVoteCard,
  cardsVisible,
  votingEnabled,
  addingDisabled
}: RetroColumnProps) => {
  const [newCardText, setNewCardText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCard = () => {
    if (newCardText.trim()) {
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

  // Sort cards by votes (highest first)
  const sortedCards = [...cards].sort((a, b) => b.votes - a.votes);

  return (
    <Card className={`${column.color} border-2 h-fit min-h-[400px]`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          {column.title}
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
            votingEnabled={votingEnabled}
          />
        ))}

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

        {addingDisabled && (
          <div className="mt-4 p-3 text-center text-sm text-gray-500 bg-white/30 rounded-lg">
            L'ajout de cartes a été désactivé
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RetroColumn;
