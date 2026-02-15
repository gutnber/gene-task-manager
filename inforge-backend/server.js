/**
 * Inforge Backend API - Gene Task Manager
 * API REST completa para gestión de tareas
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');
const API_KEY = process.env.API_KEY || 'ik_e9e6dfc89c2b2fdcff23a652ad0e6f7a';

app.use(cors());
app.use(express.json());

// Auth middleware
const auth = (req, res, next) => {
  const key = req.headers.authorization?.replace('Bearer ', '');
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Read tasks
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // Initial seed data
    return [
      {
        id: '1',
        title: '🎨 Mejorar diseño visual ProTask Kanban',
        description: 'Implementar tablero Kanban con 3 columnas',
        priority: 'high',
        status: 'completed',
        notes: '✅ Completado - URL: https://protask-todo-appgit-7256-39785.web.app/',
        createdAt: '2026-02-15T09:09:00Z',
        updatedAt: '2026-02-15T16:00:00Z'
      },
      {
        id: '2',
        title: '📊 Crear Plan de Negocios Serviclima El Muñoz',
        description: 'Plan completo con proyecciones financieras para inversionistas',
        priority: 'high',
        status: 'completed',
        notes: '✅ Completado - Inversión: $275,800 MXN - ROI: 46.4%',
        createdAt: '2026-02-15T07:15:00Z',
        updatedAt: '2026-02-15T08:30:00Z'
      },
      {
        id: '3',
        title: '📖 Configurar mensaje diario 9 AM versículo bíblico',
        description: 'Cron job para enviar versículos diarios',
        priority: 'high',
        status: 'completed',
        notes: '✅ Completado - Cron ID: 96192f06-45ff-42fa-a301-4f3bc5880189',
        createdAt: '2026-02-15T02:09:00Z',
        updatedAt: '2026-02-15T09:00:00Z'
      },
      {
        id: '4',
        title: '💕 Crear mensaje de amor bíblico para esposa',
        description: 'Mensaje basado en 1 Corintios 13:4-8, Proverbios 31:10, Eclesiastes 4:9',
        priority: 'high',
        status: 'completed',
        notes: '✅ Completado - Mensaje entregado con éxito',
        createdAt: '2026-02-15T20:23:00Z',
        updatedAt: '2026-02-15T20:24:00Z'
      }
    ];
  }
}

// Write tasks
async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Gene Task API', version: '1.0' });
});

// GET all tasks
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create task
app.post('/api/tasks', auth, async (req, res) => {
  try {
    const tasks = await readTasks();
    const newTask = {
      id: Date.now().toString(),
      ...req.body,
      status: req.body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update task
app.put('/api/tasks/:id', auth, async (req, res) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    tasks[index] = { 
      ...tasks[index], 
      ...req.body, 
      updatedAt: new Date().toISOString() 
    };
    await writeTasks(tasks);
    res.json({ success: true, data: tasks[index] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update status
app.patch('/api/tasks/:id/status', auth, async (req, res) => {
  try {
    const tasks = await readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    task.status = req.body.status;
    task.updatedAt = new Date().toISOString();
    await writeTasks(tasks);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH add notes
app.patch('/api/tasks/:id/notes', auth, async (req, res) => {
  try {
    const tasks = await readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    task.notes = req.body.notes;
    task.updatedAt = new Date().toISOString();
    await writeTasks(tasks);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE task
app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    let tasks = await readTasks();
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    tasks.splice(index, 1);
    await writeTasks(tasks);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET stats
app.get('/api/stats', auth, async (req, res) => {
  try {
    const tasks = await readTasks();
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      progress: tasks.filter(t => t.status === 'progress').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Gene Task API running on port ${PORT}`);
});

module.exports = app;
