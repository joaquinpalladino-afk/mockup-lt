import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { TaskType } from '../types';

export const Notifications: React.FC = () => {
  const { state } = useAppContext();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const overdueTasks = state.tasks.filter(
    (task) => !task.completed && task.dueDate && new Date(task.dueDate) < now
  );

  const dueTodayTasks = state.tasks.filter(
    (task) => !task.completed && task.dueDate && task.dueDate.startsWith(todayStr)
  );
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];


  const relevantTasksOfYesterday = state.tasks.filter(
    t => t.type === TaskType.Relevant && t.createdAt.startsWith(yesterdayStr)
  );

  const relevantTasksCompletedYesterday = relevantTasksOfYesterday.filter(t => t.completed).length;
  
  const completionPercentage = relevantTasksOfYesterday.length > 0 
    ? Math.round((relevantTasksCompletedYesterday / relevantTasksOfYesterday.length) * 100) 
    : 0;

  const NotificationCard: React.FC<{children: React.ReactNode, style?: React.CSSProperties}> = ({ children, style }) => (
    <div 
        style={style}
        className="bg-[#444444] p-5 rounded-lg animate-fade-in-up transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl"
    >
      {children}
    </div>
  );


  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 animate-fade-in-up">Notificaciones</h1>

      <div className="space-y-10">
        {/* Alerts Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b-2 border-[#444444] pb-2 animate-fade-in-up" style={{animationDelay: '100ms'}}>Alertas</h2>
          <div className="space-y-4">
            {overdueTasks.length > 0 && (
              <NotificationCard style={{animationDelay: '200ms'}}>
                <h3 className="text-xl font-bold text-red-400 mb-2">Tareas Vencidas ({overdueTasks.length})</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {overdueTasks.map(task => (
                     <li key={task.id}><Link to="/" className="hover:underline">{task.title}</Link></li>
                  ))}
                </ul>
              </NotificationCard>
            )}
            {dueTodayTasks.length > 0 && (
              <NotificationCard style={{animationDelay: '300ms'}}>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">Tareas que vencen hoy ({dueTodayTasks.length})</h3>
                 <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {dueTodayTasks.map(task => (
                     <li key={task.id}><Link to="/" className="hover:underline">{task.title}</Link></li>
                  ))}
                </ul>
              </NotificationCard>
            )}
            {overdueTasks.length === 0 && dueTodayTasks.length === 0 && (
                 <NotificationCard style={{animationDelay: '200ms'}}>
                    <p className="text-gray-400 text-center py-4">No hay alertas importantes. ¡Buen trabajo!</p>
                 </NotificationCard>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b-2 border-[#444444] pb-2 animate-fade-in-up" style={{animationDelay: '400ms'}}>Logros</h2>
          <div className="space-y-4">
              <NotificationCard style={{animationDelay: '500ms'}}>
                <p className="text-lg text-green-400">
                    {
                        completionPercentage > 0 ? `¡Ayer completaste el ${completionPercentage}% de tus tareas Relevantes!` : "Sigue esforzándote para completar tus tareas relevantes."
                    }
                </p>
              </NotificationCard>
              <NotificationCard style={{animationDelay: '600ms'}}>
                <p className="text-lg text-green-400">¡Felicidades! Llevas 1 día seguido alcanzando tu objetivo.</p>
              </NotificationCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;