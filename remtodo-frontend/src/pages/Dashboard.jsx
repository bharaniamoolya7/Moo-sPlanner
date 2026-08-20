import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PixelAvatar from '../components/PixelAvatar';
import CozyDeskRoom from '../components/CozyDeskRoom';
import { storageService } from '../services/storageService';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ studyTime: '1h 45m', codingTime: '2h 15m', completedTasks: 0, totalTasks: 0 });
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    const [fetchedTasks, fetchedReminders] = await Promise.all([
      storageService.getItems(user?.id, 'tasks', `/api/tasks/user/${user?.id}`),
      storageService.getItems(user?.id, 'reminders', `/api/reminders/user/${user?.id}`)
    ]);

    setTasks(fetchedTasks);
    setReminders(fetchedReminders);

    const doneCount = fetchedTasks.filter(t => t.completed).length;
    setStats(prev => ({
      ...prev,
      completedTasks: doneCount,
      totalTasks: fetchedTasks.length
    }));

    setLoading(false);
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => String(t.id) === String(taskId));
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    const saved = await storageService.saveItem(user?.id, 'tasks', updated, '/api/tasks', taskId);
    setTasks(prev => prev.map(t => String(t.id) === String(taskId) ? saved : t));
  };

  const avatarConfig = user?.avatarConfig || {};
  const activeReminders = reminders.filter(r => !r.completed);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">{greeting}, {user?.displayName || 'Friend'} ♡</h1>
          <p className="dashboard-date">📅 {dateStr}</p>
        </div>
        <div className="dashboard-xp-badge">
          <span className="pixel-font" style={{ fontSize: '8px' }}>Level 1</span>
          <span className="pixel-font" style={{ fontSize: '8px' }}>{stats.completedTasks * 20}/100 XP</span>
          <div className="progress-bar-container" style={{ width: 100, height: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, stats.completedTasks * 20)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="dashboard-grid">
        {/* My Space - pixel desk room */}
        <div className="pixel-card dash-space">
          <div className="pixel-card-header">🏠 MY SPACE</div>
          <div className="pixel-card-body dash-room">
            <CozyDeskRoom />
          </div>
        </div>

        {/* Buddy */}
        <div className="pixel-card dash-buddy">
          <div className="pixel-card-header">✦ BUDDY</div>
          <div className="pixel-card-body" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div className="dash-buddy-avatar">
              <PixelAvatar config={avatarConfig} size={64} />
            </div>
            <p className="dash-buddy-msg">
              &ldquo;You have <strong>{tasks.filter(t => !t.completed).length || 0} tasks</strong> &amp; <strong>{activeReminders.length} reminders</strong> today!
              Let&apos;s get them done!&rdquo;
            </p>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="pixel-card dash-tasks">
          <div className="pixel-card-header">☰ TODAY'S TASKS</div>
          <div className="pixel-card-body">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : tasks.length > 0 ? (
              <div className="dash-task-list">
                {tasks.slice(0, 5).map(task => (
                  <label key={task.id} className="pixel-checkbox dash-task-item">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className={task.completed ? 'task-text-done' : ''}>
                      {task.title}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="dash-empty">No tasks for today! Add some ♡</p>
            )}
            <Link to="/tasks" className="dash-view-all">View all tasks →</Link>
          </div>
        </div>

        {/* Activity */}
        <div className="pixel-card dash-activity">
          <div className="pixel-card-header">📊 ACTIVITY</div>
          <div className="pixel-card-body">
            <div className="activity-row">
              <span className="activity-label">Coding Activity</span>
              <span className="activity-time">{stats.codingTime}</span>
            </div>
            <div className="activity-blocks">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className={`activity-block ${i <= 4 ? 'filled' : ''}`}></div>
              ))}
            </div>
            <div className="activity-row" style={{ marginTop: 12 }}>
              <span className="activity-label">Study Time</span>
              <span className="activity-time">{stats.studyTime}</span>
            </div>
            <div className="activity-blocks">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className={`activity-block green ${i <= 3 ? 'filled' : ''}`}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="pixel-card dash-reminders">
          <div className="pixel-card-header">🔔 REMINDERS</div>
          <div className="pixel-card-body">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : activeReminders.length > 0 ? (
              activeReminders.slice(0, 3).map(rem => (
                <div key={rem.id} className="dash-reminder-item">
                  <span className="dash-reminder-icon">⏰</span>
                  <div>
                    <div className="dash-reminder-title">{rem.title}</div>
                    <div className="dash-reminder-time">
                      {rem.dueTime ? `⏰ ${rem.dueTime}` : (rem.dueDate ? `📅 ${rem.dueDate}` : 'Coming up')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="dash-empty">No upcoming reminders</p>
            )}
            <Link to="/reminders" className="dash-view-all">View all →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
