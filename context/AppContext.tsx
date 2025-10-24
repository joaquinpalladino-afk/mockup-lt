import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { AppState, Action, AppContextType, Tag, Task } from '../types';
import { TaskType, Repeat } from '../types';

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
    case 'TOGGLE_TASK_COMPLETION': {
      let newTasks = [...state.tasks];
      const taskIndex = newTasks.findIndex(task => task.id === action.payload.id);
      if (taskIndex === -1) return state;

      const originalTask = newTasks[taskIndex];
      const completed = !originalTask.completed;

      newTasks[taskIndex] = { ...originalTask, completed };

      // When a recurring task is completed, create a new task for the next occurrence.
      if (completed && originalTask.repeat && originalTask.repeat !== Repeat.None) {
        
        // Ensure we have a valid due date to work from.
        if (!originalTask.dueDate) return { ...state, tasks: newTasks };

        const hasTime = originalTask.dueDate.includes('T');
        
        // new Date() can be tricky with YYYY-MM-DD format (parses as UTC).
        // To handle it safely, we can append time to ensure it's parsed as local time.
        const dateStringToParse = hasTime ? originalTask.dueDate : `${originalTask.dueDate}T00:00`;
        const newDueDate = new Date(dateStringToParse);

        if (originalTask.repeat === Repeat.Daily) {
          newDueDate.setDate(newDueDate.getDate() + 1);
        } else if (originalTask.repeat === Repeat.Weekly) {
          newDueDate.setDate(newDueDate.getDate() + 7);
        }

        let newDueDateString: string;
        const year = newDueDate.getFullYear();
        const month = String(newDueDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDueDate.getDate()).padStart(2, '0');

        if (hasTime) {
            // Format back to YYYY-MM-DDTHH:mm to match datetime-local input
            const hours = String(newDueDate.getHours()).padStart(2, '0');
            const minutes = String(newDueDate.getMinutes()).padStart(2, '0');
            newDueDateString = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            // Format back to YYYY-MM-DD
            newDueDateString = `${year}-${month}-${day}`;
        }

        const repeatedTask: Task = {
          ...originalTask,
          id: `task-${Date.now()}`,
          completed: false,
          dueDate: newDueDateString,
          createdAt: new Date().toISOString(),
        };
        newTasks.push(repeatedTask);
      }

      return { ...state, tasks: newTasks };
    }
    case 'ADD_TAG': {
        const tagExists = state.tags.some(tag => tag.name.toLowerCase() === action.payload.name.toLowerCase());
        if (tagExists) return state;
        return { ...state, tags: [...state.tags, action.payload] };
    }
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    default:
      return state;
  }
};

const getInitialState = (): AppState => {
  try {
    const item = window.localStorage.getItem('loomtaskState');
    if (item) {
        const parsed = JSON.parse(item);
        if (parsed.user && parsed.settings && parsed.tags && parsed.tasks && parsed.selectedDate) {
            return { ...parsed, selectedDate: new Date() };
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
    selectedDate: new Date(),
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