import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialNotifications, initialTasks, NotificationData, QuickTask } from '../lib/mockData';

export interface DashboardState {
  sidebarCollapsed: boolean;
  notifications: NotificationData[];
  tasks: QuickTask[];
}

const initialState: DashboardState = {
  sidebarCollapsed: false,
  notifications: initialNotifications,
  tasks: initialTasks,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) {
        notif.read = true;
      }
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach(n => {
        n.read = true;
      });
    },
    toggleTaskCompleted(state, action: PayloadAction<string>) {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    addTask(state, action: PayloadAction<{ label: string; priority: 'low' | 'medium' | 'high' }>) {
      state.tasks.unshift({
        id: `task-${Date.now()}`,
        label: action.payload.label,
        completed: false,
        priority: action.payload.priority,
      });
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    }
  }
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  markNotificationRead,
  markAllNotificationsRead,
  toggleTaskCompleted,
  addTask,
  deleteTask
} = dashboardSlice.actions;

export const dashboardReducer = dashboardSlice.reducer;
