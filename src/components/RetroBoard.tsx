import RetroColumn from "./RetroColumn";

interface RetroCardData {
    id: string;
    text: string;
    author: string;
    votes: number;
    hasVoted: boolean;
    highlighted?: boolean;
}

interface Column {
    id: string;
    title: string;
    color: string;
    cards: RetroCardData[];
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
    showOnlyHighlighted?: boolean;
    actionCreationEnabled?: boolean;
}

interface RetroBoardProps {
    columns: Column[];
    boardData: BoardData | null;
    currentUsername: string;
    cardsVisible: boolean;
    isVotingEnabled: boolean;
    userVotesRemaining: number;
    onAddCard: (columnId: string, text: string) => void;
    onDeleteCard: (columnId: string, cardId: string) => void;
    onVoteCard: (columnId: string, cardId: string) => void;
    onHighlightCard?: (columnId: string, cardId: string) => void;
    onCreateAction?: (actionTitle: string, actionDescription: string, sourceCardId: string, sourceCardText: string) => void;
    getFilteredCards: (cards: RetroCardData[]) => RetroCardData[];
    isMaster?: boolean;
    showHighlightButtons?: boolean;
    showActionButtons?: boolean;
}

const RetroBoard = ({
                        columns,
                        boardData,
                        currentUsername,
                        cardsVisible,
                        isVotingEnabled,
                        userVotesRemaining,
                        onAddCard,
                        onDeleteCard,
                        onVoteCard,
                        onHighlightCard,
                        onCreateAction,
                        getFilteredCards,
                        isMaster = false,
                        showHighlightButtons = false,
                        showActionButtons = false
                    }: RetroBoardProps) => {
    if (columns.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-gray-400">📋</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Aucune colonne configurée
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Il semble qu'il n'y ait pas de colonnes définies pour cette rétrospective.
                    </p>
                </div>
            </div>
        );
    }

    // Calculer les statistiques globales
    const totalCards = columns.reduce((total, col) => total + getFilteredCards(col.cards).length, 0);
    const myCards = columns.reduce((total, col) =>
        total + getFilteredCards(col.cards).filter(card => card.author === currentUsername).length, 0
    );
    const totalVotes = columns.reduce((total, col) =>
        total + getFilteredCards(col.cards).reduce((sum, card) => sum + card.votes, 0), 0
    );
    const myVotes = columns.reduce((total, col) =>
        total + getFilteredCards(col.cards).filter(card => card.hasVoted).length, 0
    );

    // Calculer les statistiques de mise en évidence
    const highlightedCards = columns.reduce((total, col) =>
        total + getFilteredCards(col.cards).filter(card => card.highlighted).length, 0
    );

    return (
        <div className="space-y-6">
            {/* Statistiques rapides */}
            {isMaster && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total des cartes</p>
                                <p className="text-2xl font-bold text-blue-600">{totalCards}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-sm">📝</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total votes</p>
                                <p className="text-2xl font-bold text-purple-600">{totalVotes}</p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600 text-sm">❤️</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">En évidence</p>
                                <p className="text-2xl font-bold text-yellow-600">{highlightedCards}</p>
                            </div>
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <span className="text-yellow-600 text-sm">⭐</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages d'information */}
            {!cardsVisible && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-yellow-600">👁️</span>
                        <div>
                            <h4 className="text-sm font-medium text-yellow-800">Cartes masquées</h4>
                            <p className="text-sm text-yellow-700">
                                Les cartes sont actuellement masquées. Utilisez le bouton "Afficher" dans l'en-tête pour les voir.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isVotingEnabled && userVotesRemaining === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-red-600">⚠️</span>
                        <div>
                            <h4 className="text-sm font-medium text-red-800">Limite de votes atteinte</h4>
                            <p className="text-sm text-red-700">
                                Vous avez utilisé tous vos votes disponibles. Vous pouvez retirer des votes existants pour en donner à d'autres cartes.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {boardData?.addingCardsDisabled && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-orange-600">🔒</span>
                        <div>
                            <h4 className="text-sm font-medium text-orange-800">Ajout de cartes désactivé</h4>
                            <p className="text-sm text-orange-700">
                                L'administrateur a désactivé l'ajout de nouvelles cartes pour cette session.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Message d'information pour l'admin sur les fonctionnalités de mise en évidence */}
            {isMaster && showHighlightButtons && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-yellow-600">⭐</span>
                        <div>
                            <h4 className="text-sm font-medium text-yellow-800">Fonctionnalités d'administrateur</h4>
                            <p className="text-sm text-yellow-700">
                                En tant qu'administrateur, vous pouvez cliquer sur l'icône étoile des cartes pour les mettre en évidence.
                                Utilisez les paramètres pour afficher uniquement les cartes en évidence à tous les participants.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Message d'information sur la création d'actions */}
            {boardData?.actionCreationEnabled && isMaster && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-green-600">🎯</span>
                        <div>
                            <h4 className="text-sm font-medium text-green-800">Création d'actions activée</h4>
                            <p className="text-sm text-green-700">
                                Les participants peuvent maintenant créer des actions à partir des cartes en évidence.
                                Un bouton 🎯 apparaît sur toutes les cartes mises en évidence.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Message si aucune carte n'est visible en mode mise en évidence */}
            {boardData?.showOnlyHighlighted && totalCards === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-yellow-600">⭐</span>
                        <div>
                            <h4 className="text-sm font-medium text-yellow-800">Aucune carte en évidence</h4>
                            <p className="text-sm text-yellow-700">
                                Le mode "cartes en évidence uniquement" est activé, mais aucune carte n'a été mise en évidence.
                                {isMaster && " Mettez des cartes en évidence ou désactivez ce mode dans les paramètres."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Colonnes de la rétrospective */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((column) => (
                    <RetroColumn
                        key={column.id}
                        column={column}
                        cards={getFilteredCards(column.cards)}
                        onAddCard={onAddCard}
                        onDeleteCard={onDeleteCard}
                        onVoteCard={onVoteCard}
                        onHighlightCard={onHighlightCard}
                        onCreateAction={onCreateAction}
                        cardsVisible={cardsVisible}
                        votingEnabled={isVotingEnabled}
                        addingDisabled={boardData ? boardData.addingCardsDisabled : false}
                        currentUsername={currentUsername}
                        userCanVote={userVotesRemaining > 0}
                        isMaster={isMaster}
                        showHighlightButtons={showHighlightButtons}
                        showActionButtons={showActionButtons}
                    />
                ))}
            </div>

            {/* Légende des colonnes */}
            <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">💡 Guide des colonnes</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {columns.map((column, index) => {
                        const descriptions = [
                            "Partagez ce qui s'est bien passé, les réussites et les points positifs de cette période.",
                            "Identifiez les aspects à améliorer, les problèmes rencontrés et les points de friction.",
                            "Proposez des actions concrètes et des solutions pour la prochaine itération."
                        ];

                        return (
                            <div key={column.id} className="flex items-start space-x-2">
                                <div className={`w-3 h-3 rounded-full mt-1 ${column.color.split(' ')[0].replace('bg-', 'bg-').replace('-100', '-400')}`}></div>
                                <div>
                                    <p className="font-medium text-gray-700">{column.title}</p>
                                    <p className="text-gray-600 mt-1">{descriptions[index] || "Ajoutez vos idées et commentaires."}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Information sur la mise en évidence et les actions pour les admins */}
                {isMaster && (showHighlightButtons || showActionButtons) && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        {showHighlightButtons && (
                            <div className="mb-3">
                                <h5 className="text-sm font-semibold text-gray-800 mb-2">⭐ Mise en évidence des cartes</h5>
                                <p className="text-xs text-gray-600">
                                    En tant qu'administrateur, vous pouvez mettre en évidence les cartes importantes en cliquant sur l'icône étoile ⭐.
                                    Les cartes mises en évidence apparaissent avec un contour doré et sont triées en premier.
                                </p>
                            </div>
                        )}
                        {showActionButtons && (
                            <div>
                                <h5 className="text-sm font-semibold text-gray-800 mb-2">🎯 Création d'actions</h5>
                                <p className="text-xs text-gray-600">
                                    Cliquez sur l'icône cible 🎯 des cartes en évidence pour créer des actions concrètes.
                                    Ces actions seront visibles dans l'onglet "Actions" avec une référence à la carte d'origine.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RetroBoard;