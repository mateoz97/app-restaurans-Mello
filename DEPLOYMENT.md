# 🚀 Guía de Despliegue en Producción

Esta guía detalla los pasos para desplegar la aplicación Restaurant App en producción.

## 📋 Pre-requisitos

- Node.js 18+ instalado
- Cuenta en servicio de hosting (Heroku, Railway, DigitalOcean, etc.)
- Cuenta en Expo EAS (para builds de producción)
- Base de datos PostgreSQL (recomendado para producción)

## 🔧 Backend - Configuración

### 1. Variables de Entorno

Crear archivo `.env` en producción con:

```env
NODE_ENV=production
PORT=3000

# JWT - IMPORTANTE: Usar un secreto seguro
JWT_SECRET=tu-secreto-super-seguro-de-minimo-32-caracteres-random
JWT_EXPIRES_IN=7d

# Base de datos PostgreSQL (recomendado)
DATABASE_URL=postgresql://usuario:password@host:5432/nombre_db

# O SQLite para testing
DATABASE_PATH=./database/restaurant.db
```

### 2. Generar JWT Secret Seguro

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Migrar a PostgreSQL (Recomendado)

#### Instalar dependencia:
```bash
npm install pg
```

#### Actualizar código de base de datos:
El código actual usa SQLite. Para PostgreSQL, necesitarás:
- Usar un ORM como Prisma o Sequelize
- O adaptar las queries manualmente a PostgreSQL

### 4. Desplegar Backend

#### Opción A: Heroku
```bash
# Instalar Heroku CLI
heroku login
heroku create restaurant-app-backend

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu-secreto-aqui
heroku config:set DATABASE_URL=postgresql://...

# Desplegar
git subtree push --prefix backend heroku main
```

#### Opción B: Railway
```bash
# Instalar Railway CLI
railway login
railway init
railway add

# Variables de entorno en dashboard de Railway
# Desplegar se hace automáticamente desde GitHub
```

#### Opción C: DigitalOcean/VPS
```bash
# SSH a tu servidor
ssh usuario@tu-servidor

# Clonar repositorio
git clone tu-repo.git
cd restaurant-app/backend

# Instalar dependencias
npm install --production

# Configurar PM2 para mantener corriendo
npm install -g pm2
pm2 start src/server.js --name restaurant-backend
pm2 startup
pm2 save

# Configurar Nginx como reverse proxy
```

### 5. Crear Usuarios Iniciales

Una vez desplegado, ejecutar seed en producción:
```bash
npm run seed
```

**IMPORTANTE**: Cambiar las contraseñas de los usuarios de prueba inmediatamente.

## 📱 Frontend - Configuración

### 1. Configurar Variables de Entorno

Crear `.env`:
```env
EXPO_PUBLIC_API_URL=https://tu-api-backend.com/api
```

### 2. Actualizar app.config.js

```javascript
export default {
  name: 'restaurant-app',
  slug: 'restaurant-app',
  version: '1.0.0',
  // ... resto de configuración
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    eas: {
      projectId: "tu-project-id"
    }
  }
};
```

### 3. Build con EAS (Expo Application Services)

#### Instalar EAS CLI:
```bash
npm install -g eas-cli
eas login
```

#### Configurar proyecto:
```bash
eas build:configure
```

#### Build para iOS:
```bash
eas build --platform ios
```

#### Build para Android:
```bash
eas build --platform android
```

### 4. Publicar Updates OTA (Over The Air)

```bash
eas update --branch production --message "Descripción del cambio"
```

## 🔒 Seguridad en Producción

### Backend

1. **JWT Secret**: Usar secreto fuerte y aleatorio
2. **CORS**: Configurar solo dominios permitidos
   ```javascript
   app.use(cors({
     origin: ['https://tu-frontend.com'],
     credentials: true
   }));
   ```

3. **Rate Limiting**: Proteger contra ataques de fuerza bruta
   ```bash
   npm install express-rate-limit
   ```

4. **Helmet**: Headers de seguridad
   ```bash
   npm install helmet
   ```

5. **Variables de entorno**: NUNCA commitear archivos `.env`

6. **HTTPS**: Usar certificados SSL (Let's Encrypt gratis)

### Frontend

1. **No exponer credenciales**: Eliminadas del LoginScreen
2. **Validar inputs**: Validación en frontend y backend
3. **HTTPS only**: Conexiones seguras solamente

## 🗄️ Base de Datos

### Migración de SQLite a PostgreSQL

1. Exportar schema:
```bash
sqlite3 restaurant.db .schema > schema.sql
```

2. Adaptar a PostgreSQL y ejecutar

3. Migrar datos usando herramientas como `pgloader`

### Backups

Configurar backups automáticos diarios:
```bash
# PostgreSQL backup
pg_dump -U usuario nombre_db > backup_$(date +%Y%m%d).sql
```

## 📊 Monitoring

### Logs

```bash
# PM2
pm2 logs restaurant-backend

# Heroku
heroku logs --tail --app restaurant-app-backend
```

### Métricas

- Configurar New Relic, DataDog o similar
- Monitorear:
  - Tiempos de respuesta
  - Errores 5xx
  - Uso de memoria
  - CPU

## 🔄 CI/CD

### GitHub Actions ejemplo:

```yaml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "restaurant-app-backend"
          heroku_email: "tu@email.com"
```

## 📱 Publicación en Stores

### App Store (iOS)

1. Cuenta de Apple Developer ($99/año)
2. Crear App ID en Apple Developer Portal
3. Build con EAS: `eas build --platform ios`
4. Submit: `eas submit --platform ios`

### Google Play (Android)

1. Cuenta de Google Play Console ($25 único pago)
2. Crear aplicación en Play Console
3. Build con EAS: `eas build --platform android`
4. Submit: `eas submit --platform android`

## ✅ Checklist Pre-Deploy

### Backend
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET seguro y aleatorio
- [ ] Base de datos PostgreSQL configurada
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado
- [ ] Logs configurados
- [ ] Backups automáticos activos
- [ ] HTTPS/SSL configurado
- [ ] Contraseñas de usuarios cambiadas

### Frontend
- [ ] API_URL apunta a producción
- [ ] Credenciales de prueba eliminadas
- [ ] Variables de entorno configuradas
- [ ] Build de producción testeado
- [ ] Manejo de errores implementado
- [ ] Analytics configurado (opcional)

### General
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] Plan de rollback definido
- [ ] Monitoring configurado

## 🚨 Rollback

Si algo sale mal:

### Backend
```bash
# Heroku
heroku releases:rollback

# PM2
pm2 restart restaurant-backend
git checkout versión-anterior
npm install
pm2 reload restaurant-backend
```

### Frontend
```bash
# EAS
eas update --branch production --message "Rollback" --clear-cache
```

## 📞 Soporte

- Revisar logs primero
- Verificar status de servicios externos
- Contactar soporte de hosting si es necesario

---

**¡Importante!**: Siempre probar en staging antes de producción.
