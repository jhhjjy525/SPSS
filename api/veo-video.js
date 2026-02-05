// Vercel Serverless Function - Video from Image (using FAL AI)
// Creates video from image using FAL/Pika image-to-video

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const falKey = process.env.FAL_KEY;
        const { action, requestId, imageBase64, prompt, aspectRatio = '9:16', duration = 5 } = req.body;

        if (!falKey) {
            return res.status(500).json({
                error: 'FAL_KEY not configured'
            });
        }

        if (action === 'submit') {
            // Use FAL Pika text-to-video
            const modelPath = 'fal-ai/pika/v2/text-to-video';

            console.log(`🎬 FAL Pika 영상 생성 시작: "${prompt?.substring(0, 50)}..."`);
            console.log(`📐 Aspect Ratio: ${aspectRatio}, Duration: ${duration}s`);

            // Map aspect ratio to Pika format
            let pikaAspectRatio = '9:16'; // default vertical
            if (aspectRatio === '16:9') {
                pikaAspectRatio = '16:9';
            } else if (aspectRatio === '1:1') {
                pikaAspectRatio = '1:1';
            }

            const requestBody = {
                prompt: prompt + ', cinematic quality, smooth motion, professional video',
                aspect_ratio: pikaAspectRatio,
                duration: Math.min(Math.max(duration, 3), 5), // Pika supports 3-5 seconds
                fps: 24
            };

            console.log('📤 FAL Request Body:', JSON.stringify(requestBody));

            const response = await fetch(`https://queue.fal.run/${modelPath}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${falKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            console.log(`📥 FAL Submit Response (${response.status}):`, responseText.substring(0, 500));

            if (!response.ok) {
                console.error('FAL Submit Error:', responseText);
                return res.status(response.status).json({
                    error: 'Video generation submit failed',
                    details: responseText
                });
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                return res.status(500).json({
                    error: 'Invalid JSON response from FAL',
                    details: responseText
                });
            }

            console.log('✅ FAL job submitted:', data.request_id);

            return res.json({
                success: true,
                operationName: data.request_id,
                requestId: data.request_id,
                status: 'SUBMITTED'
            });

        } else if (action === 'status') {
            // Check FAL request status
            const reqId = requestId || req.body.operationName;

            if (!reqId) {
                return res.status(400).json({ error: 'requestId is required' });
            }

            const modelPath = 'fal-ai/pika/v2/text-to-video';

            console.log(`🔍 FAL 상태 확인: ${reqId}`);

            // Step 1: Check status first
            const statusResponse = await fetch(
                `https://queue.fal.run/${modelPath}/requests/${reqId}/status`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Key ${falKey}`
                    }
                }
            );

            const statusText = await statusResponse.text();
            console.log(`📊 FAL Status Response (${statusResponse.status}):`, statusText.substring(0, 300));

            let statusData;
            try {
                statusData = JSON.parse(statusText);
            } catch (e) {
                return res.json({
                    status: 'PENDING',
                    debug: { error: 'Invalid status JSON', raw: statusText.substring(0, 200) }
                });
            }

            // FAL status can be: IN_QUEUE, IN_PROGRESS, COMPLETED
            if (statusData.status === 'COMPLETED') {
                // Step 2: Get the actual result
                const resultResponse = await fetch(
                    `https://queue.fal.run/${modelPath}/requests/${reqId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Key ${falKey}`
                        }
                    }
                );

                const resultText = await resultResponse.text();
                console.log(`📹 FAL Result Response:`, resultText.substring(0, 500));

                let result;
                try {
                    result = JSON.parse(resultText);
                } catch (e) {
                    return res.json({
                        status: 'ERROR',
                        debug: { error: 'Invalid result JSON', raw: resultText.substring(0, 200) }
                    });
                }

                // Check for video URL in result
                const videoUrl = result.video?.url || result.output?.video?.url || result.url;

                if (videoUrl) {
                    console.log('✅ FAL Pika 영상 생성 완료!', videoUrl);
                    return res.json({
                        status: 'COMPLETED',
                        videoUrl: videoUrl,
                        videos: [{
                            url: videoUrl,
                            mimeType: 'video/mp4'
                        }]
                    });
                }

                console.log('⚠️ Video URL not found in result:', JSON.stringify(result).substring(0, 300));
                return res.json({
                    status: 'ERROR',
                    debug: { message: 'No video URL in result', keys: Object.keys(result) }
                });

            } else if (statusData.status === 'IN_QUEUE' || statusData.status === 'IN_PROGRESS') {
                return res.json({
                    status: 'IN_PROGRESS',
                    queuePosition: statusData.queue_position || null
                });
            } else if (statusData.status === 'FAILED') {
                console.error('❌ FAL job failed:', statusData);
                return res.json({
                    status: 'FAILED',
                    error: statusData.error || 'Unknown error'
                });
            } else {
                return res.json({
                    status: statusData.status || 'PENDING',
                    debug: statusData
                });
            }

        } else {
            return res.status(400).json({
                error: 'Invalid action. Use "submit" or "status"'
            });
        }

    } catch (error) {
        console.error('Video Generation Error:', error);
        res.status(500).json({
            error: 'Video generation error',
            message: error.message
        });
    }
};
