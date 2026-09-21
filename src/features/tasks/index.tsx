import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { EmptyState, ActionCard, FilterChip, Button } from '../../components';
import { useTasksStore } from '../../lib/stores';
import { resetDemoData } from '../../data/db';

export const TasksScreen: React.FC = () => {
  const { tasks, filter, loadTasks, setFilter, toggleTaskStatus, createTask } = useTasksStore();
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask({
      title: newTaskTitle.trim(),
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'critical') return t.priority === 'critical' || t.priority === 'high';
    if (filter === 'todo') return t.status !== 'done';
    if (filter === 'done') return t.status === 'done';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm transition-colors">
        <div>
          <h2 className="text-heading-sm font-bold text-text-primary">
            Action Items & Punch Lists
          </h2>
          <p className="text-metadata text-text-muted mt-0.5">
            Auto-extracted from voice memos & field inspection findings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            Add Task
          </Button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
          <h3 className="text-body-sm font-semibold text-text-primary">New Action Item</h3>
          <input
            type="text"
            placeholder="Describe action item (e.g. Tighten flange bolts on Line 3)..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Create Item
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
                  ? tasks.filter((t) => t.status !== 'done').length
                  : tasks.filter((t) => t.status === 'done').length
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
