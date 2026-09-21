import { create } from 'zustand';
import type { Action, TaskStatus, SeverityLevel } from '../../shared/types';
import { db } from '../../data/db';

interface TasksStoreState {
  tasks: Action[];
  filter: 'all' | 'critical' | 'todo' | 'done';
  isLoading: boolean;
  loadTasks: () => Promise<void>;
  setFilter: (filter: 'all' | 'critical' | 'todo' | 'done') => void;
  toggleTaskStatus: (id: string) => Promise<void>;
  createTask: (params: {
    title: string;
    description?: string;
    assignee?: string;
    priority: SeverityLevel;
    dueDate?: string;
  }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksStoreState>((set, get) => ({
  tasks: [],
  filter: 'all',
  isLoading: false,

  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const allTasks = await db.actions.toArray();
      set({ tasks: allTasks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setFilter: (filter) => set({ filter }),

  toggleTaskStatus: async (id: string) => {
    const task = await db.actions.get(id);
    if (!task) return;

    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    const isCompleted = nextStatus === 'done';

    const updated: Action = {
      ...task,
      status: nextStatus,
      isCompleted,
    };

    await db.actions.put(updated);
    set({
      tasks: get().tasks.map((t) => (t.id === id ? updated : t)),
    });
  },

  createTask: async (params) => {
    const newTask: Action = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: params.title,
      description: params.description,
      assignee: params.assignee,
      priority: params.priority,
      status: 'todo',
      dueDate: params.dueDate,
      isCompleted: false,
    };

    await db.actions.put(newTask);
    set({ tasks: [newTask, ...get().tasks] });
  },

  deleteTask: async (id: string) => {
    await db.actions.delete(id);
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },
}));
