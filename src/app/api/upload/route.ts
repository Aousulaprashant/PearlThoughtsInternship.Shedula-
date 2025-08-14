// app/api/upload/route.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

export async function POST(req: Request) {
  try {
    const { file } = await req.json(); // base64 string or remote URL

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: "doctor_profiles",
    });

    return new Response(JSON.stringify({ url: uploadResponse.secure_url }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Cloudinary upload failed" }), { status: 500 });
  }
}
