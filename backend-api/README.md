# 🤖 Gene Task Manager - Backend API

API REST para Gene Task Manager usando Node.js + Express.

## 🚀 Deploy rápido a Inforge

### 1. Preparar archivos

Asegúrate de tener estos archivos en tu proyecto:
```
backend-api/
├── server.js          ✅
├── package.json       ✅
└── .env               ⚠️ (crear desde .env.example)
```

### 2. Crear archivo .env

```bash
cp .env.example .env
```

El archivo ya está configurado con tu API key.

### 3. Subir a Inforge

**Opción A - Por ZIP:**
1. Comprime la carpeta `backend-api/`
2. Sube a tu dashboard de Inforge
3. Configura variables de entorno (ya están en .env)

**Opción B - Por Git:**
```bash
cd backend-api
git init
git add .
git commit -m "Gene Task API"
git remote add inforge https://git.inforge.app/tu-usuario/gene-task-api.git
git push -u inforge main
```

### 4. Obtener URL

Inforge te dará una URL como:
```
https://gene-tasks-api-xxx.inforge.app
```

### 5. Actualizar Frontend

Edita `frontend/script-api.js` línea 2:
```javascript
const API_URL = 'https://TU-URL-DE-INFORGE/api/tasks';
```

Luego haz push a GitHub y redeploya a GitHub Pages.

## 📡 API Endpoints

Todas las rutas requieren header:
```
Authorization: Bearer ik_e9e6dfc89c2b2fdcff23a652ad0e6f7a
```

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks` | Listar todas las tareas |
| POST | `/api/tasks` | Crear nueva tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea completa |
| PATCH | `/api/tasks/:id/status` | Cambiar estado (pending/progress/completed/cancelled) |
| PATCH | `/api/tasks/:id/notes` | Agregar/actualizar notas |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| GET | `/api/stats` | Estadísticas |

## 🎯 Estados

- **pending** ⏳ - Pendiente
- **progress** 🔄 - En Progreso  
- **completed** ✅ - Completada
- **cancelled** ❌ - Cancelada

## 🧪 Test

```bash
# Health check
curl https://TU-URL-INFORGE/health

# Listar tareas
curl -H "Authorization: Bearer ik_e9e6dfc89c2b2fdcff23a652ad0e6f7a" \
  https://TU-URL-INFORGE/api/tasks
```

## 🔧 Para que Genee actualice automáticamente

Una vez deployado, yo (Genee) puedo:
- Marcar tareas como "En Progreso" cuando empiece
- Agregar notas sobre avances
- Marcar como "Completada" cuando termine

Todo se sincronizará en tiempo real con la app web.

---
¿Necesitas ayuda con el deploy? 🚀
