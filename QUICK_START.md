# ⚡ Quick Start: Tabla de Posiciones

## 🎯 The Golden Rule
**Para que un partido cuente en posiciones, DEBE estar en estado "Finalizado"**

---

## 📝 3-Step Process

### 1️⃣ Generate
```
Dashboard → Gestión de Partidos → 🍫 Chocolate
Select: Fecha (1-5), Disciplina, Sitio, Series
Click: Generar Partidos
```

### 2️⃣ Register Result & Finalize
```
Click: "Colocar Resultado"
Enter: Goles/Puntos
Change: Estado → "Finalizado" ⭐ IMPORTANT
Click: "✓ Guardar Resultado"
```

### 3️⃣ View Standings
```
Dashboard → Tabla de Posiciones
See: Equipos ranked by points
```

---

## 🚨 Common Mistakes

| ❌ Wrong | ✅ Right |
|---------|---------|
| Leave estado as "Programado" | Change to "Finalizado" |
| Forget estado selector | Always look for estado dropdown |
| Expect auto-update | Wait 1 second after save |
| Skip any partidos | Finalize ALL partidos |

---

## 📊 What You'll See

### Standings Table (After Finalizing)
```
ATLETISMO - Serie Única
┌─────────────────────────────────────────┐
│ Pos │ Atleta      │ PJ │ Pts Apertura │
├─────┼─────────────┼────┼──────────────┤
│ 🏆  │ Atleta A    │ 1  │ 500          │
│ #2  │ Atleta B    │ 1  │ 450          │
│ #3  │ Atleta C    │ 1  │ 400          │
└─────────────────────────────────────────┘
```

### No Data (Before Finalizing)
```
"No hay datos de posiciones disponibles"
↓
This means: No partidos are finalized yet
```

---

## 💡 Key Concepts

**Programado** = Not finalized yet (doesn't count)
**Finalizado** = Finalized and counts in standings
**Apertura** = Dates 1-5 (first season)
**Clausura** = Dates 6-10 (second season, auto-generated)

---

## 🔧 Troubleshooting

**Q: Why don't I see any data in standings?**
A: Finalize at least one partido by changing estado to "Finalizado"

**Q: Can I change my result after finalizing?**
A: Yes, just click "Colocar Resultado" again, update, and save

**Q: Do I need to finalize ALL partidos?**
A: No, only the ones you want in standings

**Q: Will standings update automatically?**
A: Yes, within 1 second of saving

---

## 📋 Checklist

- [ ] Generated partidos with 🍫 Chocolate
- [ ] Clicked "Colocar Resultado" on at least one
- [ ] Entered goles/puntos
- [ ] Changed estado to "Finalizado"
- [ ] Clicked "✓ Guardar Resultado"
- [ ] Went to "Tabla de Posiciones"
- [ ] See equipos in standings?

✅ **All checked = You're ready to go!**

---

## 🆘 Emergency Help

1. **Nothing shows in standings** → Finalize 1 partido (Change to "Finalizado")
2. **Data looks wrong** → Check estado is "Finalizado" (green)
3. **Standings won't update** → Reload page (F5)
4. **Button not working** → Refresh browser (Ctrl+Shift+R)
5. **Still confused** → Read `POSICIONES_GUIDE.md` for full instructions
