import { useEffect, useState } from 'react';
import api from '../api/client';

const normalizeStatus = (status) => {
  if (typeof status !== 'string') return 'todo';

  const normalized = status.trim().toLowerCase();
  if (normalized === 'to do') return 'todo';
  if (normalized === 'in progress') return 'in-progress';
  if (normalized === 'completed') return 'done';

  return normalized;
};

const defaultTask = {
  title: '',
  description: '',
  projectId: '',
  assignedTo: '',
};

const statusOptions = ['todo', 'in-progress', 'done'];

const isValidUserId = (value) => {
  const trimmed = value.trim();
  return trimmed === '' || /^[a-f\d]{24}$/i.test(trimmed);
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(defaultTask);
  const [filterProjectId, setFilterProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data);
    if (data.length && !form.projectId) {
      setForm((prev) => ({ ...prev, projectId: data[0]._id }));
    }
  };

  const fetchTasks = async (projectId = '') => {
    setLoading(true);
    setError('');
    try {
      const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
      const { data } = await api.get(endpoint);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        await fetchProjects();
        await fetchTasks();
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load page data');
      }
    };

    loadPageData();
  }, []);

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await api.post('/tasks', {
        ...form,
        assignedTo: form.assignedTo || null,
      });
      setForm((prev) => ({ ...defaultTask, projectId: prev.projectId }));
      fetchTasks(filterProjectId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setError('');
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      fetchTasks(filterProjectId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssign = async (taskId, userId) => {
    const trimmedUserId = userId.trim();

    if (!isValidUserId(trimmedUserId)) {
      setError('User ID must be a valid 24-character MongoDB ObjectId or left empty');
      return;
    }

    setError('');
    try {
      await api.patch(`/tasks/${taskId}/assign`, { userId: trimmedUserId || null });
      fetchTasks(filterProjectId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const handleDelete = async (taskId) => {
    setError('');
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks(filterProjectId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <section>
      <h1>Tasks</h1>

      <form className="panel" onSubmit={handleCreateTask}>
        <h3>Create Task</h3>
        <input
          type="text"
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
        <textarea
          placeholder="Task description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
        <select
          value={form.projectId}
          onChange={(e) => setForm((prev) => ({ ...prev, projectId: e.target.value }))}
          required
        >
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Assign user ID (optional)"
          value={form.assignedTo}
          onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
        />
        <button type="submit">Create Task</button>
      </form>

      <div className="panel">
        <h3>Filter Tasks</h3>
        <select
          value={filterProjectId}
          onChange={(e) => {
            const value = e.target.value;
            setFilterProjectId(value);
            fetchTasks(value);
          }}
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="panel error">{error}</div>}
      {loading ? (
        <div className="panel">Loading tasks...</div>
      ) : (
        <div className="stack">
          {tasks.map((task) => (
            <article className="panel" key={task._id}>
              <h3>{task.title}</h3>
              <p>{task.description || 'No description'}</p>
              <p>
                <strong>Project:</strong> {task.project?.name || 'Unknown'}
              </p>
              <p>
                <strong>Assigned:</strong> {task.assignedTo?.name || task.assignedTo?._id || 'Unassigned'}
              </p>

              <div className="actions">
                <select
                  value={normalizeStatus(task.status)}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="User ID"
                  defaultValue={task.assignedTo?._id || ''}
                  onBlur={(e) => handleAssign(task._id, e.target.value)}
                />
                <button type="button" className="danger" onClick={() => handleDelete(task._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {tasks.length === 0 && <div className="panel">No tasks yet.</div>}
        </div>
      )}
    </section>
  );
};

export default TasksPage;
