import React, { useState, useEffect, useMemo } from 'react';
import type { Task, Tag } from '../types';
import { Repeat } from '../types';
import { useAppContext } from '../context/AppContext';
import { TrashIcon } from './Icons';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const { state, dispatch } = useAppContext();
  const task = state.tasks.find(t => t.id === taskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [repeat, setRepeat] = useState<Repeat>(Repeat.None);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const filteredTags = useMemo(() => {
    if (!tagInput) {
      return state.tags;
    }
    return state.tags.filter(tag =>
      tag.name.toLowerCase().includes(tagInput.toLowerCase())
    );
  }, [tagInput, state.tags]);
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      const currentTag = state.tags.find(tag => tag.id === task.tagId);
      setTagInput(currentTag ? currentTag.name : '');
      setSelectedTagId(task.tagId);
      setDueDate(task.dueDate ? task.dueDate.substring(0, 16) : '');
      setPriority(task.priority);
      setRepeat(task.repeat || Repeat.None);
    }
  }, [task, state.tags]);

  const handleSave = () => {
    if (!task || !title.trim()) return;

    let finalTagId = selectedTagId;
    if (tagInput.trim()) {
        const existingTag = state.tags.find(t => t.name.toLowerCase() === tagInput.trim().toLowerCase());
        if (existingTag) {
            finalTagId = existingTag.id;
        } else {
            const newTag: Tag = { id: `tag-${Date.now()}`, name: tagInput.trim() };
            dispatch({ type: 'ADD_TAG', payload: newTag });
            finalTagId = newTag.id;
        }
    } else {
        finalTagId = null;
    }

    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      description,
      tagId: finalTagId,
      dueDate: dueDate || null,
      priority,
      repeat,
    };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      dispatch({ type: 'DELETE_TASK', payload: { id: task.id } });
      onClose();
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#444444] rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-lg text-white animate-scale-in" onClick={e => e.stopPropagation()}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent w-full focus:outline-none mb-4 border-b-2 border-gray-600 focus:border-[#156193] py-1 transition-colors"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Añadir descripción..."
          className="w-full h-24 bg-[#1E1E1E] rounded-md p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#156193] placeholder-gray-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-1">Tag (Proyecto)</label>
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                        setTagInput(e.target.value);
                        setSelectedTagId(null);
                    }}
                    onFocus={() => setShowTagSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
                    className="w-full bg-[#1E1E1E] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#156193]"
                    autoComplete="off"
                />
                {showTagSuggestions && filteredTags.length > 0 && (
                    <div className="absolute z-10 w-full bg-[#2d2d2d] rounded-md mt-1 shadow-lg">
                        <ul className="max-h-40 overflow-y-auto py-1">
                            {filteredTags.map(tag => (
                                <li
                                    key={tag.id}
                                    className="px-3 py-2 cursor-pointer hover:bg-[#4a4a4a]"
                                    onMouseDown={() => {
                                        setTagInput(tag.name);
                                        setSelectedTagId(tag.id);
                                        setShowTagSuggestions(false);
                                    }}
                                >
                                    {tag.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Prioridad</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-[#1E1E1E] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#156193] appearance-none">
                    {state.settings.priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Repetir</label>
                <select value={repeat} onChange={(e) => setRepeat(e.target.value as Repeat)} className="w-full bg-[#1E1E1E] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#156193] appearance-none">
                    {Object.values(Repeat).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Caducidad</label>
                <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-[#1E1E1E] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#156193]" />
            </div>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <button onClick={handleDelete} className="flex items-center space-x-2 text-red-500 hover:text-red-400 font-semibold transition-all duration-200 hover:scale-105">
            <TrashIcon className="h-5 w-5" />
            <span>Eliminar Tarea</span>
          </button>
          <button onClick={handleSave} className="w-full sm:w-auto bg-[#156193] text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:scale-105">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};