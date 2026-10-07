import { supabase } from "./supabase";
import {
  BUCKET, CATEGORIES as C, PRODUCTS as P,
  toCategory, toProduct, fromCategory, fromProduct,
  type Category, type Product,
} from "./schema";

export function arabicError(e: any): string {
  const code = e?.code;
  if (code === "23503") return "لا يمكن حذف هذا التصنيف لأنه مرتبط بمنتجات. انقل المنتجات أو احذفها أولاً.";
  if (code === "23505") return "هذه القيمة مستخدمة مسبقاً (مثل الرابط المختصر).";
  if (code === "42501" || e?.status === 401 || e?.status === 403) return "ليست لديك صلاحية لهذه العملية. سجّل الدخول مجدداً.";
  const msg = String(e?.message ?? "");
  if (msg.includes("Invalid login")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (msg.includes("Failed to fetch")) return "تعذّر الاتصال بالخادم. تحقق من الإنترنت.";
  return "حدث خطأ غير متوقع، حاول مرة أخرى.";
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from(C.table).select("*").order(C.sortOrder);
  if (error) throw error;
  return (data ?? []).map(toCategory);
}
export async function createCategory(c: Omit<Category, "id">) {
  const { error } = await supabase.from(C.table).insert(fromCategory(c));
  if (error) throw error;
}
export async function deleteCategory(id: string) {
  const { error } = await supabase.from(C.table).delete().eq(C.id, id);
  if (error) throw error;
}

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from(P.table).select("*").order(P.createdAt, { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toProduct);
}
export async function saveProduct(p: Omit<Product, "id">, id?: string) {
  const q = id
    ? supabase.from(P.table).update(fromProduct(p)).eq(P.id, id)
    : supabase.from(P.table).insert(fromProduct(p));
  const { error } = await q;
  if (error) throw error;
}
export async function deleteProduct(id: string) {
  const { error } = await supabase.from(P.table).delete().eq(P.id, id);
  if (error) throw error;
}

export async function uploadImage(blob: Blob): Promise<string> {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function compressImage(src: Blob | HTMLCanvasElement, maxEdge = 1600, quality = 0.82): Promise<Blob> {
  let source: CanvasImageSource; let w: number; let h: number;
  if (src instanceof HTMLCanvasElement) { source = src; w = src.width; h = src.height; }
  else { const bmp = await createImageBitmap(src); source = bmp; w = bmp.width; h = bmp.height; }
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale); canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  let q = quality; let blob: Blob | null = null;
  do {
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q));
    q -= 0.1;
  } while (blob && blob.size > 2 * 1024 * 1024 && q > 0.4);
  if (!blob) throw new Error("compress failed");
  return blob;
}
