---
name: Add Translations
description: How to add or update Hindi (hi) and English (en) i18n translations in the RY Bricks Manager app using react-i18next.
---

# Add Translations

## i18n Setup

The app uses `react-i18next` configured in `src/lib/i18n.ts`. It supports two languages:

| Language | Locale File |
|---|---|
| English | `src/locales/en/translation.json` |
| Hindi | `src/locales/hi/translation.json` |

- **Fallback language**: English (`en`)
- **Detection order**: `localStorage` → browser `navigator`
- **Caching**: `localStorage`

## Step-by-Step

### 1. Add Keys to Both Locale Files

Always add keys to **both** `en/translation.json` and `hi/translation.json` at the same time. Never add to one without the other.

Use **nested objects** to group keys by page or feature:

**`src/locales/en/translation.json`**:
```json
{
  "orders": {
    "title": "Orders",
    "newOrder": "New Order",
    "totalAmount": "Total Amount"
  }
}
```

**`src/locales/hi/translation.json`**:
```json
{
  "orders": {
    "title": "ऑर्डर",
    "newOrder": "नया ऑर्डर",
    "totalAmount": "कुल राशि"
  }
}
```

### 2. Use Translations in Components

Import the `useTranslation` hook and use the `t()` function:

```tsx
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("orders.title")}</h1>
      <button>{t("orders.newOrder")}</button>
    </div>
  );
};
```

### 3. Interpolation (Dynamic Values)

For strings with variables, use double curly braces:

**JSON**:
```json
{
  "orders": {
    "totalItems": "Total: {{count}} items"
  }
}
```

**Component**:
```tsx
<p>{t("orders.totalItems", { count: 42 })}</p>
```

### 4. Language Switching

The app stores the current language in `localStorage`. The Settings page (`src/pages/Settings.tsx`) provides a language switcher. To change language programmatically:

```tsx
import { useTranslation } from "react-i18next";

const { i18n } = useTranslation();
i18n.changeLanguage("hi"); // Switch to Hindi
i18n.changeLanguage("en"); // Switch to English
```

## Key Rules

1. **Always add to BOTH locale files** — never leave one behind
2. **Use nested keys** — group by page/feature (e.g., `orders.title`, `settings.language`)
3. **Never hardcode user-facing text** — wrap everything with `t()`
4. **Keep key names in English** — even for Hindi translations, the keys are in English
5. **Use camelCase** for key names (e.g., `newOrder`, `totalAmount`)
6. **Maintain alphabetical order** within each section when practical
