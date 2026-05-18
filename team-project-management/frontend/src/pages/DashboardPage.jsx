import { useEffect, useState } from 'react';
import api from '../api/client';

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
          todo: tasks.filter((t) => t.status === 'todo').length,
          inProgress: tasks.filter((t) => t.status === 'in-progress').length,
          done: tasks.filter((t) => t.status === 'done').length,
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

  return (
    <section>
      <h1>Dashboard</h1>
      <div className="grid">
        <article className="panel">
          <h3>Projects</h3>
          <p>{stats.projects}</p>
        </article>
        <article className="panel">
          <h3>Total Tasks</h3>
          <p>{stats.tasks}</p>
        </article>
        <article className="panel">
          <h3>To Do</h3>
          <p>{stats.todo}</p>
        </article>
        <article className="panel">
          <h3>In Progress</h3>
          <p>{stats.inProgress}</p>
        </article>
        <article className="panel">
          <h3>Done</h3>
          <p>{stats.done}</p>
        </article>
      </div>
    </section>
  );
};

export default DashboardPage;
