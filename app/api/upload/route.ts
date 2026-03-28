import { NextRequest, NextResponse } from "next/server"
import { requireAnyAuth } from "@/lib/auth"
import { uploadToS3 } from "@/lib/s3"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

export async function POST(request: NextRequest) {
    try {
        const auth = requireAnyAuth(request)
        if ("error" in auth) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const formData = await request.formData()
        const files = formData.getAll("files") as File[]

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "No files provided" },
                { status: 400 }
            )
        }

        const uploadedUrls: string[] = []

        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.type}. Allowed: jpg, png, webp, pdf` },
                    { status: 400 }
                )
            }

            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File too large: ${file.name}. Maximum size: 5MB` },
                    { status: 400 }
                )
            }

            const buffer = Buffer.from(await file.arrayBuffer())
            const url = await uploadToS3(buffer, file.name, file.type, "properties")
            uploadedUrls.push(url)
        }

        return NextResponse.json({ urls: uploadedUrls }, { status: 201 })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Failed to upload files to S3" },
            { status: 500 }
        )
    }
}
