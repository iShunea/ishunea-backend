# API Specification pentru Traduceri

## Overview
Frontend-ul iShunea Tech Solutions va solicita traduceri de la backend pentru suport multi-limbă (EN/RO/RU).

## Base URL
```
Production: https://ishunea-backend.replit.app
Development: http://localhost:3000
```

## Endpoints

### 1. GET /api/translations
Returnează toate traducerile pentru o limbă specificată.

**Query Parameters:**
- `lang` (required): Codul limbii (`en`, `ro`, `ru`)
- `category` (optional): Filtrare după categorie (`ui`, `seo`, `content`)

**Request Example:**
```http
GET /api/translations?lang=en
GET /api/translations?lang=ro&category=seo
```

**Response Format:**
```json
[
  {
    "id": 1,
    "key": "nav.home",
    "value": "Home",
    "language": "en",
    "category": "ui",
    "updated_at": "2025-10-15T10:00:00Z"
  },
  {
    "id": 2,
    "key": "home.hero.title",
    "value": "Moving your ideas to digital",
    "language": "en",
    "category": "content",
    "updated_at": "2025-10-15T10:00:00Z"
  },
  {
    "id": 3,
    "key": "seo.home.title",
    "value": "Custom Software, AI & IoT for Growth | iShunea",
    "language": "en",
    "category": "seo",
    "updated_at": "2025-10-15T10:00:00Z"
  }
]
```

**Response Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Missing or invalid `lang` parameter
- `500 Internal Server Error`: Server error

### 2. GET /api/translations/:key
Returnează o traducere specifică pentru o limbă.

**Path Parameters:**
- `key`: Cheia traducerii (ex: `nav.home`)

**Query Parameters:**
- `lang` (required): Codul limbii

**Request Example:**
```http
GET /api/translations/nav.home?lang=ro
```

**Response Format:**
```json
{
  "id": 1,
  "key": "nav.home",
  "value": "Acasă",
  "language": "ro",
  "category": "ui",
  "updated_at": "2025-10-15T10:00:00Z"
}
```

## Frontend Cache Strategy

Frontend-ul implementează un sistem de cache pe 2 nivele:

1. **Memory Cache**: Traducerile sunt stocate în RAM pentru acces instant
2. **LocalStorage Cache**: Persistență între sesiuni (valabil 1 oră)

**Cache Invalidation:**
- Automat după 1 oră
- Manual prin `refreshTranslations()` method

## Structura Cheilor (Key Convention)

Folosim dot notation pentru organizare ierarhică:

```
{category}.{page}.{section}.{element}
```

**Exemple:**
- `nav.home` - Navigation: Home link
- `home.hero.title` - Home page: Hero section title
- `seo.services.title` - SEO: Services page title
- `footer.copyright` - Footer: Copyright text
- `common.loading` - Common: Loading text
- `errors.404.title` - Errors: 404 page title

## Categorii

1. **ui**: Elemente de interfață (butoane, meniuri, labels)
2. **seo**: Meta tags, titluri, descrieri pentru SEO
3. **content**: Conținut dinamic (blog, servicii, despre)
4. **errors**: Mesaje de eroare
5. **validation**: Mesaje de validare formulare

## Database Schema Recomandată

```sql
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  language VARCHAR(5) NOT NULL,
  category VARCHAR(50),
  page VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(key, language)
);

CREATE INDEX idx_translations_lang ON translations(language);
CREATE INDEX idx_translations_key ON translations(key);
CREATE INDEX idx_translations_category ON translations(category, language);
```

## Performanță

**Recomandări Backend:**
1. Implementați caching Redis/Memcached
2. Compresie GZIP pentru responses
3. Index-uri pe `language` și `key`
4. Consider pagination pentru volume mari (>1000 traduceri/limbă)

**Frontend Optimization:**
Frontend-ul gestionează automat:
- LocalStorage caching (1 oră TTL)
- In-memory caching pentru sesiune
- Fallback translations dacă API nu răspunde
