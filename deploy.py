#!/usr/bin/env python3
"""
Script de despliegue para Namecheap usando FTP
"""

import os
import ftplib
import sys

# CONFIGURACION
FTP_HOST = "ftp.olimpiadas2026.com"
FTP_USER = "olimcnhc"
FTP_PASS = "#21592159xDxD"
FTP_DIR = "/public_html"
LOCAL_DIR = r"D:\Campeonato"

# Archivos a subir
ITEMS_TO_UPLOAD = [
    "package.json",
    "package-lock.json",
    ".env.production",
    "next.config.js",
    "tsconfig.json",
]

def upload_file(ftp, local_path, remote_name):
    """Sube un archivo individual"""
    try:
        with open(local_path, 'rb') as f:
            ftp.storbinary(f'STOR {remote_name}', f)
        print(f"✓ {remote_name}")
        return True
    except Exception as e:
        print(f"✗ Error: {remote_name} - {e}")
        return False

def main():
    print("🚀 DESPLIEGUE A NAMECHEAP")
    print(f"Host: {FTP_HOST}")
    print(f"Usuario: {FTP_USER}")
    print()
    
    try:
        print("Conectando a FTP...")
        ftp = ftplib.FTP(FTP_HOST, FTP_USER, FTP_PASS, timeout=15)
        ftp.encoding = 'utf-8'
        print("✓ Conectado")
        
        ftp.cwd(FTP_DIR)
        print(f"✓ En {FTP_DIR}")
        print()
        
        print("📤 Subiendo archivos...")
        for item in ITEMS_TO_UPLOAD:
            local_path = os.path.join(LOCAL_DIR, item)
            if os.path.exists(local_path):
                upload_file(ftp, local_path, item)
            else:
                print(f"⚠ No existe: {item}")
        
        ftp.quit()
        
        print()
        print("✅ ARCHIVOS SUBIDOS")
        print()
        print("📋 PRÓXIMOS PASOS:")
        print("1. Sube manualmente: /app, /components, /lib, /public, /.next")
        print("2. En cPanel → Setup Node.js App")
        print("3. Configura: Node v18+, App Root: /home/olimcnhc/public_html")
        print("4. Comando: npm start")
        
    except ftplib.all_errors as e:
        print(f"❌ Error FTP: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
