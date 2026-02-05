// Vercel Serverless Function - Generate S3 Presigned URLs
// Allows temporary access to private S3 video files

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

function getS3Client() {
    return new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            return res.status(500).json({
                error: 'AWS credentials not configured'
            });
        }

        const { s3Uri, key, bucket, expiresIn = 3600 } = req.body || req.query;

        let bucketName, objectKey;

        if (s3Uri) {
            // Parse S3 URI (s3://bucket-name/path/to/file)
            const match = s3Uri.match(/^s3:\/\/([^\/]+)\/(.+)$/);
            if (!match) {
                return res.status(400).json({ error: 'Invalid S3 URI format' });
            }
            bucketName = match[1];
            objectKey = match[2];
        } else if (bucket && key) {
            bucketName = bucket;
            objectKey = key;
        } else {
            return res.status(400).json({
                error: 'Either s3Uri or (bucket + key) is required'
            });
        }

        const client = getS3Client();

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey
        });

        // Generate presigned URL (valid for 1 hour by default)
        const presignedUrl = await getSignedUrl(client, command, {
            expiresIn: Math.min(expiresIn, 86400) // Max 24 hours
        });

        return res.json({
            success: true,
            url: presignedUrl,
            expiresIn: expiresIn
        });

    } catch (error) {
        console.error('S3 Presign Error:', error);

        if (error.name === 'NoSuchKey') {
            return res.status(404).json({
                error: 'File not found',
                message: 'The requested file does not exist in S3'
            });
        }

        res.status(500).json({
            error: 'Failed to generate presigned URL',
            message: error.message
        });
    }
};
