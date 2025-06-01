
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Eye, Users, Plus, Vote, Crown, Settings as SettingsIcon } from "lucide-react";

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
  onCloseRetro
}: RetroSidebarProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-white/95 backdrop-blur-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>Paramètres de la Rétrospective</span>
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Master Control */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Contrôle Master</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="master-mode" className="text-sm font-medium">
                  Mode Master activé
                </Label>
                <p className="text-xs text-gray-500">
                  Vous permet de contrôler tous les paramètres de la rétrospective
                </p>
              </div>
              <Switch
                id="master-mode"
                checked={isMaster}
                onCheckedChange={onToggleMaster}
              />
            </div>
          </div>

          <Separator />

          {/* Voting Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Vote className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Système de Vote</h3>
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
                disabled={!isMaster}
              />
            </div>

            {votingEnabled && (
              <div className="space-y-2">
                <Label htmlFor="max-votes" className="text-sm font-medium">
                  Nombre maximum de votes par personne
                </Label>
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
                <p className="text-xs text-gray-500">
                  Chaque participant peut donner au maximum {maxVotesPerPerson} vote(s)
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Visibility Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Visibilité des Cartes</h3>
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
                disabled={!isMaster}
              />
            </div>
          </div>

          <Separator />

          {/* Card Management */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Gestion des Cartes</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="disable-adding-cards" className="text-sm font-medium">
                  Désactiver l'ajout de cartes
                </Label>
                <p className="text-xs text-gray-500">
                  Empêche l'ajout de nouvelles cartes par les participants
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
                <p className="text-sm text-gray-900 mt-1">4 participants actifs</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Statut</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">Session active</span>
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
                    Cette action fermera la session pour tous les participants et supprimera toutes les données.
                    Cette action est irréversible.
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
                        Cette action fermera définitivement la rétrospective et supprimera toutes les cartes,
                        votes et données associées. Tous les participants perdront l'accès à la session.
                        Cette action ne peut pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onCloseRetro}
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
