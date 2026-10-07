import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Glasses, Loader2, LogOut, Pencil, Plus, Search, Settings, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/ProductForm";
import { CategoriesPanel } from "@/components/CategoriesPanel";
import { supabase } from "@/lib/supabase";
import { arabicError, deleteProduct, listCategories, listProducts } from "@/lib/api";
import type { Category, Product } from "@/lib/schema";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "المنتجات — لوحة تحكم المتجر" },
      { name: "description", content: "إدارة منتجات وتصنيفات متجر النظارات" },
      { property: "og:title", content: "المنتجات — لوحة تحكم المتجر" },
      { property: "og:description", content: "إدارة منتجات وتصنيفات متجر النظارات" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  useEffect(() => { if (!loading && !session) navigate({ to: "/" }); }, [loading, session, navigate]);

  const load = useCallback(async () => {
    setFetching(true); setLoadError("");
    try {
      const [p, c] = await Promise.all([listProducts(), listCategories()]);
      setProducts(p); setCategories(c);
    } catch (e) { setLoadError(arabicError(e)); } finally { setFetching(false); }
  }, []);

  useEffect(() => { if (session) load(); }, [session, load]);

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";
  const filtered = useMemo(() => products.filter((p) =>
    (cat === "all" || p.categoryId === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase())), [products, cat, q]);

  async function confirmDelete() {
    if (!toDelete) return;
    try { await deleteProduct(toDelete.id); toast.success("تم حذف المنتج"); load(); }
    catch (e) { toast.error(arabicError(e)); } finally { setToDelete(null); }
  }

  if (loading || !session) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary"><Glasses className="h-5 w-5" /></span>
            لوحة التحكم
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCatsOpen(true)} aria-label="التصنيفات"><Settings /></Button>
            <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>
              <LogOut /> تسجيل خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">المنتجات <span className="text-base font-normal text-muted-foreground">({products.length})</span></h1>
          <Button size="lg" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus /> إضافة منتج</Button>
        </div>

        <div className="space-y-3 rounded-2xl bg-card p-4 shadow-soft">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ابحث بالاسم..." className="pr-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ id: "all", name: "الكل" }, ...categories].map((c) => (
              <Button key={c.id} size="sm" variant={cat === c.id ? "default" : "secondary"} className="rounded-full" onClick={() => setCat(c.id)}>{c.name}</Button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
        ) : loadError ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-soft">
            <p className="mb-3">{loadError}</p><Button variant="secondary" onClick={load}>إعادة المحاولة</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-card p-12 text-center text-muted-foreground shadow-soft">لا توجد منتجات مطابقة</div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-soft">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain" loading="lazy" /> : <ImageIcon className="text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold">{p.name}</p>
                    {!p.isActive && <Badge variant="secondary">مخفي</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{catName(p.categoryId)}</p>
                </div>
                <p className="hidden font-bold text-primary sm:block">{p.price} ر.س</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(p); setFormOpen(true); }}><Pencil /> <span className="hidden sm:inline">تعديل</span></Button>
                  <Button variant="ghost" size="sm" onClick={() => setToDelete(p)}><Trash2 className="text-destructive" /> <span className="hidden sm:inline">حذف</span></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ProductForm open={formOpen} onOpenChange={setFormOpen} product={editing} categories={categories} onSaved={load} />
      <CategoriesPanel open={catsOpen} onOpenChange={setCatsOpen} categories={categories} onChanged={load} />
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف «{toDelete?.name}» نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
