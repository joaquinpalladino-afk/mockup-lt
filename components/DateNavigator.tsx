
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
      <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-gray-200">
        <ChevronLeft />
      </button>
      <h2 className="text-lg font-semibold mx-4">{formattedDate}</h2>
      <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-gray-200">
        <ChevronRight />
      </button>
    </div>
  );
};

export default DateNavigator;
