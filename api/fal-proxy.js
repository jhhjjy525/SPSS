// Vercel Serverless Function - FAL API Proxy (to bypass CORS)

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const falKey = process.env.FAL_KEY;
        const { action, requestId, prompt, aspectRatio, duration } = req.body || req.query;

        const modelPath = 'fal-ai/pika/v2/text-to-video';

        if (action === 'submit') {
            // Submit new video generation request
            const submitResponse = await fetch(`https://queue.fal.run/${modelPath}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${falKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    aspect_ratio: aspectRatio || '9:16',
                    duration: Math.min(duration || 5, 5),
                    resolution: "1080p",
                    fps: 24
                })
            });

            if (!submitResponse.ok) {
                const errorText = await submitResponse.text();
                return res.status(submitResponse.status).json({
                    error: 'Submit failed',
                    details: errorText
                });
            }

            const submitData = await submitResponse.json();
            return res.json({
                success: true,
                requestId: submitData.request_id
            });

        } else if (action === 'status' && requestId) {
            // Check status and get result
            const resultResponse = await fetch(
                `https://queue.fal.run/${modelPath}/requests/${requestId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Key ${falKey}`
                    }
                }
            );

            if (resultResponse.status === 200) {
                const result = await resultResponse.json();

                if (result.video && result.video.url) {
                    return res.json({
                        status: 'COMPLETED',
                        videoUrl: result.video.url
                    });
                }

                return res.json({
                    status: result.status || 'IN_PROGRESS',
                    data: result
                });
            } else if (resultResponse.status === 202) {
                return res.json({
                    status: 'IN_PROGRESS'
                });
            } else {
                const errorText = await resultResponse.text();
                return res.json({
                    status: 'PENDING',
                    debug: { httpStatus: resultResponse.status, error: errorText }
                });
            }

        } else {
            return res.status(400).json({ error: 'Invalid action. Use "submit" or "status"' });
        }

    } catch (error) {
        console.error('FAL Proxy Error:', error);
        res.status(500).json({
            error: 'Proxy error',
            message: error.message
        });
    }
};
