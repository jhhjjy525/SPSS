// Vercel Serverless Function - Check Video Generation Status (OpenAI Sora)

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const openaiKey = process.env.OPENAI_API_KEY;
        const { requestId } = req.query;

        if (!requestId) {
            return res.status(400).json({ error: 'requestId가 필요합니다' });
        }

        if (!openaiKey) {
            return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
        }

        // Check status using OpenAI Sora API
        const statusResponse = await fetch(
            `https://api.openai.com/v1/videos/generations/${requestId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Sora status check for:', requestId);
        console.log('Status response:', statusResponse.status);

        if (!statusResponse.ok) {
            const errorData = await statusResponse.json();
            console.log('Status error:', errorData);
            return res.json({
                status: 'PENDING',
                message: '처리 중...',
                debug: { httpStatus: statusResponse.status, error: errorData }
            });
        }

        const statusData = await statusResponse.json();
        console.log('Status data:', JSON.stringify(statusData).substring(0, 500));

        // Check if generation is complete
        if (statusData.status === 'succeeded' || statusData.status === 'completed') {
            // Get the video URL from the response
            const videoUrl = statusData.data?.[0]?.url || statusData.video?.url || statusData.url;

            if (videoUrl) {
                return res.json({
                    status: 'COMPLETED',
                    videoUrl: videoUrl
                });
            }
        }

        // Map OpenAI status to our status format
        let mappedStatus = 'IN_QUEUE';
        if (statusData.status === 'in_progress' || statusData.status === 'processing') {
            mappedStatus = 'IN_PROGRESS';
        } else if (statusData.status === 'failed') {
            mappedStatus = 'FAILED';
        } else if (statusData.status === 'queued') {
            mappedStatus = 'IN_QUEUE';
        }

        return res.json({
            status: mappedStatus,
            data: statusData
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: '상태 확인 실패',
            message: error.message
        });
    }
};
