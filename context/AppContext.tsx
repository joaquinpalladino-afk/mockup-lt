
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { AppState, Action, AppContextType, Tag, Task } from '../types';
import { TaskType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        settings: {
          ...state.settings,
          priorities: action.payload.priorities,
          onboardingComplete: true,
        },
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      };
    case 'TOGGLE_TASK_COMPLETION':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    case 'ADD_TAG': {
        const tagExists = state.tags.some(tag => tag.name.toLowerCase() === action.payload.name.toLowerCase());
        if (tagExists) return state;
        return { ...state, tags: [...state.tags, action.payload] };
    }
    default:
      return state;
  }
};

const getInitialState = (): AppState => {
  try {
    const item = window.localStorage.getItem('loomtaskState');
    if (item) {
        const parsed = JSON.parse(item);
        // Basic validation to ensure we don't crash on malformed localStorage
        if (parsed.user && parsed.settings && parsed.tags && parsed.tasks) {
            return parsed;
        }
    }
  } catch (error) {
    console.error('Error reading from localStorage', error);
  }

  return {
    user: { name: 'Daniel Pérez', avatarUrl: `https://picsum.photos/seed/daniel/100/100` },
    settings: {
      priorities: [],
      onboardingComplete: false,
    },
    tags: [],
    tasks: [],
  };
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  useEffect(() => {
    try {
      window.localStorage.setItem('loomtaskState', JSON.stringify(state));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
