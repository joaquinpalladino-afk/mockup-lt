import React, { FC, useMemo } from 'react';
import type { Task } from '../types';
import { useAppContext } from '../context/AppContext';
import { CalendarIcon, TagIcon } from './Icons';

interface TaskItemProps {
    task: Task;
    onEdit: (id: string) => void;
    style: React.CSSProperties;
}

export const TaskItem: FC<TaskItemProps> = ({ task, onEdit, style }) => {
    const { state, dispatch } = useAppContext();

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: { id: task.id } });
    };

    const tagName = useMemo(() => {
        return state.tags.find(tag => tag.id === task.tagId)?.name;
    }, [task.tagId, state.tags]);

    const getPriorityClass = (priority: string): string => {
        const p = priority.toLowerCase();
        if (p.includes('crítico')) return 'bg-red-500/80 text-white';
        if (p.includes('alto')) return 'bg-yellow-500/80 text-black';
        if (p.includes('normal')) return 'bg-blue-500/80 text-white';
        if (p.includes('bajo')) return 'bg-gray-500/80 text-white';
        return 'bg-gray-600/80 text-white';
    };

    const formattedDueDate = useMemo(() => {
        if (!task.dueDate) return null;
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        now.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let text = '';
        let colorClass = 'text-gray-400';

        if (diffDays < 0) {
            text = `Vencido hace ${Math.abs(diffDays)}d`;
            colorClass = 'text-red-400';
        } else if (diffDays === 0) {
            text = 'Hoy';
            colorClass = 'text-yellow-400';
        } else if (diffDays === 1) {
            text = 'Mañana';
        } else {
            text = dueDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        }
        return { text, colorClass };
    }, [task.dueDate]);

    return (
        <div 
          style={style}
          className={`bg-[#444444]/70 p-3 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer animate-fade-in-up backdrop-blur-sm border border-white/10 ${task.completed ? 'opacity-50' : ''}`}
          onClick={() => onEdit(task.id)}
        >
            <div className="flex items-start space-x-3">
                <div onClick={handleToggle} className="pt-1">
                  <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="form-checkbox h-5 w-5 rounded-sm bg-gray-700 border-gray-600 text-[#156193] focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent focus:ring-[#156193] cursor-pointer"
                  />
                </div>
                <span className={`flex-grow pt-0.5 ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.title}
                </span>
            </div>
            
            {(tagName || formattedDueDate) && (
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 pl-8 border-t border-white/10 text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                    </span>
                    {tagName && (
                        <div className="flex items-center space-x-1 text-gray-400">
                            <TagIcon className="h-3.5 w-3.5" />
                            <span>{tagName}</span>
                        </div>
                    )}
                    {formattedDueDate && (
                        <div className={`flex items-center space-x-1 ${formattedDueDate.colorClass}`}>
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>{formattedDueDate.text}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
