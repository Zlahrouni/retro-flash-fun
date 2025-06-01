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
        hideCardsFromOthers: true,
        votingEnabled: false,
        votesPerParticipant: 3,
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
            return docSnap.data() as BoardData;
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

// Met à jour les paramètres du board
export const updateBoardSettings = async (params: UpdateBoardSettingsParams): Promise<void> => {
    try {
        const docRef = doc(db, 'boards', params.boardId);

        // Créer un objet avec seulement les champs à mettre à jour
        const updates: Partial<BoardData> = {};

        if (params.hideCardsFromOthers !== undefined) {
            updates.hideCardsFromOthers = params.hideCardsFromOthers;
        }

        if (params.votingEnabled !== undefined) {
            updates.votingEnabled = params.votingEnabled;
        }

        if (params.votesPerParticipant !== undefined) {
            updates.votesPerParticipant = params.votesPerParticipant;
        }

        await updateDoc(docRef, updates);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des paramètres:', error);
        throw new Error('Impossible de mettre à jour les paramètres du board');
    }
};

// Ferme définitivement un board
export const closeBoardPermanently = async (boardId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'boards', boardId);
        await updateDoc(docRef, {
            isActive: false
        });
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
                callback(doc.data() as BoardData);
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