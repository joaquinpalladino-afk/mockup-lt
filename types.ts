import * as React from 'react';

export enum TaskType {
  Relevant = 'Relevant',
  Maintenance = 'Maintenance',
}

export enum Repeat {
    None = 'None',
    Daily = 'Daily',
    Weekly = 'Weekly',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  completed: boolean;
  dueDate: string | null;
  priority: string;
  tagId: string | null;
  createdAt: string;
  repeat: Repeat;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Settings {
  priorities: string[];
  onboardingComplete: boolean;
}

export interface AppState {
  user: {
    name: string;
    avatarUrl: string;
  };
  settings: Settings;
  tags: Tag[];
  tasks: Task[];
  selectedDate: Date;
}

export type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'COMPLETE_ONBOARDING'; payload: { priorities: string[] } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: { id: string } }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'SET_SELECTED_DATE'; payload: Date };

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}