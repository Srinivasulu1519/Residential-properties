import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import path from "path"

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
})

const BUCKET = process.env.S3_RAW_BUCKET || "realestate"

export async function uploadToS3(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    folder: string = "uploads"
): Promise<string> {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = path.extname(fileName) || ".jpg"
    const key = `${folder}/${timestamp}_${random}${ext}`

    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        })
    )

    // Return the S3 URL
    return `https://${BUCKET}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`
}

export async function deleteFromS3(fileUrl: string): Promise<void> {
    try {
        // Extract key from the full S3 URL
        const url = new URL(fileUrl)
        const key = url.pathname.substring(1) // remove leading /

        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: BUCKET,
                Key: key,
            })
        )
    } catch (error) {
        console.error("Failed to delete from S3:", error)
    }
}

export async function getPresignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
    try {
        const url = new URL(fileUrl)
        const key = url.pathname.substring(1)

        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        })

        return await getSignedUrl(s3Client, command, { expiresIn })
    } catch {
        return fileUrl
    }
}
