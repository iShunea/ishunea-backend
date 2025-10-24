# 📚 Ghid Integrare API Traduceri - Frontend & Admin

## 📋 Cuprins
1. [Despre API](#despre-api)
2. [Endpoint-uri Disponibile](#endpoint-uri-disponibile)
3. [Structura Datelor](#structura-datelor)
4. [Integrare Frontend (React/Vue/Angular)](#integrare-frontend)
5. [Admin Panel - CRUD Traduceri](#admin-panel)
6. [Best Practices & Caching](#best-practices)
7. [Exemple Complete](#exemple-complete)

---

## 🎯 Despre API

Backend-ul oferă un API complet pentru gestionarea traducerilor multi-limbă (EN/RO/RU). API-ul este construit pentru:
- **Frontend**: Încărcare rapidă a traducerilor cu caching
- **Admin Panel**: Management complet CRUD pentru traduceri

### Limbaje Suportate
- `en` - English
- `ro` - Romanian  
- `ru` - Russian

### Categorii Disponibile
- `ui` - Elemente interfață (butoane, meniuri, labels)
- `seo` - Meta titluri, descrieri, keywords
- `content` - Conținut pagini (texte, paragrafe)
- `errors` - Mesaje de eroare
- `validation` - Mesaje validare formulare

---

## 🔌 Endpoint-uri Disponibile

### 1. GET `/api/translations` - Obține toate traducerile pentru o limbă

**Folosire**: Frontend (încărcare inițială traduceri)

```http
GET /api/translations?lang=ro&category=ui
```

**Parametri Query**:
- `lang` (obligatoriu): `en` | `ro` | `ru`
- `category` (opțional): `ui` | `seo` | `content` | `errors` | `validation`

**Răspuns Success (200)**:
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "key": "nav.home",
    "value": "Acasă",
    "language": "ro",
    "category": "ui",
    "page": "navigation",
    "updated_at": "2025-10-15T10:30:00.000Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "key": "nav.services",
    "value": "Servicii",
    "language": "ro",
    "category": "ui",
    "page": "navigation",
    "updated_at": "2025-10-15T10:30:00.000Z"
  }
]
```

---

### 2. GET `/api/translations/:key` - Obține o traducere specifică

**Folosire**: Frontend/Admin (verificare traducere individuală)

```http
GET /api/translations/nav.home?lang=ro
```

**Răspuns Success (200)**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "key": "nav.home",
  "value": "Acasă",
  "language": "ro",
  "category": "ui",
  "page": "navigation",
  "updated_at": "2025-10-15T10:30:00.000Z"
}
```

**Răspuns Eroare (404)**:
```json
{
  "error": "Not Found",
  "message": "Translation not found for key: nav.home and language: ro"
}
```

---

### 3. POST `/api/translations` - Creează sau Actualizează traducere

**Folosire**: Admin Panel (creare/editare traduceri)

```http
POST /api/translations
Content-Type: application/json

{
  "key": "nav.contact",
  "value": "Contact",
  "language": "ro",
  "category": "ui",
  "page": "navigation"
}
```

**Comportament**:
- Dacă traducerea există (key + language) → **UPDATE**
- Dacă nu există → **CREATE**

**Răspuns Create (201)**:
```json
{
  "message": "Translation created successfully",
  "translation": {
    "id": "507f1f77bcf86cd799439013",
    "key": "nav.contact",
    "value": "Contact",
    "language": "ro",
    "category": "ui",
    "page": "navigation",
    "updated_at": "2025-10-15T11:00:00.000Z"
  }
}
```

**Răspuns Update (200)**:
```json
{
  "message": "Translation updated successfully",
  "translation": { ... }
}
```

---

### 4. PUT `/api/translations/:key` - Actualizează traducere existentă

**Folosire**: Admin Panel (editare traducere specifică)

```http
PUT /api/translations/nav.contact?lang=ro
Content-Type: application/json

{
  "value": "Contactați-ne",
  "category": "ui"
}
```

**Răspuns Success (200)**:
```json
{
  "message": "Translation updated successfully",
  "translation": {
    "id": "507f1f77bcf86cd799439013",
    "key": "nav.contact",
    "value": "Contactați-ne",
    "language": "ro",
    "category": "ui",
    "page": "navigation",
    "updated_at": "2025-10-15T11:30:00.000Z"
  }
}
```

---

### 5. DELETE `/api/translations/:key` - Șterge traducere

**Folosire**: Admin Panel (ștergere traducere)

```http
DELETE /api/translations/nav.old_menu?lang=ro
```

**Răspuns Success (200)**:
```json
{
  "message": "Translation deleted successfully",
  "translation": {
    "id": "507f1f77bcf86cd799439014",
    "key": "nav.old_menu",
    "language": "ro"
  }
}
```

---

## 📦 Structura Datelor

### Translation Object
```typescript
interface Translation {
  id: string;              // MongoDB ObjectId
  key: string;             // Cheie unica (dot notation: "nav.home", "home.hero.title")
  value: string;           // Textul tradus
  language: 'en' | 'ro' | 'ru';  // Limba
  category?: 'ui' | 'seo' | 'content' | 'errors' | 'validation';
  page?: string;           // Pagina asociata (optional)
  updated_at: string;      // ISO Date string
}
```

### Convențiile pentru Key
Folosiți **dot notation** pentru organizare ierarhică:

```
nav.home                 → Navigare: Home
nav.services             → Navigare: Servicii
home.hero.title          → Homepage > Hero Section > Titlu
home.hero.subtitle       → Homepage > Hero Section > Subtitlu
seo.services.title       → SEO > Pagina Servicii > Title Tag
form.validation.email    → Formulare > Validare > Email
```

---

## 🎨 Integrare Frontend

### React Implementation

#### 1. Creați Context pentru Traduceri

```jsx
// src/context/TranslationContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [translations, setTranslations] = useState({});
  const [currentLang, setCurrentLang] = useState('ro'); // limba default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTranslations(currentLang);
  }, [currentLang]);

  const loadTranslations = async (lang) => {
    setLoading(true);
    try {
      // Verifică cache local
      const cached = localStorage.getItem(`translations_${lang}`);
      const cacheTime = localStorage.getItem(`translations_${lang}_time`);
      
      // Cache valid 24h
      if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 86400000) {
        setTranslations(JSON.parse(cached));
        setLoading(false);
        return;
      }

      // Încarcă de pe server
      const response = await fetch(`/api/translations?lang=${lang}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transformă array în object pentru acces rapid
      const translationsMap = data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
      
      setTranslations(translationsMap);
      
      // Salvează în cache
      localStorage.setItem(`translations_${lang}`, JSON.stringify(translationsMap));
      localStorage.setItem(`translations_${lang}_time`, Date.now().toString());
      
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = (key, fallback = key) => {
    return translations[key] || fallback;
  };

  const changeLanguage = (lang) => {
    if (['en', 'ro', 'ru'].includes(lang)) {
      setCurrentLang(lang);
      localStorage.setItem('preferred_language', lang);
    }
  };

  return (
    <TranslationContext.Provider value={{ t, currentLang, changeLanguage, loading }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};
```

#### 2. Wrap App cu Provider

```jsx
// src/App.jsx
import { TranslationProvider } from './context/TranslationContext';

function App() {
  return (
    <TranslationProvider>
      <YourApp />
    </TranslationProvider>
  );
}
```

#### 3. Folosește în Componente

```jsx
// src/components/Navigation.jsx
import { useTranslation } from '../context/TranslationContext';

function Navigation() {
  const { t, currentLang, changeLanguage } = useTranslation();

  return (
    <nav>
      <a href="/">{t('nav.home')}</a>
      <a href="/services">{t('nav.services')}</a>
      <a href="/contact">{t('nav.contact')}</a>
      
      <select value={currentLang} onChange={(e) => changeLanguage(e.target.value)}>
        <option value="en">EN</option>
        <option value="ro">RO</option>
        <option value="ru">RU</option>
      </select>
    </nav>
  );
}
```

---

### Vue 3 Implementation

#### 1. Creați Plugin de Traduceri

```javascript
// src/plugins/i18n.js
import { reactive, readonly } from 'vue';

const state = reactive({
  translations: {},
  currentLang: localStorage.getItem('preferred_language') || 'ro',
  loading: true
});

async function loadTranslations(lang) {
  state.loading = true;
  
  try {
    // Verifică cache
    const cached = localStorage.getItem(`translations_${lang}`);
    const cacheTime = localStorage.getItem(`translations_${lang}_time`);
    
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 86400000) {
      state.translations = JSON.parse(cached);
      state.loading = false;
      return;
    }

    // Încarcă de pe server
    const response = await fetch(`/api/translations?lang=${lang}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const translationsMap = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    
    state.translations = translationsMap;
    
    // Cache
    localStorage.setItem(`translations_${lang}`, JSON.stringify(translationsMap));
    localStorage.setItem(`translations_${lang}_time`, Date.now().toString());
    
  } catch (error) {
    console.error('Error loading translations:', error);
  } finally {
    state.loading = false;
  }
}

export default {
  install: (app) => {
    // Funcția de traducere
    app.config.globalProperties.$t = (key, fallback = key) => {
      return state.translations[key] || fallback;
    };

    // Funcția de schimbare limbă
    app.config.globalProperties.$changeLanguage = async (lang) => {
      if (['en', 'ro', 'ru'].includes(lang)) {
        state.currentLang = lang;
        localStorage.setItem('preferred_language', lang);
        await loadTranslations(lang);
      }
    };

    // State read-only
    app.config.globalProperties.$i18n = readonly(state);
    
    // Încarcă limba default
    loadTranslations(state.currentLang);
  }
};
```

#### 2. Înregistrează Plugin

```javascript
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import i18nPlugin from './plugins/i18n';

const app = createApp(App);
app.use(i18nPlugin);
app.mount('#app');
```

#### 3. Folosește în Componente

```vue
<!-- src/components/Navigation.vue -->
<template>
  <nav>
    <a href="/">{{ $t('nav.home') }}</a>
    <a href="/services">{{ $t('nav.services') }}</a>
    <a href="/contact">{{ $t('nav.contact') }}</a>
    
    <select v-model="selectedLang" @change="handleLangChange">
      <option value="en">EN</option>
      <option value="ro">RO</option>
      <option value="ru">RU</option>
    </select>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      selectedLang: this.$i18n.currentLang
    };
  },
  methods: {
    handleLangChange() {
      this.$changeLanguage(this.selectedLang);
    }
  }
};
</script>
```

---

### Angular Implementation

#### 1. Creați Translation Service

```typescript
// src/app/services/translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Translation {
  id: string;
  key: string;
  value: string;
  language: string;
  category?: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: { [key: string]: string } = {};
  private currentLangSubject = new BehaviorSubject<string>(
    localStorage.getItem('preferred_language') || 'ro'
  );
  private loadingSubject = new BehaviorSubject<boolean>(true);

  public currentLang$ = this.currentLangSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTranslations(this.currentLangSubject.value);
  }

  loadTranslations(lang: string): void {
    this.loadingSubject.next(true);

    // Verifică cache
    const cached = localStorage.getItem(`translations_${lang}`);
    const cacheTime = localStorage.getItem(`translations_${lang}_time`);
    
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 86400000) {
      this.translations = JSON.parse(cached);
      this.loadingSubject.next(false);
      return;
    }

    // Încarcă de pe server
    this.http.get<Translation[]>(`/api/translations?lang=${lang}`)
      .pipe(
        tap(data => {
          this.translations = data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {} as { [key: string]: string });

          // Cache
          localStorage.setItem(`translations_${lang}`, JSON.stringify(this.translations));
          localStorage.setItem(`translations_${lang}_time`, Date.now().toString());
          
          this.loadingSubject.next(false);
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Error loading translations:', error);
          this.loadingSubject.next(false);
        }
      });
  }

  t(key: string, fallback: string = key): string {
    return this.translations[key] || fallback;
  }

  changeLanguage(lang: 'en' | 'ro' | 'ru'): void {
    this.currentLangSubject.next(lang);
    localStorage.setItem('preferred_language', lang);
    this.loadTranslations(lang);
  }

  getCurrentLang(): string {
    return this.currentLangSubject.value;
  }
}
```

#### 2. Creați Translation Pipe

```typescript
// src/app/pipes/translate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(key: string, fallback?: string): string {
    return this.translationService.t(key, fallback);
  }
}
```

#### 3. Folosește în Componente

```typescript
// src/app/components/navigation/navigation.component.ts
import { Component } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-navigation',
  template: `
    <nav>
      <a routerLink="/">{{ 'nav.home' | translate }}</a>
      <a routerLink="/services">{{ 'nav.services' | translate }}</a>
      <a routerLink="/contact">{{ 'nav.contact' | translate }}</a>
      
      <select [value]="currentLang" (change)="onLanguageChange($event)">
        <option value="en">EN</option>
        <option value="ro">RO</option>
        <option value="ru">RU</option>
      </select>
    </nav>
  `
})
export class NavigationComponent {
  currentLang: string;

  constructor(public translationService: TranslationService) {
    this.currentLang = this.translationService.getCurrentLang();
  }

  onLanguageChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value as 'en' | 'ro' | 'ru';
    this.translationService.changeLanguage(lang);
    this.currentLang = lang;
  }
}
```

---

## 🛠️ Admin Panel - CRUD Traduceri

### React Admin Panel Example

```jsx
// src/admin/TranslationManager.jsx
import React, { useState, useEffect } from 'react';

function TranslationManager() {
  const [translations, setTranslations] = useState([]);
  const [form, setForm] = useState({
    key: '',
    value: '',
    language: 'ro',
    category: 'ui',
    page: ''
  });
  const [editMode, setEditMode] = useState(false);

  // Încarcă traducerile
  useEffect(() => {
    loadTranslations();
  }, [form.language]);

  const loadTranslations = async () => {
    try {
      const response = await fetch(`/api/translations?lang=${form.language}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Error loading translations:', error);
      alert('Eroare la încărcarea traducerilor. Verifică consola pentru detalii.');
    }
  };

  // Creare/Actualizare traducere
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save translation'}`);
        return;
      }
      
      const data = await response.json();
      alert(data.message);
      loadTranslations();
      resetForm();
    } catch (error) {
      console.error('Error saving translation:', error);
      alert('Eroare la salvarea traducerii. Verifică consola pentru detalii.');
    }
  };

  // Editare traducere
  const handleEdit = (translation) => {
    setForm({
      key: translation.key,
      value: translation.value,
      language: translation.language,
      category: translation.category || 'ui',
      page: translation.page || ''
    });
    setEditMode(true);
  };

  // Ștergere traducere
  const handleDelete = async (key, lang) => {
    if (!confirm(`Sigur ștergi traducerea "${key}" (${lang})?`)) return;
    
    try {
      const response = await fetch(`/api/translations/${key}?lang=${lang}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete translation'}`);
        return;
      }
      
      const data = await response.json();
      alert(data.message);
      loadTranslations();
    } catch (error) {
      console.error('Error deleting translation:', error);
      alert('Eroare la ștergerea traducerii. Verifică consola pentru detalii.');
    }
  };

  const resetForm = () => {
    setForm({
      key: '',
      value: '',
      language: 'ro',
      category: 'ui',
      page: ''
    });
    setEditMode(false);
  };

  return (
    <div className="translation-manager">
      <h1>Translation Manager</h1>
      
      {/* Formular */}
      <form onSubmit={handleSubmit} className="translation-form">
        <h2>{editMode ? 'Edit Translation' : 'Create Translation'}</h2>
        
        <div>
          <label>Key (dot notation):</label>
          <input
            type="text"
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            placeholder="nav.home"
            required
            disabled={editMode}
          />
        </div>

        <div>
          <label>Value:</label>
          <input
            type="text"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Acasă"
            required
          />
        </div>

        <div>
          <label>Language:</label>
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            disabled={editMode}
          >
            <option value="en">English</option>
            <option value="ro">Romanian</option>
            <option value="ru">Russian</option>
          </select>
        </div>

        <div>
          <label>Category:</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="ui">UI</option>
            <option value="seo">SEO</option>
            <option value="content">Content</option>
            <option value="errors">Errors</option>
            <option value="validation">Validation</option>
          </select>
        </div>

        <div>
          <label>Page (optional):</label>
          <input
            type="text"
            value={form.page}
            onChange={(e) => setForm({ ...form, page: e.target.value })}
            placeholder="homepage"
          />
        </div>

        <div className="form-actions">
          <button type="submit">
            {editMode ? 'Update' : 'Create'} Translation
          </button>
          {editMode && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Tabel traduceri */}
      <div className="translations-list">
        <h2>Translations ({form.language.toUpperCase()})</h2>
        
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Category</th>
              <th>Page</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {translations.map((t) => (
              <tr key={t.id}>
                <td><code>{t.key}</code></td>
                <td>{t.value}</td>
                <td>{t.category}</td>
                <td>{t.page || '-'}</td>
                <td>{new Date(t.updated_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEdit(t)}>Edit</button>
                  <button onClick={() => handleDelete(t.key, t.language)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TranslationManager;
```

### CSS pentru Admin Panel

```css
/* src/admin/TranslationManager.css */
.translation-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.translation-form {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.translation-form div {
  margin-bottom: 15px;
}

.translation-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.translation-form input,
.translation-form select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background: #007bff;
  color: white;
}

.form-actions button[type="button"] {
  background: #6c757d;
  color: white;
}

.translations-list table {
  width: 100%;
  border-collapse: collapse;
}

.translations-list th,
.translations-list td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.translations-list th {
  background: #007bff;
  color: white;
}

.translations-list button {
  padding: 5px 10px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.translations-list button:first-child {
  background: #28a745;
  color: white;
}

.translations-list button:last-child {
  background: #dc3545;
  color: white;
}
```

---

## ✅ Best Practices & Caching

### 1. Strategia de Caching

#### LocalStorage Cache (24h)
```javascript
// Verifică dacă traducerile sunt fresh (< 24h)
const cached = localStorage.getItem(`translations_${lang}`);
const cacheTime = localStorage.getItem(`translations_${lang}_time`);
const CACHE_DURATION = 86400000; // 24h in ms

if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < CACHE_DURATION) {
  // Folosește cache
  return JSON.parse(cached);
}

// Altfel, încarcă de pe server și salvează în cache
```

#### Force Refresh Cache
```javascript
// Admin Panel: După update traducere, invalidează cache-ul
function invalidateCache(lang) {
  localStorage.removeItem(`translations_${lang}`);
  localStorage.removeItem(`translations_${lang}_time`);
}
```

### 2. Optimizare Performanță

#### Încarcă doar categoria necesară
```javascript
// În loc să încarci toate traducerile:
fetch('/api/translations?lang=ro')

// Încarcă doar UI translations pentru navbar:
fetch('/api/translations?lang=ro&category=ui')
```

#### Lazy Loading pe Pagini
```javascript
// Homepage încarcă doar traducerile homepage
useEffect(() => {
  fetch('/api/translations?lang=ro&category=content')
    .then(res => res.json())
    .then(data => {
      const homeTranslations = data.filter(t => t.page === 'homepage');
      // Folosește doar acestea
    });
}, []);
```

### 3. Fallback pentru Traduceri Lipsă

```javascript
// Funcția t() cu fallback
const t = (key, fallback = key) => {
  return translations[key] || fallback || key;
};

// Exemplu folosire:
<h1>{t('home.hero.title', 'Welcome')}</h1>
// Dacă 'home.hero.title' nu există, afișează 'Welcome'
```

### 4. SEO cu Traduceri

#### Meta Tags Dinamice (React)
```jsx
import { Helmet } from 'react-helmet';
import { useTranslation } from './context/TranslationContext';

function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('seo.home.title', 'Ishunea - Web Development')}</title>
        <meta name="description" content={t('seo.home.description')} />
        <meta name="keywords" content={t('seo.home.keywords')} />
      </Helmet>
      
      <h1>{t('home.hero.title')}</h1>
    </>
  );
}
```

### 5. Debugging Traduceri

```javascript
// Activează modul debug pentru a vedea key-urile în loc de valori
const DEBUG_MODE = process.env.NODE_ENV === 'development';

const t = (key, fallback = key) => {
  if (DEBUG_MODE) {
    return `[${key}]`; // Afișează [nav.home] în loc de "Acasă"
  }
  return translations[key] || fallback;
};
```

---

## 📝 Exemple Complete de Traduceri

### Exemplu Structură Traduceri pentru Website

```javascript
// Navigare
{
  "key": "nav.home", "value": "Acasă", "language": "ro", "category": "ui"
}
{
  "key": "nav.services", "value": "Servicii", "language": "ro", "category": "ui"
}
{
  "key": "nav.portfolio", "value": "Portofoliu", "language": "ro", "category": "ui"
}
{
  "key": "nav.contact", "value": "Contact", "language": "ro", "category": "ui"
}

// Homepage Hero
{
  "key": "home.hero.title", "value": "Construim experiențe digitale excepționale", "language": "ro", "category": "content", "page": "homepage"
}
{
  "key": "home.hero.subtitle", "value": "Soluții web moderne pentru afacerea ta", "language": "ro", "category": "content", "page": "homepage"
}
{
  "key": "home.hero.cta", "value": "Începe un proiect", "language": "ro", "category": "ui", "page": "homepage"
}

// SEO
{
  "key": "seo.home.title", "value": "Ishunea - Dezvoltare Web & Design", "language": "ro", "category": "seo", "page": "homepage"
}
{
  "key": "seo.home.description", "value": "Companie de dezvoltare web oferind soluții digitale complete", "language": "ro", "category": "seo", "page": "homepage"
}

// Formulare
{
  "key": "form.name.label", "value": "Nume complet", "language": "ro", "category": "ui"
}
{
  "key": "form.email.label", "value": "Adresă email", "language": "ro", "category": "ui"
}
{
  "key": "form.submit", "value": "Trimite", "language": "ro", "category": "ui"
}

// Validări
{
  "key": "validation.email.required", "value": "Email-ul este obligatoriu", "language": "ro", "category": "validation"
}
{
  "key": "validation.email.invalid", "value": "Email invalid", "language": "ro", "category": "validation"
}

// Erori
{
  "key": "error.404.title", "value": "Pagina nu a fost găsită", "language": "ro", "category": "errors"
}
{
  "key": "error.500.title", "value": "Eroare server", "language": "ro", "category": "errors"
}
```

---

## 🚀 Quick Start Checklist

### Pentru Frontend Developers:

1. ✅ **Citește secțiunea API Endpoints** pentru a înțelege ce date primești
2. ✅ **Alege framework-ul** (React/Vue/Angular) și copiază implementation
3. ✅ **Implementează Context/Service** pentru traduceri
4. ✅ **Adaugă caching** cu localStorage (24h)
5. ✅ **Folosește funcția t()** în toate componentele
6. ✅ **Testează schimbarea limbii** și verifică cache-ul

### Pentru Admin Panel Developers:

1. ✅ **Implementează CRUD interface** (exemplul React de mai sus)
2. ✅ **Adaugă formulare** pentru create/edit/delete traduceri
3. ✅ **Implementează validări** (key format, limbă, etc)
4. ✅ **Testează toate operațiunile** (POST/PUT/DELETE)
5. ✅ **Invalidează cache-ul** după modificări

---

## 🔗 Resurse Utile

### Backend API URL
```
Development: http://localhost:5000/api/translations
Production: https://your-domain.com/api/translations
```

### Testare Rapidă API cu cURL

```bash
# Obține toate traducerile RO
curl "http://localhost:5000/api/translations?lang=ro"

# Creează traducere nouă
curl -X POST http://localhost:5000/api/translations \
  -H "Content-Type: application/json" \
  -d '{
    "key": "test.hello",
    "value": "Salut",
    "language": "ro",
    "category": "ui"
  }'

# Șterge traducere
curl -X DELETE "http://localhost:5000/api/translations/test.hello?lang=ro"
```

---

## ❓ FAQ

**Q: Cum actualizez traducerile fără să reîncarc pagina?**  
A: După update în Admin Panel, invalidează cache-ul și re-fetch translations:
```javascript
// Invalidează cache pentru limba curentă
localStorage.removeItem(`translations_${currentLang}`);
localStorage.removeItem(`translations_${currentLang}_time`);

// Apoi reîncarcă traducerile
loadTranslations(currentLang);
```

**IMPORTANT pentru Admin Panel**: După ce salvezi/actualizezi/ștergi o traducere, invalidează cache-ul pentru TOATE limbile pentru a asigura că utilizatorii primesc cele mai recente traduceri:
```javascript
// Invalidează cache pentru toate limbile
['en', 'ro', 'ru'].forEach(lang => {
  localStorage.removeItem(`translations_${lang}`);
  localStorage.removeItem(`translations_${lang}_time`);
});
```

**Q: Ce se întâmplă dacă o traducere nu există?**  
A: Funcția `t()` returnează fallback-ul sau key-ul dacă nu găsește traducerea.

**Q: Pot folosi HTML în traduceri?**  
A: Da, dar folosește `dangerouslySetInnerHTML` (React) sau `v-html` (Vue) cu atenție:
```jsx
<div dangerouslySetInnerHTML={{ __html: t('home.hero.html') }} />
```

**Q: Cum optimizez pentru SEO?**  
A: Folosește traduceri în meta tags (title, description, keywords) și asigură-te că sunt încărcate server-side pentru SSR.

---

## 📞 Suport

Pentru întrebări sau probleme:
1. Verifică acest ghid
2. Testează endpoint-urile cu cURL/Postman
3. Verifică console logs pentru erori
4. Contactează echipa backend

**Backend este gata! Acum depinde de voi să implementați frontend-ul. Mult succes! 🎉**
