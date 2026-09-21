import React, { useState } from 'react';
import { CheckSquare, Plus, CheckCircle2, Clock, Filter, Trash2 } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import type { FieldTask } from '../../shared/types';

export const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'todo' | 'done'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: FieldTask = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle.trim(),
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const handleCreateSampleTasks = () => {
    const samples: FieldTask[] = [
      {
        id: `tsk-${Date.now()}-1`,
        title: 'Replace burnt bushing contact lugs on Transformer B',
        priority: 'critical',
        status: 'todo',
        assignee: 'K. Rao (Electrical Team)',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: `tsk-${Date.now()}-2`,
        title: 'Recalibrate digital pressure transducer B-12',
        priority: 'high',
        status: 'in_progress',
        assignee: 'Field Tech S. Reddy',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      },
      {
        id: `tsk-${Date.now()}-3`,
        title: 'Perform secondary ground loop impedance test',
        priority: 'medium',
        status: 'done',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    setTasks(samples);
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
          : t
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'critical') return t.priority === 'critical';
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-body-sm font-semibold bg-semantic-green text-text-inverse hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          {tasks.length === 0 && (
            <button
              type="button"
              onClick={handleCreateSampleTasks}
              className="px-3 py-2 rounded-xl text-body-sm font-medium bg-bg-surface2 text-text-secondary border border-border-default hover:bg-bg-hover transition-colors"
            >
              Load Samples
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTask} className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-3">
          <h3 className="text-body-sm font-semibold text-text-primary">New Action Item</h3>
          <input
            type="text"
            placeholder="Describe action item (e.g. Tighten flange bolts on Line 3)..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-metadata text-text-secondary hover:bg-bg-surface2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-metadata font-semibold bg-semantic-green text-text-inverse hover:brightness-110"
            >
              Create Item
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-surface1 border border-border-default w-fit overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-text-muted ml-2 mr-1 shrink-0" />
          {(['all', 'critical', 'todo', 'done'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`
                px-3 py-1 rounded-lg text-metadata font-medium uppercase tracking-wider transition-colors
                ${
                  filter === f
                    ? 'bg-bg-surface2 text-text-primary font-bold shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          badge="Punch list clear"
          title="Zero Outstanding Tasks"
          description="No outstanding punch list items. Action items extracted from notes and inspection reports will automatically sync here."
          actions={[
            {
              label: 'Add Action Item',
              icon: Plus,
              onClick: () => setShowAddForm(true),
              variant: 'primary',
            },
            {
              label: 'Load Sample Tasks',
              icon: Plus,
              onClick: handleCreateSampleTasks,
              variant: 'secondary',
            },
          ]}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'done';
            return (
              <div
                key={task.id}
                className={`
                  flex items-start justify-between gap-3 p-4 rounded-xl border transition-all
                  ${
                    isDone
                      ? 'bg-bg-surface1/60 border-border-subtle opacity-75'
                      : 'bg-bg-surface1 border-border-default hover:border-border-strong'
                  }
                `}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleTaskStatus(task.id)}
                    className={`
                      mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0
                      ${
                        isDone
                          ? 'bg-semantic-green border-semantic-green text-text-inverse'
                          : 'border-border-strong hover:border-semantic-green bg-bg-surface2'
                      }
                    `}
                    aria-label={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <p className={`text-body-sm font-medium ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-metadata text-text-muted">
                      <span
                        className={`
                          px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase
                          ${
                            task.priority === 'critical'
                              ? 'bg-semantic-red-surface text-semantic-red-text border border-semantic-red-border'
                              : task.priority === 'high'
                              ? 'bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border'
                              : 'bg-bg-surface2 text-text-secondary border border-border-subtle'
                          }
                        `}
                      >
                        {task.priority}
                      </span>
                      {task.assignee && (
                        <span className="font-mono text-text-secondary truncate">
                          {task.assignee}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 font-mono text-text-muted">
                          <Clock className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-semantic-red hover:bg-bg-surface2 transition-colors shrink-0"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
