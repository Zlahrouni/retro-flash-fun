// src/services/notesService.ts
import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    Timestamp,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';

export interface NoteData {
    id?: string;
    content: string;
    column: string;
    createdBy: string;
    createdAt: Timestamp;
    voteCount: number;
    voters: string[];
}

export interface CreateNoteParams {
    boardId: string;
    content: string;
    column: string;
    createdBy: string;
}

export interface VoteParams {
    boardId: string;
    noteId: string;
    userId: string;
}

// Crée une nouvelle note dans la sous-collection
export const createNote = async (params: CreateNoteParams): Promise<string> => {
    try {
        const notesRef = collection(db, 'boards', params.boardId, 'notes');

        const noteData: Omit<NoteData, 'id'> = {
            content: params.content,
            column: params.column,
            createdBy: params.createdBy,
            createdAt: Timestamp.now(),
            voteCount: 0,
            voters: []
        };

        const docRef = await addDoc(notesRef, noteData);
        return docRef.id;
    } catch (error) {
        console.error('Erreur lors de la création de la note:', error);
        throw new Error('Impossible de créer la note');
    }
};

// Récupère toutes les notes d'un board
export const getNotes = async (boardId: string): Promise<NoteData[]> => {
    try {
        const notesRef = collection(db, 'boards', boardId, 'notes');
        const q = query(notesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const notes: NoteData[] = [];
        querySnapshot.forEach((doc) => {
            notes.push({
                id: doc.id,
                ...doc.data()
            } as NoteData);
        });

        return notes;
    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        throw new Error('Impossible de récupérer les notes');
    }
};

// Supprime une note
export const deleteNote = async (boardId: string, noteId: string): Promise<void> => {
    try {
        const noteRef = doc(db, 'boards', boardId, 'notes', noteId);
        await deleteDoc(noteRef);
    } catch (error) {
        console.error('Erreur lors de la suppression de la note:', error);
        throw new Error('Impossible de supprimer la note');
    }
};

// Ajoute ou retire un vote sur une note
export const toggleVote = async (params: VoteParams): Promise<void> => {
    try {
        const noteRef = doc(db, 'boards', params.boardId, 'notes', params.noteId);

        // Récupérer la note actuelle pour vérifier si l'utilisateur a déjà voté
        const noteDoc = await getDocs(query(collection(db, 'boards', params.boardId, 'notes')));
        const currentNote = noteDoc.docs.find(doc => doc.id === params.noteId);

        if (!currentNote) {
            throw new Error('Note non trouvée');
        }

        const noteData = currentNote.data() as NoteData;
        const hasVoted = noteData.voters.includes(params.userId);

        if (hasVoted) {
            // Retirer le vote
            await updateDoc(noteRef, {
                voteCount: noteData.voteCount - 1,
                voters: arrayRemove(params.userId)
            });
        } else {
            // Ajouter le vote
            await updateDoc(noteRef, {
                voteCount: noteData.voteCount + 1,
                voters: arrayUnion(params.userId)
            });
        }
    } catch (error) {
        console.error('Erreur lors du vote:', error);
        throw new Error('Impossible de voter sur cette note');
    }
};

// Écoute en temps réel les changements de notes
export const subscribeToNotes = (
    boardId: string,
    callback: (notes: NoteData[]) => void
): (() => void) => {
    try {
        const notesRef = collection(db, 'boards', boardId, 'notes');
        const q = query(notesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes: NoteData[] = [];
            snapshot.forEach((doc) => {
                notes.push({
                    id: doc.id,
                    ...doc.data()
                } as NoteData);
            });
            callback(notes);
        }, (error) => {
            console.error('Erreur lors de l\'écoute des notes:', error);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Erreur lors de la souscription aux notes:', error);
        throw new Error('Impossible de souscrire aux notes');
    }
};

// Vérifie si un utilisateur peut encore voter (respecte la limite)
export const canUserVote = (
    notes: NoteData[],
    userId: string,
    maxVotes: number
): boolean => {
    const totalVotesByUser = notes.reduce((count, note) => {
        return count + (note.voters.includes(userId) ? 1 : 0);
    }, 0);

    return totalVotesByUser < maxVotes;
};

// Filtre les notes selon les règles de visibilité
export const filterNotesByVisibility = (
    notes: NoteData[],
    currentUserId: string,
    hideCardsFromOthers: boolean
): NoteData[] => {
    if (hideCardsFromOthers) {
        return notes.filter(note => note.createdBy === currentUserId);
    }
    return notes;
};