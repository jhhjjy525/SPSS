// Vercel Serverless Function - Health Check
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    res.json({
        status: 'ok',
        services: {
            tts: !!process.env.GOOGLE_CREDENTIALS_JSON,
            pika: !!process.env.FAL_KEY
        },
        platform: 'vercel',
        timestamp: new Date().toISOString()
    });
};
