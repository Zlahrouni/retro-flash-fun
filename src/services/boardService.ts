// src/services/boardService.ts
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

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