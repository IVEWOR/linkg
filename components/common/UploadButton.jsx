"use client";
import { useRef, useState } from "react";

export default function UploadButton({
  folder = "uploads",
  onUploaded,
  children,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const click = () => inputRef.current?.click();

  const change = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);

    try {
      const sig = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      }).then((r) => r.json());

      if (!sig?.ok) {
        setBusy(false);
        return alert(`Sign error: ${sig?.error || "unknown"}`);
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", String(sig.timestamp));
      fd.append("upload_preset", sig.uploadPreset);
      fd.append("signature", sig.signature);
      if (sig.signedParams?.folder)
        fd.append("folder", sig.signedParams.folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: fd }
      );
      const json = await res.json();

      if (!res.ok) {
        console.error("Cloudinary error:", json);
        setBusy(false);
        return alert(json?.error?.message || "Upload failed (Cloudinary 400)");
      }

      setBusy(false);
      onUploaded?.(json.secure_url, json);
    } catch (err) {
      console.error(err);
      setBusy(false);
      alert("Upload failed (network)");
    }
  };

  return (
    <>
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm disabled:opacity-60"
        onClick={click}
        disabled={busy}
      >
        {busy ? "Uploading…" : children || "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={change}
      />
    </>
  );
}
