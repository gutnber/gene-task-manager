// Simple backend usando Express + archivo JSON para persistencia
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'tasks.json');
const API_KEY = process.env.API_KEY || 'gene-api-key';

app.use(cors());
app.use(express.json());

// Middleware de autenticación
const auth = (req, res, next) => {
  const key = req.headers.authorization?.replace('Bearer ', '');
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Leer tareas
async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Guardar tareas
async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// GET todas las tareas
app.get('/api/tasks', auth, async (req, res) => {
  const tasks = await readTasks();
  res.json({ success: true, data: tasks });
});

// POST crear tarea
app.post('/api/tasks', auth, async (req, res) => {
  const tasks = await readTasks();
  const newTask = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  await writeTasks(tasks);
  res.status(201).json({ success: true, data: newTask });
});

// PUT actualizar tarea completa
app.put('/api/tasks/:id', auth, async (req, res) => {
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
});

// PATCH actualizar estado
app.patch('/api/tasks/:id/status', auth, async (req, res) => {
  const tasks = await readTasks();
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  task.status = req.body.status;
  task.updatedAt = new Date().toISOString();
  await writeTasks(tasks);
  res.json({ success: true, data: task });
});

// PATCH agregar notas
app.patch('/api/tasks/:id/notes', auth, async (req, res) => {
  const tasks = await readTasks();
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  task.notes = req.body.notes;
  task.updatedAt = new Date().toISOString();
  await writeTasks(tasks);
  res.json({ success: true, data: task });
});

// GET estadísticas
app.get('/api/stats', auth, async (req, res) => {
  const tasks = await readTasks();
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    progress: tasks.filter(t => t.status === 'progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length
  };
  res.json({ success: true, data: stats });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Gene Task API' });
});

app.listen(PORT, () => {
  console.log(`Gene Task API running on port ${PORT}`);
});
