// app/api/upload/sign/route.js
export const dynamic = "force-dynamic";

import crypto from "crypto";

function signParams(paramsObj) {
  // Cloudinary signature: all params except `file` and `api_key`, alpha-sorted, joined with &,
  // then append API_SECRET and sha1 hash.
  const sorted = Object.keys(paramsObj)
    .sort()
    .map((k) => `${k}=${paramsObj[k]}`)
    .join("&");

  const sig = crypto
    .createHash("sha1")
    .update(sorted + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  return sig;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { folder } = body || {};
    const timestamp = Math.floor(Date.now() / 1000);

    // These are the exact params you'll send in the browser (besides file and api_key)
    const paramsToSign = {
      timestamp,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      ...(folder ? { folder } : {}),
    };

    const signature = signParams(paramsToSign);

    return Response.json({
      ok: true,
      timestamp,
      signature,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      // send back what we signed so client can mirror exactly
      signedParams: paramsToSign,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e?.message || "sign-error" },
      { status: 500 }
    );
  }
}
