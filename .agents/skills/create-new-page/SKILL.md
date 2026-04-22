---
name: Create a New Page
description: Step-by-step guide to create a new page in the RY Bricks Manager app following established patterns (routing, translations, auth, Supabase, UI components).
---

# Create a New Page

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router v7 (`react-router-dom`)
- **State/Data**: TanStack React Query + Supabase JS client
- **UI Components**: shadcn/ui (in `src/components/ui/`)
- **i18n**: react-i18next with English (`en`) and Hindi (`hi`) locales
- **Auth**: Custom `useAuth` hook from `@/hooks/useAuth`

## Steps

### 1. Create the Page Component

Create a new `.tsx` file in `src/pages/`. Use this template:

```tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MyNewPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from Supabase here
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("table_name")
          .select("*");
        if (error) throw error;
        // Set state with data
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">{t("myPage.title")}</h1>
      {/* Page content */}
    </div>
  );
};

export default MyNewPage;
```

### 2. Add the Route in `src/App.tsx`

Import the page and add a `<Route>` **above** the catch-all `*` route:

```tsx
import MyNewPage from "./pages/MyNewPage";

// Inside <Routes>, ABOVE the catch-all:
<Route path="/my-new-page" element={<MyNewPage />} />
{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
<Route path="*" element={<NotFound />} />
```

### 3. Add Translations

Add translation keys to **both** locale files:

- `src/locales/en/translation.json` — English strings
- `src/locales/hi/translation.json` — Hindi strings

```json
{
  "myPage": {
    "title": "My New Page",
    "description": "Page description here"
  }
}
```

Always use `t("myPage.keyName")` in the component via the `useTranslation()` hook.

### 4. Add Navigation (if needed)

Add a sidebar or navigation link pointing to the new route. Navigation items typically use `<Link to="/my-new-page">` from `react-router-dom`.

## Key Conventions

- **Always use TypeScript** (`.tsx` extension)
- **Always wrap user-facing strings** with `t()` for i18n
- **Use shadcn/ui components** from `@/components/ui/` — never install raw component libraries
- **Use `@/` path aliases** for imports (maps to `src/`)
- **Supabase client**: import from `@/integrations/supabase/client`
- **Constants**: brick grades, payment statuses, delivery statuses, etc. are in `@/lib/constants.ts`
- **Currency formatting**: use `formatINR` and `formatIndianNumber` from `@/lib/currency`
- **Auth**: use `useAuth()` hook for user session/authentication
- **Toast notifications**: use `Toaster` from `@/components/ui/toaster` or Sonner
