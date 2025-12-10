import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

/**
 * Un modal de marcador de posición (placeholder) para gestionar los recursos de un curso.
 * NOTA: La funcionalidad completa para este modal no está implementada.
 */
const CourseResourcesModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Recursos del Curso">
            <p className="text-gray-600 dark:text-gray-400">Este componente es un marcador de posición y su funcionalidad será implementada en el futuro.</p>
            <div className="flex justify-end mt-4">
                <Button onClick={onClose} variant="secondary">Cerrar</Button>
            </div>
        </Modal>
    );
};

export default CourseResourcesModal;
