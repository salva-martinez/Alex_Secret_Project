# FriendVault

Biblioteca multimedia privada con registro por invitación. Autenticación con usuario y contraseña, almacenamiento de archivos en disco local y feed de medios con subida, listado y eliminación.

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| Next.js 16 | App Router, API Routes |
| React 19 | UI |
| NextAuth.js | Autenticación (CredentialsProvider) |
| Prisma | ORM |
| SQLite | Base de datos |
| bcrypt | Hash de contraseñas |
| TypeScript | Lenguaje |

## Requisitos previos

- Node.js 20+
- npm, pnpm, yarn o bun

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con valores locales

# Generar cliente Prisma y migrar BD
npx prisma generate
npx prisma migrate dev

# Levantar servidor
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de Prisma (SQLite) | `file:./prisma/dev.db` |
| `NEXTAUTH_SECRET` | Secreto para firmar JWT (generar con `openssl rand -base64 32`) | `xxx...` |
| `NEXTAUTH_URL` | URL pública de la app | `https://midominio.com` |
| `ADMIN_SECRET` | Secreto para API de invitaciones (header `x-admin-secret`) | `xxx...` |

Crear `.env.example` con claves vacías (sin valores sensibles) para documentar.

---

## Despliegue en producción (host propio)

Instrucciones para desplegar en un VPS o servidor propio con dominio y HTTPS.

### 1. Requisitos del servidor

- SO: Ubuntu 22.04 LTS (o similar)
- Mínimo: 1 vCPU, 1 GB RAM
- Dominio apuntando al servidor (A o CNAME)

### 2. Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2

# Instalar Nginx (reverse proxy)
sudo apt install -y nginx

# Instalar Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Clonar y compilar la app

```bash
# Clonar repositorio
git clone <url-del-repo> /var/www/friendvault
cd /var/www/friendvault

# Instalar dependencias
npm ci --omit=dev

# Generar cliente Prisma
npx prisma generate
```

### 4. Configurar variables de entorno

```bash
sudo nano /var/www/friendvault/.env
```

Ejemplo de `.env` para producción:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="<genera-con-openssl-rand-base64-32>"
NEXTAUTH_URL="https://midominio.com"
ADMIN_SECRET="<clave-secreta-admin-fuerte>"
```

Generar `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 5. Inicializar base de datos

```bash
cd /var/www/friendvault
npx prisma migrate deploy
```

### 6. Build de producción

```bash
npm run build
```

### 7. Ejecutar con PM2

```bash
cd /var/www/friendvault
pm2 start npm --name "friendvault" -- start
pm2 save
pm2 startup  # seguir instrucciones para arranque automático
```

### 8. Configurar Nginx como reverse proxy

Crear configuración:

```bash
sudo nano /etc/nginx/sites-available/friendvault
```

Contenido:

```nginx
server {
    listen 80;
    server_name midominio.com www.midominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilitar sitio y recargar Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/friendvault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Obtener certificado SSL (HTTPS)

```bash
sudo certbot --nginx -d midominio.com -d www.midominio.com
```

Certbot modificará la config de Nginx para servir HTTPS. La renovación es automática.

### 10. Directorio de uploads

Los archivos se guardan en `uploads/` dentro del proyecto. Asegúrate de:

- Mantener permisos de escritura para el usuario que ejecuta la app
- Hacer backups periódicos de `uploads/` y de la base de datos

```bash
# Permisos
chown -R $USER:$USER /var/www/friendvault/uploads
```

### 11. Reinicio tras despliegues futuros

```bash
cd /var/www/friendvault
git pull
npm ci --omit=dev
npx prisma migrate deploy
npm run build
pm2 restart friendvault
```

---

## Resumen de rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Feed de medios (requiere login) |
| `/login` | Inicio de sesión y registro |
| `/media` | Galería de archivos |
| `/api/auth/*` | NextAuth (login, registro, sesión) |
| `/api/admin/invite` | Invitar usuarios (header `x-admin-secret`) |
| `/api/media` | CRUD de medios |

---

## Seguridad en producción

- **NEXTAUTH_SECRET**: Generar con `openssl rand -base64 32`, nunca usar valores de ejemplo.
- **ADMIN_SECRET**: Clave fuerte solo para la API de invitaciones.
- **HTTPS**: Usar siempre Let's Encrypt; no exponer la app en HTTP solo.
- **Firewall**: Abrir solo puertos 80 y 443.
- **Backups**: Backup regular de `prisma/dev.db` y de `uploads/`.

---

## Crear usuario administrador inicial

Primero añade el username a la whitelist vía API:

```bash
curl -X POST https://midominio.com/api/admin/invite \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: TU_ADMIN_SECRET" \
  -d '{"username":"admin"}'
```

Luego regístrate desde `/login` con ese username.

Para asignar rol ADMIN, modifica el rol en la base de datos con Prisma Studio o SQL:

```bash
npx prisma studio
```

O vía SQLite:

```bash
sqlite3 prisma/dev.db "UPDATE User SET role='ADMIN' WHERE username='admin';"
```
