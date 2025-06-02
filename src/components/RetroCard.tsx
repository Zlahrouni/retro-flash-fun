import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, Star, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import ActionFromCard from "./ActionFromCard";

interface RetroCardData {
    id: string;
    text: string;
    author: string;
    votes: number;
    hasVoted: boolean;
    highlighted?: boolean;
}

interface RetroCardProps {
    card: RetroCardData;
    onDelete: () => void;
    onVote: () => void;
    onHighlight?: () => void;
    onCreateAction?: (actionTitle: string, actionDescription: string, sourceCardId: string, sourceCardText: string) => void;
    votingEnabled: boolean;
    currentUsername: string;
    canVote?: boolean;
    isMaster?: boolean;
    showHighlightButton?: boolean;
    showActionButton?: boolean; // NOUVEAU PROP
}

const RetroCard = ({
                       card,
                       onDelete,
                       onVote,
                       onHighlight,
                       onCreateAction,
                       votingEnabled,
                       currentUsername,
                       canVote = true,
                       isMaster = false,
                       showHighlightButton = false,
                       showActionButton = false
                   }: RetroCardProps) => {
    if (!card) {
        return null;
    }

    const canDelete = card.author === currentUsername;
    const canVoteOnCard = votingEnabled && (card.hasVoted || canVote);
    const canHighlight = isMaster && showHighlightButton && onHighlight;
    const canCreateAction = card.highlighted && showActionButton && onCreateAction; // SEULEMENT POUR LES CARTES EN ÉVIDENCE

    return (
        <Card className={cn(
            "bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 group",
            card.highlighted && "ring-2 ring-yellow-400 bg-yellow-50/90 border-yellow-300"
        )}>
            <CardContent className="p-3">
                <div className="space-y-2">
                    <div className="relative">
                        {card.highlighted && (
                            <div className="absolute -top-1 -right-1">
                                <div className="bg-yellow-400 rounded-full p-1">
                                    <Star className="w-3 h-3 text-yellow-800 fill-current" />
                                </div>
                            </div>
                        )}
                        <p className="text-sm text-gray-800 leading-relaxed">{card.text}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 font-medium">{card.author}</span>

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
                                card.votes > 0 && (
                                    <div className="flex items-center space-x-1 text-gray-500">
                                        <Heart className="w-3 h-3" />
                                        <span className="text-xs">{card.votes}</span>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="flex items-center space-x-1">
                            {/* NOUVEAU : Bouton de création d'action */}
                            {canCreateAction && (
                                <ActionFromCard
                                    card={card}
                                    onCreateAction={onCreateAction}
                                />
                            )}

                            {canHighlight && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onHighlight}
                                    className={cn(
                                        "h-6 w-6 p-0 transition-all",
                                        card.highlighted
                                            ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                                            : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50",
                                        "opacity-0 group-hover:opacity-100"
                                    )}
                                    title={card.highlighted ? "Retirer la mise en évidence" : "Mettre en évidence"}
                                >
                                    <Star
                                        className={cn(
                                            "w-3 h-3",
                                            card.highlighted && "fill-current"
                                        )}
                                    />
                                </Button>
                            )}

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

                    {card.highlighted && (
                        <div className="flex items-center justify-center mt-2">
                            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1 border border-yellow-300">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="font-medium">En évidence</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RetroCard;