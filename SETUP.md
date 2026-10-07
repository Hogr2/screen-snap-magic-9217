# دليل الربط — لوحة تحكم متجر النظارات

## ١. لصق بيانات الربط
افتح الملف `src/lib/supabase-config.ts` واستبدل القيمتين:
```ts
export const SUPABASE_URL = "https://xxxx.supabase.co";
export const SUPABASE_ANON_KEY = "eyJ...";
```
تجدهما في لوحة Supabase: **Project Settings → API**.

## ٢. الجداول المتوقعة (موجودة مسبقاً)
- **categories**: `id`, `name_ar`, `slug`, `sort_order`
- **products**: `id`, `name`, `price`, `category_id` (→ categories.id), `description`, `frame_material`, `lens_type`, `color`, `size`, `image_url`, `is_active`, `created_at`

إن اختلف اسم أي عمود، عدّله في مكان واحد فقط: `src/lib/schema.ts`.

## ٣. مخزن الصور
حاوية باسم `product-images` ويجب أن تكون **عامة (Public)**.

## ٤. الصلاحيات
القراءة عامة، والإضافة/التعديل/الحذف تتطلب جلسة مسجّلة.

## ٥. الحسابات
لا يوجد تسجيل حساب جديد داخل اللوحة. أنشئ حساب المسؤول يدوياً من لوحة Supabase: **Authentication → Users → Add user**.
