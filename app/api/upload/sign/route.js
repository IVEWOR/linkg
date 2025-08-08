import crypto from "crypto";

export async function POST(req) {
  const { folder } = await req.json().catch(() => ({}));
  const timestamp = Math.floor(Date.now() / 1000);

  const params = new URLSearchParams();
  params.append("timestamp", timestamp);
  params.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);
  if (folder) params.append("folder", folder);

  const toSign = Array.from(params.entries())
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(toSign + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  return Response.json({
    timestamp,
    signature,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}
