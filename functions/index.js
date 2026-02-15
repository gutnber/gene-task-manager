const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();
const db = admin.firestore();

// API Key para autenticación
const API_KEY = 'gene-tasks-api-key-2024';

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({error: 'No autorizado'});
  }
  
  const token = authHeader.split('Bearer ')[1];
  if (token !== API_KEY) {
    return res.status(403).json({error: 'Token inválido'});
  }
  
  next();
};

// GET todas las tareas
exports.getTasks = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    authenticate(req, res, async () => {
      try {
        const snapshot = await db.collection('tasks')
          .orderBy('createdAt', 'desc')
          .get();
        
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        res.json({success: true, data: tasks});
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Error al obtener tareas'});
      }
    });
  });
});

// POST crear tarea
exports.createTask = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    authenticate(req, res, async () => {
      try {
        const taskData = {
          title: req.body.title,
          description: req.body.description,
          priority: req.body.priority || 'medium',
          status: 'pending',
          deadline: req.body.deadline || null,
          notes: '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection('tasks').add(taskData);
        
        res.status(201).json({
          success: true,
          data: {id: docRef.id, ...taskData}
        });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Error al crear tarea'});
      }
    });
  });
});

// PATCH actualizar estado
exports.updateStatus = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    authenticate(req, res, async () => {
      try {
        const taskId = req.query.id;
        const {status} = req.body;
        
        if (!taskId || !status) {
          return res.status(400).json({error: 'Faltan datos'});
        }
        
        await db.collection('tasks').doc(taskId).update({
          status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({success: true, message: 'Estado actualizado'});
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Error al actualizar estado'});
      }
    });
  });
});

// PATCH agregar notas
exports.addNotes = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    authenticate(req, res, async () => {
      try {
        const taskId = req.query.id;
        const {notes} = req.body;
        
        if (!taskId || notes === undefined) {
          return res.status(400).json({error: 'Faltan datos'});
        }
        
        await db.collection('tasks').doc(taskId).update({
          notes,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({success: true, message: 'Notas agregadas'});
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Error al agregar notas'});
      }
    });
  });
});

// GET estadísticas
exports.getStats = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    authenticate(req, res, async () => {
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
        
        res.json({success: true, data: stats});
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Error al obtener estadísticas'});
      }
    });
  });
});

// Función para que Genee actualice tareas desde el sistema
exports.geneUpdateTask = functions.https.onCall(async (data, context) => {
  const {taskId, status, notes} = data;
  
  try {
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    
    await db.collection('tasks').doc(taskId).update(updateData);
    
    return {success: true, message: 'Tarea actualizada por Genee'};
  } catch (error) {
    console.error('Error:', error);
    throw new functions.https.HttpsError('internal', 'Error al actualizar');
  }
});
