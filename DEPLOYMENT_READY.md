# 🚀 PROYECTO LISTO PARA DESPLIEGUE

**Estado:** ✅ Build compilado correctamente
**Fecha:** 2026-06-17
**Dominio:** olimpuades2026.com
**BD:** En servidor remoto (209.74.89.191)

---

## **ARCHIVOS PREPARADOS**

✅ `.env.production` - Variables de entorno para producción
✅ `next.config.js` - Configuración optimizada para producción
✅ `/.next` - Build compilado y listo

---

## **PRÓXIMOS PASOS**

### **OPCIÓN 1: NAMECHEAP + CPANEL (Si Node.js disponible)**

1. **Verificar Node.js en cPanel**
   - En cPanel busca: "Setup Node.js App"
   - Si existe → Usa esta opción
   - Si NO existe → Ve a Opción 2

2. **Descargar proyecto compilado**
   ```bash
   # Crear archivo comprimido
   npm run build  # Ya está hecho, pero verifica
   ```

3. **Subir por FTP**
   - Usar FileZilla, WinSCP o similar
   - Host: ftp.olimpuades2026.com
   - Usuario: olimachc
   - Contraseña: (tu contraseña cPanel)
   - Subir carpetas: `/public`, `/.next`, `/app`, `/components`, `/lib`, `node_modules` (opcional)
   - Archivos: `package.json`, `package-lock.json`, `.env.production`, `next.config.js`

4. **En cPanel → Setup Node.js App**
   - Node Version: v18 o superior
   - App Root: `/home/olimachc/public_html`
   - App URL: `olimpuades2026.com`
   - App Startup File: `npm start`

5. **SSH o Terminal en cPanel**
   ```bash
   cd /home/olimachc/public_html
   npm install
   npm run build
   ```

---

### **OPCIÓN 2: RAILWAY (Recomendado - Más fácil)**

Si Node.js NO está en Namecheap, usa Railway:

1. **Ir a https://railway.app**

2. **Sign up with GitHub**

3. **New Project → GitHub Repo → Selecciona este repo**

4. **Agregar variables de entorno:**
   ```
   DB_HOST=209.74.89.191
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=#21592159xD
   DB_NAME=campeonato_bd
   NEXTAUTH_SECRET=olimpiadas_campeonato_2026_secret_key_production
   NEXTAUTH_URL=https://olimpuades2026.com
   NODE_ENV=production
   ```

5. **Railway hace el build y deploy automático**

6. **Cambiar dominio en Namecheap:**
   - Namecheap → Domains → Manage → DNS
   - Agregar CNAME record de Railway

---

## **VERIFICACIÓN POST-DESPLIEGUE**

```
✅ Acceder a https://olimpuades2026.com
✅ Ver página de login
✅ Probar login: admin / admin123
✅ Ver dashboard
✅ Crear/editar partidos
✅ Verificar posiciones
✅ HTTPS funciona (certificado SSL)
```

---

## **INFORMACIÓN DEL SERVIDOR**

**cPanel:**
- Usuario: olimachc
- Dominio: olimpuades2026.com
- Home: /home/olimachc

**Base de Datos:**
- Host: 209.74.89.191
- Puerto: 3306
- Base: campeonato_bd
- Usuario: root

**Credenciales Login:**
- admin / admin123

---

## **¿NECESITAS AYUDA?**

1. **Revisa primero:**
   - Logs en cPanel (Error Logs)
   - Verificar variables de entorno
   - Verificar conexión a BD

2. **Si usas Railway:**
   - Dashboard → Deployments → Ver logs

3. **Si usas Namecheap:**
   - SSH → Revisar `npm start` output
   - cPanel → Setup Node.js App → Ver status

---

**¡Listo para desplegar! 🎉**

Avísame cuándo estés en cPanel y confirmamos si tiene Node.js.
