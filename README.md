# Sistema PPE — Participación Estudiantil

Plataforma educativa institucional para gestionar la participación estudiantil de primero, segundo y tercero de bachillerato.

## Tecnologías

- **Backend:** Laravel 11 + Spatie Laravel Permission
- **Frontend:** React 18 + Inertia.js
- **Estilos:** Tailwind CSS v3 (paleta morada institucional)
- **Base de datos:** MySQL/MariaDB (Laragon)
- **Gráficos:** Recharts

## Instalación

### 1. Instalar dependencias PHP

```bash
composer install
```

### 2. Instalar dependencias Node.js

```bash
npm install
```

### 3. Configurar el entorno

Editar `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ppe_db
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Crear la base de datos en MySQL/HeidiSQL

```sql
CREATE DATABASE IF NOT EXISTS ppe_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Ejecutar migraciones y seeders

```bash
php artisan migrate:fresh --seed
```

### 6. Compilar assets e iniciar servidor

```bash
# Terminal 1 — Assets (desarrollo con hot reload):
npm run dev

# Terminal 2 — Servidor PHP:
php artisan serve
```

Acceder en: `http://127.0.0.1:8000`

---

## Credenciales de prueba

| Rol         | Email                       | Contraseña   |
|-------------|-----------------------------|--------------|
| Coordinador | coordinador@ppe.edu         | Admin123!    |
| Docente     | mgonzalez@ppe.edu           | Docente123!  |
| Docente     | cramirez@ppe.edu            | Docente123!  |
| Estudiante  | atorres@estudiante.ppe.edu  | Est123!      |
| Estudiante  | druiz@estudiante.ppe.edu    | Est123!      |
| Estudiante  | vsalcedo@estudiante.ppe.edu | Est123!      |

## Estructura del proyecto

```
sistema-ppe/
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          — Controladores del coordinador
│   │   ├── Auth/           — Autenticación (Login/Logout)
│   │   ├── Docente/        — Controladores del docente
│   │   └── Estudiante/     — Controladores del estudiante
│   ├── Middleware/HandleInertiaRequests.php
│   └── Models/             — User, Curso, FasePpe, Asistencia, etc.
├── database/
│   ├── migrations/         — 11 tablas del sistema
│   └── seeders/            — Datos de prueba (admin, docentes, estudiantes)
├── resources/js/
│   ├── Pages/
│   │   ├── Admin/          — Dashboard del coordinador
│   │   ├── Auth/           — Página de Login
│   │   ├── Docente/        — Dashboard del docente
│   │   └── Estudiante/     — Dashboard del estudiante
│   ├── Layouts/            — AdminLayout, DocenteLayout, EstudianteLayout
│   └── Components/UI/      — StatCard, Badge, DataTable, Modal, etc.
└── routes/web.php          — Rutas organizadas por rol (admin/docente/estudiante)
```

## Roles del sistema

| Rol          | Prefijo URL  | Funcionalidades                                |
|--------------|-------------|------------------------------------------------|
| `admin`      | `/admin`    | Gestión completa: usuarios, cursos, cronograma |
| `docente`    | `/docente`  | Asistencia, calificación de bitácoras          |
| `estudiante` | `/estudiante` | Cronograma, notas, asistencia personal       |
