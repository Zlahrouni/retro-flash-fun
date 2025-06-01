import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Share2, Target } from "lucide-react";
import RetroSidebar from "@/components/RetroSidebar";
import RetroColumn from "@/components/RetroColumn";
import { toast } from "@/hooks/use-toast";

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
  const { retroId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(true);
  const [cardsVisible, setCardsVisible] = useState(true);
  const [showOthersCards, setShowOthersCards] = useState(true);
  const [addingCardsDisabled, setAddingCardsDisabled] = useState(false);
  const [maxVotesPerPerson, setMaxVotesPerPerson] = useState(5);
  const [isMaster, setIsMaster] = useState(true);

  // Get retro type from navigation state or use default
  const retroType = location.state?.retroType || {
    id: "what-went-well",
    title: "What went well, To improve, Action items",
    columns: ["What went well?", "What could be improved?", "Action items"]
  };

  const getDefaultColumns = () => {
    const colors = ["bg-green-100 border-green-200", "bg-yellow-100 border-yellow-200", "bg-blue-100 border-blue-200"];
    return retroType.columns.map((title: string, index: number) => ({
      id: (index + 1).toString(),
      title,
      color: colors[index] || "bg-gray-100 border-gray-200",
      cards: []
    }));
  };

  const [columns, setColumns] = useState<Column[]>(getDefaultColumns);

  const addCard = (columnId: string, text: string) => {
    if (addingCardsDisabled) {
      toast({
        title: "Action non autorisée",
        description: "L'ajout de cartes a été désactivé par l'administrateur.",
        variant: "destructive"
      });
      return;
    }

    const newCard: Card = {
      id: Date.now().toString(),
      text,
      author: "Vous",
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
  };

  const deleteCard = (columnId: string, cardId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
          : col
      )
    );
  };

  const voteCard = (columnId: string, cardId: string) => {
    if (!votingEnabled) {
      toast({
        title: "Votes désactivés",
        description: "Le vote a été désactivé pour cette session.",
        variant: "destructive"
      });
      return;
    }

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
  };

  const getFilteredCards = (cards: Card[]) => {
    if (!showOthersCards) {
      return cards.filter(card => card.author === "Vous");
    }
    return cards;
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{retroType.title}</h1>
                <p className="text-sm text-gray-600">ID: {retroId}</p>
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
                <span>Paramètres</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
              votingEnabled={votingEnabled}
              addingDisabled={addingCardsDisabled}
            />
          ))}
        </div>
      </main>

      {/* Sidebar */}
      <RetroSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        votingEnabled={votingEnabled}
        onToggleVoting={setVotingEnabled}
        showOthersCards={showOthersCards}
        onToggleShowOthersCards={setShowOthersCards}
        addingCardsDisabled={addingCardsDisabled}
        onToggleAddingCards={setAddingCardsDisabled}
        maxVotesPerPerson={maxVotesPerPerson}
        onMaxVotesChange={setMaxVotesPerPerson}
        isMaster={isMaster}
        onToggleMaster={setIsMaster}
        retroId={retroId || ""}
        onCloseRetro={closeRetro}
      />
    </div>
  );
};

export default Retro;
