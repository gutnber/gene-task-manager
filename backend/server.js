/**
 * Gene Task Manager Backend API
 * API para gestión de tareas asignadas a Genee
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Almacenamiento en memoria
const tasks = new Map();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(express.json());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Auth middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'API key inválida' });
  }
  next();
};

// Schemas
const taskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(2000).required(),
  priority: Joi.string().valid('high', 'medium', 'low').default('medium'),
  deadline: Joi.date().iso().optional(),
  status: Joi.string().valid('pending', 'progress', 'completed', 'cancelled').default('pending')
});

const notesSchema = Joi.object({
  notes: Joi.string().max(2000).required()
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Gene Task Manager API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// GET todas las tareas
app.get('/api/tasks', validateApiKey, (req, res) => {
  const allTasks = Array.from(tasks.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({
    success: true,
    count: allTasks.length,
    data: allTasks
  });
});

// GET una tarea
app.get('/api/tasks/:id', validateApiKey, (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  res.json({ success: true, data: task });
});

// POST crear tarea
app.post('/api/tasks', validateApiKey, (req, res) => {
  const { error, value } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const task = {
    id: uuidv4(),
    ...value,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.set(task.id, task);

  res.status(201).json({
    success: true,
    message: 'Tarea creada exitosamente',
    data: task
  });
});

// PUT actualizar tarea
app.put('/api/tasks/:id', validateApiKey, (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  const { error, value } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const updatedTask = {
    ...task,
    ...value,
    updatedAt: new Date().toISOString()
  };

  tasks.set(task.id, updatedTask);

  res.json({
    success: true,
    message: 'Tarea actualizada',
    data: updatedTask
  });
});

// PATCH actualizar estado
app.patch('/api/tasks/:id/status', validateApiKey, (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  const { status } = req.body;
  if (!['pending', 'progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  task.status = status;
  task.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Estado actualizado a: ${status}`,
    data: task
  });
});

// PATCH agregar notas
app.patch('/api/tasks/:id/notes', validateApiKey, (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  const { error, value } = notesSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  task.notes = value.notes;
  task.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Notas agregadas',
    data: task
  });
});

// DELETE eliminar tarea
app.delete('/api/tasks/:id', validateApiKey, (req, res) => {
  if (!tasks.has(req.params.id)) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  tasks.delete(req.params.id);

  res.json({
    success: true,
    message: 'Tarea eliminada'
  });
});

// GET estadísticas
app.get('/api/stats', validateApiKey, (req, res) => {
  const allTasks = Array.from(tasks.values());
  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    progress: allTasks.filter(t => t.status === 'progress').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    cancelled: allTasks.filter(t => t.status === 'cancelled').length,
    byPriority: {
      high: allTasks.filter(t => t.priority === 'high').length,
      medium: allTasks.filter(t => t.priority === 'medium').length,
      low: allTasks.filter(t => t.priority === 'low').length
    }
  };

  res.json({ success: true, data: stats });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     🤖 Gene Task Manager API v1.0         ║
  ╠═══════════════════════════════════════════╣
  ║  Puerto: ${PORT}                              ║
  ║  Health: http://localhost:${PORT}/health       ║
  ╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
