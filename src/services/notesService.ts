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
    orderBy,
    writeBatch
} from 'firebase/firestore';

export interface NoteData {
    id?: string;
    content: string;
    column: string;
    createdBy: string;
    createdAt: Timestamp;
    voteCount: number;
    voters: string[];
    highlighted: boolean; // Nouveau champ pour la mise en évidence
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

export interface HighlightParams {
    boardId: string;
    noteId: string;
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
            voters: [],
            highlighted: false // Par défaut, les nouvelles notes ne sont pas mises en évidence
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
            const data = doc.data();
            notes.push({
                id: doc.id,
                highlighted: false, // Valeur par défaut pour la compatibilité avec les anciennes notes
                ...data
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

// Toggle la mise en évidence d'une note (fonction pour les admins)
export const toggleHighlight = async (params: HighlightParams): Promise<void> => {
    try {
        const noteRef = doc(db, 'boards', params.boardId, 'notes', params.noteId);

        // Récupérer la note actuelle pour vérifier son état de mise en évidence
        const noteDoc = await getDocs(query(collection(db, 'boards', params.boardId, 'notes')));
        const currentNote = noteDoc.docs.find(doc => doc.id === params.noteId);

        if (!currentNote) {
            throw new Error('Note non trouvée');
        }

        const noteData = currentNote.data() as NoteData;
        const isHighlighted = noteData.highlighted || false; // Valeur par défaut pour la compatibilité

        // Toggle l'état de mise en évidence
        await updateDoc(noteRef, {
            highlighted: !isHighlighted
        });

        console.log(`Note ${params.noteId} mise en évidence: ${!isHighlighted}`);

    } catch (error) {
        console.error('Erreur lors de la mise en évidence:', error);
        throw new Error('Impossible de modifier la mise en évidence de cette note');
    }
};

// Réinitialise tous les votes d'un board
export const resetAllVotes = async (boardId: string): Promise<void> => {
    try {
        const notesRef = collection(db, 'boards', boardId, 'notes');
        const querySnapshot = await getDocs(notesRef);

        // Utiliser un batch pour mettre à jour toutes les notes en une seule transaction
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
            const noteRef = doc.ref;
            batch.update(noteRef, {
                voteCount: 0,
                voters: []
            });
        });

        // Exécuter toutes les mises à jour
        await batch.commit();

        console.log(`Tous les votes ont été réinitialisés pour le board ${boardId}`);

    } catch (error) {
        console.error('Erreur lors de la réinitialisation des votes:', error);
        throw new Error('Impossible de réinitialiser les votes');
    }
};

// Réinitialise toutes les mises en évidence d'un board
export const resetAllHighlights = async (boardId: string): Promise<void> => {
    try {
        const notesRef = collection(db, 'boards', boardId, 'notes');
        const querySnapshot = await getDocs(notesRef);

        // Utiliser un batch pour mettre à jour toutes les notes en une seule transaction
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
            const noteRef = doc.ref;
            batch.update(noteRef, {
                highlighted: false
            });
        });

        // Exécuter toutes les mises à jour
        await batch.commit();

        console.log(`Toutes les mises en évidence ont été réinitialisées pour le board ${boardId}`);

    } catch (error) {
        console.error('Erreur lors de la réinitialisation des mises en évidence:', error);
        throw new Error('Impossible de réinitialiser les mises en évidence');
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
                const data = doc.data();
                notes.push({
                    id: doc.id,
                    highlighted: false, // Valeur par défaut pour la compatibilité
                    ...data
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

// Filtre les notes selon les mises en évidence (nouvelle fonction)
export const filterNotesByHighlight = (
    notes: NoteData[],
    showOnlyHighlighted: boolean
): NoteData[] => {
    if (showOnlyHighlighted) {
        return notes.filter(note => note.highlighted === true);
    }
    return notes;
};

// Obtient le nombre total de votes d'un utilisateur
export const getUserVoteCount = (notes: NoteData[], userId: string): number => {
    return notes.reduce((count, note) => {
        return count + (note.voters.includes(userId) ? 1 : 0);
    }, 0);
};

// Obtient les statistiques de votes pour un board
export const getVoteStatistics = (notes: NoteData[]): {
    totalVotes: number;
    totalCards: number;
    averageVotesPerCard: number;
    mostVotedCard: NoteData | null;
} => {
    const totalVotes = notes.reduce((sum, note) => sum + note.voteCount, 0);
    const totalCards = notes.length;
    const averageVotesPerCard = totalCards > 0 ? totalVotes / totalCards : 0;
    const mostVotedCard = notes.length > 0
        ? notes.reduce((max, note) => note.voteCount > max.voteCount ? note : max)
        : null;

    return {
        totalVotes,
        totalCards,
        averageVotesPerCard,
        mostVotedCard
    };
};

// Obtient les statistiques des mises en évidence pour un board
export const getHighlightStatistics = (notes: NoteData[]): {
    totalHighlighted: number;
    highlightedByColumn: Record<string, number>;
} => {
    const totalHighlighted = notes.filter(note => note.highlighted).length;
    const highlightedByColumn: Record<string, number> = {};

    notes.forEach(note => {
        if (note.highlighted) {
            highlightedByColumn[note.column] = (highlightedByColumn[note.column] || 0) + 1;
        }
    });

    return {
        totalHighlighted,
        highlightedByColumn
    };
};