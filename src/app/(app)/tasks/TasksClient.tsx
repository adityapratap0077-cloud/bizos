'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
  type Column,
} from '@/components/ui';
import { useToast } from '@/components/Toast';
import { createTask, deleteTask, setTaskStatus, updateTask, type TaskInput } from '@/actions/tasks';
import { validateTask, type FieldErrors } from '@/lib/validations';
import { PRIORITY_BADGE_COLORS, TASK_BADGE_COLORS, formatDate } from '@/lib/display';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from '@/lib/types';

export type TaskWithCustomer = Task & { customer_name?: string };
export type CustomerOption = { id: string; name: string };

/* ── TaskForm (add + edit) ──────────────────────────────────────────────── */

const EMPTY_FORM: Required<TaskInput> = {
  title: '',
  description: '',
  due_date: '',
  priority: 'Medium',
  status: 'Todo',
  customer_id: '',
};

function TaskForm({
  open,
  onClose,
  initial,
  customers,
}: {
  open: boolean;
  onClose: () => void;
  initial: TaskWithCustomer | null;
  customers: CustomerOption[];
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<Required<TaskInput>>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form whenever the modal opens (add) or switches to a task (edit).
  const formKey = open ? (initial?.id ?? 'new') : 'closed';
  const [lastKey, setLastKey] = useState(formKey);
  if (formKey !== lastKey) {
    setLastKey(formKey);
    setErrors({});
    setValues(
      initial
        ? {
            title: initial.title ?? '',
            description: initial.description ?? '',
            due_date: initial.due_date ?? '',
            priority: initial.priority ?? 'Medium',
            status: initial.status ?? 'Todo',
            customer_id: initial.customer_id ?? '',
          }
        : EMPTY_FORM,
    );
  }

  const set =
    (field: keyof Required<TaskInput>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validateTask(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    const res = initial ? await updateTask(initial.id, values) : await createTask(values);
    setSubmitting(false);

    if (res.ok) {
      toast(initial ? 'Task updated.' : 'Task added.', 'success');
      onClose();
    } else {
      toast(res.error, 'error');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit task' : 'Add task'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={submitting}>
            {initial ? 'Save changes' : 'Add task'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="Title *" name="title" value={values.title} onChange={set('title')} error={errors.title} autoComplete="off" />
        <Textarea label="Description" name="description" rows={3} value={values.description} onChange={set('description')} error={errors.description} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Due date" name="due_date" type="date" value={values.due_date} onChange={set('due_date')} error={errors.due_date} />
          <Select
            label="Customer"
            name="customer_id"
            placeholder="No customer"
            value={values.customer_id}
            onChange={set('customer_id')}
            error={errors.customer_id}
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Priority"
            name="priority"
            value={values.priority}
            onChange={set('priority')}
            error={errors.priority}
            options={TASK_PRIORITIES.map((p) => ({ value: p, label: p }))}
          />
          <Select
            label="Status"
            name="status"
            value={values.status}
            onChange={set('status')}
            error={errors.status}
            options={TASK_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
      </form>
    </Modal>
  );
}

/* ── Tasks page client ──────────────────────────────────────────────────── */

type ViewFilter = 'all' | 'overdue' | 'today' | 'upcoming';

const VIEW_FILTERS: { value: ViewFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
];

export default function TasksClient({
  tasks,
  customers,
}: {
  tasks: TaskWithCustomer[];
  customers: CustomerOption[];
}) {
  const { toast } = useToast();
  const [view, setView] = useState<ViewFilter>('all');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskWithCustomer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskWithCustomer | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      const overdue = t.due_date != null && t.due_date < today && t.status !== 'Completed';
      switch (view) {
        case 'overdue':
          return overdue;
        case 'today':
          return t.due_date === today;
        case 'upcoming':
          return t.due_date != null && t.due_date > today;
        default:
          return true;
      }
    });
  }, [tasks, view, statusFilter, today]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: TaskWithCustomer) {
    setEditing(task);
    setFormOpen(true);
  }

  async function handleToggle(task: TaskWithCustomer) {
    const next: TaskStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
    setBusyId(task.id);
    const res = await setTaskStatus(task.id, next);
    setBusyId(null);
    if (res.ok) {
      toast(next === 'Completed' ? 'Task marked done.' : 'Task reopened.', 'success');
    } else {
      toast(res.error, 'error');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    const res = await deleteTask(deleteTarget.id);
    setBusyId(null);
    if (res.ok) {
      toast('Task deleted.', 'success');
      setDeleteTarget(null);
    } else {
      toast(res.error, 'error');
    }
  }

  const columns: Column<TaskWithCustomer>[] = [
    {
      header: 'Done',
      className: 'w-24',
      render: (t) => (
        <Button
          size="sm"
          variant={t.status === 'Completed' ? 'secondary' : 'primary'}
          onClick={() => handleToggle(t)}
          disabled={busyId === t.id}
          loading={busyId === t.id}
          aria-label={t.status === 'Completed' ? `Reopen ${t.title}` : `Mark ${t.title} done`}
        >
          {t.status === 'Completed' ? 'Reopen' : 'Mark done'}
        </Button>
      ),
    },
    {
      header: 'Title',
      render: (t) => (
        <div>
          <p className={`font-medium text-ink-900 ${t.status === 'Completed' ? 'line-through text-ink-400' : ''}`}>
            {t.title}
          </p>
          {t.description && (
            <p className="mt-0.5 max-w-xs truncate text-xs text-ink-500">{t.description}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Customer',
      render: (t) =>
        t.customer_name ? (
          <span className="text-xs">{t.customer_name}</span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      header: 'Due date',
      render: (t) => {
        const overdue = t.due_date != null && t.due_date < today && t.status !== 'Completed';
        return (
          <span
            className={`whitespace-nowrap text-xs ${overdue ? 'font-semibold text-clay-600' : ''}`}
          >
            {formatDate(t.due_date)}
          </span>
        );
      },
    },
    {
      header: 'Priority',
      render: (t) => <Badge color={PRIORITY_BADGE_COLORS[t.priority]}>{t.priority}</Badge>,
    },
    {
      header: 'Status',
      render: (t) => <Badge color={TASK_BADGE_COLORS[t.status]}>{t.status}</Badge>,
    },
    {
      header: 'Actions',
      className: 'whitespace-nowrap',
      render: (t) => (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => openEdit(t)} aria-label={`Edit ${t.title}`}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteTarget(t)}
            aria-label={`Delete ${t.title}`}
            className="text-clay-600 hover:bg-clay-50 hover:text-clay-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Everything that needs doing, in one list."
        actions={<Button onClick={openAdd}>Add task</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex w-fit rounded-lg border border-ink-200 bg-white p-1 shadow-sm"
          role="group"
          aria-label="Filter tasks by due date"
        >
          {VIEW_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setView(f.value)}
              aria-pressed={view === f.value}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === f.value
                  ? 'bg-pine-600 text-white'
                  : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="sm:w-48">
          <Select
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: 'All', label: 'All statuses' }, ...TASK_STATUSES.map((s) => ({ value: s, label: s }))]}
            aria-label="Filter by status"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
          description={
            tasks.length === 0
              ? 'Add your first task to start tracking work.'
              : 'Try a different filter.'
          }
          action={tasks.length === 0 ? <Button onClick={openAdd}>Add task</Button> : undefined}
        />
      ) : (
        <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} ariaLabel="Tasks" />
      )}

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} customers={customers} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task"
        message={`Delete "${deleteTarget?.title ?? 'this task'}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={busyId === deleteTarget?.id}
      />
    </div>
  );
}
