import React, { useEffect, useState } from 'react';
import { Plus, Bell, BellRing, CheckCircle2, Clock, Check } from 'lucide-react';
import { EmptyState, ActionCard, FilterChip, Button } from '../../components';
import { useTasksStore } from '../../lib/stores';
import { resetDemoData } from '../../data/db';

export const TasksScreen: React.FC = () => {
  const { tasks, filter, loadTasks, setFilter, toggleTaskStatus, createTask } = useTasksStore();
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('K. Rao');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, [loadTasks]);

  const handleRequestReminder = async (taskTitle?: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setReminderMessage('Notification API not supported by browser. In-app alerts remain active.');
      setTimeout(() => setReminderMessage(null), 4000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === 'granted') {
        const title = taskTitle || 'Tighten terminal lugs (Panel 204)';
        new Notification('FieldNote Task Reminder', {
          body: `Due before morning shift: ${title}`,
          icon: '/favicon.svg',
        });
        setReminderMessage(`Reminder set for morning shift: "${title}"`);
      } else {
        setReminderMessage('Browser notifications blocked in settings. In-app alerts remain active.');
      }
    } catch {
      setReminderMessage('Could not enable notifications. In-app alerts remain active.');
    }

    setTimeout(() => setReminderMessage(null), 4000);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask({
      title: newTaskTitle.trim(),
      assignee: newTaskAssignee.trim() || 'K. Rao (Electrical Team Lead)',
      priority: newTaskPriority,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const openTasks = tasks.filter((t) => t.status !== 'done' && !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.status === 'done' || t.isCompleted);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'critical') return t.priority === 'critical' || t.priority === 'high';
    if (filter === 'todo') return t.status !== 'done' && !t.isCompleted;
    if (filter === 'done') return t.status === 'done' || t.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-heading-sm font-bold text-text-primary">
              Action Items & Punch Lists
            </h1>
            <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
              {openTasks.length} OPEN
            </span>
          </div>
          <p className="text-metadata text-text-muted mt-0.5">
            Auto-extracted from voice memos & field inspection findings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={notificationStatus === 'granted' ? BellRing : Bell}
            onClick={() => handleRequestReminder()}
            title="Configure shift reminder notifications"
          >
            {notificationStatus === 'granted' ? 'Reminders Active' : 'Set Reminders'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Reminder notification toast */}
      {reminderMessage && (
        <div className="p-3.5 rounded-xl bg-bg-surface1 border border-semantic-green text-body-xs font-mono text-semantic-green flex items-center gap-2 shadow-md">
          <BellRing className="w-4 h-4 text-semantic-green shrink-0" />
          <span>{reminderMessage}</span>
        </div>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddTask}
          className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3.5 shadow-sm"
        >
          <h3 className="text-body-sm font-bold text-text-primary">
            Create Action Item
          </h3>
          <input
            type="text"
            placeholder="Describe action item (e.g. Torque flange bolts to 18 Nm)..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green focus:ring-1 focus:ring-semantic-green"
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-metadata-xs font-mono uppercase text-text-muted block mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-bg-surface2 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green"
              />
            </div>

            <div>
              <label className="text-metadata-xs font-mono uppercase text-text-muted block mb-1">
                Priority
              </label>
              <select
                value={newTaskPriority}
                onChange={(e) =>
                  setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')
                }
                className="w-full px-3 py-1.5 rounded-lg bg-bg-surface2 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green"
              >
                <option value="critical">CRITICAL</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" icon={Check}>
              Save Action Item
            </Button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['all', 'critical', 'todo', 'done'] as const).map((f) => (
            <FilterChip
              key={f}
              label={f.toUpperCase()}
              active={filter === f}
              onClick={() => setFilter(f)}
              count={
                f === 'all'
                  ? tasks.length
                  : f === 'critical'
                  ? tasks.filter((t) => t.priority === 'critical' || t.priority === 'high').length
                  : f === 'todo'
                  ? openTasks.length
                  : completedTasks.length
              }
            />
          ))}
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={Plus}
          badge="Punch list clear"
          title="Zero Outstanding Tasks"
          description="No outstanding punch list items. Action items extracted from notes and inspection reports will automatically sync here."
          actions={[
            {
              label: 'Load Seed Data',
              icon: Plus,
              onClick: async () => {
                await resetDemoData();
                await loadTasks();
              },
              variant: 'primary',
            },
          ]}
        />
      ) : filter === 'all' ? (
        <div className="space-y-6">
          {/* OPEN TASKS GROUP */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-semantic-amber-text flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Open Items ({openTasks.length})</span>
              </h3>
              <span className="text-metadata-xs text-text-muted font-mono">
                Tap checkbox to complete
              </span>
            </div>

            <div className="space-y-3">
              {openTasks.length === 0 ? (
                <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default text-text-muted text-metadata text-center">
                  All action items completed!
                </div>
              ) : (
                openTasks.map((task) => (
                  <ActionCard
                    key={task.id}
                    action={task}
                    onToggleStatus={(id) => toggleTaskStatus(id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* COMPLETED TASKS GROUP */}
          {completedTasks.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-semantic-green flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed Items ({completedTasks.length})</span>
                </h3>
              </div>

              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <ActionCard
                    key={task.id}
                    action={task}
                    onToggleStatus={(id) => toggleTaskStatus(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <ActionCard
              key={task.id}
              action={task}
              onToggleStatus={(id) => toggleTaskStatus(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

