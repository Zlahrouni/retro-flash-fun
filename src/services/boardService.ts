// src/services/boardService.ts
import { db } from '@/lib/firebase';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    Timestamp,
    onSnapshot
} from 'firebase/firestore';

export interface BoardData {
    name: string;
    type: string;
    createdAt: Timestamp;
    createdBy: string;
    isActive: boolean;
    columns: string[];
    hideCardsFromOthers: boolean;
    votingEnabled: boolean;
    votesPerParticipant: number;
    addingCardsDisabled: boolean;
    showOnlyHighlighted: boolean; // Nouveau champ pour l'affichage des cartes en évidence
    participants: string[];
}

export interface CreateBoardParams {
    name: string;
    username: string;
    type: string;
    columns: string[];
}

export interface UpdateBoardSettingsParams {
    boardId: string;
    hideCardsFromOthers?: boolean;
    votingEnabled?: boolean;
    votesPerParticipant?: number;
    addingCardsDisabled?: boolean;
    showOnlyHighlighted?: boolean; // Nouveau paramètre
}

// Génère un ID unique alphanumérique de 6 caractères maximum
export const generateBoardId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Crée un nouveau board dans Firestore
export const createBoard = async (params: CreateBoardParams): Promise<string> => {
    const boardId = generateBoardId();

    const boardData: BoardData = {
        name: params.name,
        type: params.type,
        createdAt: Timestamp.now(),
        createdBy: params.username,
        isActive: true,
        columns: params.columns,
        hideCardsFromOthers: true, // Par défaut, masquer les cartes des autres
        votingEnabled: false, // Par défaut, votes désactivés
        votesPerParticipant: 3, // Par défaut, 3 votes maximum
        addingCardsDisabled: false, // Par défaut, ajout de cartes autorisé
        showOnlyHighlighted: false, // Par défaut, afficher toutes les cartes
        participants: [params.username]
    };

    try {
        await setDoc(doc(db, 'boards', boardId), boardData);
        return boardId;
    } catch (error) {
        console.error('Erreur lors de la création du board:', error);
        throw new Error('Impossible de créer le board');
    }
};

// Récupère un board depuis Firestore
export const getBoard = async (boardId: string): Promise<BoardData | null> => {
    try {
        const docRef = doc(db, 'boards', boardId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as Partial<BoardData>;

            // Assurer la compatibilité avec les anciens boards qui n'ont pas les nouveaux champs
            return {
                addingCardsDisabled: false, // Valeur par défaut
                showOnlyHighlighted: false, // Valeur par défaut
                ...data
            } as BoardData;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du board:', error);
        throw new Error('Impossible de récupérer le board');
    }
};

// Ajoute un participant au board
export const addParticipantToBoard = async (boardId: string, username: string): Promise<void> => {
    try {
        const docRef = doc(db, 'boards', boardId);

        // Vérifier d'abord que le board existe et est actif
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error('Board non trouvé');
        }

        const boardData = docSnap.data() as BoardData;
        if (!boardData.isActive) {
            throw new Error('Ce board n\'est plus actif');
        }

        // Vérifier si l'utilisateur n'est pas déjà dans la liste
        if (boardData.participants.includes(username)) {
            // L'utilisateur est déjà participant, pas besoin de l'ajouter
            return;
        }

        // Ajouter l'utilisateur à la liste des participants
        await updateDoc(docRef, {
            participants: arrayUnion(username)
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout du participant:', error);
        throw new Error('Impossible d\'ajouter le participant au board');
    }
};

// Met à jour les paramètres du board (fonction améliorée)
export const updateBoardSettings = async (params: UpdateBoardSettingsParams): Promise<void> => {
    try {
        const docRef = doc(db, 'boards', params.boardId);

        // Vérifier que le board existe d'abord
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error('Board non trouvé');
        }

        const boardData = docSnap.data() as BoardData;
        if (!boardData.isActive) {
            throw new Error('Ce board n\'est plus actif');
        }

        // Créer un objet avec seulement les champs à mettre à jour
        const updates: Partial<BoardData> = {};

        if (params.hideCardsFromOthers !== undefined) {
            updates.hideCardsFromOthers = params.hideCardsFromOthers;
        }

        if (params.votingEnabled !== undefined) {
            updates.votingEnabled = params.votingEnabled;
        }

        if (params.votesPerParticipant !== undefined) {
            // Validation de la valeur
            if (params.votesPerParticipant < 1 || params.votesPerParticipant > 20) {
                throw new Error('Le nombre de votes doit être entre 1 et 20');
            }
            updates.votesPerParticipant = params.votesPerParticipant;
        }

        if (params.addingCardsDisabled !== undefined) {
            updates.addingCardsDisabled = params.addingCardsDisabled;
        }

        if (params.showOnlyHighlighted !== undefined) {
            updates.showOnlyHighlighted = params.showOnlyHighlighted;
        }

        // Effectuer la mise à jour
        await updateDoc(docRef, updates);

        console.log('Paramètres du board mis à jour:', updates);

    } catch (error) {
        console.error('Erreur lors de la mise à jour des paramètres:', error);
        throw new Error('Impossible de mettre à jour les paramètres du board');
    }
};

// Ferme définitivement un board
export const closeBoardPermanently = async (boardId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'boards', boardId);

        // Vérifier que le board existe d'abord
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error('Board non trouvé');
        }

        await updateDoc(docRef, {
            isActive: false
        });

        console.log('Board fermé définitivement:', boardId);

    } catch (error) {
        console.error('Erreur lors de la fermeture du board:', error);
        throw new Error('Impossible de fermer le board');
    }
};

// Écoute en temps réel les changements du board
export const subscribeToBoardUpdates = (
    boardId: string,
    callback: (boardData: BoardData | null) => void
): (() => void) => {
    try {
        const docRef = doc(db, 'boards', boardId);

        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as Partial<BoardData>;

                // Assurer la compatibilité avec les anciens boards
                const boardData: BoardData = {
                    addingCardsDisabled: false, // Valeur par défaut
                    showOnlyHighlighted: false, // Valeur par défaut
                    ...data
                } as BoardData;

                callback(boardData);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Erreur lors de l\'écoute du board:', error);
            callback(null);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Erreur lors de la souscription au board:', error);
        throw new Error('Impossible de souscrire aux mises à jour du board');
    }
};

// Fonction utilitaire pour valider les paramètres de board
export const validateBoardSettings = (settings: Partial<UpdateBoardSettingsParams>): boolean => {
    if (settings.votesPerParticipant !== undefined) {
        if (settings.votesPerParticipant < 1 || settings.votesPerParticipant > 20) {
            return false;
        }
    }
    return true;
};

// Fonction pour obtenir le statut d'un board sans s'abonner
export const getBoardStatus = async (boardId: string): Promise<{
    exists: boolean;
    isActive: boolean;
    createdBy?: string;
}> => {
    try {
        const docRef = doc(db, 'boards', boardId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as BoardData;
            return {
                exists: true,
                isActive: data.isActive,
                createdBy: data.createdBy
            };
        } else {
            return {
                exists: false,
                isActive: false
            };
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        return {
            exists: false,
            isActive: false
        };
    }
};

// Fonction pour réinitialiser tous les votes d'un board
export const resetAllVotes = async (boardId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'boards', boardId);

        // Vérifier que le board existe d'abord
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error('Board non trouvé');
        }

        const boardData = docSnap.data() as BoardData;
        if (!boardData.isActive) {
            throw new Error('Ce board n\'est plus actif');
        }

        // Note: Cette fonction ne fait que marquer qu'une réinitialisation est demandée
        // La réinitialisation réelle des votes se fait côté notes dans notesService
        // Ici on pourrait ajouter un timestamp de dernière réinitialisation si nécessaire

        console.log('Demande de réinitialisation des votes pour le board:', boardId);

    } catch (error) {
        console.error('Erreur lors de la réinitialisation des votes:', error);
        throw new Error('Impossible de réinitialiser les votes');
    }
};