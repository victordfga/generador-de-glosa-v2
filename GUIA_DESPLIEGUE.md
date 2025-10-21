# 🚀 Guía de Despliegue - Generador de Glosas SIGA

## 📋 Opciones para Compartir la Aplicación

### **Opción 1: GitHub Pages (RECOMENDADA) - GRATIS**

#### Para el Administrador (Tú):
1. **Crear repositorio en GitHub:**
   - Ve a [GitHub.com](https://github.com)
   - Crea un nuevo repositorio llamado `generador-glosas-siga`
   - Hazlo público

2. **Subir el código:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/generador-glosas-siga.git
git push -u origin main
```

3. **Activar GitHub Pages:**
   - Ve a Settings > Pages
   - Source: "GitHub Actions"
   - El workflow se ejecutará automáticamente

4. **URL de la aplicación:**
   - `https://TU-USUARIO.github.io/generador-glosas-siga/`

#### Para tus Compañeros:
- **Solo necesitan la URL** - ¡No instalan nada!
- Acceden desde cualquier navegador
- Funciona en móviles, tablets y computadoras

---

### **Opción 2: Netlify (GRATIS) - ALTERNATIVA**

1. **Subir a GitHub** (pasos 1-2 de arriba)
2. **Conectar con Netlify:**
   - Ve a [netlify.com](https://netlify.com)
   - "New site from Git"
   - Conecta tu repositorio
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **URL automática:** `https://random-name.netlify.app`

---

### **Opción 3: Distribución Local (SIN INTERNET)**

#### Para Compartir Archivos:
1. **Construir la aplicación:**
```bash
npm run build
```

2. **Comprimir la carpeta `dist`:**
   - Comprime la carpeta `dist` en un ZIP
   - Comparte el archivo ZIP

#### Para tus Compañeros:
1. **Extraer el ZIP**
2. **Abrir `index.html`** en cualquier navegador
3. **¡Listo!** - No necesitan instalar nada

---

### **Opción 4: Servidor Local (RED INTERNA)**

#### Para el Administrador:
1. **Construir la aplicación:**
```bash
npm run build
```

2. **Servir archivos estáticos:**
```bash
# Opción A: Python (si tienen Python)
cd dist
python -m http.server 8000

# Opción B: Node.js
npx serve dist -p 8000

# Opción C: Live Server (VS Code)
# Instalar extensión "Live Server" y abrir index.html
```

3. **Compartir IP local:**
   - `http://TU-IP:8000` (ej: `http://192.168.1.100:8000`)

#### Para tus Compañeros:
- Acceder a la IP desde cualquier navegador en la misma red

---

## 🎯 **Recomendación Final**

### **Para Uso Profesional:**
- **GitHub Pages** (Opción 1) - Más profesional, siempre actualizado
- **Netlify** (Opción 2) - Alternativa excelente

### **Para Uso Rápido:**
- **Distribución Local** (Opción 3) - Más simple, no requiere internet

### **Para Red Interna:**
- **Servidor Local** (Opción 4) - Control total, sin dependencias externas

---

## 📱 **Características de la Aplicación Desplegada**

✅ **Funciona en cualquier dispositivo**
✅ **No requiere instalación**
✅ **Datos se guardan localmente**
✅ **Funciona offline después de cargar**
✅ **Interfaz responsive**
✅ **Actualizaciones automáticas** (GitHub Pages/Netlify)

---

## 🔧 **Comandos Útiles**

```bash
# Construir para producción
npm run build

# Previsualizar build local
npm run preview

# Servir archivos estáticos
npx serve dist -p 8000

# Verificar que todo funciona
npm run dev
```

---

## 📞 **Soporte**

Si tus compañeros tienen problemas:
1. **Verificar navegador:** Chrome, Firefox, Edge (versiones recientes)
2. **Habilitar JavaScript:** Debe estar habilitado
3. **Limpiar caché:** Ctrl+F5 para recargar
4. **Verificar conexión:** Para opciones online

¡La aplicación está lista para compartir! 🚀
