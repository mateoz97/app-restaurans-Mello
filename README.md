# 🍽️ Restaurant App - Sistema de Gestión Full Stack

Aplicación profesional de gestión de restaurante desarrollada con React Native (Expo) + Node.js/Express + SQLite.

## 🎯 Características Principales

### Frontend (React Native + Expo)
- ✅ Autenticación JWT con persistencia de sesión
- ✅ Sistema de roles y permisos granular (4 roles)
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de órdenes CRUD
- ✅ Control de inventario con alertas
- ✅ Material Design UI
- ✅ Pull to refresh
- ✅ Soporte iOS, Android y Web

### Backend (Node.js + Express + SQLite)
- ✅ API RESTful con autenticación JWT
- ✅ Base de datos SQLite (desarrollo) / PostgreSQL (producción)
- ✅ Sistema de permisos por rol
- ✅ Endpoints protegidos
- ✅ Seeders con datos de prueba
- ✅ Middleware de autenticación y autorización

## 🚀 Inicio Rápido

### Pre-requisitos
- Node.js 18+
- npm o yarn
- Para iOS: Xcode o Expo Go
- Para Android: Android Studio o Expo Go

### Instalación

#### 1. Backend
```bash
cd backend
npm install
npm run seed      # Crear base de datos y datos de prueba
npm run dev       # Iniciar servidor en puerto 3000
```

#### 2. Frontend
```bash
# En el directorio raíz
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Iniciar Expo
npm start
```

#### 3. Configurar URL del Backend

Editar `.env` o `src/config/env.ts`:

```typescript
// Para iOS Simulator
apiUrl: 'http://localhost:3000/api'

// Para Android Emulator
apiUrl: 'http://10.0.2.2:3000/api'

// Para dispositivo físico
apiUrl: 'http://TU_IP_LOCAL:3000/api'
```

## 👥 Sistema de Roles y Permisos

### Roles Disponibles

| Rol | Permisos | Ver Ingresos |
|-----|----------|--------------|
| **Admin** | Acceso total al sistema | ✅ Sí |
| **Manager** | Gestión completa de órdenes e inventario | ✅ Sí |
| **Waiter** | Crear/editar órdenes, ver inventario | ❌ No |
| **Chef** | Ver/actualizar estado de órdenes | ❌ No |

### Permisos Específicos

- `view_dashboard` - Ver dashboard
- `view_orders` - Ver órdenes
- `create_order` - Crear órdenes
- `edit_order` - Editar órdenes
- `delete_order` - Eliminar órdenes
- `view_inventory` - Ver inventario
- `edit_inventory` - Editar inventario
- `manage_users` - Gestionar usuarios
- `view_reports` - Ver reportes
- `view_revenue` - **Ver métricas de ingresos** (solo Admin y Manager)

## 📁 Estructura del Proyecto

```
app-restaurant/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuración (DB, JWT)
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Autenticación y permisos
│   │   ├── routes/         # Rutas de la API
│   │   ├── utils/          # Utilidades y seeders
│   │   └── server.js       # Servidor Express
│   └── database/           # SQLite database
│
├── src/                     # Frontend React Native
│   ├── components/         # Componentes reutilizables
│   ├── config/             # Configuración de entorno
│   ├── contexts/           # Context API (Auth, Data)
│   ├── navigation/         # React Navigation
│   ├── screens/            # Pantallas de la app
│   ├── services/           # API client (axios)
│   ├── types/              # TypeScript types
│   └── utils/              # Utilidades y permisos
│
├── App.tsx                 # Componente raíz
├── app.config.js           # Configuración de Expo
└── DEPLOYMENT.md           # Guía de despliegue
```

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/login       - Iniciar sesión
GET    /api/auth/profile     - Obtener perfil del usuario
```

### Órdenes
```
GET    /api/orders           - Listar todas las órdenes
POST   /api/orders           - Crear nueva orden
GET    /api/orders/:id       - Obtener orden específica
PATCH  /api/orders/:id/status - Actualizar estado
DELETE /api/orders/:id       - Eliminar orden (Admin/Manager)
GET    /api/orders/stats     - Estadísticas (revenue protegido)
```

### Inventario
```
GET    /api/inventory        - Listar inventario
GET    /api/inventory/:id    - Obtener item específico
PATCH  /api/inventory/:id    - Actualizar item
GET    /api/inventory/low-stock - Items con stock bajo
```

### Menú
```
GET    /api/menu             - Obtener items del menú
```

## 🔐 Seguridad

### Desarrollo
- JWT tokens con expiración de 7 días
- Contraseñas hasheadas con bcrypt
- Validación de permisos en backend
- AsyncStorage para tokens en frontend

### Producción
- ⚠️ **IMPORTANTE**: Cambiar `JWT_SECRET` en `.env`
- Usar HTTPS/SSL
- Configurar CORS apropiadamente
- Implementar rate limiting
- Usar PostgreSQL en lugar de SQLite
- Variables de entorno nunca commiteadas

Ver `DEPLOYMENT.md` para guía completa de producción.

## 🛠️ Scripts Disponibles

### Frontend
```bash
npm start          # Iniciar Expo Dev Server
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en navegador
```

### Backend
```bash
npm run dev        # Desarrollo con nodemon
npm start          # Producción
npm run seed       # Crear/resetear base de datos
```

## 📱 Ejecutar en Dispositivos

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Dispositivo Físico (Expo Go)
1. Instalar Expo Go (App Store / Google Play)
2. Ejecutar `npm start`
3. Escanear código QR
4. Ajustar API URL a tu IP local en `.env`

## 🐛 Troubleshooting

### Backend no responde
```bash
# Verificar que el backend esté corriendo
curl http://localhost:3000/health
```

### Error de conexión desde app
1. Verificar que backend esté corriendo
2. Revisar URL en `.env` o `src/config/env.ts`
3. Para Android Emulator usar: `http://10.0.2.2:3000/api`
4. Para dispositivo físico usar: `http://TU_IP_LOCAL:3000/api`

### Base de datos corrupta
```bash
cd backend
rm database/restaurant.db
npm run seed
```

### Limpiar caché de Expo
```bash
npx expo start -c
```

## 🚀 Despliegue en Producción

Ver `DEPLOYMENT.md` para guía completa que incluye:

- Configuración de variables de entorno
- Migración a PostgreSQL
- Despliegue en Heroku/Railway/DigitalOcean
- Build de producción con EAS
- Publicación en App Store y Google Play
- Configuración de CI/CD
- Monitoring y logs

## 🎯 Próximos Pasos

### Funcionalidades Planeadas
- [ ] Reportes y analytics avanzados
- [ ] Notificaciones push
- [ ] Sincronización offline
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Gestión de mesas con mapa
- [ ] Módulo de empleados completo
- [ ] Exportar reportes (PDF, Excel)
- [ ] Integración con sistemas de pago

### Mejoras Técnicas
- [ ] Tests unitarios (Jest)
- [ ] Tests E2E (Detox)
- [ ] CI/CD con GitHub Actions
- [ ] Docker containers
- [ ] Migración a PostgreSQL
- [ ] Rate limiting
- [ ] Logs centralizados (Winston)
- [ ] Monitoring (New Relic/DataDog)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 📞 Soporte

Para soporte o consultas:
- Abrir un issue en GitHub
- Revisar documentación en `backend/README.md`
- Consultar guía de despliegue en `DEPLOYMENT.md`

---

## 📚 Stack Tecnológico

**Frontend:**
- React Native & Expo
- TypeScript
- React Navigation
- Material Design Icons
- Axios
- AsyncStorage
- Context API

**Backend:**
- Node.js & Express
- SQLite3 (dev) / PostgreSQL (prod)
- JWT (jsonwebtoken)
- bcryptjs
- CORS

---

**Desarrollado con ❤️ - Sistema de Gestión de Restaurante Full Stack**

Para documentación detallada:
- Backend: `backend/README.md`
- Despliegue: `DEPLOYMENT.md`
