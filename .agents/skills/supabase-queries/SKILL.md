---
name: Supabase Queries
description: How to write Supabase queries in the RY Bricks Manager app — client setup, CRUD patterns, auth, error handling, and database schema conventions.
---

# Supabase Queries

## Client Setup

The Supabase client is pre-configured at `src/integrations/supabase/client.ts`. Always import it like this:

```tsx
import { supabase } from "@/integrations/supabase/client";
```

Environment variables used (defined in `.env`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Database Types

Auto-generated TypeScript types are at `src/integrations/supabase/types.ts`. Import types from there when needed:

```tsx
import type { Database } from "@/integrations/supabase/types";
```

## Common Query Patterns

### SELECT (Read)

```tsx
const { data, error } = await supabase
  .from("orders")
  .select("*, customer:customers(name, id)")
  .order("created_at", { ascending: false });

if (error) throw error;
```

### SELECT with Filters

```tsx
const { data, error } = await supabase
  .from("orders")
  .select("*")
  .eq("payment_status", "pending")
  .gte("created_at", startDate)
  .lte("created_at", endDate)
  .order("created_at", { ascending: false });
```

### INSERT (Create)

```tsx
const { data, error } = await supabase
  .from("orders")
  .insert({
    customer_id: customerId,
    brick_grade: "class_a",
    quantity: 1000,
    unit_price: 8,
    total_price: 8000,
    payment_status: "pending",
    delivery_status: "pending",
  })
  .select()
  .single();
```

### UPDATE

```tsx
const { error } = await supabase
  .from("orders")
  .update({ payment_status: "paid" })
  .eq("id", orderId);
```

### DELETE

```tsx
const { error } = await supabase
  .from("orders")
  .delete()
  .eq("id", orderId);
```

## Key Tables & Relationships

| Table | Description |
|---|---|
| `customers` | Customer records (name, phone, address) |
| `orders` | Brick orders linked to customers via `customer_id` |
| `payments` | Payment transactions linked to orders |
| `inventory_items` | Stock / inventory tracking |
| `inventory_transactions` | Stock movement records |

## Domain Constants

Always use the constants defined in `src/lib/constants.ts`:

- **Brick Grades**: `class_a`, `class_b`, `class_c`
- **Payment Statuses**: `pending`, `partial`, `paid`
- **Payment Modes**: `cash`, `upi`, `bank_transfer`
- **Delivery Statuses**: `pending`, `in_transit`, `delivered`, `cancelled`
- **Vehicle Types**: `truck`, `tractor`, `tempo`, `pickup`, `other`
- **User Roles**: `sales`, `dispatch`, `management`

## Error Handling Pattern

Always check for errors after every Supabase call:

```tsx
try {
  const { data, error } = await supabase.from("orders").select("*");
  if (error) throw error;
  // Use data
} catch (err) {
  console.error("Error:", err);
  // Show toast notification to user
}
```

## Auth Context

To get the current authenticated user:

```tsx
import { useAuth } from "@/hooks/useAuth";

const { user, session, loading } = useAuth();
```

## Currency Formatting

When displaying prices or amounts, always use the helpers from `@/lib/currency`:

```tsx
import { formatINR, formatIndianNumber } from "@/lib/currency";

// formatINR(8000)    → "₹8,000"
// formatIndianNumber(10000) → "10,000"
```
