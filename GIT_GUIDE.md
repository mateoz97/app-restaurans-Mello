# 📚 Guía de Git para Restaurant App

## 🎯 Configuración Inicial (Ya hecha ✅)

```bash
# Configurar usuario (local al proyecto)
git config user.name "Teo"
git config user.email "teo@restaurant-app.local"

# Template de commits configurado
git config commit.template .gitmessage
```

## 📝 Workflow Básico

### 1. Ver estado actual
```bash
git status
```

### 2. Agregar archivos al staging
```bash
# Agregar archivo específico
git add src/screens/NewScreen.tsx

# Agregar todos los archivos modificados
git add .

# Agregar todo (incluyendo eliminados)
git add -A
```

### 3. Crear commit
```bash
# Con mensaje directo
git commit -m "feat: Agregar pantalla de reportes"

# Con editor (usa el template)
git commit

# Commit con mensaje multi-línea
git commit -m "feat: Agregar autenticación biométrica

- Implementar FaceID para iOS
- Implementar fingerprint para Android
- Agregar toggle en ProfileScreen
- Actualizar documentación"
```

### 4. Ver historial
```bash
# Historial completo
git log

# Historial resumido
git log --oneline

# Historial con gráfico
git log --oneline --graph --all

# Últimos 5 commits
git log -5 --oneline
```

## 🌿 Trabajo con Branches

### Crear y cambiar de branch
```bash
# Crear branch para nueva feature
git checkout -b feature/payment-integration

# Crear branch para fix
git checkout -b fix/login-validation

# Crear branch para backend
git checkout -b backend/initial-setup
```

### Cambiar entre branches
```bash
# Volver a master
git checkout master

# Ir a otra branch
git checkout feature/payment-integration
```

### Ver branches
```bash
# Listar branches locales
git branch

# Listar todas las branches
git branch -a
```

### Mergear branches
```bash
# Primero ir a master
git checkout master

# Mergear la feature
git merge feature/payment-integration

# Eliminar branch después del merge
git branch -d feature/payment-integration
```

## 🚀 Repositorio Remoto (GitHub/GitLab/Bitbucket)

### Configurar remoto
```bash
# Agregar repositorio remoto
git remote add origin https://github.com/tu-usuario/restaurant-app.git

# Verificar remoto
git remote -v
```

### Push (subir cambios)
```bash
# Primera vez (crea la branch en remoto)
git push -u origin master

# Siguientes veces
git push

# Push de una branch específica
git push origin feature/payment-integration
```

### Pull (bajar cambios)
```bash
# Traer cambios del remoto
git pull

# Pull de branch específica
git pull origin master
```

### Clonar repositorio
```bash
# Si trabajas desde otra computadora
git clone https://github.com/tu-usuario/restaurant-app.git
cd restaurant-app
npm install
```

## 🔧 Comandos Útiles

### Ver cambios antes de commit
```bash
# Ver diferencias
git diff

# Ver diferencias de archivo específico
git diff src/screens/LoginScreen.tsx

# Ver diferencias staged
git diff --staged
```

### Deshacer cambios
```bash
# Descartar cambios en archivo (CUIDADO: se pierden)
git restore src/screens/LoginScreen.tsx

# Descartar todos los cambios
git restore .

# Quitar archivo del staging (mantiene cambios)
git restore --staged src/screens/LoginScreen.tsx

# Volver al commit anterior (CUIDADO)
git reset --hard HEAD~1
```

### Stash (guardar cambios temporalmente)
```bash
# Guardar cambios sin commit
git stash

# Ver stashes guardados
git stash list

# Aplicar último stash
git stash pop

# Aplicar stash específico
git stash apply stash@{0}
```

### Ver información
```bash
# Ver detalles de un commit
git show ee5ff89

# Ver qué archivos cambiaron
git show --name-only ee5ff89

# Ver autor y fecha de cada línea
git blame src/screens/LoginScreen.tsx
```

## 🎨 Convención de Commits

Usa estos prefijos para mantener un historial limpio:

```bash
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Cambios en documentación
style:    Formato de código
refactor: Refactorización
perf:     Mejoras de rendimiento
test:     Tests
chore:    Tareas de mantenimiento
```

### Ejemplos:
```bash
git commit -m "feat: Agregar pantalla de reportes mensuales"
git commit -m "fix: Corregir validación de email en login"
git commit -m "docs: Actualizar README con guía de instalación"
git commit -m "refactor: Simplificar lógica de permisos"
git commit -m "perf: Optimizar carga de órdenes en dashboard"
git commit -m "test: Agregar tests unitarios para AuthContext"
git commit -m "chore: Actualizar dependencias de npm"
```

## 📦 Workflow Recomendado para Features

```bash
# 1. Crear branch desde master
git checkout master
git checkout -b feature/nueva-funcionalidad

# 2. Trabajar en la feature
# ... hacer cambios ...
git add .
git commit -m "feat: Implementar nueva funcionalidad"

# 3. Hacer más commits si es necesario
# ... más cambios ...
git add .
git commit -m "feat: Completar nueva funcionalidad"

# 4. Volver a master y mergear
git checkout master
git merge feature/nueva-funcionalidad

# 5. Eliminar branch
git branch -d feature/nueva-funcionalidad

# 6. Push si tienes remoto
git push
```

## 🔥 Comandos de Emergencia

### "Cometí un error en el último commit"
```bash
# Modificar el último commit
git commit --amend -m "feat: Mensaje corregido"

# Agregar archivos olvidados al último commit
git add archivo-olvidado.ts
git commit --amend --no-edit
```

### "Quiero deshacer el último commit pero mantener cambios"
```bash
git reset --soft HEAD~1
```

### "Quiero deshacer TODO (CUIDADO)"
```bash
git reset --hard HEAD~1
```

### "Quiero ver qué pasó en un archivo específico"
```bash
git log -- src/screens/LoginScreen.tsx
```

### "Borré algo por error"
```bash
# Ver archivo eliminado
git checkout HEAD -- archivo-borrado.ts
```

## 🎯 Estrategia de Branches Recomendada

```
master (producción estable)
├── develop (desarrollo activo)
│   ├── feature/payment-integration
│   ├── feature/notifications
│   └── fix/login-bug
└── backend/implementation
```

### Setup:
```bash
# Crear branch de desarrollo
git checkout -b develop

# Hacer merge a master solo cuando esté listo para producción
git checkout master
git merge develop
git tag v1.0.0
git push origin master --tags
```

## 📌 Archivos Ignorados

El `.gitignore` ya está configurado para ignorar:
- `node_modules/`
- `.env` (variables sensibles)
- `.expo/` (caché de Expo)
- `*.db` (bases de datos)
- `.vscode/` (configuración del editor)
- `coverage/` (reportes de tests)

## 🔗 Conectar con GitHub

### 1. Crear repositorio en GitHub
- Ir a github.com
- Click en "New repository"
- Nombre: `restaurant-app`
- NO inicializar con README (ya lo tienes)

### 2. Conectar local con remoto
```bash
git remote add origin https://github.com/TU-USUARIO/restaurant-app.git
git branch -M master
git push -u origin master
```

### 3. Comandos frecuentes con remoto
```bash
# Subir cambios
git push

# Bajar cambios
git pull

# Ver información del remoto
git remote show origin
```

## 📊 Ver Estadísticas

```bash
# Número de commits por autor
git shortlog -sn

# Estadísticas del repositorio
git log --stat

# Gráfico visual de branches
git log --all --decorate --oneline --graph
```

## 🎓 Tips Profesionales

1. **Commits pequeños y frecuentes**: Es mejor hacer varios commits pequeños que uno gigante
2. **Mensajes descriptivos**: Explica QUÉ y POR QUÉ, no CÓMO
3. **Una funcionalidad por branch**: Facilita el code review
4. **Pull antes de push**: Evita conflictos
5. **Nunca hagas commit de .env**: Ya está en .gitignore
6. **Usa tags para versiones**: `git tag v1.0.0`

## 🆘 Ayuda Rápida

```bash
# Ayuda general
git help

# Ayuda de un comando específico
git help commit
git help branch
git help merge
```

---

**Proyecto:** Restaurant App - Sistema de Gestión
**Stack:** React Native + Expo + Node.js + SQLite
**Mantenedor:** Teo
