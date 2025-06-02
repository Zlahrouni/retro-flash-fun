// src/services/actionsService.ts
import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    Timestamp,
    onSnapshot,
    where
} from 'firebase/firestore';

export interface ActionData {
    id?: string;
    title: string;
    createdAt: Timestamp;
    createdBy: string;

    // Lien avec la carte source
    linkedNoteId: string;
    linkedNoteContent: string;
    linkedNoteColumn: string;

    // Attributions
    assignedTo: string[]; // Un ou plusieurs utilisateurs ou "all"

    // Statut & permissions
    status: 'proposed' | 'todo' | 'in-progress' | 'done';
    isApproved: boolean;
    approvedBy?: string;
    approvedAt?: Timestamp;

    // Optionnel : description détaillée de l'action
    description?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
}

export interface CreateActionParams {
    boardId: string;
    title: string;
    linkedNoteId: string;
    linkedNoteContent: string;
    linkedNoteColumn: string;
    createdBy: string;
    assignedTo: string[];
    description?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
}

export interface UpdateActionParams {
    boardId: string;
    actionId: string;
    title?: string;
    assignedTo?: string[];
    status?: ActionData['status'];
    description?: string;
    dueDate?: string;
    priority?: ActionData['priority'];
}

export interface ApproveActionParams {
    boardId: string;
    actionId: string;
    approvedBy: string;
}

// Crée une nouvelle action proposée
export const createAction = async (params: CreateActionParams): Promise<string> => {
    try {
        const actionsRef = collection(db, 'boards', params.boardId, 'actions');

        const actionData: Omit<ActionData, 'id'> = {
            title: params.title,
            createdAt: Timestamp.now(),
            createdBy: params.createdBy,
            linkedNoteId: params.linkedNoteId,
            linkedNoteContent: params.linkedNoteContent,
            linkedNoteColumn: params.linkedNoteColumn,
            assignedTo: params.assignedTo,
            status: 'proposed',
            isApproved: false,
            description: params.description,
            dueDate: params.dueDate,
            priority: params.priority || 'medium'
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
            actions.push({
                id: doc.id,
                ...doc.data()
            } as ActionData);
        });

        return actions;
    } catch (error) {
        console.error('Erreur lors de la récupération des actions:', error);
        throw new Error('Impossible de récupérer les actions');
    }
};

// Met à jour une action existante
export const updateAction = async (params: UpdateActionParams): Promise<void> => {
    try {
        const actionRef = doc(db, 'boards', params.boardId, 'actions', params.actionId);

        const updateData: Partial<ActionData> = {};

        if (params.title !== undefined) updateData.title = params.title;
        if (params.assignedTo !== undefined) updateData.assignedTo = params.assignedTo;
        if (params.status !== undefined) updateData.status = params.status;
        if (params.description !== undefined) updateData.description = params.description;
        if (params.dueDate !== undefined) updateData.dueDate = params.dueDate;
        if (params.priority !== undefined) updateData.priority = params.priority;

        await updateDoc(actionRef, updateData);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'action:', error);
        throw new Error('Impossible de mettre à jour l\'action');
    }
};

// Approuve une action proposée (seul l'admin peut le faire)
export const approveAction = async (params: ApproveActionParams): Promise<void> => {
    try {
        const actionRef = doc(db, 'boards', params.boardId, 'actions', params.actionId);

        await updateDoc(actionRef, {
            isApproved: true,
            approvedBy: params.approvedBy,
            approvedAt: Timestamp.now(),
            status: 'todo' // Passe automatiquement en "todo" une fois approuvée
        });
    } catch (error) {
        console.error('Erreur lors de l\'approbation de l\'action:', error);
        throw new Error('Impossible d\'approuver l\'action');
    }
};

// Rejette une action proposée
export const rejectAction = async (boardId: string, actionId: string): Promise<void> => {
    try {
        const actionRef = doc(db, 'boards', boardId, 'actions', actionId);
        await deleteDoc(actionRef);
    } catch (error) {
        console.error('Erreur lors du rejet de l\'action:', error);
        throw new Error('Impossible de rejeter l\'action');
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
                actions.push({
                    id: doc.id,
                    ...doc.data()
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

// Récupère les actions approuvées uniquement
export const getApprovedActions = async (boardId: string): Promise<ActionData[]> => {
    try {
        const actionsRef = collection(db, 'boards', boardId, 'actions');
        const q = query(
            actionsRef,
            where('isApproved', '==', true),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const actions: ActionData[] = [];
        querySnapshot.forEach((doc) => {
            actions.push({
                id: doc.id,
                ...doc.data()
            } as ActionData);
        });

        return actions;
    } catch (error) {
        console.error('Erreur lors de la récupération des actions approuvées:', error);
        throw new Error('Impossible de récupérer les actions approuvées');
    }
};

// Récupère les actions en attente d'approbation
export const getPendingActions = async (boardId: string): Promise<ActionData[]> => {
    try {
        const actionsRef = collection(db, 'boards', boardId, 'actions');
        const q = query(
            actionsRef,
            where('isApproved', '==', false),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const actions: ActionData[] = [];
        querySnapshot.forEach((doc) => {
            actions.push({
                id: doc.id,
                ...doc.data()
            } as ActionData);
        });

        return actions;
    } catch (error) {
        console.error('Erreur lors de la récupération des actions en attente:', error);
        throw new Error('Impossible de récupérer les actions en attente');
    }
};

// Obtient les statistiques des actions
export const getActionStatistics = (actions: ActionData[]): {
    total: number;
    proposed: number;
    approved: number;
    todo: number;
    inProgress: number;
    done: number;
    byColumn: Record<string, number>;
} => {
    const stats = {
        total: actions.length,
        proposed: 0,
        approved: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        byColumn: {} as Record<string, number>
    };

    actions.forEach(action => {
        // Statuts
        if (!action.isApproved) {
            stats.proposed++;
        } else {
            stats.approved++;

            switch (action.status) {
                case 'todo':
                    stats.todo++;
                    break;
                case 'in-progress':
                    stats.inProgress++;
                    break;
                case 'done':
                    stats.done++;
                    break;
            }
        }

        // Répartition par colonne source
        if (stats.byColumn[action.linkedNoteColumn]) {
            stats.byColumn[action.linkedNoteColumn]++;
        } else {
            stats.byColumn[action.linkedNoteColumn] = 1;
        }
    });

    return stats;
};

// Filtre les actions selon l'utilisateur actuel
export const filterActionsByUser = (
    actions: ActionData[],
    currentUsername: string,
    filterType: 'all' | 'assigned' | 'created'
): ActionData[] => {
    switch (filterType) {
        case 'assigned':
            return actions.filter(action =>
                action.assignedTo.includes(currentUsername) ||
                action.assignedTo.includes('all')
            );
        case 'created':
            return actions.filter(action => action.createdBy === currentUsername);
        case 'all':
        default:
            return actions;
    }
};