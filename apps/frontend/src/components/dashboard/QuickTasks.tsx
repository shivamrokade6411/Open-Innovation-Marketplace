'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Check, ClipboardList } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addTask, deleteTask, toggleTaskCompleted } from '../../store/dashboardSlice';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function QuickTasks(): JSX.Element {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.dashboard.tasks);

  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskLabel.trim()) return;

    dispatch(addTask({ label: newTaskLabel, priority }));
    setNewTaskLabel('');
    setShowAddForm(false);
  };

  const getPriorityBadge = (p: 'low' | 'medium' | 'high') => {
    const variantMap = {
      low: 'gray',
      medium: 'warning',
      high: 'danger'
    } as const;
    return <Badge variant={variantMap[p]}>{p}</Badge>;
  };

  return (
    <Card variant="glass" className="space-y-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase font-mono">
            Quick Tasks
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
            Manage your personal platform checklists
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/5"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add Task Form Inline */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddTask}
            className="space-y-3 p-3 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden"
          >
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-surface-card-dark px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-105 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                  Priority:
                </span>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                      priority === p
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-black'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs rounded-lg px-2" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="h-7 text-xs rounded-lg px-3">
                  Add
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task Checklist Items */}
      <div className="flex-grow space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 gap-2">
            <ClipboardList className="h-8 w-8 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">No tasks listed</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/20 dark:bg-slate-900/10 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => dispatch(toggleTaskCompleted(task.id))}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                      task.completed
                        ? 'bg-success border-success text-white scale-95'
                        : 'border-slate-300 dark:border-white/10 hover:border-primary/50'
                    }`}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <motion.span
                    animate={{
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.45 : 1
                    }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight select-none cursor-pointer"
                    onClick={() => dispatch(toggleTaskCompleted(task.id))}
                  >
                    {task.label}
                  </motion.span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getPriorityBadge(task.priority)}
                  <button
                    onClick={() => dispatch(deleteTask(task.id))}
                    className="text-slate-400 hover:text-danger hover:scale-105 transition-all p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}
