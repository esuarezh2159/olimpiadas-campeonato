# Guía Completa: Tabla de Posiciones (Standings)

## 🎯 Objetivo
Mostrar automáticamente la tabla de posiciones de cada disciplina una vez que se registren y finalicen los partidos.

## 📊 Flujo Completo

### 1️⃣ Generar Partidos
- Ve a **Gestión de Partidos** → Haz clic en **🍫 Chocolate**
- Selecciona:
  - **Fecha**: Elige una fecha de Apertura (1-5)
  - **Disciplinas**: Selecciona una o más (Futbito, Basquetbol, Atletismo, etc.)
  - **Sitio**: Elige el sitio
  - **Series**: Selecciona las series a "chocolatear"
- Haz clic en **🍫 Generar Partidos**

**Resultado**: Se crean partidos con `estado='Programado'`

```
Estado actual de los partidos: Programado ✓ Listo para registrar resultados
```

---

### 2️⃣ Registrar Resultado (Colocar Puntos/Goles)

En la tabla **Gestión de Partidos**, para cada partido:

1. Haz clic en el botón **Colocar Resultado** (verde)
2. Se abre un modal con:
   - **Para disciplinas VS** (Futbito, Basquetbol):
     - Ingresa goles del equipo local
     - Ingresa goles del equipo visitante
   
   - **Para disciplinas Individuales** (Atletismo, Natación, Billar, etc.):
     - Si tiene sub-disciplinas: Ingresa puntos para cada sub-disciplina
     - Sin sub-disciplinas: Ingresa el total de puntos

---

### 3️⃣ ⚠️ **PASO CRÍTICO**: Cambiar Estado a "Finalizado"

**ESTO ES LO MÁS IMPORTANTE:**

En el mismo modal, encontrarás un dropdown **Estado del Partido**:

```
□ Programado    ← El valor por defecto
□ En juego
☑ Finalizado    ← DEBES seleccionar ESTO para que el partido cuente en posiciones
```

**SIN cambiar a "Finalizado", el partido NO aparecerá en la tabla de posiciones.**

---

### 4️⃣ Guardar Resultado

Haz clic en **✓ Guardar Resultado**

**Lo que sucede automáticamente:**
- ✓ Se guardan los goles/puntos
- ✓ Se cambia el estado a "Finalizado" (si lo seleccionaste)
- ✓ Se dispara un evento que actualiza la tabla de posiciones
- ✓ Los datos se reflejan en **Tabla de Posiciones**

---

### 5️⃣ Ver Tabla de Posiciones

Ve a la sección **Tabla de Posiciones** en el dashboard:

```
Tabla de Posiciones
├── Futbito
│   ├── Serie A
│   │   ├── Equipo A: 3 pts (Apertura) + 0 pts (Clausura) = 3 pts
│   │   ├── Equipo B: 1 pts (Apertura) + 0 pts (Clausura) = 1 pts
│   │   └── Equipo C: 0 pts (Apertura) + 0 pts (Clausura) = 0 pts
│   └── Serie B
│       └── ...
├── Atletismo
│   └── Serie Única
│       ├── Atleta A: 500 pts
│       ├── Atleta B: 450 pts
│       └── Atleta C: 400 pts
└── ...
```

---

## 🔍 ¿Por qué no veo datos en Posiciones?

### ❌ Problema: "No hay datos de posiciones disponibles"

**Causas comunes:**

1. **No has registrado resultados aún**
   - ✓ Solución: Haz clic en "Colocar Resultado" para cada partido

2. **Registraste resultados pero NO cambiaste a "Finalizado"**
   - ✓ Solución: Cambia el estado a "Finalizado" antes de guardar

3. **No has creado partidos aún**
   - ✓ Solución: Usa el botón 🍫 Chocolate para generar partidos

### ✅ Cómo verificar

En la tabla **Gestión de Partidos**, verifica que el Estado sea:
- Verde con "Finalizado" ✓ → Aparecerá en posiciones
- Gris con "Programado" ✗ → NO aparecerá en posiciones
- Amarillo con "En juego" ? → NO contará (requiere cambiar a Finalizado)

---

## 📋 Resumen de Estados

| Estado | Significado | ¿Cuenta en Posiciones? |
|--------|-------------|:----------------------:|
| **Programado** | Partido pendiente de disputar | ❌ No |
| **En juego** | Partido en proceso | ❌ No |
| **Finalizado** | Partido jugado y resultado registrado | ✅ SÍ |

---

## 🎮 Ejemplo Paso a Paso

### Generar Atletismo Fecha 1

1. Dashboard → **Gestión de Partidos** → **🍫 Chocolate**
2. Selecciona:
   - Fecha: "Fecha 1 - Apertura"
   - Disciplinas: ☑ Atletismo
   - Sitio: "Estadio Principal"
   - Series: ☑ Serie Única
3. Click: **🍫 Generar Partidos**
4. Se crean 6 partidos de Atletismo con `estado='Programado'`

### Registrar Resultados

En la tabla, ves:
```
Atleta A vs Atleta A    | 0 - 0 | Programado | [Colocar Resultado]
Atleta B vs Atleta B    | 0 - 0 | Programado | [Colocar Resultado]
```

5. Click: **Colocar Resultado** para Atleta A
6. Ingresa puntos: 500
7. **IMPORTANTE**: Cambia Estado a **"Finalizado"**
8. Click: **✓ Guardar Resultado**

**Resultado**: El estado cambia a verde "Finalizado" ✓

9. Repite pasos 5-8 para cada atleta

### Ver Tabla de Posiciones

10. Dashboard → **Tabla de Posiciones**
11. Verás:

```
Atletismo
└── Serie Única
    ├── 🏆 Atleta A: 500 pts (Apertura: 500, Clausura: 0)
    ├── #2  Atleta B: 450 pts (Apertura: 450, Clausura: 0)
    └── #3  Atleta C: 400 pts (Apertura: 400, Clausura: 0)
```

---

## 💡 Notas Importantes

1. **Apertura vs Clausura**:
   - Las fechas 1-5 son **Apertura**
   - Las fechas 6-10 son **Clausura**
   - Los puntos se suman de ambas para obtener el total

2. **Disciplinas Individuales vs VS**:
   - **Individuales** (Atletismo, Natación, etc.): El "partido" es atleta vs sí mismo, se registran puntos
   - **VS** (Futbito, Basquetbol): Hay dos equipos, se registran goles

3. **Generación Automática de Clausura**:
   - Cuando generas partidos en Apertura, automáticamente se crean los mismos en Clausura
   - Los partidos en Clausura se crean con `estado='Programado'` (deben finalizarse también)

4. **Ganador de la Serie**:
   - El equipo/atleta con más puntos totales aparece como 🏆 Ganador
   - Si hay empate, gana por diferencia de goles (en VS) o goles a favor (en individuales)

---

## 🚀 Próximos Pasos

1. **Automatizar finalización**: Podría agregarse checkbox "Finalizar automáticamente" en modal
2. **Importación de resultados**: Podría subirse archivo CSV con resultados
3. **Vista previa de resultados**: Mostrar posiciones predichas con partidos no finalizados
4. **Historial de cambios**: Registrar quién y cuándo cambió cada resultado

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que generaste partidos con 🍫 Chocolate
2. Abre cada partido y haz clic en "Colocar Resultado"
3. **IMPORTANTE**: Cambia a "Finalizado" antes de guardar
4. Recarga la página (F5) para ver cambios en posiciones
5. Revisa la consola del navegador (F12) para errores
