import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Eye, Users, Plus, Vote, Crown, Settings as SettingsIcon } from "lucide-react";
import { closeBoardPermanently } from "@/services/boardService";
import { toast } from "@/hooks/use-toast";

interface RetroSidebarProps {
  open: boolean;
  onClose: () => void;
  votingEnabled: boolean;
  onToggleVoting: (enabled: boolean) => void;
  showOthersCards: boolean;
  onToggleShowOthersCards: (show: boolean) => void;
  addingCardsDisabled: boolean;
  onToggleAddingCards: (disabled: boolean) => void;
  maxVotesPerPerson: number;
  onMaxVotesChange: (max: number) => void;
  isMaster: boolean;
  onToggleMaster: (master: boolean) => void;
  retroId: string;
  onCloseRetro: () => void;
  participantCount?: number;
  createdBy?: string;
  isOnlineMode?: boolean; // Indique si on est en mode connecté Firebase
}

const RetroSidebar = ({
                        open,
                        onClose,
                        votingEnabled,
                        onToggleVoting,
                        showOthersCards,
                        onToggleShowOthersCards,
                        addingCardsDisabled,
                        onToggleAddingCards,
                        maxVotesPerPerson,
                        onMaxVotesChange,
                        isMaster,
                        onToggleMaster,
                        retroId,
                        onCloseRetro,
                        participantCount = 1,
                        createdBy = "Inconnu",
                        isOnlineMode = false
                      }: RetroSidebarProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCloseRetro = async () => {
    if (isOnlineMode && retroId !== "local") {
      try {
        await closeBoardPermanently(retroId);
        toast({
          title: "Board fermé",
          description: "Le board a été fermé définitivement pour tous les participants.",
          variant: "destructive"
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de fermer le board dans Firebase.",
          variant: "destructive"
        });
        return;
      }
    }

    onCloseRetro();
    setShowDeleteDialog(false);
  };

  return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-white/95 backdrop-blur-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>Paramètres de la Rétrospective</span>
              {!isOnlineMode && (
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Hors ligne
              </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Master Control - Visible pour tous mais non modifiable en mode online */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Statut Administrateur</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="master-mode" className="text-sm font-medium">
                    {isMaster ? "Vous êtes administrateur" : "Mode lecture seule"}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {isOnlineMode
                        ? isMaster
                            ? "Vous pouvez modifier tous les paramètres du board"
                            : "Seul le créateur peut modifier les paramètres"
                        : "Vous pouvez contrôler tous les paramètres en mode hors ligne"
                    }
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isMaster
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                }`}>
                  {isMaster ? 'Admin' : 'Participant'}
                </div>
              </div>
            </div>

            <Separator />

            {/* Message pour les non-administrateurs */}
            {!isMaster && (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-medium text-blue-800">Mode participant</h4>
                    </div>
                    <p className="text-xs text-blue-700">
                      Vous consultez les paramètres en lecture seule. Seul l'administrateur ({createdBy}) peut les modifier.
                    </p>
                  </div>
                  <Separator />
                </>
            )}

            {/* Voting Settings - Affiché pour tous, modifiable seulement par l'admin */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Vote className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Système de Vote
                  {!isMaster && <span className="text-xs text-gray-500 ml-2">(lecture seule)</span>}
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="voting-enabled" className="text-sm font-medium">
                    Votes {votingEnabled ? 'activés' : 'désactivés'}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {votingEnabled
                        ? "Les participants peuvent voter sur les cartes"
                        : "Le système de vote est désactivé"
                    }
                  </p>
                </div>
                <Switch
                    id="voting-enabled"
                    checked={votingEnabled}
                    onCheckedChange={onToggleVoting}
                    disabled={!isMaster}
                />
              </div>

              {votingEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="max-votes" className="text-sm font-medium">
                      Nombre maximum de votes par personne
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                          id="max-votes"
                          type="number"
                          min="1"
                          max="20"
                          value={maxVotesPerPerson}
                          onChange={(e) => onMaxVotesChange(parseInt(e.target.value) || 1)}
                          disabled={!isMaster}
                          className="w-20"
                      />
                      {!isMaster && (
                          <span className="text-xs text-gray-500">(non modifiable)</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Chaque participant peut donner au maximum {maxVotesPerPerson} vote(s)
                    </p>
                  </div>
              )}
            </div>

            <Separator />

            {/* Visibility Settings - Affiché pour tous, modifiable seulement par l'admin */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Visibilité des Cartes
                  {!isMaster && <span className="text-xs text-gray-500 ml-2">(lecture seule)</span>}
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-others-cards" className="text-sm font-medium">
                    {showOthersCards ? "Toutes les cartes visibles" : "Cartes des autres masquées"}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {showOthersCards
                        ? "Tous les participants voient toutes les cartes"
                        : "Les participants ne voient que leurs propres cartes"
                    }
                  </p>
                </div>
                <Switch
                    id="show-others-cards"
                    checked={!showOthersCards}
                    onCheckedChange={(checked) => onToggleShowOthersCards(!checked)}
                    disabled={!isMaster}
                />
              </div>
            </div>

            <Separator />

            {/* Card Management - Affiché pour tous, modifiable seulement par l'admin */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestion des Cartes
                  {!isMaster && <span className="text-xs text-gray-500 ml-2">(lecture seule)</span>}
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="disable-adding-cards" className="text-sm font-medium">
                    {addingCardsDisabled ? "Ajout de cartes désactivé" : "Ajout de cartes autorisé"}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {addingCardsDisabled
                        ? "Les participants ne peuvent plus ajouter de cartes"
                        : "Les participants peuvent ajouter de nouvelles cartes"
                    }
                  </p>
                </div>
                <Switch
                    id="disable-adding-cards"
                    checked={addingCardsDisabled}
                    onCheckedChange={onToggleAddingCards}
                    disabled={!isMaster}
                />
              </div>
            </div>

            <Separator />

            {/* Session Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informations de Session</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">ID de la Rétrospective</Label>
                  <p className="text-xs text-gray-500 break-all mt-1 p-2 bg-gray-50 rounded">
                    {retroId}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Participants connectés</Label>
                  <p className="text-sm text-gray-900 mt-1">{participantCount} participant(s) actif(s)</p>
                </div>
                {isOnlineMode && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Créé par</Label>
                      <p className="text-sm text-gray-900 mt-1">{createdBy}</p>
                    </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Statut</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isOnlineMode ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className={`text-sm ${isOnlineMode ? 'text-green-700' : 'text-yellow-700'}`}>
                    {isOnlineMode ? 'Session en ligne' : 'Mode hors ligne'}
                  </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Danger Zone */}
            {isMaster && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-600">Zone de Danger</h3>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-red-800">
                        Fermer définitivement la rétrospective
                      </h4>
                      <p className="text-xs text-red-600 mt-1">
                        {isOnlineMode
                            ? "Cette action fermera la session pour tous les participants et rendra le board inaccessible. Cette action est irréversible."
                            : "Cette action fermera la session locale. Cette action est irréversible."
                        }
                      </p>
                    </div>

                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Fermer la rétrospective
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {isOnlineMode
                                ? "Cette action fermera définitivement la rétrospective et supprimera l'accès pour tous les participants. Toutes les cartes et votes resteront sauvegardés mais le board ne sera plus accessible. Cette action ne peut pas être annulée."
                                : "Cette action fermera la session locale. Toutes les données seront perdues. Cette action ne peut pas être annulée."
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                              onClick={handleCloseRetro}
                              className="bg-red-600 hover:bg-red-700"
                          >
                            Fermer définitivement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
  );
};

export default RetroSidebar;