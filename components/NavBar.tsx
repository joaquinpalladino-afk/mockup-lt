import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BellIcon } from './Icons';
import { useAppContext } from '../context/AppContext';

export const NavBar: React.FC = () => {
  const { state } = useAppContext();
  const location = useLocation();

  const hasNewNotifications = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const overdue = state.tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date().toISOString());
    const dueToday = state.tasks.filter(t => !t.completed && t.dueDate && t.dueDate.startsWith(today));
    return overdue.length > 0 || dueToday.length > 0;
  }, [state.tasks]);

  return (
    <nav className="bg-[#1E1E1E] text-[#E0E0E0] p-4 flex justify-between items-center border-b border-[#444444] sticky top-0 z-30">
      <div className="text-2xl font-bold tracking-wider">
        <Link to="/" className="transition-colors hover:text-[#156193]">Loomtask</Link>
      </div>
      <div className="flex items-center space-x-4 md:space-x-6">
        <Link to="/notifications" className="relative transition-transform duration-200 hover:scale-110">
          <BellIcon className={`h-6 w-6 ${location.pathname === '/notifications' ? 'text-[#156193]' : 'text-gray-400 hover:text-white transition-colors'}`} />
          {hasNewNotifications && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#1E1E1E]"></span>}
        </Link>
        <div className="flex items-center space-x-3">
          <span className="font-medium hidden sm:inline">{state.user.name}</span>
          <img className="h-10 w-10 rounded-full object-cover border-2 border-[#444444]" src={state.user.avatarUrl} alt="User Avatar" />
        </div>
      </div>
    </nav>
  );
};