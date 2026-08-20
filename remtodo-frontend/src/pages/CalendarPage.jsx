import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import './CalendarPage.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadEvents();
  }, [user?.id, month, year]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [tasksData, remindersData, projectsData, goalsData] = await Promise.all([
        storageService.getItems(user?.id, 'tasks', `/api/tasks/user/${user?.id}`),
        storageService.getItems(user?.id, 'reminders', `/api/reminders/user/${user?.id}`),
        storageService.getItems(user?.id, 'projects', `/api/projects/user/${user?.id}`),
        storageService.getItems(user?.id, 'goals', `/api/goals/user/${user?.id}`),
      ]);

      const taskEvents = (tasksData || [])
        .filter(t => t.dueDate)
        .map(t => ({ ...t, type: 'task', label: '✓ Task', date: t.dueDate }));

      const reminderEvents = (remindersData || [])
        .filter(r => r.dueDate)
        .map(r => ({ ...r, type: 'reminder', label: '🔔 Reminder', date: r.dueDate }));

      const projectEvents = (projectsData || [])
        .filter(p => p.deadline)
        .map(p => ({ ...p, type: 'project', label: '🗂 Project Deadline', date: p.deadline }));

      const goalEvents = (goalsData || [])
        .filter(g => g.deadline)
        .map(g => ({ ...g, type: 'goal', label: '⭐ Goal Target', date: g.deadline }));

      setEvents([...taskEvents, ...reminderEvents, ...projectEvents, ...goalEvents]);
    } catch (err) {
      console.warn('Error loading calendar events:', err);
    }
    setLoading(false);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1 className="page-title">📅 Calendar</h1>
      </div>

      <div className="pixel-card">
        <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
          <button className="cal-nav-btn" onClick={prevMonth}>◀</button>
          <span>{MONTHS[month]} {year}</span>
          <button className="cal-nav-btn" onClick={nextMonth}>▶</button>
        </div>
        <div className="pixel-card-body">
          {loading ? (
            <div className="loading-spinner" style={{ padding: 40 }}></div>
          ) : (
            <div className="cal-grid">
              {DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
              {cells.map((day, i) => {
                if (!day) return <div key={`e${i}`} className="cal-cell empty"></div>;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = getEventsForDay(day);
                const isToday = dateStr === today;
                const isSelected = selectedDay === day;
                return (
                  <div
                    key={day}
                    className={`cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className="cal-cell-num">{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="cal-cell-dots">
                        {dayEvents.slice(0, 4).map((e, j) => (
                          <span key={j} className={`cal-dot ${e.type}`}></span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected day events panel */}
      {selectedDay && (
        <div className="pixel-card" style={{ marginTop: 16 }}>
          <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
            <span>📅 Deadlines for {MONTHS[month]} {selectedDay}, {year}</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-pixel)' }}>{selectedEvents.length} items</span>
          </div>
          <div className="pixel-card-body">
            {selectedEvents.length > 0 ? selectedEvents.map(e => (
              <div key={e.id} className="cal-event-item">
                <span className={`cal-event-type ${e.type}`}>
                  {e.type === 'task' ? '✓' : e.type === 'reminder' ? '🔔' : e.type === 'project' ? '🗂' : '⭐'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, textDecoration: e.completed ? 'line-through' : 'none' }}>
                    {e.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--brown-muted)', marginTop: 2 }}>
                    <span className={`badge ${e.type === 'task' ? 'badge-pink' : e.type === 'project' ? 'badge-yellow' : 'badge-blue'}`}>
                      {e.label}
                    </span>
                    {e.priority && ` • Priority: ${e.priority}`}
                    {e.dueTime && ` • Time: ${e.dueTime}`}
                    {e.completed && ' • Completed ✓'}
                  </div>
                </div>
              </div>
            )) : <p className="dash-empty">No deadlines scheduled for this day</p>}
          </div>
        </div>
      )}
    </div>
  );
}
