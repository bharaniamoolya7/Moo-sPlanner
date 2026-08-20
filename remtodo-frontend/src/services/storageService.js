import api from './api';

// Helper to get local storage key for a user and data type
const getKey = (userId, type) => `moosplanner_${type}_${userId || 'guest'}`;

// Initial default seed items for brand new users
const DEFAULT_SEED_DATA = {
  reminders: [
    {
      id: 'seed-rem-1',
      title: 'Take a break & drink water 🍵',
      description: 'Remember to stay hydrated while coding!',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '15:00',
      repeat: 'daily',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-rem-2',
      title: 'Review weekly goals ⭐',
      description: 'Check progress on study & project tasks',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '19:00',
      repeat: 'weekly',
      completed: false,
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 'seed-task-1',
      title: 'Complete today\'s study targets 📖',
      description: 'Focus for 45 minutes on core topics',
      priority: 'High',
      category: 'Study',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '18:00',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-task-2',
      title: 'Push code changes to repo 💻',
      description: 'Clean up components and save state',
      priority: 'Medium',
      category: 'Coding',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '20:00',
      completed: false,
      createdAt: new Date().toISOString()
    }
  ],
  notes: [
    {
      id: 'seed-note-1',
      title: 'Cozy moo\'splanner Ideas 💡',
      content: 'Remember to track daily progress and keep reminders updated!',
      category: 'Ideas',
      pinned: true,
      tags: ['moosplanner', 'plans'],
      createdAt: new Date().toISOString()
    }
  ],
  goals: [
    {
      id: 'seed-goal-1',
      title: 'Solve 50 Coding Problems 🚀',
      description: 'Practice problem solving daily',
      target: 50,
      current: 12,
      unit: 'problems',
      deadline: '',
      completed: false,
      createdAt: new Date().toISOString()
    }
  ],
  projects: []
};

export const storageService = {
  // Read items (combines API fetch + LocalStorage fallback)
  async getItems(userId, type, endpoint) {
    const storageKey = getKey(userId, type);
    let localData = [];

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        localData = JSON.parse(stored);
      } else if (DEFAULT_SEED_DATA[type]) {
        localData = DEFAULT_SEED_DATA[type];
        localStorage.setItem(storageKey, JSON.stringify(localData));
      }
      
      // Remove legacy seed projects if present
      if (type === 'projects' && Array.isArray(localData)) {
        const cleaned = localData.filter(i => !String(i.id).startsWith('seed-proj-'));
        if (cleaned.length !== localData.length) {
          localData = cleaned;
          localStorage.setItem(storageKey, JSON.stringify(cleaned));
        }
      }
    } catch (e) {
      console.warn('Failed to parse local storage:', e);
    }

    if (!endpoint) return localData;

    try {
      const res = await api.get(endpoint);
      if (res.data && Array.isArray(res.data)) {
        // Map backend repeatSchedule to repeat for reminders
        const serverItems = res.data.map(item => ({
          ...item,
          repeat: item.repeat || item.repeatSchedule || 'none'
        }));
        
        // Merge with local items that might only exist locally
        const serverIds = new Set(serverItems.map(i => String(i.id)));
        const unsyncedLocals = localData.filter(i => (String(i.id).startsWith('seed-') || String(i.id).startsWith('local-')) && !String(i.id).startsWith('seed-proj-'));
        
        const combined = [...serverItems, ...unsyncedLocals.filter(i => !serverIds.has(String(i.id)))];
        localStorage.setItem(storageKey, JSON.stringify(combined));
        return combined;
      }
    } catch (err) {
      console.log(`Backend offline or endpoint failed for ${type}, using local storage.`, err);
    }

    return localData;
  },

  // Create or Update item
  async saveItem(userId, type, itemData, endpoint, itemId = null) {
    const storageKey = getKey(userId, type);
    let currentItems = [];

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) currentItems = JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read error:', e);
    }

    // Format item for frontend state and local storage
    const tempId = itemId || (editing => editing ? editing : `local-${Date.now()}`)(itemId);
    const formattedItem = {
      ...itemData,
      id: itemId || tempId,
      repeat: itemData.repeat || itemData.repeatSchedule || 'none',
      createdAt: itemData.createdAt || new Date().toISOString()
    };

    // Optimistically update local storage
    let updatedList;
    if (itemId) {
      updatedList = currentItems.map(item => String(item.id) === String(itemId) ? { ...item, ...formattedItem } : item);
    } else {
      updatedList = [formattedItem, ...currentItems];
    }
    localStorage.setItem(storageKey, JSON.stringify(updatedList));

    if (!endpoint) return formattedItem;

    // Try backend persistence
    try {
      const backendPayload = {
        ...itemData,
        repeatSchedule: itemData.repeat || itemData.repeatSchedule || 'none'
      };

      let res;
      if (itemId && !String(itemId).startsWith('local-') && !String(itemId).startsWith('seed-')) {
        res = await api.put(`${endpoint}/${itemId}`, backendPayload);
      } else {
        res = await api.post(endpoint, backendPayload);
      }

      if (res.data) {
        const savedServerItem = {
          ...res.data,
          repeat: res.data.repeat || res.data.repeatSchedule || 'none'
        };

        // Replace optimistic local item with actual server item
        updatedList = updatedList.map(i => (String(i.id) === String(formattedItem.id) ? savedServerItem : i));
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
        return savedServerItem;
      }
    } catch (err) {
      console.log(`Backend save failed for ${type}, preserved in local storage.`, err);
    }

    return formattedItem;
  },

  // Delete item
  async deleteItem(userId, type, itemId, endpoint) {
    const storageKey = getKey(userId, type);
    let currentItems = [];

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) currentItems = JSON.parse(stored);
      const updatedList = currentItems.filter(item => String(item.id) !== String(itemId));
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Storage delete error:', e);
    }

    if (endpoint && !String(itemId).startsWith('local-') && !String(itemId).startsWith('seed-')) {
      try {
        await api.delete(`${endpoint}/${itemId}`);
      } catch (err) {
        console.log(`Backend delete failed for ${type}, deleted locally.`, err);
      }
    }
  }
};
