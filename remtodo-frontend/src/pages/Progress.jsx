import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Progress() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [tasks, notes, reminders, goals, problems, subjects, projects] = await Promise.allSettled([
        api.get(`/api/tasks/user/${user?.id}`),
        api.get(`/api/notes/user/${user?.id}`),
        api.get(`/api/reminders/user/${user?.id}`),
        api.get(`/api/goals/user/${user?.id}`),
        api.get(`/api/coding-problems/user/${user?.id}`),
        api.get(`/api/subjects/user/${user?.id}`),
        api.get(`/api/projects/user/${user?.id}`),
      ]);

      const t = tasks.status === 'fulfilled' ? tasks.value.data || [] : [];
      const n = notes.status === 'fulfilled' ? notes.value.data || [] : [];
      const r = reminders.status === 'fulfilled' ? reminders.value.data || [] : [];
      const g = goals.status === 'fulfilled' ? goals.value.data || [] : [];
      const p = problems.status === 'fulfilled' ? problems.value.data || [] : [];
      const s = subjects.status === 'fulfilled' ? subjects.value.data || [] : [];
      const pr = projects.status === 'fulfilled' ? projects.value.data || [] : [];

      setStats({
        tasksCompleted: t.filter(x => x.completed).length,
        tasksPending: t.filter(x => !x.completed).length,
        totalTasks: t.length,
        totalNotes: n.length,
        remindersActive: r.filter(x => !x.completed).length,
        totalReminders: r.length,
        goalsCompleted: g.filter(x => x.completed).length,
        goalsActive: g.filter(x => !x.completed).length,
        problemsSolved: p.filter(x => x.solved).length,
        totalProblems: p.length,
        subjectsCount: s.length,
        subjectsProgress: s.length > 0 ? Math.round(s.reduce((acc, sub) => {
          const topics = sub.topics || [];
          return acc + (topics.length > 0 ? (topics.filter(t => t.status === 'Completed').length / topics.length) * 100 : 0);
        }, 0) / s.length) : 0,
        projectsActive: pr.filter(x => x.status !== 'Completed').length,
        projectsCompleted: pr.filter(x => x.status === 'Completed').length,
      });
    } catch {}
    setLoading(false);
  };

  const StatCard = ({ icon, label, value, sub, color = 'badge-pink' }) => (
    <div className="pixel-card">
      <div className="pixel-card-body" style={{ textAlign: 'center', padding: '20px 16px' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 24, color: 'var(--mauve)', marginBottom: 4 }}>{value}</div>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--brown-text)', marginBottom: 4, letterSpacing: '0.5px' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--brown-muted)' }}>{sub}</div>}
      </div>
    </div>
  );

  if (loading) return <div className="loading-spinner" style={{ height: '50vh' }}></div>;

  const s = stats || {};

  return (
    <div className="tasks-page" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">📊 Progress</h1>
      </div>

      <div className="notes-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <StatCard icon="✓" label="Tasks Done" value={s.tasksCompleted || 0} sub={`${s.tasksPending || 0} pending`} />
        <StatCard icon="📝" label="Notes" value={s.totalNotes || 0} />
        <StatCard icon="🔔" label="Reminders" value={s.totalReminders || 0} sub={`${s.remindersActive || 0} active`} />
        <StatCard icon="💻" label="Problems Solved" value={s.problemsSolved || 0} sub={`of ${s.totalProblems || 0} total`} />
        <StatCard icon="📚" label="Subjects" value={s.subjectsCount || 0} sub={`${s.subjectsProgress || 0}% avg progress`} />
        <StatCard icon="⭐" label="Goals Done" value={s.goalsCompleted || 0} sub={`${s.goalsActive || 0} active`} />
        <StatCard icon="📁" label="Projects" value={(s.projectsActive || 0) + (s.projectsCompleted || 0)} sub={`${s.projectsCompleted || 0} completed`} />
        <StatCard icon="🏆" label="Total Items" value={(s.totalTasks || 0) + (s.totalNotes || 0) + (s.totalReminders || 0)} sub="Tasks + Notes + Reminders" />
      </div>

      {/* Progress bars section */}
      <div className="pixel-card" style={{ marginTop: 20 }}>
        <div className="pixel-card-header">📈 OVERVIEW</div>
        <div className="pixel-card-body">
          {[
            { label: 'Tasks Completion', pct: s.totalTasks > 0 ? Math.round((s.tasksCompleted / s.totalTasks) * 100) : 0 },
            { label: 'Coding Progress', pct: s.totalProblems > 0 ? Math.round((s.problemsSolved / s.totalProblems) * 100) : 0 },
            { label: 'Learning Progress', pct: s.subjectsProgress || 0 },
            { label: 'Goals Progress', pct: (s.goalsActive + s.goalsCompleted) > 0 ? Math.round((s.goalsCompleted / (s.goalsActive + s.goalsCompleted)) * 100) : 0 },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span>{item.label}</span>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9 }}>{item.pct}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${item.pct}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
