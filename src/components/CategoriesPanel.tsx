import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { arabicError, createCategory, deleteCategory } from "@/lib/api";
import type { Category } from "@/lib/schema";

const map: Record<string, string> = {
  ا:"a",أ:"a",إ:"i",آ:"a",ب:"b",ت:"t",ث:"th",ج:"j",ح:"h",خ:"kh",د:"d",ذ:"th",ر:"r",ز:"z",س:"s",ش:"sh",
  ص:"s",ض:"d",ط:"t",ظ:"z",ع:"a",غ:"gh",ف:"f",ق:"q",ك:"k",ل:"l",م:"m",ن:"n",ه:"h",و:"w",ي:"y",ى:"a",ة:"a",ء:"",ئ:"e",ؤ:"o",
};
const slugify = (s: string) =>
  s.split("").map((ch) => map[ch] ?? ch).join("").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function CategoriesPanel({ open, onOpenChange, categories, onChanged }: {
  open: boolean; onOpenChange: (o: boolean) => void; categories: Category[]; onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [order, setOrder] = useState(0);
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name.trim() || !slug.trim()) return toast.error("أدخل الاسم والرابط المختصر.");
    setBusy(true);
    try {
      await createCategory({ name: name.trim(), slug: slug.trim(), sortOrder: order });
      toast.success("تمت إضافة التصنيف");
      setName(""); setSlug(""); setSlugEdited(false); setOrder(0); onChanged();
    } catch (e) { toast.error(arabicError(e)); } finally { setBusy(false); }
  }

  async function remove(c: Category) {
    if (!confirm(`حذف التصنيف «${c.name}»؟`)) return;
    try { await deleteCategory(c.id); toast.success("تم حذف التصنيف"); onChanged(); }
    catch (e) { toast.error(arabicError(e)); }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md" dir="rtl">
        <SheetHeader><SheetTitle>إدارة التصنيفات</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-3 rounded-2xl bg-secondary p-4">
          <div className="space-y-1.5"><Label>الاسم بالعربية</Label>
            <Input value={name} onChange={(e) => { setName(e.target.value); if (!slugEdited) setSlug(slugify(e.target.value)); }} /></div>
          <div className="grid grid-cols-[1fr_90px] gap-2">
            <div className="space-y-1.5"><Label>الرابط المختصر</Label>
              <Input dir="ltr" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }} /></div>
            <div className="space-y-1.5"><Label>الترتيب</Label>
              <Input type="number" dir="ltr" value={order} onChange={(e) => setOrder(Number(e.target.value))} /></div>
          </div>
          <Button className="w-full" onClick={add} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Plus />} إضافة تصنيف</Button>
        </div>
        <ul className="mt-4 divide-y">
          {categories.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">لا توجد تصنيفات بعد</li>}
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">{c.slug} · #{c.sortOrder}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(c)} aria-label="حذف"><Trash2 className="text-destructive" /></Button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
