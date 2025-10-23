import React, { useState, useMemo, FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import type { Task } from '../types';
import { TaskType } from '../types';
import { TaskModal } from '../components/TaskModal';
import { PlusIcon, ChevronDownIcon, CheckCircleIcon } from '../components/Icons';
import { TaskItem } from '../components/TaskItem';

// Sub-component for the progress bar
const ProgressBar: FC<{ value: number }> = ({ value }) => (
    <div className="flex items-center gap-4">
        <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden backdrop-blur-sm">
            <motion.div
                className="bg-[#156193] h-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            />
        </div>
        <span className="text-white font-semibold">{value}%</span>
    </div>
);

const CompletionCelebration = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center justify-center p-6 bg-green-500/20 rounded-lg my-4 backdrop-blur-sm border border-green-500/50"
    >
        <CheckCircleIcon className="h-12 w-12 text-green-400 mb-2" />
        <h3 className="text-xl font-bold text-white">¡Felicidades!</h3>
        <p className="text-green-300">Has completado todas tus tareas.</p>
    </motion.div>
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

            <div className="my-6">
                <ProgressBar value={progress} />
                {progress === 100 && <CompletionCelebration />}
            </div>

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
                                <AnimatePresence>
                                    {filteredTasks.filter(t => t.type === type).length === 0 ? <EmptyState /> : 
                                    filteredTasks.filter(t => t.type === type)
                                        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .map((task, index) => (
                                        <TaskItem key={task.id} task={task} onEdit={setEditingTaskId} style={{ animationDelay: `${index * 50}ms` }} />
                                    ))}
                                </AnimatePresence>
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