// Firebase Functions + Firestore Backend for Gene Task Manager
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Middleware de autenticación
const validateKey = async (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (apiKey !== 'gene-tasks-api-key') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// GET todas las tareas
app.get('/tasks', validateKey, async (req, res) => {
  try {
    const snapshot = await db.collection('tasks')
      .orderBy('createdAt', 'desc')
      .get();
    
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear tarea
app.post('/tasks', validateKey, async (req, res) => {
  try {
    const task = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'medium',
      status: 'pending',
      deadline: req.body.deadline || null,
      notes: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('tasks').add(task);
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...task }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH actualizar estado
app.patch('/tasks/:id/status', validateKey, async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('tasks').doc(req.params.id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH agregar notas
app.patch('/tasks/:id/notes', validateKey, async (req, res) => {
  try {
    const { notes } = req.body;
    await db.collection('tasks').doc(req.params.id).update({
      notes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Notes added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET estadísticas
app.get('/stats', validateKey, async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').get();
    const tasks = snapshot.docs.map(doc => doc.data());
    
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      progress: tasks.filter(t => t.status === 'progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.api = functions.https.onRequest(app);
