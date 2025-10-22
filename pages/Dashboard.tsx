import React, { useState, useMemo, FC } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Task } from '../types';
import { TaskType } from '../types';
import { TaskModal } from '../components/TaskModal';
import { PlusIcon, ChevronDownIcon } from '../components/Icons';
import { TaskItem } from '../components/TaskItem';

// Sub-component for the progress bar
const ProgressBar: FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-black/30 rounded-full h-4 my-6 overflow-hidden backdrop-blur-sm">
        <div
            className="bg-[#156193] h-4 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${value}%` }}
        ></div>
    </div>
);

// Main Dashboard Component
export const Dashboard: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTagId, setSelectedTagId] = useState<string | 'all'>('all');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState<{ [key in TaskType]: string }>({ Relevant: '', Maintenance: '' });

    const handleAddTask = (type: TaskType) => {
        const title = newTaskTitle[type].trim();
        if (!title) return;

        const newTask: Task = {
            id: `task-${Date.now()}`,
            title,
            description: '',
            type,
            completed: false,
            dueDate: null,
            priority: state.settings.priorities[state.settings.priorities.length - 1] || 'Normal',
            tagId: null,
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_TASK', payload: newTask });
        setNewTaskTitle(prev => ({ ...prev, [type]: '' }));
    };

    const filteredTasks = useMemo(() => {
        return state.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTag = selectedTagId === 'all' || task.tagId === selectedTagId;
            return matchesSearch && matchesTag;
        });
    }, [state.tasks, searchTerm, selectedTagId]);
    
    const progress = useMemo(() => {
        if (state.tasks.length === 0) return 0;

        const relevantTasks = state.tasks.filter(t => t.type === TaskType.Relevant);
        const maintenanceTasks = state.tasks.filter(t => t.type === TaskType.Maintenance);

        let currentProgress = 0;
        
        if (relevantTasks.length > 0) {
            const relevantWeight = 80 / relevantTasks.length;
            const completedRelevant = relevantTasks.filter(t => t.completed).length;
            currentProgress += completedRelevant * relevantWeight;
        }

        if (maintenanceTasks.length > 0) {
            const maintenanceWeight = 20 / maintenanceTasks.length;
            const completedMaintenance = maintenanceTasks.filter(t => t.completed).length;
            currentProgress += completedMaintenance * maintenanceWeight;
        }

        return Math.round(currentProgress);

    }, [state.tasks]);
    
    const EmptyState: FC = () => (
      <div className="text-center py-10">
        <p className="text-gray-400">No hay tareas aquí. <br/> ¡Añade una para empezar!</p>
      </div>
    );

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="relative w-full sm:w-auto">
                    <select
                        value={selectedTagId}
                        onChange={e => setSelectedTagId(e.target.value)}
                        className="w-full sm:w-auto bg-black/30 text-white rounded-md py-2 pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#156193] transition-all backdrop-blur-sm"
                    >
                        <option value="all">Todos los Proyectos</option>
                        {state.tags.map(tag => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
                </div>
                <input
                    type="text"
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/3 bg-black/30 border-transparent rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#156193] transition-all backdrop-blur-sm"
                />
            </div>

            <ProgressBar value={progress} />

            {/* Task Columns */}
            <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
                {[TaskType.Relevant, TaskType.Maintenance].map(type => (
                    <div key={type} className="flex-1">
                        <h2 className="text-2xl font-semibold mb-4 text-center">{type}</h2>
                        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 space-y-3 min-h-[50vh] border border-white/10 shadow-2xl">
                            <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                                <PlusIcon className="h-5 w-5 text-gray-400"/>
                                <input
                                    type="text"
                                    placeholder={`+ Añadir una tarea ${type === TaskType.Relevant ? 'Relevante' : 'de Mantenimiento'}`}
                                    value={newTaskTitle[type]}
                                    onChange={e => setNewTaskTitle(prev => ({...prev, [type]: e.target.value}))}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTask(type)}
                                    className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none"
                                />
                            </div>
                            <div className="pt-2 space-y-3">
                                {filteredTasks.filter(t => t.type === type).length === 0 ? <EmptyState /> : 
                                  filteredTasks.filter(t => t.type === type)
                                    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((task, index) => (
                                      <TaskItem key={task.id} task={task} onEdit={setEditingTaskId} style={{ animationDelay: `${index * 50}ms` }} />
                                  ))
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {editingTaskId && <TaskModal taskId={editingTaskId} onClose={() => setEditingTaskId(null)} />}
        </div>
    );
};

export default Dashboard;