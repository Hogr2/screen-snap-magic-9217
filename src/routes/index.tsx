import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Glasses, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isConfigured } from "@/lib/supabase";
import { arabicError } from "@/lib/api";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — لوحة تحكم المتجر" },
      { name: "description", content: "تسجيل دخول المسؤول إلى لوحة إدارة متجر النظارات" },
      { property: "og:title", content: "تسجيل الدخول — لوحة تحكم المتجر" },
      { property: "og:description", content: "تسجيل دخول المسؤول إلى لوحة إدارة متجر النظارات" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (session) navigate({ to: "/dashboard" }); }, [session, navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(arabicError(error));
    else navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
            <Glasses className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">سجّل الدخول لإدارة المنتجات</p>
        </div>
        {!isConfigured && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-accent p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>لم يتم ربط قاعدة البيانات بعد — راجع ملف SETUP.md</span>
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">كلمة المرور</Label>
            <Input id="pw" type="password" dir="ltr" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={!isConfigured || busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} تسجيل الدخول
          </Button>
        </form>
      </div>
    </div>
  );
}
