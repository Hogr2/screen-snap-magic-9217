// Single source of truth for table, column and bucket names.
export const BUCKET = "product-images";

export const CATEGORIES = {
  table: "categories",
  id: "id",
  name: "name_ar",
  slug: "slug",
  sortOrder: "sort_order",
} as const;

export const PRODUCTS = {
  table: "products",
  id: "id",
  name: "name",
  price: "price",
  categoryId: "category_id",
  description: "description",
  frameMaterial: "frame_material",
  lensType: "lens_type",
  color: "color",
  size: "size",
  imageUrl: "image_url",
  isActive: "is_active",
  createdAt: "created_at",
} as const;

export type Category = { id: string; name: string; slug: string; sortOrder: number };
export type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string | null;
  description: string;
  frameMaterial: string;
  lensType: string;
  color: string;
  size: string;
  imageUrl: string | null;
  isActive: boolean;
};

const C = CATEGORIES;
const P = PRODUCTS;

export const toCategory = (r: Record<string, any>): Category => ({
  id: r[C.id],
  name: r[C.name] ?? "",
  slug: r[C.slug] ?? "",
  sortOrder: Number(r[C.sortOrder] ?? 0),
});
export const fromCategory = (c: Omit<Category, "id">) => ({
  [C.name]: c.name,
  [C.slug]: c.slug,
  [C.sortOrder]: c.sortOrder,
});

export const toProduct = (r: Record<string, any>): Product => ({
  id: r[P.id],
  name: r[P.name] ?? "",
  price: Number(r[P.price] ?? 0),
  categoryId: r[P.categoryId] ?? null,
  description: r[P.description] ?? "",
  frameMaterial: r[P.frameMaterial] ?? "",
  lensType: r[P.lensType] ?? "",
  color: r[P.color] ?? "",
  size: r[P.size] ?? "",
  imageUrl: r[P.imageUrl] ?? null,
  isActive: r[P.isActive] !== false,
});
export const fromProduct = (p: Omit<Product, "id">) => ({
  [P.name]: p.name,
  [P.price]: p.price,
  [P.categoryId]: p.categoryId,
  [P.description]: p.description,
  [P.frameMaterial]: p.frameMaterial,
  [P.lensType]: p.lensType,
  [P.color]: p.color,
  [P.size]: p.size,
  [P.imageUrl]: p.imageUrl,
  [P.isActive]: p.isActive,
});
