import { useEffect, useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CameraCapture({ onCapture, onClose }: { onCapture: (c: HTMLCanvasElement) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const stop = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); setReady(true); }
      } catch {
        setError("تعذّر فتح الكاميرا. تأكد من منح الإذن أو استخدم «اختر من المعرض».");
      }
    })();
    return () => { cancelled = true; stop(); };
  }, []);

  function capture() {
    const v = videoRef.current; if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    stop(); onCapture(c);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-overlay p-4">
      <div className="flex justify-end">
        <Button variant="secondary" size="icon" onClick={() => { stop(); onClose(); }} aria-label="إغلاق"><X /></Button>
      </div>
      <div className="relative mx-auto my-4 flex w-full max-w-2xl flex-1 items-center justify-center overflow-hidden rounded-2xl bg-foreground">
        {error ? <p className="p-6 text-center text-background">{error}</p> : (
          <>
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            {!ready && <Loader2 className="absolute h-8 w-8 animate-spin text-background" />}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="aspect-[2/1] w-3/4 rounded-[3rem] border-2 border-dashed border-background/70 bg-background/5" />
            </div>
          </>
        )}
      </div>
      {!error && (
        <div className="flex justify-center pb-4">
          <button onClick={capture} disabled={!ready} aria-label="التقاط"
            className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-background bg-primary p-4 text-primary-foreground disabled:opacity-50">
            <Camera className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  );
}
