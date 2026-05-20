import { useEffect, useState } from 'react';
import api from '../api/client';

const normalizeStatus = (status) => {
  if (typeof status !== 'string') return '';

  const normalized = status.trim().toLowerCase();
  if (normalized === 'to do') return 'todo';
  if (normalized === 'in progress') return 'in-progress';
  if (normalized === 'completed') return 'done';

  return normalized;
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ projects: 0, tasks: 0, todo: 0, inProgress: 0, done: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks'),
        ]);

        const tasks = tasksRes.data;
        setStats({
          projects: projectsRes.data.length,
          tasks: tasks.length,
          todo: tasks.filter((t) => normalizeStatus(t.status) === 'todo').length,
          inProgress: tasks.filter((t) => normalizeStatus(t.status) === 'in-progress').length,
          done: tasks.filter((t) => normalizeStatus(t.status) === 'done').length,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="panel">Loading dashboard...</div>;
  if (error) return <div className="panel error">{error}</div>;

  const statItems = [
    { id: 'projects', label: 'Projects', value: stats.projects },
    { id: 'tasks', label: 'Total Tasks', value: stats.tasks },
    { id: 'todo', label: 'To Do', value: stats.todo },
    { id: 'inProgress', label: 'In Progress', value: stats.inProgress },
    { id: 'done', label: 'Done', value: stats.done },
  ];

  return (
    <section>
      <h1>Dashboard</h1>

      <div className="card-grid">
        {statItems.map((s) => (
          <div key={s.id} className="stat-card">
            <div className="stat-card-header">
              <h3 className="stat-label">{s.label}</h3>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-progress">
              <div
                className="stat-progress-fill"
                style={{ width: `${Math.min(100, Math.round((s.value / Math.max(1, stats.tasks || 1)) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="content">
        <h3 style={{ marginTop: '1.2rem' }}>Recent Projects</h3>
        <div className="project-cards panel">
          {/* placeholder cards; replace with API-driven project list if desired */}
          <div className="project-card">
            <h4>Example Project A</h4>
            <p className="muted">3 tasks • 2 members</p>
          </div>
          <div className="project-card">
            <h4>Example Project B</h4>
            <p className="muted">5 tasks • 4 members</p>
          </div>
          <div className="project-card">
            <h4>Example Project C</h4>
            <p className="muted">1 task • 1 member</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
