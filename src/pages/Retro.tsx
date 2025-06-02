import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Share2, Target, Users, AlertCircle, Crown, User } from "lucide-react";
import RetroSidebar from "@/components/RetroSidebar";
import RetroColumn from "@/components/RetroColumn";
import { toast } from "@/hooks/use-toast";
import { getBoard, BoardData, subscribeToBoardUpdates } from "@/services/boardService";
import {
  createNote,
  deleteNote,
  toggleVote,
  subscribeToNotes,
  canUserVote,
  filterNotesByVisibility,
  NoteData
} from "@/services/notesService";

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

const Retro = () => {
  const { retroId } = useParams<{ retroId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // États pour les données Firebase
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState("");

  // États pour l'interface
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(true);
  const [isMaster, setIsMaster] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);

  // Fonction pour créer les colonnes par défaut à partir des données du board
  const createColumnsFromBoardData = (boardData: BoardData): Column[] => {
    const colors = [
      "bg-green-100 border-green-200",
      "bg-yellow-100 border-yellow-200",
      "bg-blue-100 border-blue-200"
    ];
    return boardData.columns.map((title, index) => ({
      id: (index + 1).toString(),
      title,
      color: colors[index] || "bg-gray-100 border-gray-200",
      cards: []
    }));
  };

  // Fonction pour créer les colonnes par défaut (fallback pour mode hors ligne)
  const getDefaultColumns = () => {
    const retroType = location.state?.retroType || {
      title: "What went well, To improve, Action items",
      columns: ["What went well?", "What could be improved?", "Action items"]
    };

    const colors = [
      "bg-green-100 border-green-200",
      "bg-yellow-100 border-yellow-200",
      "bg-blue-100 border-blue-200"
    ];
    return retroType.columns.map((title: string, index: number) => ({
      id: (index + 1).toString(),
      title,
      color: colors[index] || "bg-gray-100 border-gray-200",
      cards: []
    }));
  };

  // Fonction pour convertir les notes Firebase en cartes pour l'interface
  const convertNotesToCards = (notes: NoteData[], columnTitle: string, currentUserId: string): Card[] => {
    return notes
        .filter(note => note.column === columnTitle)
        .map(note => ({
          id: note.id!,
          text: note.content,
          author: note.createdBy,
          votes: note.voteCount,
          hasVoted: note.voters.includes(currentUserId)
        }))
        .sort((a, b) => b.votes - a.votes); // Trier par votes décroissants
  };

  // Charger les données du board et s'abonner aux notes
  useEffect(() => {
    const loadBoard = async () => {
      if (!retroId) {
        // Mode hors ligne : utiliser les données par défaut
        setColumns(getDefaultColumns());
        setCurrentUsername("Vous");
        setIsMaster(true);
        setLoading(false);
        return;
      }

      try {
        // Charger les données du board depuis Firebase
        const data = await getBoard(retroId);
        if (!data) {
          setError("Board non trouvé");
          setLoading(false);
          return;
        }

        if (!data.isActive) {
          setError("Ce board n'est plus actif");
          setLoading(false);
          return;
        }

        setBoardData(data);

        // Gestion des utilisateurs et redirection
        const savedUsername = localStorage.getItem(`username_${retroId}`);
        const isCreator = location.state?.isCreator === true;

        if (!savedUsername) {
          if (isCreator) {
            // Si c'est le créateur, sauvegarder son nom automatiquement
            localStorage.setItem(`username_${retroId}`, data.createdBy);
            setCurrentUsername(data.createdBy);
          } else {
            // Rediriger les autres utilisateurs vers la page de saisie du nom
            navigate(`/join/${retroId}`);
            return;
          }
        } else {
          setCurrentUsername(savedUsername);
        }

        // Déterminer si l'utilisateur est le master (créateur)
        const username = savedUsername || data.createdBy;
        setIsMaster(username === data.createdBy);

        // Créer les colonnes depuis les données du board
        setColumns(createColumnsFromBoardData(data));

        // S'abonner aux mises à jour du board en temps réel
        const unsubscribeBoard = subscribeToBoardUpdates(retroId, (updatedBoardData) => {
          if (updatedBoardData) {
            setBoardData(updatedBoardData);

            // Si le board devient inactif, rediriger
            if (!updatedBoardData.isActive) {
              setError("Cette rétrospective a été fermée par l'administrateur");
              toast({
                title: "Rétrospective fermée",
                description: "Cette rétrospective a été fermée par l'administrateur.",
                variant: "destructive"
              });
              // Rediriger après 3 secondes
              setTimeout(() => {
                navigate("/");
              }, 3000);
            }
          } else {
            setError("Board supprimé ou inaccessible");
          }
        });

        // S'abonner aux notes en temps réel
        const unsubscribeNotes = subscribeToNotes(retroId, (notesData) => {
          setNotes(notesData);
        });

        // Nettoyer les abonnements au démontage du composant
        return () => {
          unsubscribeBoard();
          unsubscribeNotes();
        };

      } catch (err) {
        console.error("Erreur lors du chargement du board:", err);
        // En cas d'erreur Firebase, utiliser les données par défaut
        setColumns(getDefaultColumns());
        setCurrentUsername("Vous");
        setIsMaster(true);
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [retroId, location.state, navigate]);

  // Mettre à jour les colonnes quand les notes changent
  useEffect(() => {
    if (columns.length > 0 && notes.length >= 0) {
      // Utiliser les paramètres Firebase pour le filtrage
      const hideFromOthers = boardData ? boardData.hideCardsFromOthers : false;
      const filteredNotes = filterNotesByVisibility(notes, currentUsername, hideFromOthers);

      setColumns(prev => prev.map(column => ({
        ...column,
        cards: convertNotesToCards(filteredNotes, column.title, currentUsername)
      })));
    }
  }, [notes, currentUsername, boardData]);

  // Fonctions de gestion des cartes
  const addCard = async (columnId: string, text: string) => {
    // Vérifier si l'ajout de cartes est désactivé
    const addingDisabled = boardData ? boardData.addingCardsDisabled : false;

    if (addingDisabled) {
      toast({
        title: "Action non autorisée",
        description: "L'ajout de cartes a été désactivé par l'administrateur.",
        variant: "destructive"
      });
      return;
    }

    if (!retroId || !boardData) {
      // Mode hors ligne - garder l'ancienne logique
      const newCard: Card = {
        id: Date.now().toString(),
        text,
        author: currentUsername,
        votes: 0,
        hasVoted: false
      };

      setColumns(prev =>
          prev.map(col =>
              col.id === columnId
                  ? { ...col, cards: [...col.cards, newCard] }
                  : col
          )
      );

      toast({
        title: "Carte ajoutée",
        description: "Votre carte a été ajoutée avec succès.",
      });
      return;
    }

    try {
      const column = columns.find(col => col.id === columnId);
      if (!column) return;

      await createNote({
        boardId: retroId,
        content: text,
        column: column.title,
        createdBy: currentUsername
      });

      toast({
        title: "Carte ajoutée",
        description: "Votre carte a été ajoutée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la carte:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la carte. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const deleteCard = async (columnId: string, cardId: string) => {
    if (!retroId || !boardData) {
      // Mode hors ligne - garder l'ancienne logique
      setColumns(prev =>
          prev.map(col =>
              col.id === columnId
                  ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
                  : col
          )
      );

      toast({
        title: "Carte supprimée",
        description: "La carte a été supprimée avec succès.",
      });
      return;
    }

    try {
      await deleteNote(retroId, cardId);

      toast({
        title: "Carte supprimée",
        description: "La carte a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la carte:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la carte. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const voteCard = async (columnId: string, cardId: string) => {
    // Vérifier si le système de vote est activé
    const votingEnabled = boardData ? boardData.votingEnabled : true;

    if (!votingEnabled) {
      toast({
        title: "Votes désactivés",
        description: "Le système de vote a été désactivé par l'administrateur.",
        variant: "destructive"
      });
      return;
    }

    if (!retroId || !boardData) {
      // Mode hors ligne - garder l'ancienne logique
      setColumns(prev =>
          prev.map(col =>
              col.id === columnId
                  ? {
                    ...col,
                    cards: col.cards.map(card =>
                        card.id === cardId
                            ? {
                              ...card,
                              votes: card.hasVoted ? card.votes - 1 : card.votes + 1,
                              hasVoted: !card.hasVoted
                            }
                            : card
                    )
                  }
                  : col
          )
      );
      return;
    }

    try {
      // Vérifier si l'utilisateur a encore des votes disponibles
      const currentNote = notes.find(note => note.id === cardId);
      if (!currentNote) return;

      const hasVotedForThisCard = currentNote.voters.includes(currentUsername);
      const maxVotes = boardData.votesPerParticipant;

      if (!hasVotedForThisCard && !canUserVote(notes, currentUsername, maxVotes)) {
        toast({
          title: "Limite de votes atteinte",
          description: `Vous ne pouvez voter que ${maxVotes} fois maximum.`,
          variant: "destructive"
        });
        return;
      }

      await toggleVote({
        boardId: retroId,
        noteId: cardId,
        userId: currentUsername
      });

    } catch (error) {
      console.error("Erreur lors du vote:", error);
      toast({
        title: "Erreur",
        description: "Impossible de voter sur cette carte. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const getFilteredCards = (cards: Card[]) => {
    // En mode Firebase, utiliser boardData.hideCardsFromOthers
    // En mode local, afficher toutes les cartes
    const shouldHide = boardData ? boardData.hideCardsFromOthers : false;

    if (shouldHide) {
      return cards.filter(card => card.author === currentUsername);
    }
    return cards;
  };

  // Fonctions utilitaires
  const shareRetro = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Lien copié",
        description: "Le lien de la rétrospective a été copié dans le presse-papiers.",
      });
    });
  };

  const closeRetro = () => {
    toast({
      title: "Rétrospective fermée",
      description: "La rétrospective a été fermée pour tous les participants.",
      variant: "destructive"
    });
    navigate("/");
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <Card className="w-96 text-center">
            <CardContent className="p-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de la rétrospective...</p>
            </CardContent>
          </Card>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <Card className="w-96 text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>Erreur</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={() => navigate("/")} variant="outline">
                  Retour à l'accueil
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Déterminer le titre et les informations à afficher
  const displayTitle = boardData ? boardData.name : (location.state?.retroType?.title || "Rétrospective");
  const displayId = retroId || "local";

  // Calculer les votes restants pour l'utilisateur
  const userVotesUsed = retroId && boardData ?
      notes.reduce((count, note) => count + (note.voters.includes(currentUsername) ? 1 : 0), 0) : 0;
  const maxVotesPerPerson = boardData ? boardData.votesPerParticipant : 3;
  const userVotesRemaining = maxVotesPerPerson - userVotesUsed;

  // Vérifier si le système de vote est activé
  const isVotingEnabled = boardData ? boardData.votingEnabled : true;

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{displayTitle}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>ID: {displayId}</span>

                    {/* Informations du board */}
                    {boardData && (
                        <>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{boardData.participants.length} participant(s)</span>
                          </div>
                          <span>Créé par: {boardData.createdBy}</span>
                        </>
                    )}

                    {/* Informations de l'utilisateur */}
                    {currentUsername && (
                        <div className="flex items-center space-x-1">
                          {isMaster ? (
                              <Crown className="w-4 h-4 text-yellow-600" />
                          ) : (
                              <User className="w-4 h-4 text-blue-600" />
                          )}
                          <span className={`font-medium ${isMaster ? 'text-yellow-700' : 'text-blue-600'}`}>
                        {currentUsername} {isMaster && '(Admin)'}
                      </span>
                        </div>
                    )}

                    {/* Statut de connexion */}
                    {boardData && (
                        <span className="text-green-600 font-medium">⚡ En ligne</span>
                    )}
                    {!boardData && retroId && (
                        <span className="text-yellow-600 font-medium">🔄 Connexion...</span>
                    )}
                    {!retroId && (
                        <span className="text-orange-600 font-medium">📱 Mode local</span>
                    )}

                    {/* Informations de vote */}
                    {isVotingEnabled && (
                        <div className="flex items-center space-x-1">
                      <span className={`text-sm font-medium ${userVotesRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Votes: {userVotesRemaining}/{maxVotesPerPerson}
                      </span>
                        </div>
                    )}

                    {!isVotingEnabled && (
                        <span className="text-gray-500 font-medium">Votes désactivés</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={shareRetro}
                    className="flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>{isMaster ? 'Administration' : 'Informations'}</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {columns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune colonne configurée</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((column) => (
                    <RetroColumn
                        key={column.id}
                        column={column}
                        cards={getFilteredCards(column.cards)}
                        onAddCard={addCard}
                        onDeleteCard={deleteCard}
                        onVoteCard={voteCard}
                        cardsVisible={cardsVisible}
                        votingEnabled={isVotingEnabled}
                        addingDisabled={boardData ? boardData.addingCardsDisabled : false}
                        currentUsername={currentUsername}
                        userCanVote={userVotesRemaining > 0}
                    />
                ))}
              </div>
          )}
        </main>

        {/* Sidebar */}
        <RetroSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            boardData={boardData}
            isMaster={isMaster}
            retroId={displayId}
            onCloseRetro={closeRetro}
            participantCount={boardData ? boardData.participants.length : 1}
            currentUsername={currentUsername}
            isOnlineMode={!!boardData}
        />
      </div>
  );
};

export default Retro;