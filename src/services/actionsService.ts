
// src/services/actionsService.ts
import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
    writeBatch
} from 'firebase/firestore';

export interface ActionData {
    id?: string;
    title: string;
    description?: string;
    createdBy: string;
    createdAt: Timestamp;
    assignedTo?: string; // "all-team" ou nom d'utilisateur spécifique
    sourceCard?: {
        id: string;
        text: string;
        author: string;
        votes: number;
    };
}

export interface CreateActionParams {
    boardId: string;
    title: string;
    description?: string;
    createdBy: string;
    sourceCard?: {
        id: string;
        text: string;
        author: string;
        votes: number;
    };
}

export interface UpdateActionAssignmentParams {
    boardId: string;
    actionId: string;
    assignedTo?: string;
}

// Crée une nouvelle action dans la sous-collection
export const createAction = async (params: CreateActionParams): Promise<string> => {
    try {
        const actionsRef = collection(db, 'boards', params.boardId, 'actions');

        const actionData: Omit<ActionData, 'id'> = {
            title: params.title,
            description: params.description || '',
            createdBy: params.createdBy,
            createdAt: Timestamp.now(),
            assignedTo: null, // Par défaut, pas d'assignation
            sourceCard: params.sourceCard
        };

        const docRef = await addDoc(actionsRef, actionData);
        return docRef.id;
    } catch (error) {
        console.error('Erreur lors de la création de l\'action:', error);
        throw new Error('Impossible de créer l\'action');
    }
};

// Récupère toutes les actions d'un board
export const getActions = async (boardId: string): Promise<ActionData[]> => {
    try {
        const actionsRef = collection(db, 'boards', boardId, 'actions');
        const q = query(actionsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const actions: ActionData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            actions.push({
                id: doc.id,
                ...data
            } as ActionData);
        });

        return actions;
    } catch (error) {
        console.error('Erreur lors de la récupération des actions:', error);
        throw new Error('Impossible de récupérer les actions');
    }
};

// Supprime une action
export const deleteAction = async (boardId: string, actionId: string): Promise<void> => {
    try {
        const actionRef = doc(db, 'boards', boardId, 'actions', actionId);
        await deleteDoc(actionRef);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'action:', error);
        throw new Error('Impossible de supprimer l\'action');
    }
};

// Met à jour l'assignation d'une action
export const updateActionAssignment = async (params: UpdateActionAssignmentParams): Promise<void> => {
    try {
        const actionRef = doc(db, 'boards', params.boardId, 'actions', params.actionId);

        await updateDoc(actionRef, {
            assignedTo: params.assignedTo || null
        });

        console.log(`Action ${params.actionId} assignée à: ${params.assignedTo || 'personne'}`);

    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'assignation:', error);
        throw new Error('Impossible de mettre à jour l\'assignation de l\'action');
    }
};

// Écoute en temps réel les changements d'actions
export const subscribeToActions = (
    boardId: string,
    callback: (actions: ActionData[]) => void
): (() => void) => {
    try {
        const actionsRef = collection(db, 'boards', boardId, 'actions');
        const q = query(actionsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const actions: ActionData[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                actions.push({
                    id: doc.id,
                    ...data
                } as ActionData);
            });
            callback(actions);
        }, (error) => {
            console.error('Erreur lors de l\'écoute des actions:', error);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Erreur lors de la souscription aux actions:', error);
        throw new Error('Impossible de souscrire aux actions');
    }
};

// Supprime toutes les actions d'un board (utile pour la remise à zéro)
export const deleteAllActions = async (boardId: string): Promise<void> => {
    try {
        const actionsRef = collection(db, 'boards', boardId, 'actions');
        const querySnapshot = await getDocs(actionsRef);

        // Utiliser un batch pour supprimer toutes les actions en une seule transaction
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Exécuter toutes les suppressions
        await batch.commit();

        console.log(`Toutes les actions ont été supprimées pour le board ${boardId}`);

    } catch (error) {
        console.error('Erreur lors de la suppression de toutes les actions:', error);
        throw new Error('Impossible de supprimer toutes les actions');
    }
};

// Obtient les statistiques des actions pour un board
export const getActionStatistics = (actions: ActionData[]): {
    total: number;
    assigned: number;
    unassigned: number;
    assignedToTeam: number;
    assignedToIndividuals: number;
    byAssignee: Record<string, number>;
} => {
    const total = actions.length;
    const assigned = actions.filter(action => action.assignedTo).length;
    const unassigned = total - assigned;
    const assignedToTeam = actions.filter(action => action.assignedTo === 'all-team').length;
    const assignedToIndividuals = assigned - assignedToTeam;

    // Compter les actions par assigné
    const byAssignee: Record<string, number> = {};
    actions.forEach(action => {
        if (action.assignedTo) {
            byAssignee[action.assignedTo] = (byAssignee[action.assignedTo] || 0) + 1;
        }
    });

    return {
        total,
        assigned,
        unassigned,
        assignedToTeam,
        assignedToIndividuals,
        byAssignee
    };
};

// Filtre les actions selon l'assignation
export const filterActionsByAssignment = (
    actions: ActionData[],
    userId: string,
    showOnlyMyActions: boolean = false
): ActionData[] => {
    if (!showOnlyMyActions) {
        return actions;
    }

    return actions.filter(action =>
        action.assignedTo === userId ||
        action.assignedTo === 'all-team' ||
        action.createdBy === userId
    );
};