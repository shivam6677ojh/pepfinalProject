import { useEffect, useState } from 'react';
import api from '../api/client';

const defaultForm = { name: '', description: '' };

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, form);
      } else {
        await api.post('/projects', form);
      }
      setForm(defaultForm);
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setForm({ name: project.name, description: project.description || '' });
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <section>
      <h1>Projects</h1>

      <form className="panel" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Update Project' : 'Create Project'}</h3>
        <input
          type="text"
          placeholder="Project name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
        <div className="actions">
          <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(defaultForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <div className="panel error">{error}</div>}
      {loading ? (
        <div className="panel">Loading projects...</div>
      ) : (
        <div className="stack">
          {projects.map((project) => (
            <article key={project._id} className="panel">
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
              <div className="actions">
                <button type="button" onClick={() => handleEdit(project)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => handleDelete(project._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {projects.length === 0 && <div className="panel">No projects yet.</div>}
        </div>
      )}
    </section>
  );
};

export default ProjectsPage;
