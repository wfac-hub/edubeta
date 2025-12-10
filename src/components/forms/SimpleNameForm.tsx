
import React, { useState } from 'react';
import Button from '../ui/Button';

interface SimpleNameFormProps {
    initialValue: string;
    onSave: (name: string) => void;
    onClose: () => void;
    label: string;
}

const SimpleNameForm: React.FC<SimpleNameFormProps> = ({ initialValue, onSave, onClose, label }) => {
    const [name, setName] = useState(initialValue);

    return (
        <form onSubmit={e => { e.preventDefault(); onSave(name); }} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input 
                    type="text" 
                    className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    autoFocus
                />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    );
}

export default SimpleNameForm;
