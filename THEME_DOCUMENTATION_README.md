# Theme System Documentation

**🎯 START HERE:** Open **[MASTER_DOCUMENTATION.md](MASTER_DOCUMENTATION.md)** for a guided introduction to the theme system and game.

---

## 📚 Quick Navigation

### New to the System?
👉 **[MASTER_DOCUMENTATION.md](MASTER_DOCUMENTATION.md)** - High-level overview with quick guides

### Need Quick Reference?
👉 **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Quick reference and common tasks

### Need Detailed Guides?
- **[THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md)** - Complete theme system
- **[GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md)** - Game integration
- **[SWITCH_GAME_SPECIFICATIONS.md](SWITCH_GAME_SPECIFICATIONS.md)** - Game mechanics

---

## 🚀 Quick Links

### Common Tasks

**Add a theme to a page:**
1. Edit `src/components/ThemeConfig.astro`
2. Add to `getDefaultTheme()` function:
   ```javascript
   if (chapterId === X && pageNumber === Y) {
     return { theme: 'themename' };
   }
   ```

**Add a character theme:**
1. Edit `public/games/switch/characters.js`
2. Add `theme` property to character:
   ```javascript
   charactername: {
     theme: 'themename',
     // ... other properties
   }
   ```

**Force a theme (ignore user preferences):**
```javascript
return { theme: 'themename', overrule: true };
```

**Create a smooth transition between themes:**
```javascript
return { 
  originalTheme: 'time', 
  theme: 'space', 
  transition: 'fast' 
};
```

---

## 🎨 Available Themes

`space` • `breath` • `light` • `time` • `heart` • `mind` • `hope` • `rage` • `life` • `doom` • `blood` • `void`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/components/ThemeConfig.astro` | Configure page themes |
| `public/games/switch/characters.js` | Configure character themes |
| `public/styles.css` | Theme colors and styles |
| `public/js/reader.js` | Theme application logic |
| `src/layouts/MSPALayout.astro` | Game theme integration |

---

## 🔧 Troubleshooting

**Theme not applying?**
- Check `getDefaultTheme()` in `src/components/ThemeConfig.astro`
- Verify user has "Default" selected in `/options`
- Check browser console for errors

**Game theme not changing?**
- User must have "Default" theme selected
- Character must have `theme` property defined
- Check console for postMessage errors

**More help:** See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) → Troubleshooting

---

## 📖 Documentation Structure

```
DOCUMENTATION_INDEX.md              ← Quick reference & navigation
├── THEME_SYSTEM_MASTER.md         ← Complete theme system guide
│   ├── Configuration
│   ├── Transitions
│   ├── User Preferences
│   └── Examples & Troubleshooting
│
└── GAME_THEME_INTEGRATION_MASTER.md  ← Complete game integration guide
    ├── Character Mapping
    ├── Communication Flow
    ├── Smooth Transitions
    └── Examples & Troubleshooting
```

---

## ✨ Features

### Theme System
- 12 color themes + default space theme
- Page-specific theme assignment
- User preference system
- Forced themes for story moments
- 5 transition types (instant, fast, smooth, slow, fade)
- Theme-to-theme transitions

### Game Integration
- Dynamic character-based themes
- Smooth transitions without flashing
- Respects user preferences
- 20+ characters with themes
- PostMessage communication

---

## 🎯 Next Steps

1. **New to the system?** → Read [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. **Need to configure themes?** → See [THEME_SYSTEM_MASTER.md](THEME_SYSTEM_MASTER.md)
3. **Working with games?** → See [GAME_THEME_INTEGRATION_MASTER.md](GAME_THEME_INTEGRATION_MASTER.md)
4. **Understanding game mechanics?** → See [SWITCH_GAME_SPECIFICATIONS.md](SWITCH_GAME_SPECIFICATIONS.md)
5. **Want to understand the consolidation?** → See [DOCUMENTATION_SUMMARY.md](DOCUMENTATION_SUMMARY.md)

---

**Status:** ✅ Complete and Verified  
**Last Updated:** 2025  
**Version:** 2.0
