import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CalendarPage.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadEvents();
  }, [month, year]);

  const loadEvents = async () => {
    try {
      const [tasksRes, remindersRes] = await Promise.allSettled([
        api.get(`/api/tasks/user/${user?.id}`),
        api.get(`/api/reminders/user/${user?.id}`),
      ]);
      const taskEvents = (tasksRes.status === 'fulfilled' ? tasksRes.value.data : [])
        .filter(t => t.dueDate)
        .map(t => ({ ...t, type: 'task', date: t.dueDate }));
      const reminderEvents = (remindersRes.status === 'fulfilled' ? remindersRes.value.data : [])
        .filter(r => r.dueDate)
        .map(r => ({ ...r, type: 'reminder', date: r.dueDate }));
      setEvents([...taskEvents, ...reminderEvents]);
    } catch {}
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
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <span key={j} className={`cal-dot ${e.type === 'task' ? 'pink' : 'blue'}`}></span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="pixel-card" style={{ marginTop: 16 }}>
          <div className="pixel-card-header">
            📅 {MONTHS[month]} {selectedDay}, {year}
          </div>
          <div className="pixel-card-body">
            {selectedEvents.length > 0 ? selectedEvents.map(e => (
              <div key={e.id} className="cal-event-item">
                <span className={`cal-event-type ${e.type}`}>
                  {e.type === 'task' ? '✓' : '🔔'}
                </span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--brown-muted)' }}>
                    {e.type === 'task' ? 'Task' : 'Reminder'}
                    {e.completed && ' • Completed ✓'}
                    {e.dueTime && ` • ${e.dueTime}`}
                  </div>
                </div>
              </div>
            )) : <p className="dash-empty">No events on this day</p>}
          </div>
        </div>
      )}
    </div>
  );
}
