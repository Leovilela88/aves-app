import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.B2_ENDPOINT!;
const region = process.env.B2_REGION || "us-east-005";
const bucket = process.env.B2_BUCKET!;

export const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
  forcePathStyle: true,
});

export const B2_BUCKET = bucket;

export async function listAllObjects(): Promise<{ key: string; size: number }[]> {
  const out: { key: string; size: number }[] = [];
  let token: string | undefined;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token })
    );
    for (const obj of res.Contents || []) {
      if (obj.Key && obj.Size != null) out.push({ key: obj.Key, size: obj.Size });
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return out;
}

export async function signedUrl(key: string, expiresIn = 3600, download = false) {
  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: download
      ? `attachment; filename="${key.split("/").pop()}"`
      : undefined,
  });
  return getSignedUrl(s3, cmd, { expiresIn });
}
