# Validation Checklist: Standings System

Use this checklist to verify the standings system is working correctly.

---

## Pre-flight Checks

### Database & Server
- [ ] MySQL server is running (verify in MySQL Workbench or cmd)
- [ ] Node.js dev server is running (http://localhost:3000)
- [ ] Can access Dashboard without errors
- [ ] Can navigate between pages (no 500 errors)

### Required Tables
- [ ] `TblPartido` exists with `estado` column
- [ ] `TblEquipoDisciplina` exists with teams
- [ ] `TblDisciplina` exists with disciplinas
- [ ] `TblFecha` exists with 10 fechas (1-10)
- [ ] `TblSeries` exists with series
- [ ] `TblEquipo` exists with teams

---

## Phase 1: Generate Partidos

### Step 1: Navigate to Gestión de Partidos
- [ ] Dashboard visible
- [ ] Can click "Gestión de Partidos" tab
- [ ] Table is empty or shows existing partidos
- [ ] 🍫 Chocolate button is visible

### Step 2: Open Chocolate Modal
- [ ] Click 🍫 Chocolate button
- [ ] Modal opens without errors
- [ ] Modal title: "🍫 Generador de Partidos - Chocolate"
- [ ] See 4 dropdown/selector sections

### Step 3: Fill Selections
- [ ] Can select Fecha (Apertura 1-5 only) ✓
- [ ] Can select Disciplinas (checkboxes work)
- [ ] Can select Sitio (dropdown loads)
- [ ] Can select Series (checkboxes work)

### Step 4: Generate Partidos
- [ ] Click "🍫 Generar Partidos" button
- [ ] Button shows "Generando..." briefly
- [ ] Success: Green box shows "✓ X partidos generados"
- [ ] No error messages
- [ ] Modal auto-closes after 800ms

### Step 5: Verify Partidos Created
- [ ] Go back to "Gestión de Partidos" table
- [ ] New partidos appear in table
- [ ] All partidos show `estado = "Programado"` (gray) ✓
- [ ] Count matches expected (e.g., 6 for Atletismo)

---

## Phase 2: Register Results

### Step 1: Find a Partido
- [ ] Scroll to first "Programado" partido
- [ ] Verify it's the sport you want (check disciplina_nombre column)

### Step 2: Open Resultado Modal
- [ ] Click "Colocar Resultado" button (green)
- [ ] Modal opens with title "Registrar Resultado"
- [ ] No error messages

### Step 3: Verify Modal Content

#### For VS Disciplines (Futbito, Basquetbol):
- [ ] Shows "Local" equipo name
- [ ] Shows input field for local goles
- [ ] Shows "VS" separator
- [ ] Shows "Visitante" equipo name
- [ ] Shows input field for visitante goles

#### For Individual Disciplines (Atletismo, Natación, etc.):
- [ ] Shows athlete/equipo name (not "Local vs Visitante")
- [ ] Shows input field for "Puntos" or "Puntos por Sub-disciplina"
- [ ] For Atletismo: Shows inputs for each sub-discipline (100m, 200m, etc.)

### Step 4: Verify Estado Selector
- [ ] **CRITICAL**: Can see "Estado del Partido" label
- [ ] Dropdown shows 3 options:
  - [ ] Programado
  - [ ] En juego
  - [ ] Finalizado

### Step 5: Enter Resultado
- [ ] Enter goles/puntos in input fields
  - For Futbito: e.g., "3" and "1"
  - For Atletismo: e.g., "100", "85", "90" (per sub-discipline)
  - For Natación: e.g., "95" (total)
- [ ] Values accepted without error

### Step 6: **⭐ CRITICAL - Change Estado**
- [ ] Click estado dropdown
- [ ] Currently shows "Programado"
- [ ] **SELECT "Finalizado"** ← Most important step
- [ ] Verify selection changed to "Finalizado"

### Step 7: Save Resultado
- [ ] Click "✓ Guardar Resultado" button
- [ ] Modal closes after 1-2 seconds
- [ ] No error messages in console (F12)

---

## Phase 3: Verify Event & Update

### Step 1: Check Partidos Table
- [ ] Refresh table or wait 1 second
- [ ] Resultado appears: Shows goles/puntos instead of "0-0"
- [ ] Estado changed to "Finalizado" (green badge)

### Step 2: Check Browser Console
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Should see no error messages
- [ ] May see API call logs

### Step 3: Navigate to Standings
- [ ] Go to "Tabla de Posiciones" tab
- [ ] Wait for page to load (shows loading message briefly)

---

## Phase 4: Verify Standings Display

### First Time (Minimal Data)
- [ ] Standings is NOT showing "No hay datos..."
- [ ] Instead, shows standings section for your disciplina
- [ ] Correct disciplina name appears (e.g., "Atletismo")
- [ ] Correct serie name appears (e.g., "Serie Única")

### Standings Table Content
- [ ] Table header shows columns:
  - [ ] Pos (position)
  - [ ] Equipo/Nombre
  - [ ] PJ (Partidos Jugados)
  - [ ] Pts Apertura
  - [ ] Pts Clausura
  - [ ] Pts Total
  - (Other stats: G, E, P, GF, GC, DG)

### Standings Data
- [ ] At least 1 team/athlete appears
- [ ] Your team/athlete shows correct puntos
- [ ] Partidos Jugados = 1 (if you finalized 1 partido)
- [ ] Pts Total > 0 (shows your points)

### Winner Marking
- [ ] If only 1 team: Shows 🏆 Ganador badge
- [ ] If multiple teams: Highest points shows 🏆

---

## Phase 5: Real-Time Update Test

### Step 1: Register Another Resultado
- [ ] Go back to "Gestión de Partidos"
- [ ] Find another "Programado" partido
- [ ] Click "Colocar Resultado"
- [ ] Enter resultado
- [ ] **Change estado to "Finalizado"**
- [ ] Click "✓ Guardar Resultado"

### Step 2: Verify Auto-Refresh
- [ ] Go to "Tabla de Posiciones"
- [ ] **Without manual refresh**: Standings should update
- [ ] New team/athlete appears OR new points added
- [ ] Change happened within 1-2 seconds
- [ ] No page reload needed ✓

---

## Phase 6: Apertura & Clausura Test

### Step 1: Check Current Partidos
- [ ] Go to "Gestión de Partidos"
- [ ] Filter by Fecha: Select "Fecha 1 - Apertura"
- [ ] Verify you have partidos for Fecha 1

### Step 2: Check Auto-Generated Clausura
- [ ] Filter by Fecha: Select "Fecha 6 - Clausura"
- [ ] Should show SAME partidos (automatically generated)
- [ ] Count matches Fecha 1
- [ ] All should be "Programado" (not yet finalized)

### Step 3: Finalize Apertura Matches
- [ ] Go back to "Gestión de Partidos"
- [ ] Filter: Fecha 1 (Apertura)
- [ ] Finalize at least 2-3 partidos
- [ ] Go to "Tabla de Posiciones"
- [ ] Check "Pts Apertura" column

### Step 4: Finalize Clausura Matches
- [ ] Go back to "Gestión de Partidos"
- [ ] Filter: Fecha 6 (Clausura)
- [ ] Finalize at least 2-3 matching partidos
- [ ] Go to "Tabla de Posiciones"
- [ ] Verify "Pts Clausura" shows points
- [ ] Verify "Pts Total" = Apertura + Clausura

---

## Phase 7: Edge Cases & Error Handling

### Test 1: Leave Estado as Programado
- [ ] Register resultado but DON'T change estado
- [ ] Leave it as "Programado"
- [ ] Click "Guardar Resultado"
- [ ] Go to standings
- [ ] Verify: Partido should NOT appear in standings ✓
- [ ] Go back to partidos table
- [ ] Verify: Resultado shows but estado still "Programado"

### Test 2: Change Resultado Multiple Times
- [ ] Click "Colocar Resultado" on a finalized partido
- [ ] Change the goles/puntos
- [ ] **Verify**: estado is still "Finalizado"
- [ ] Click "Guardar Resultado"
- [ ] Go to standings
- [ ] Verify: Standings updated with new values
- [ ] Verify: Points reflect new resultado ✓

### Test 3: Access Standings Without Any Finalized Partidos
- [ ] Reset all partidos (delete or keep as Programado)
- [ ] Go to "Tabla de Posiciones"
- [ ] Should show: "No hay datos de posiciones disponibles"
- [ ] With helpful instructions ✓

### Test 4: Filter Standings by Disciplina
- [ ] Go to "Tabla de Posiciones"
- [ ] Click disciplina filter dropdown
- [ ] Select specific disciplina (e.g., "Atletismo")
- [ ] Table updates to show only that disciplina ✓
- [ ] Select "Todas las disciplinas"
- [ ] Table shows all disciplinas ✓

---

## Phase 8: Data Accuracy

### Test 1: VS Discipline Calculations
- [ ] Create Futbito: Equipo A 3 - Equipo B 1
- [ ] Check standings:
  - [ ] Equipo A: 1 victoria, 3 puntos, +2 diferencia
  - [ ] Equipo B: 1 derrota, 0 puntos, -2 diferencia

### Test 2: Individual Discipline Calculations
- [ ] Create Atletismo: Atleta A = 500 puntos
- [ ] Check standings:
  - [ ] Atleta A: 1 PJ, 500 puntos
  - [ ] Goles Favor: 500

### Test 3: Sub-Discipline Aggregation
- [ ] Create Atletismo with sub-disciplines:
  - [ ] 100m: 100 puntos
  - [ ] 200m: 150 puntos
  - [ ] Lanzamiento: 200 puntos
- [ ] Check standings:
  - [ ] Total: 450 puntos ✓

---

## Phase 9: Performance

### Test 1: Response Time
- [ ] Action: Register resultado
- [ ] Expected: "Guardar Resultado" processes in < 1 second
- [ ] Expected: Standings refresh within 1-2 seconds

### Test 2: Multiple Simultaneous Changes
- [ ] Generate 10+ partidos
- [ ] Finalize 5+ in quick succession
- [ ] Verify: No timeouts or crashes
- [ ] Verify: Final standings correct after all updates

### Test 3: Page Load Time
- [ ] Navigate to "Tabla de Posiciones" with 50+ finalized partidos
- [ ] Expected: Page loads in < 2 seconds
- [ ] No freezing or lag

---

## Phase 10: UI/UX Verification

### Visual Elements
- [ ] Colors are consistent (green=Finalizado, gray=Programado)
- [ ] Buttons are clickable and responsive
- [ ] Text is readable (proper contrast)
- [ ] Layout is responsive (works on different screen sizes)
- [ ] Modals have proper close buttons
- [ ] Error messages (if any) are clear

### Accessibility
- [ ] Can tab through form fields
- [ ] Can submit forms with Enter key
- [ ] Labels are associated with inputs
- [ ] Tables are readable with screen reader

---

## Final Validation

### All Systems Go? ✅
- [ ] Phase 1: Partidos generated ✓
- [ ] Phase 2: Resultados registered ✓
- [ ] Phase 3: Events & updates working ✓
- [ ] Phase 4: Standings display correct ✓
- [ ] Phase 5: Real-time updates working ✓
- [ ] Phase 6: Apertura/Clausura correct ✓
- [ ] Phase 7: Edge cases handled ✓
- [ ] Phase 8: Data accurate ✓
- [ ] Phase 9: Performance acceptable ✓
- [ ] Phase 10: UI/UX good ✓

### Issues Found
```
(Document any issues here)
- Issue 1: ___________________
- Issue 2: ___________________
- Issue 3: ___________________
```

### Sign-Off
- **Validated By**: _______________
- **Date**: _______________
- **Status**: ✅ PASS / ⚠️ NEEDS FIXES / ❌ FAIL

---

## Troubleshooting Tips

If you encounter issues:

1. **Check estado selector**
   - Make sure you're changing to "Finalizado"
   - Most common issue is leaving it as "Programado"

2. **Refresh if needed**
   - Standings may not update immediately
   - F5 to refresh page
   - Close and reopen modal if issues persist

3. **Check browser console**
   - F12 → Console tab
   - Look for error messages
   - Note any red text errors

4. **Verify database**
   - Check MySQL connection
   - Verify tables exist
   - Check sample data in TblPartido

5. **Clear browser cache**
   - Ctrl+Shift+Delete
   - Clear cached images & files
   - Retry operation

---

## Support

If validation fails:
1. Check all steps completed correctly
2. Review POSICIONES_GUIDE.md for details
3. Check TECHNICAL_FLOW.md for architecture
4. Review browser console for errors (F12)
5. Contact support with phase number that failed
