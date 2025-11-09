import React from 'react';
import { useModal } from '../contexts/ModalContext';

// Import Modals
import AddTransactionModal from './AddTransactionModal';
import ComingSoonModal from './ComingSoonModal';

const ModalManager: React.FC = () => {
    const { modalState, closeModal } = useModal();
    const { type, props = {} } = modalState;

    if (!type) {
        return null;
    }

    switch (type) {
        case 'addTransaction':
            return <AddTransactionModal show={true} onClose={closeModal} />;
        case 'editTransaction':
            return <AddTransactionModal show={true} onClose={closeModal} transactionToEdit={props.transaction} />;
        case 'comingSoon':
            return <ComingSoonModal show={true} onClose={closeModal} featureName={props.featureName} />;
        default:
            return null;
    }
};

export default ModalManager;
