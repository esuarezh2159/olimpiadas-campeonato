# ✅ CHECKLIST DE DESPLIEGUE

## **1. VERIFICAR NODE.JS EN CPANEL**

**Acción:** Toma screenshot del menú principal de cPanel
**Busca:** 
- [ ] "Setup Node.js App"
- [ ] "Node.js"
- [ ] "Developer Tools"

---

## **2. PREPARAR PROYECTO LOCALMENTE**

```bash
# 1. Limpiar caché
rm -r .next
rm -r node_modules

# 2. Instalar dependencias
npm install

# 3. Compilar para producción
npm run build

# 4. Verificar que compiló sin errores
# Debería decir: "Compiled successfully"
```

---

## **3. OPCIÓN A: DESPLEGAR EN NAMECHEAP (Si Node.js disponible)**

### **Paso 3A.1: Subir archivos por FTP**

Usar programa FTP como:
- **FileZilla** (gratis)
- **WinSCP** (gratis)
- **Cyberduck** (gratis)

**Credenciales:**
```
Host: ftp.olimpuades2026.com
Usuario: olimachc
Contraseña: (tu contraseña cPanel)
Puerto: 21
```

**Archivos a subir:**
```
📁 /public
📁 /.next
📁 /app
📁 /components
📁 /lib
📁 /node_modules (opcional - instalar en servidor)
📄 package.json
📄 package-lock.json
📄 .env.production
📄 next.config.js
📄 tsconfig.json
```

**Ruta destino:** `/home/olimachc/public_html`

---

### **Paso 3A.2: Configurar Node.js en cPanel**

1. En cPanel → **Setup Node.js App**
2. Llenar formulario:
   - **Node Version:** v18 o superior
   - **App Root:** `/home/olimachc/public_html`
   - **App URL:** `olimpuades2026.com`
   - **App Startup File:** `server.js` o `npm start`

3. Guardar

---

### **Paso 3A.3: Instalar dependencias en servidor**

1. En cPanel → **Terminal** (o SSH)
2. Ejecutar:
```bash
cd /home/olimachc/public_html
npm install
npm run build
```

3. El app debería iniciar automáticamente

---

## **3. OPCIÓN B: DESPLEGAR EN RAILWAY (Si Node.js NO disponible)**

Esta es la **opción recomendada** si Namecheap no tiene Node.js.

### **Paso 3B.1: Preparar repositorio Git**

```bash
# En tu máquina local
git add .
git commit -m "Deployment ready for production"
git push origin main
```

### **Paso 3B.2: Crear cuenta en Railway**

1. Ir a https://railway.app
2. Sign up with GitHub
3. Autorizar acceso

### **Paso 3B.3: Crear nuevo proyecto**

1. Dashboard → New Project → GitHub Repo
2. Seleccionar este repositorio
3. Railway detectará automáticamente que es Next.js

### **Paso 3B.4: Agregar variables de entorno**

En Railway → Project Settings → Variables:
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

### **Paso 3B.5: Desplegar**

1. Railway detecta cambios automáticamente
2. Build y deploy automático
3. Acceder a URL de Railway

---

## **4. CONFIGURAR DOMINIO**

### **Si usas Namecheap:**
El dominio ya está configurado. Solo verificar DNS.

### **Si usas Railway:**
1. En Railway → Domains → Add Domain
2. Agregar: `olimpuades2026.com`
3. Railway mostrará CNAME record
4. En Namecheap → DNS → Cambiar A Record a CNAME de Railway

---

## **5. VERIFICACIÓN FINAL**

```
✅ Acceder a https://olimpuades2026.com
✅ Ver página de login
✅ Probar login: admin / admin123
✅ Navegar por dashboard
✅ Crear un partido de prueba
✅ Verificar posiciones
✅ Probar editar equipos
✅ Probar cambiar horario
✅ HTTPS funciona (certificado SSL)
```

---

## **6. MONITOREO EN PRODUCCIÓN**

### **Si usas Railway:**
Dashboard → Deployments → Ver logs en tiempo real

### **Si usas Namecheap + cPanel:**
cPanel → Error Logs
O SSH → tail -f logs/error.log

---

## **7. ROLLBACK (Si algo falla)**

### **Railway:**
Dashboard → Deployments → Click versión anterior → Redeploy

### **Namecheap:**
Restaurar archivos desde backup FTP anterior

---

## **8. ACTUALIZACIONES FUTURAS**

Una vez desplegado:

### **Para actualizar:**
```bash
# Local
npm run build
# Subir nuevamente los archivos
# O hacer git push si usas Railway (auto-deploy)
```

### **Railway (automático):**
```bash
git push origin main
# Railway detecta cambios y redeploy automático
```

---

## **SOPORTE**

**Si algo falla:**
1. Revisar los logs (cPanel Error Logs o Railway Logs)
2. Verificar variables de entorno
3. Verificar conexión a BD
4. Contactar soporte Namecheap/Railway

---

**¡Listo para desplegar!** 🚀

