import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Eye, Users, Plus, Vote, Crown, Settings as SettingsIcon, Save, AlertTriangle, RotateCcw, Star, Sparkles } from "lucide-react";
import { closeBoardPermanently, updateBoardSettings, BoardData } from "@/services/boardService";
import { resetAllVotes, resetAllHighlights } from "@/services/notesService";
import { toast } from "@/hooks/use-toast";

interface RetroSidebarProps {
  open: boolean;
  onClose: () => void;
  boardData: BoardData | null;
  isMaster: boolean;
  retroId: string;
  onCloseRetro: () => void;
  participantCount?: number;
  currentUsername: string;
  isOnlineMode?: boolean;
}

const RetroSidebar = ({
                        open,
                        onClose,
                        boardData,
                        isMaster,
                        retroId,
                        onCloseRetro,
                        participantCount = 1,
                        currentUsername,
                        isOnlineMode = false
                      }: RetroSidebarProps) => {
  // États locaux pour les paramètres (modifiables avant sauvegarde)
  const [localVotingEnabled, setLocalVotingEnabled] = useState(false);
  const [localShowOthersCards, setLocalShowOthersCards] = useState(true);
  const [localAddingCardsDisabled, setLocalAddingCardsDisabled] = useState(false);
  const [localMaxVotesPerPerson, setLocalMaxVotesPerPerson] = useState(3);
  const [localShowOnlyHighlighted, setLocalShowOnlyHighlighted] = useState(false); // Nouveau paramètre

  // États pour les dialogues
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showResetVotesDialog, setShowResetVotesDialog] = useState(false);
  const [showResetHighlightsDialog, setShowResetHighlightsDialog] = useState(false); // Nouveau dialogue

  // État pour le suivi des modifications
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingVotes, setIsResettingVotes] = useState(false);
  const [isResettingHighlights, setIsResettingHighlights] = useState(false); // Nouvel état

  // Initialiser les valeurs locales quand boardData change
  useEffect(() => {
    if (boardData) {
      setLocalVotingEnabled(boardData.votingEnabled);
      setLocalShowOthersCards(!boardData.hideCardsFromOthers);
      setLocalAddingCardsDisabled(boardData.addingCardsDisabled);
      setLocalMaxVotesPerPerson(boardData.votesPerParticipant);
      setLocalShowOnlyHighlighted(boardData.showOnlyHighlighted || false); // Nouveau champ
      setHasUnsavedChanges(false);
    }
  }, [boardData]);

  // Fonction pour détecter les changements
  const checkForChanges = (
      votingEnabled: boolean,
      showOthersCards: boolean,
      addingCardsDisabled: boolean,
      maxVotes: number,
      showOnlyHighlighted: boolean // Nouveau paramètre
  ) => {
    if (!boardData) return false;

    return (
        votingEnabled !== boardData.votingEnabled ||
        showOthersCards !== !boardData.hideCardsFromOthers ||
        addingCardsDisabled !== boardData.addingCardsDisabled ||
        maxVotes !== boardData.votesPerParticipant ||
        showOnlyHighlighted !== (boardData.showOnlyHighlighted || false) // Nouveau check
    );
  };

  // Gestionnaires de changements avec détection
  const handleVotingChange = (enabled: boolean) => {
    setLocalVotingEnabled(enabled);
    setHasUnsavedChanges(checkForChanges(enabled, localShowOthersCards, localAddingCardsDisabled, localMaxVotesPerPerson, localShowOnlyHighlighted));
  };

  const handleVisibilityChange = (show: boolean) => {
    setLocalShowOthersCards(show);
    setHasUnsavedChanges(checkForChanges(localVotingEnabled, show, localAddingCardsDisabled, localMaxVotesPerPerson, localShowOnlyHighlighted));
  };

  const handleAddingCardsChange = (disabled: boolean) => {
    setLocalAddingCardsDisabled(disabled);
    setHasUnsavedChanges(checkForChanges(localVotingEnabled, localShowOthersCards, disabled, localMaxVotesPerPerson, localShowOnlyHighlighted));
  };

  const handleMaxVotesChange = (max: number) => {
    if (max < 1 || max > 20) return;
    setLocalMaxVotesPerPerson(max);
    setHasUnsavedChanges(checkForChanges(localVotingEnabled, localShowOthersCards, localAddingCardsDisabled, max, localShowOnlyHighlighted));
  };

  // Nouveau gestionnaire pour les cartes en évidence
  const handleShowOnlyHighlightedChange = (show: boolean) => {
    setLocalShowOnlyHighlighted(show);
    setHasUnsavedChanges(checkForChanges(localVotingEnabled, localShowOthersCards, localAddingCardsDisabled, localMaxVotesPerPerson, show));
  };

  // Fonction de sauvegarde
  const handleSaveSettings = async () => {
    if (!hasUnsavedChanges || !isMaster || !isOnlineMode || !retroId || retroId === "local") {
      return;
    }

    setIsSaving(true);

    try {
      await updateBoardSettings({
        boardId: retroId,
        votingEnabled: localVotingEnabled,
        hideCardsFromOthers: !localShowOthersCards,
        votesPerParticipant: localMaxVotesPerPerson,
        addingCardsDisabled: localAddingCardsDisabled,
        showOnlyHighlighted: localShowOnlyHighlighted // Nouveau paramètre
      });

      setHasUnsavedChanges(false);
      setShowSaveDialog(false);

      toast({
        title: "Paramètres sauvegardés",
        description: "Les nouveaux paramètres ont été appliqués pour tous les participants.",
      });

    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les paramètres. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction de réinitialisation
  const handleResetSettings = () => {
    if (boardData) {
      setLocalVotingEnabled(boardData.votingEnabled);
      setLocalShowOthersCards(!boardData.hideCardsFromOthers);
      setLocalAddingCardsDisabled(boardData.addingCardsDisabled);
      setLocalMaxVotesPerPerson(boardData.votesPerParticipant);
      setLocalShowOnlyHighlighted(boardData.showOnlyHighlighted || false);
      setHasUnsavedChanges(false);
    }
  };

  // Fonction de fermeture de la rétro
  const handleCloseRetro = async () => {
    if (isOnlineMode && retroId !== "local") {
      try {
        await closeBoardPermanently(retroId);
        toast({
          title: "Rétrospective fermée",
          description: "La rétrospective a été fermée définitivement pour tous les participants.",
          variant: "destructive"
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de fermer la rétrospective.",
          variant: "destructive"
        });
        return;
      }
    }

    onCloseRetro();
    setShowDeleteDialog(false);
  };

  // Fonction de réinitialisation des votes
  const handleResetVotes = async () => {
    if (!isOnlineMode || retroId === "local") {
      toast({
        title: "Action non disponible",
        description: "La réinitialisation des votes n'est disponible qu'en mode en ligne.",
        variant: "destructive"
      });
      return;
    }

    setIsResettingVotes(true);

    try {
      await resetAllVotes(retroId);

      toast({
        title: "Votes réinitialisés",
        description: "Tous les votes ont été supprimés pour toutes les cartes.",
      });

      setShowResetVotesDialog(false);

    } catch (error) {
      console.error("Erreur lors de la réinitialisation des votes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les votes. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsResettingVotes(false);
    }
  };

  // Nouvelle fonction de réinitialisation des mises en évidence
  const handleResetHighlights = async () => {
    if (!isOnlineMode || retroId === "local") {
      toast({
        title: "Action non disponible",
        description: "La réinitialisation des mises en évidence n'est disponible qu'en mode en ligne.",
        variant: "destructive"
      });
      return;
    }

    setIsResettingHighlights(true);

    try {
      await resetAllHighlights(retroId);

      toast({
        title: "Mises en évidence réinitialisées",
        description: "Toutes les mises en évidence ont été supprimées.",
      });

      setShowResetHighlightsDialog(false);

    } catch (error) {
      console.error("Erreur lors de la réinitialisation des mises en évidence:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les mises en évidence. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsResettingHighlights(false);
    }
  };

  // Si ce n'est pas l'admin et qu'on est en mode online, afficher une version simplifiée
  if (!isMaster && isOnlineMode) {
    return (
        <Sheet open={open} onOpenChange={onClose}>
          <SheetContent className="w-[400px] sm:w-[540px] bg-white/95 backdrop-blur-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5" />
                <span>Informations de la Rétrospective</span>
              </SheetTitle>
            </SheetHeader>

            <div className="py-6 space-y-6">
              {/* Message pour les participants */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-medium text-blue-800">Mode participant</h4>
                </div>
                <p className="text-xs text-blue-700">
                  Vous participez à cette rétrospective. Seul l'administrateur ({boardData?.createdBy}) peut modifier les paramètres.
                </p>
              </div>

              <Separator />

              {/* Informations en lecture seule */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Vote className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Paramètres actuels</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Système de vote</span>
                    <span className={`text-sm font-medium ${boardData?.votingEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {boardData?.votingEnabled ? 'Activé' : 'Désactivé'}
                  </span>
                  </div>

                  {boardData?.votingEnabled && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Votes maximum par personne</span>
                        <span className="text-sm font-medium text-blue-600">
                      {boardData?.votesPerParticipant}
                    </span>
                      </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Visibilité des cartes</span>
                    <span className={`text-sm font-medium ${boardData?.hideCardsFromOthers ? 'text-orange-600' : 'text-green-600'}`}>
                    {boardData?.hideCardsFromOthers ? 'Cartes personnelles uniquement' : 'Toutes les cartes visibles'}
                  </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ajout de cartes</span>
                    <span className={`text-sm font-medium ${boardData?.addingCardsDisabled ? 'text-red-600' : 'text-green-600'}`}>
                    {boardData?.addingCardsDisabled ? 'Désactivé' : 'Autorisé'}
                  </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mode d'affichage</span>
                    <span className={`text-sm font-medium ${boardData?.showOnlyHighlighted ? 'text-yellow-600' : 'text-green-600'}`}>
                    {boardData?.showOnlyHighlighted ? 'Cartes en évidence uniquement' : 'Toutes les cartes'}
                  </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informations de session */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Informations</h3>
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
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Créé par</Label>
                    <p className="text-sm text-gray-900 mt-1">{boardData?.createdBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Votre nom</Label>
                    <p className="text-sm text-blue-600 mt-1 font-medium">{currentUsername}</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
    );
  }

  // Interface complète pour les administrateurs
  return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-white/95 backdrop-blur-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span>Administration de la Rétrospective</span>
              {!isOnlineMode && (
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Hors ligne
              </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Alerte pour les modifications non sauvegardées */}
            {hasUnsavedChanges && isOnlineMode && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <h4 className="text-sm font-medium text-orange-800">Modifications non sauvegardées</h4>
                  </div>
                  <p className="text-xs text-orange-700 mb-3">
                    Vous avez des modifications en attente. N'oubliez pas de les sauvegarder.
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => setShowSaveDialog(true)} className="bg-orange-600 hover:bg-orange-700">
                      <Save className="w-3 h-3 mr-1" />
                      Sauvegarder
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleResetSettings}>
                      Annuler
                    </Button>
                  </div>
                </div>
            )}

            {/* Système de vote */}
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
                    checked={localVotingEnabled}
                    onCheckedChange={handleVotingChange}
                />
              </div>

              {localVotingEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="max-votes" className="text-sm font-medium">
                      Nombre maximum de votes par personne
                    </Label>
                    <Input
                        id="max-votes"
                        type="number"
                        min="1"
                        max="20"
                        value={localMaxVotesPerPerson}
                        onChange={(e) => handleMaxVotesChange(parseInt(e.target.value) || 1)}
                        className="w-20"
                    />
                    <p className="text-xs text-gray-500">
                      Chaque participant peut donner au maximum {localMaxVotesPerPerson} vote(s)
                    </p>

                    {/* Bouton de réinitialisation des votes */}
                    {isOnlineMode && (
                        <div className="pt-3 border-t border-gray-200">
                          <AlertDialog open={showResetVotesDialog} onOpenChange={setShowResetVotesDialog}>
                            <AlertDialogTrigger asChild>
                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                  disabled={isResettingVotes}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Réinitialiser tous les votes
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Réinitialiser tous les votes</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action supprimera tous les votes de toutes les cartes pour tous les participants.
                                  Les cartes resteront intactes, seuls les votes seront supprimés.
                                  Cette action ne peut pas être annulée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleResetVotes}
                                    disabled={isResettingVotes}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                  {isResettingVotes ? "Réinitialisation..." : "Confirmer la réinitialisation"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                    )}
                  </div>
              )}
            </div>

            <Separator />

            {/* Visibilité des cartes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Visibilité des Cartes</h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-others-cards" className="text-sm font-medium">
                    Masquer les cartes des autres participants
                  </Label>
                  <p className="text-xs text-gray-500">
                    Les participants ne voient que leurs propres cartes
                  </p>
                </div>
                <Switch
                    id="show-others-cards"
                    checked={!localShowOthersCards}
                    onCheckedChange={(checked) => handleVisibilityChange(!checked)}
                />
              </div>
            </div>

            <Separator />

            {/* Nouvelle section : Mise en évidence des cartes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Mise en Évidence</h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-only-highlighted" className="text-sm font-medium">
                    Afficher uniquement les cartes en évidence
                  </Label>
                  <p className="text-xs text-gray-500">
                    Masque toutes les cartes sauf celles mises en évidence
                  </p>
                </div>
                <Switch
                    id="show-only-highlighted"
                    checked={localShowOnlyHighlighted}
                    onCheckedChange={handleShowOnlyHighlightedChange}
                />
              </div>

              {/* Bouton de réinitialisation des mises en évidence */}
              {isOnlineMode && (
                  <div className="pt-3 border-t border-gray-200">
                    <AlertDialog open={showResetHighlightsDialog} onOpenChange={setShowResetHighlightsDialog}>
                      <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                            disabled={isResettingHighlights}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Réinitialiser toutes les mises en évidence
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Réinitialiser toutes les mises en évidence</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action supprimera toutes les mises en évidence de toutes les cartes.
                            Les cartes resteront intactes, seules les mises en évidence seront supprimées.
                            Cette action ne peut pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                              onClick={handleResetHighlights}
                              disabled={isResettingHighlights}
                              className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            {isResettingHighlights ? "Réinitialisation..." : "Confirmer la réinitialisation"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
              )}

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <h5 className="text-sm font-medium text-yellow-800">Conseil d'utilisation</h5>
                </div>
                <p className="text-xs text-yellow-700">
                  En tant qu'administrateur, vous pouvez cliquer sur l'icône étoile ⭐ des cartes pour les mettre en évidence.
                  Activez ensuite le filtre ci-dessus pour ne montrer que les cartes importantes à tous les participants.
                </p>
              </div>
            </div>

            <Separator />

            {/* Gestion des cartes */}
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
                    Empêche l'ajout de nouvelles cartes
                  </p>
                </div>
                <Switch
                    id="disable-adding-cards"
                    checked={localAddingCardsDisabled}
                    onCheckedChange={handleAddingCardsChange}
                />
              </div>
            </div>

            <Separator />

            {/* Boutons de sauvegarde */}
            {isOnlineMode && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Save className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Sauvegarde</h3>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                          onClick={() => setShowSaveDialog(true)}
                          disabled={!hasUnsavedChanges || isSaving}
                          className="flex-1"
                      >
                        {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Sauvegarde...
                            </>
                        ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Sauvegarder les paramètres
                            </>
                        )}
                      </Button>

                      <Button
                          variant="outline"
                          onClick={handleResetSettings}
                          disabled={!hasUnsavedChanges}
                      >
                        Annuler
                      </Button>
                    </div>

                    {!hasUnsavedChanges && (
                        <p className="text-xs text-green-600 text-center">
                          ✓ Tous les paramètres sont sauvegardés
                        </p>
                    )}
                  </div>

                  <Separator />
                </>
            )}

            {/* Informations de session */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informations</h3>
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
                {isOnlineMode && boardData && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Créé par</Label>
                      <p className="text-sm text-gray-900 mt-1">{boardData.createdBy}</p>
                    </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Votre statut</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700 font-medium">Administrateur</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Zone de danger */}
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
                        Cette action fermera définitivement la rétrospective pour tous les participants.
                        {isOnlineMode && " Le board ne sera plus accessible mais les données resteront sauvegardées."}
                        {!isOnlineMode && " Toutes les données seront perdues."}
                        {" "}Cette action ne peut pas être annulée.
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
          </div>

          {/* Dialog de confirmation de sauvegarde */}
          <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sauvegarder les paramètres</AlertDialogTitle>
                <AlertDialogDescription>
                  Ces modifications seront appliquées immédiatement pour tous les participants :
                  <div className="mt-3 space-y-1 text-sm">
                    <div>• Votes : {localVotingEnabled ? `Activés (${localMaxVotesPerPerson} max par personne)` : 'Désactivés'}</div>
                    <div>• Visibilité : {localShowOthersCards ? 'Toutes les cartes visibles' : 'Cartes personnelles uniquement'}</div>
                    <div>• Ajout de cartes : {localAddingCardsDisabled ? 'Désactivé' : 'Autorisé'}</div>
                    <div>• Affichage : {localShowOnlyHighlighted ? 'Cartes en évidence uniquement' : 'Toutes les cartes'}</div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? "Sauvegarde..." : "Confirmer et sauvegarder"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetContent>
      </Sheet>
  );
};

export default RetroSidebar;