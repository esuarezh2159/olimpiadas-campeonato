# 📋 GUÍA DE DESPLIEGUE EN NAMECHEAP

## **INFORMACIÓN DEL SERVIDOR**
- **Host:** Namecheap cPanel
- **Usuario:** olimachc
- **Dominio:** olimpuades2026.com
- **Home Directory:** /home/olimachc
- **BD:** En servidor remoto (209.74.89.191)

---

## **PASO 1: VERIFICAR DISPONIBILIDAD DE NODE.JS**

En cPanel, busca:
1. **Software** → **Setup Node.js App**
2. O **Developer** → **Node.js**
3. O en el menú principal busca "Node"

Si **NO está disponible**, Namecheap probablemente usa:
- **Passenger Node.js** (alternativa)
- O necesitaremos usar un servicio como **Heroku, Railway, Render** (recomendado)

---

## **PASO 2: PREPARAR EL PROYECTO**

✅ Ya hecho:
- Archivo `.env.production` creado con variables correctas
- Build optimizado

**Para construir localmente:**
```bash
npm run build
```

---

## **PASO 3: SUBIR ARCHIVOS**

**Opción A: Si Node.js está disponible en cPanel**

1. Conectar por FTP/SFTP:
   - Host: ftp.olimpuades2026.com (o IP del servidor)
   - Usuario: olimachc
   - Contraseña: (tu contraseña cPanel)

2. Subir estos archivos/carpetas:
   ```
   /public
   /.next
   /app
   /components
   /lib
   /node_modules (o no subir y instalar en servidor)
   package.json
   package-lock.json
   .env.production
   next.config.js
   tsconfig.json
   ```

3. En cPanel → Setup Node.js App:
   - Seleccionar NodeVersion (14.x o superior)
   - App Root: /home/olimachc/public_html (o donde subas)
   - App URL: olimpuades2026.com
   - App Startup File: npm start

4. Ejecutar:
   ```bash
   npm install
   npm run build
   npm start
   ```

---

## **OPCIÓN B: USAR ALTERNATIVA A NAMECHEAP (RECOMENDADO)**

Si Node.js **NO está disponible** en Namecheap, opción mejor:

### **USAR RAILWAY O RENDER**

**Railway (Recomendado - Fácil)**
1. Ir a https://railway.app
2. Conectar con GitHub
3. Seleccionar este repositorio
4. Agregar variable de entorno de BD
5. Deploy automático

**Render.com (También bueno)**
1. Ir a https://render.com
2. Conectar con GitHub
3. Create Web Service
4. Seleccionar Node
5. Agregar .env variables
6. Deploy

---

## **PASO 4: CONFIGURAR DOMINIO**

**Si usas Node.js en cPanel:**
- El dominio ya está configurado en cPanel
- Verificar que el A Record apunte a la IP correcta

**Si usas Railway/Render:**
1. Ir a los DNS de Namecheap
2. Cambiar nameservers a los de Railway/Render
3. O crear CNAME record

---

## **VERIFICACIÓN FINAL**

1. Acceder a https://olimpuades2026.com
2. Verificar que carga la página de login
3. Probar login con admin/admin123
4. Verificar que funciona todo

---

## **VARIABLES DE ENTORNO EN PRODUCCIÓN**

```
DB_HOST=209.74.89.191
DB_PORT=3306
DB_USER=root
DB_PASSWORD=#21592159xD
DB_NAME=campeonato_bd
NEXTAUTH_SECRET=olimpiadas_campeonato_2026_secret_key_production_secure_key_123456789
NEXTAUTH_URL=https://olimpuades2026.com
NODE_ENV=production
```

---

## **TROUBLESHOOTING**

**Error: Cannot find module**
```bash
npm install
```

**Error: Port 3000 already in use**
- cPanel asigna puerto automáticamente
- Usar el puerto que cPanel especifica en Setup Node.js

**Error: Conexión BD**
- Verificar que DB_HOST sea accesible desde Namecheap
- Si no, usar IP pública del servidor BD

---

## **PRÓXIMOS PASOS**

1. Confirmar disponibilidad de Node.js
2. Si está disponible: FTP + Setup Node.js
3. Si NO está disponible: Usar Railway/Render (recomendado)
4. Hacer pruebas en producción
5. Configurar SSL/HTTPS (Namecheap lo hace automático)

