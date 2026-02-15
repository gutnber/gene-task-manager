# Inforge Backend para Gene Task Manager

## 📦 Archivos para deployar en Inforge

### 1. Archivos necesarios
- `server.js` - API REST completa
- `package.json` - Dependencias
- `.env` - Variables de entorno (crear desde .env.example)

### 2. Configuración

Crear archivo `.env`:
```
PORT=3000
API_KEY=ik_e9e6dfc89c2b2fdcff23a652ad0e6f7a
```

### 3. Deploy en Inforge

**Opción A - Subir ZIP:**
1. Comprimir esta carpeta (`inforge-backend/`)
2. Subir a tu dashboard de Inforge
3. Inforge detectará automáticamente Node.js

**Opción B - Git:**
```bash
cd inforge-backend
git init
git add .
git commit -m "Gene Task API"
git remote add inforge https://git.inforge.app/tu-usuario/gene-task-api.git
git push -u inforge main
```

### 4. Endpoints disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/tasks` | Listar todas las tareas |
| POST | `/api/tasks` | Crear nueva tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea |
| PATCH | `/api/tasks/:id/status` | Cambiar estado |
| PATCH | `/api/tasks/:id/notes` | Agregar notas |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| GET | `/api/stats` | Estadísticas |

### 5. Autenticación

Todas las rutas (excepto `/health`) requieren header:
```
Authorization: Bearer ik_e9e6dfc89c2b2fdcff23a652ad0e6f7a
```

### 6. Base de datos

Usa archivo JSON (`tasks.json`) como base de datos.
Las tareas persisten entre reinicios.

### 7. Tareas iniciales incluidas

El backend viene con 4 tareas completadas pre-cargadas:
1. Mejorar diseño visual ProTask Kanban
2. Crear Plan de Negocios Serviclima El Muñoz
3. Configurar mensaje diario 9 AM versículo bíblico
4. Crear mensaje de amor bíblico para esposa

---

## 🚀 Después del deploy

Una vez deployado en Inforge, actualizar Gene Task Manager para usar:
```javascript
const API_URL = 'https://tu-url-de-inforge.com';
const API_KEY = 'ik_e9e6dfc89c2b2fdcff23a652ad0e6f7a';
```

**¿Necesitas ayuda con el deploy?** 🎯
