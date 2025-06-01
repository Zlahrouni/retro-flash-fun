import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Card {
  id: string;
  text: string;
  author: string;
  votes: number;
  hasVoted: boolean;
}

interface RetroCardProps {
  card: Card;
  onDelete: () => void;
  onVote: () => void;
  votingEnabled: boolean;
  currentUsername: string;
  canVote?: boolean; // Indique si l'utilisateur peut encore voter (limite non atteinte)
}

const RetroCard = ({
                     card,
                     onDelete,
                     onVote,
                     votingEnabled,
                     currentUsername,
                     canVote = true
                   }: RetroCardProps) => {
  // Détermine si l'utilisateur peut supprimer cette carte
  const canDelete = card.author === currentUsername;

  // Détermine si l'utilisateur peut voter sur cette carte
  const canVoteOnCard = votingEnabled && (card.hasVoted || canVote);

  return (
      <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 group">
        <CardContent className="p-3">
          <div className="space-y-2">
            <p className="text-sm text-gray-800 leading-relaxed">{card.text}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-medium">{card.author}</span>

                {/* Affichage des votes */}
                {votingEnabled ? (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onVote}
                        disabled={!canVoteOnCard}
                        className={cn(
                            "flex items-center space-x-1 h-6 px-2 rounded-full transition-all",
                            card.hasVoted
                                ? "text-red-600 bg-red-50 hover:bg-red-100"
                                : canVoteOnCard
                                    ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
                                    : "text-gray-300 cursor-not-allowed",
                            !canVoteOnCard && !card.hasVoted && "opacity-50"
                        )}
                        title={
                          !canVoteOnCard && !card.hasVoted
                              ? "Limite de votes atteinte"
                              : card.hasVoted
                                  ? "Retirer votre vote"
                                  : "Voter pour cette carte"
                        }
                    >
                      <Heart
                          className={cn(
                              "w-3 h-3",
                              card.hasVoted && "fill-current"
                          )}
                      />
                      <span className="text-xs font-medium">{card.votes}</span>
                    </Button>
                ) : (
                    // Affichage des votes en lecture seule quand le vote est désactivé
                    card.votes > 0 && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Heart className="w-3 h-3" />
                          <span className="text-xs">{card.votes}</span>
                        </div>
                    )
                )}
              </div>

              {/* Bouton de suppression - visible seulement pour l'auteur */}
              {canDelete && (
                  <Button
                      size="sm"
                      variant="ghost"
                      onClick={onDelete}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      title="Supprimer cette carte"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default RetroCard;