# 🤖 Gene Task Manager

Sistema de gestión de tareas para **Genee** - Tu agente de desarrollo AI.

## 📋 Descripción

Gene Task Manager permite:
- **Asignar tareas** a Genee con descripción detallada
- **Seguimiento de estado**: Pendiente → En Progreso → Completada
- **Historial completo** de todas las tareas
- **Notas y comentarios** de Genee sobre cada tarea
- **Priorización** (Alta/Media/Baja)
- **Fechas límite** para entregas

## 🏗️ Arquitectura

```
gene-task-manager/
├── frontend/          # App web (Firebase Hosting)
│   └── index.html     # SPA completa
├── backend/           # API Node.js (Inforge)
│   ├── server.js      # API REST
│   └── package.json
└── .github/workflows/ # Deploy automático
```

## 🚀 Deploy

### 1. Crear proyecto Firebase
```bash
# En Firebase Console
gene-task-manager-XXXXX
```

### 2. Actualizar .firebaserc
```json
{
  "projects": {
    "default": "TU-PROJECT-ID"
  }
}
```

### 3. Configurar GitHub Secrets
- `FIREBASE_TOKEN`: Token de Firebase

### 4. Subir a GitHub y deployar
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/tasks` | Listar tareas |
| POST | `/api/tasks` | Crear tarea |
| GET | `/api/tasks/:id` | Ver tarea |
| PUT | `/api/tasks/:id` | Actualizar |
| PATCH | `/api/tasks/:id/status` | Cambiar estado |
| PATCH | `/api/tasks/:id/notes` | Agregar notas |
| DELETE | `/api/tasks/:id` | Eliminar |
| GET | `/api/stats` | Estadísticas |

## 🎯 Estados de Tareas

- **Pendiente** ⏳ - Esperando ser iniciada
- **En Progreso** 🔄 - Genee está trabajando
- **Completada** ✅ - Tarea finalizada
- **Cancelada** ❌ - Tarea descartada

## 📝 Ejemplo de Uso

1. **Crear tarea:**
   - Título: "Crear skill de búsqueda web"
   - Descripción: "Implementar búsqueda DuckDuckGo..."
   - Prioridad: Alta
   - Fecha límite: 2026-02-20

2. **Genee actualiza:**
   - Cambia estado a "En Progreso"
   - Agrega notas sobre avances
   - Al completar, marca como "Completada"

3. **Historial:**
   - Todas las tareas quedan registradas
   - Filtros por estado
   - Estadísticas de productividad

## 🔧 Variables de Entorno

Backend (`.env`):
```env
PORT=3001
API_KEY=tu-api-key-segura
FRONTEND_URL=https://gene-task-manager.web.app
NODE_ENV=production
```

## 🛡️ Seguridad

- API Key authentication
- Rate limiting (100 req/15min)
- CORS configurado
- Helmet para headers seguros

## 📝 Licencia

MIT

---
Creado con ❤️ por Genee 🤖
