#!/usr/bin/env python3
"""
Script de despliegue para Namecheap usando SFTP (SSH)
No necesita contraseña, usa clave SSH
"""

import os
import sys
import paramiko
from pathlib import Path

# CONFIGURACION
SFTP_HOST = "olimpuades2026.com"
SFTP_USER = "olimachc"
PRIVATE_KEY_PATH = r"C:\Users\2308TK0503632\Downloads\campeonato_deploy_v2"
KEY_PASSWORD = "#21592159xDxD"
REMOTE_DIR = "/home/olimachc/public_html"
LOCAL_DIR = r"D:\Campeonato"

# Archivos/carpetas a subir
ITEMS_TO_UPLOAD = [
    "package.json",
    "package-lock.json",
    ".env.production",
    "next.config.js",
    "tsconfig.json",
    "public",
    "app",
    "components",
    "lib",
    ".next"
]

def upload_file(sftp, local_path, remote_path):
    """Sube un archivo individual"""
    try:
        sftp.put(local_path, remote_path)
        print(f"✓ {remote_path}")
        return True
    except Exception as e:
        print(f"✗ Error subiendo {remote_path}: {e}")
        return False

def upload_directory(sftp, local_dir, remote_dir):
    """Sube una carpeta completa"""
    try:
        sftp.mkdir(remote_dir)
    except IOError:
        pass  # Carpeta ya existe
    
    for item in os.listdir(local_dir):
        if item in ['.git', 'node_modules', '.next', '.env.local', 'bak.sql']:
            continue
            
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}".replace("\\", "/")
        
        if os.path.isfile(local_path):
            upload_file(sftp, local_path, remote_path)
        elif os.path.isdir(local_path):
            print(f"📁 Subiendo carpeta {item}...")
            upload_directory(sftp, local_path, remote_path)

def main():
    print("🚀 DESPLIEGUE A NAMECHEAP (SFTP)")
    print(f"Servidor: {SFTP_HOST}")
    print(f"Usuario: {SFTP_USER}")
    print(f"Clave: {PRIVATE_KEY_PATH}")
    print()
    
    try:
        # Verificar que la clave existe
        if not os.path.exists(PRIVATE_KEY_PATH):
            print(f"❌ Clave no encontrada: {PRIVATE_KEY_PATH}")
            print("Asegúrate de que campeonato_deploy está en Descargas")
            sys.exit(1)
        
        print("Conectando por SFTP...")
        
        # Crear cliente SSH
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Conectar con clave privada
        ssh.connect(
            SFTP_HOST,
            username=SFTP_USER,
            key_filename=PRIVATE_KEY_PATH,
            password=KEY_PASSWORD,
            timeout=10
        )
        print("✓ Conectado por SSH")
        
        # Abrir SFTP
        sftp = ssh.open_sftp()
        print("✓ SFTP iniciado")
        print()
        
        # Cambiar directorio remoto
        try:
            sftp.chdir(REMOTE_DIR)
        except IOError:
            print(f"⚠ Directorio no existe, creando: {REMOTE_DIR}")
            sftp.mkdir(REMOTE_DIR)
            sftp.chdir(REMOTE_DIR)
        
        print(f"✓ En directorio {REMOTE_DIR}")
        print()
        
        # Subir archivos
        print("📤 Subiendo archivos...")
        for item in ITEMS_TO_UPLOAD:
            local_path = os.path.join(LOCAL_DIR, item)
            
            if not os.path.exists(local_path):
                print(f"⚠ No existe: {item}")
                continue
            
            if os.path.isfile(local_path):
                upload_file(sftp, local_path, item)
            else:
                print(f"📁 Subiendo carpeta {item}...")
                upload_directory(sftp, local_path, item)
        
        sftp.close()
        ssh.close()
        
        print()
        print("✅ DESPLIEGUE COMPLETADO")
        print()
        print("📋 PRÓXIMOS PASOS:")
        print("Opción 1 - Por Terminal/SSH:")
        print("  cd public_html")
        print("  npm install")
        print("  npm run build")
        print("  npm start")
        print()
        print("Opción 2 - Por cPanel Setup Node.js:")
        print("  1. cPanel → Setup Node.js App")
        print("  2. Configurar y guardar")
        print("  3. Debería iniciar automáticamente")
        
    except paramiko.AuthenticationException:
        print("❌ Error de autenticación. Verifica la clave SSH")
        sys.exit(1)
    except paramiko.SSHException as e:
        print(f"❌ Error SSH: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
