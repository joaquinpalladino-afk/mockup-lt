
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from './Icons';

const DateNavigator: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const handlePrevDay = () => {
    const newDate = new Date(state.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
  };

  const handleNextDay = () => {
    const newDate = new Date(state.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
  };

  const formattedDate = state.selectedDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-center my-4">
      <button
        onClick={handlePrevDay}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h2 className="text-lg font-semibold mx-4 w-64 text-center">{formattedDate}</h2>
      <button
        onClick={handleNextDay}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default DateNavigator;
