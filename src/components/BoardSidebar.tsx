
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Eye, Users, Plus, Vote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface BoardSidebarProps {
  open: boolean;
  onClose: () => void;
  votingEnabled: boolean;
  onToggleVoting: (enabled: boolean) => void;
  showOthersCards: boolean;
  onToggleShowOthersCards: (show: boolean) => void;
  addingCardsDisabled: boolean;
  onToggleAddingCards: (disabled: boolean) => void;
  boardId: string;
}

const BoardSidebar = ({
  open,
  onClose,
  votingEnabled,
  onToggleVoting,
  showOthersCards,
  onToggleShowOthersCards,
  addingCardsDisabled,
  onToggleAddingCards,
  boardId
}: BoardSidebarProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteBoard = () => {
    toast({
      title: "Board supprimé",
      description: "Le board a été définitivement supprimé pour tous les participants.",
      variant: "destructive"
    });
    navigate("/");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-white/95 backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-900">
            Paramètres du Board
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Voting Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Vote className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Votes</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="voting-enabled" className="text-sm font-medium">
                  Activer les votes
                </Label>
                <p className="text-xs text-gray-500">
                  Permet aux participants de voter sur les cartes
                </p>
              </div>
              <Switch
                id="voting-enabled"
                checked={votingEnabled}
                onCheckedChange={onToggleVoting}
              />
            </div>
          </div>

          <Separator />

          {/* Visibility Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Visibilité</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="show-others-cards" className="text-sm font-medium">
                  Masquer les cartes des autres
                </Label>
                <p className="text-xs text-gray-500">
                  Les participants ne voient que leurs propres cartes
                </p>
              </div>
              <Switch
                id="show-others-cards"
                checked={!showOthersCards}
                onCheckedChange={(checked) => onToggleShowOthersCards(!checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Card Management */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Gestion des cartes</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="disable-adding-cards" className="text-sm font-medium">
                  Désactiver l'ajout de cartes
                </Label>
                <p className="text-xs text-gray-500">
                  Empêche l'ajout de nouvelles cartes
                </p>
              </div>
              <Switch
                id="disable-adding-cards"
                checked={addingCardsDisabled}
                onCheckedChange={onToggleAddingCards}
              />
            </div>
          </div>

          <Separator />

          {/* Board Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Informations</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">ID du Board</Label>
                <p className="text-xs text-gray-500 break-all mt-1 p-2 bg-gray-50 rounded">
                  {boardId}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Participants connectés</Label>
                <p className="text-sm text-gray-900 mt-1">3 participants actifs</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-600">Zone de danger</h3>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Supprimer définitivement le board
                </h4>
                <p className="text-xs text-red-600 mt-1">
                  Cette action est irréversible. Le board sera supprimé pour tous les participants.
                </p>
              </div>
              
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer le board
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera définitivement le board et toutes ses données.
                      Tous les participants perdront l'accès au board. Cette action ne peut pas être annulée.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteBoard}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BoardSidebar;
