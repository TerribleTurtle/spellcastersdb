import { useState, useCallback } from "react";

interface UseTeamEditModalProps {
    hasChanges: boolean;
    onConfirm: (idx: number) => void;
}

export function useTeamEditModal({ hasChanges, onConfirm }: UseTeamEditModalProps) {
    const [showEditConfirm, setShowEditConfirm] = useState(false);
    const [pendingEditIndex, setPendingEditIndex] = useState<number | null>(null);

    const requestEdit = useCallback((idx: number) => {
        if (hasChanges) {
            setPendingEditIndex(idx);
            setShowEditConfirm(true);
        } else {
            onConfirm(idx);
        }
    }, [hasChanges, onConfirm]);

    const handleConfirm = useCallback(() => {
        if (pendingEditIndex !== null) {
            onConfirm(pendingEditIndex);
        }
        setShowEditConfirm(false);
        setPendingEditIndex(null);
    }, [pendingEditIndex, onConfirm]);

    const handleCancel = useCallback(() => {
        setShowEditConfirm(false);
        setPendingEditIndex(null);
    }, []);

    return {
        showEditConfirm,
        requestEdit,
        handleConfirm,
        handleCancel
    };
}
