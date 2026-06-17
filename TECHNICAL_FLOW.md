# Technical Flow: Standings System (Tabla de Posiciones)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: posiciones-section.tsx                               │
│ - Loads posiciones via /api/posiciones GET                     │
│ - Listens for 'resultadoGuardado' event                        │
│ - Groups and displays standings by disciplina & serie          │
└─────────────────────────────────────────────────────────────────┘
                              ↑↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: partidos-section.tsx                                 │
│ - Displays partidos table with "Colocar Resultado" button      │
│ - Modal: Enter resultado (goles/puntos) + select estado        │
│ - Calls /api/partidos PUT to save                              │
│ - Dispatches 'resultadoGuardado' event after save              │
└─────────────────────────────────────────────────────────────────┘
                              ↑↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend API Endpoints                                           │
│                                                                 │
│ POST /api/generar-partidos                                     │
│ - Creates partidos with estado='Programado'                    │
│ - Automatically generates Clausura versions                    │
│                                                                 │
│ GET /api/partidos                                              │
│ - Retrieves all partidos (both Programado and Finalizado)      │
│ - Returns: fecha_id, disciplina, serie, equipo1, equipo2,      │
│           goles_equipo1, goles_equipo2, puntos_individuales,   │
│           estado                                                │
│                                                                 │
│ PUT /api/partidos?id=X                                         │
│ - Updates partido with new resultado and estado                │
│ - Body: { goles_equipo1, goles_equipo2, puntos_individuales,   │
│          estado: 'Finalizado' }                                │
│                                                                 │
│ GET /api/posiciones?disciplinaId=X (optional filter)          │
│ - Calculates standings from ALL partidos WHERE estado='Finalizado'
│ - Groups by disciplina & serie                                 │
│ - Calculates: PJ, G, E, P, GF, GC, DG, Pts Total, Pts Apertura │
└─────────────────────────────────────────────────────────────────┘
                              ↑↓
┌─────────────────────────────────────────────────────────────────┐
│ Database: MySQL Tables                                          │
│                                                                 │
│ TblPartido                                                      │
│ ├── id (PRIMARY KEY)                                           │
│ ├── fecha_id (FK → TblFecha)                                   │
│ ├── disciplina_id (FK → TblDisciplina)                         │
│ ├── serie_id (FK → TblSeries)                                  │
│ ├── equipo1_id (FK → TblEquipo)                                │
│ ├── equipo2_id (FK → TblEquipo)                                │
│ ├── goles_equipo1 (INT, DEFAULT 0)                             │
│ ├── goles_equipo2 (INT, DEFAULT 0)                             │
│ ├── puntos_individuales (INT, nullable for individual sports)  │
│ ├── estado ENUM('Programado', 'En juego', 'Finalizado')        │
│ └── fecha_creacion, fecha_actualizacion                        │
│                                                                 │
│ TblFecha                                                        │
│ ├── id                                                          │
│ ├── nombre                                                      │
│ ├── tipo ENUM('Apertura', 'Clausura')                          │
│ └── ...                                                         │
│                                                                 │
│ TblEquipoDisciplina                                            │
│ ├── equipo_id (FK → TblEquipo)                                 │
│ ├── disciplina_id (FK → TblDisciplina)                         │
│ ├── serie_id (FK → TblSeries)                                  │
│ └── ...                                                         │
│                                                                 │
│ TblDisciplina                                                   │
│ ├── id                                                          │
│ ├── nombre                                                      │
│ ├── tipo_competicion ENUM('vs', 'puntos')                      │
│ └── ...                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Journey & Data Flow

### Step 1: Generate Partidos

```
User clicks 🍫 Chocolate
     ↓
Modal: Select Fecha (Apertura 1-5), Disciplinas, Sitio, Series
     ↓
POST /api/generar-partidos
  Body: {
    fechaId: 1,
    disciplinaId: 3,
    sitioId: 1,
    seriesIds: [1, 2]
  }
     ↓
[Backend] Creates partidos:
  - Insert into TblPartido for Fecha 1 (Apertura)
  - estado = 'Programado'
  - Automatically creates same partidos for Fecha 6 (Clausura)
  - Returns: { data: { partidos: [...] } }
     ↓
GET /api/partidos (refresh table)
     ↓
Display partidos in table with estado=Programado (gray)
```

---

### Step 2: Register Result

```
User clicks "Colocar Resultado" for a partido
     ↓
Modal opens with:
  - Resultado input fields (goles or puntos)
  - Estado dropdown: [Programado, En juego, Finalizado]
  - Sub-disciplinas (if individual sport)
     ↓
User fills in resultado and SELECTS "Finalizado"
     ↓
User clicks "✓ Guardar Resultado"
     ↓
PUT /api/partidos?id=123
  Body: {
    goles_equipo1: 3,
    goles_equipo2: 1,
    estado: 'Finalizado'
  }
     ↓
[Backend] Updates TblPartido:
  - SET goles_equipo1=3, goles_equipo2=1, estado='Finalizado'
  - WHERE id=123
     ↓
Frontend receives success response
     ↓
dispatch(new Event('resultadoGuardado'))
```

---

### Step 3: Calculate & Display Standings

```
Event: resultadoGuardado fired
     ↓
posiciones-section.tsx receives event
     ↓
GET /api/posiciones
     ↓
[Backend] posiciones/route.ts:
  1. Get ALL equipos from TblEquipoDisciplina
  2. Query partidos WHERE estado='Finalizado' (CRITICAL!)
  3. For each equipo:
     - Filter relevant partidos (same disciplina & serie)
     - Calculate:
       * victorias = count(goles_equipo > goles_contra)
       * empates = count(goles_equipo == goles_contra)
       * derrotas = count(goles_equipo < goles_contra)
       * goles_favor = sum(goles_equipo)
       * goles_contra = sum(goles_contra)
       * puntos_apertura = sum(pts from Apertura partidos)
       * puntos_clausura = sum(pts from Clausura partidos)
       * puntos_total = puntos_apertura + puntos_clausura
     - Mark es_ganador if highest points in serie
  4. Return grouped data
     ↓
Frontend receives posiciones data
     ↓
Display in Tabla de Posiciones:
  - Grouped by Disciplina
    - Grouped by Serie
      - Table with ranking
```

---

## Key Data Flows

### Flow A: VS Disciplines (Futbito, Basquetbol)

```
Partido: Equipo A vs Equipo B
         (equipo1_id != equipo2_id)

Input:
  goles_equipo1: 2
  goles_equipo2: 1
  estado: 'Finalizado'

Standings Calculation (for Equipo A):
  - esLocal: true (equipo1_id == equipo_id)
  - golesEquipo: 2
  - golesContrario: 1
  - 2 > 1 → VICTORIA
  - Puntos: 3
  - Goles Favor: +2
  - Goles Contra: +1
  - Diferencia Goles: +1

Standings Calculation (for Equipo B):
  - esLocal: false (equipo2_id == equipo_id)
  - golesEquipo: 1
  - golesContrario: 2
  - 1 < 2 → DERROTA
  - Puntos: 0
  - Goles Favor: +1
  - Goles Contra: +2
  - Diferencia Goles: -1
```

### Flow B: Individual Disciplines (Atletismo, Natación)

```
Partido: Atleta A (equipo1_id == equipo2_id)
         (self-match for scoring)

Input:
  puntos_individuales: 500
  estado: 'Finalizado'

Standings Calculation:
  - tipo_competicion: 'puntos'
  - puntosIndividuales: 500
  - Goles Favor: +500
  - Partidos Jugados: 1
  - Victorias/Empates/Derrotas: N/A (only suma de puntos)
```

---

## Critical Logic

### The "Finalizado" Requirement

**File**: `app/api/posiciones/route.ts`

```typescript
// ONLY fetch partidos where estado='Finalizado'
const [todosLosPartidosResults] = await connection.query(`
  SELECT * FROM TblPartido p
  LEFT JOIN TblFecha f ON p.fecha_id = f.id
  LEFT JOIN TblDisciplina d ON p.disciplina_id = d.id
  WHERE p.estado = 'Finalizado'  ← THIS IS THE KEY
  LIMIT 10000
`);
```

**Why**: 
- Partidos start with estado='Programado'
- Only when user explicitly sets to 'Finalizado' are they counted
- Prevents accidental/incomplete results from appearing in standings

---

## State Transitions

```
[Programado] ← Initial state (created by generar-partidos)
     ↓
     ├─→ [En juego] ← Optional (user can set this)
     │      ↓
     │      └─→ [Finalizado] ← FINAL state (for standings)
     │
     └─→ [Finalizado] ← Direct transition (most common)
            ↓
            Appears in Standings ✓
```

---

## Event System

### resultadoGuardado Event

```javascript
// In partidos-section.tsx: handleSaveResultado()
window.dispatchEvent(new Event('resultadoGuardado'));

// In posiciones-section.tsx: useEffect()
window.addEventListener('resultadoGuardado', fetchPosiciones);
```

This allows real-time standings updates without page refresh.

---

## Data Consistency Rules

### Rule 1: Individual Disciplines
```
equipo1_id === equipo2_id (self-match)
tipo_competicion === 'puntos'
Result: puntos_individuales (not goles)
```

### Rule 2: VS Disciplines
```
equipo1_id !== equipo2_id (different teams)
tipo_competicion === 'vs'
Result: goles_equipo1 and goles_equipo2
```

### Rule 3: Apertura ↔ Clausura Sync
```
When generar-partidos creates a partido for Fecha 1-5 (Apertura):
  1. Creates partido for Fecha 1
  2. Automatically creates matching partido for Fecha (id+5) (Clausura)
  3. Both start with estado='Programado'
  4. Both must be finalized separately
```

---

## Error Scenarios

### Scenario 1: User sees "No hay datos"
```
✗ No partidos generated
✗ Partidos generated but NO resultados registered
✗ Resultados registered but estado still = 'Programado'
✓ Solution: Must change to 'Finalizado' for standings
```

### Scenario 2: Standings shows old data
```
✗ Frontend has cached posiciones
✓ Solution: Event system should auto-refresh
✓ Manual: User can refresh page (F5)
```

### Scenario 3: Partial standings
```
✓ Expected: Shows only teams with finalized partidos
✓ Other teams: Not shown (0 partidos played)
```

---

## Testing Checklist

- [ ] Generate Futbito partidos for Fecha 1
- [ ] Register resultado for one Futbito match, set estado='Finalizado'
- [ ] Verify standings shows updated points for both teams
- [ ] Generate Atletismo partidos for Fecha 1
- [ ] Register puntos for one athlete
- [ ] Verify individual athlete appears in posiciones
- [ ] Generate Clausura partidos (Fecha 6)
- [ ] Verify Apertura & Clausura points separated in table
- [ ] Change a resultado, verify standings update in real-time
- [ ] Reload page, verify standings persist

---

## Performance Notes

**Query Optimization**:
- Fetch ALL partidos WHERE estado='Finalizado' once
- Loop through equipos, filter by (disciplina_id, serie_id, equipo_id)
- Reduces DB queries from O(n*m) to O(1) + loop

**Scalability**:
- Current: LIMIT 10000 partidos (should be sufficient)
- For millions: Consider pagination or caching layer

**Frontend**:
- Event-driven updates (no polling)
- Component re-renders on 'resultadoGuardado' only
- Efficient grouping logic in agruparPosiciones()
