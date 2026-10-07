import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CameraCapture } from "./CameraCapture";
import { arabicError, compressImage, saveProduct, uploadImage } from "@/lib/api";
import type { Category, Product } from "@/lib/schema";

const empty: Omit<Product, "id"> = {
  name: "", price: 0, categoryId: null, description: "", frameMaterial: "",
  lensType: "", color: "", size: "", imageUrl: null, isActive: true,
};

export function ProductForm({ open, onOpenChange, product, categories, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; product: Product | null;
  categories: Category[]; onSaved: () => void;
}) {
  const [form, setForm] = useState(empty);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const { id: _id, ...rest } = product ?? { id: "", ...empty };
    setForm(rest); setBlob(null); setPreview(rest.imageUrl);
  }, [open, product]);

  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function applyImage(src: Blob | HTMLCanvasElement) {
    try {
      const b = await compressImage(src);
      setBlob(b); setPreview(URL.createObjectURL(b));
    } catch { toast.error("تعذّرت معالجة الصورة."); }
  }

  async function submit() {
    if (!form.name.trim()) { toast.error("أدخل اسم المنتج."); return; }
    if (!(form.price >= 0)) { toast.error("السعر غير صالح."); return; }
    setBusy(true);
    try {
      let imageUrl = form.imageUrl;
      if (blob) imageUrl = await uploadImage(blob);
      await saveProduct({ ...form, imageUrl }, product?.id);
      toast.success(product ? "تم حفظ التعديلات" : "تمت إضافة المنتج");
      onSaved(); onOpenChange(false);
    } catch (e) { toast.error(arabicError(e)); }
    finally { setBusy(false); }
  }

  const catName = categories.find((c) => c.id === form.categoryId)?.name;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{product ? "تعديل منتج" : "إضافة منتج"}</DialogTitle></DialogHeader>
          <div className="grid gap-6 md:grid-cols-[1fr_260px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="الاسم" full><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></F>
              <F label="السعر (ر.س)"><Input type="number" min={0} step="0.01" dir="ltr" value={form.price} onChange={(e) => set("price", Number(e.target.value))} /></F>
              <F label="التصنيف">
                <Select value={form.categoryId ?? ""} onValueChange={(v) => set("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </F>
              <F label="النبذة" full><Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></F>
              <F label="مادة الإطار"><Input value={form.frameMaterial} onChange={(e) => set("frameMaterial", e.target.value)} /></F>
              <F label="نوع العدسة"><Input value={form.lensType} onChange={(e) => set("lensType", e.target.value)} /></F>
              <F label="اللون"><Input value={form.color} onChange={(e) => set("color", e.target.value)} /></F>
              <F label="المقاس"><Input value={form.size} onChange={(e) => set("size", e.target.value)} /></F>
              <div className="flex items-center justify-between rounded-xl bg-secondary p-3 sm:col-span-2">
                <Label>{form.isActive ? "مفعّل — ظاهر في المتجر" : "مخفي عن المتجر"}</Label>
                <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">معاينة البطاقة</p>
              <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
                <div className="relative flex aspect-square items-center justify-center bg-secondary">
                  {preview ? <img src={preview} alt="" className="h-full w-full object-contain" /> : <ImageIcon className="h-10 w-10 text-muted-foreground" />}
                  {catName && <Badge className="absolute right-3 top-3">{catName}</Badge>}
                </div>
                <div className="space-y-1 p-4">
                  <p className="line-clamp-1 font-bold">{form.name || "اسم المنتج"}</p>
                  <p className="font-bold text-primary">{form.price || 0} ر.س</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="secondary" onClick={() => setCamera(true)}><Camera /> التقط بالكاميرا</Button>
                <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}><ImageIcon /> اختر من المعرض</Button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) applyImage(f); e.target.value = ""; }} />
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button onClick={submit} disabled={busy}>{busy && <Loader2 className="animate-spin" />} حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>
      {camera && <CameraCapture onClose={() => setCamera(false)} onCapture={(c) => { setCamera(false); applyImage(c); }} />}
    </>
  );
}

function F({ label, full, children }: { label: string; full?: boolean; children: ReactNode }) {
  return <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
