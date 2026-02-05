// Vercel Serverless Function - Video Generation (OpenAI Sora)
// Async approach: Submit job and return generation_id immediately

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
        const openaiKey = process.env.OPENAI_API_KEY;

        if (!openaiKey) {
            return res.status(500).json({
                error: 'OPENAI_API_KEY 환경 변수가 설정되지 않았습니다'
            });
        }

        const { visualDescription, aspectRatio = '9:16', duration = 5 } = req.body;

        if (!visualDescription) {
            return res.status(400).json({ error: '영상 설명이 필요합니다' });
        }

        console.log(`🎬 OpenAI Sora 영상 생성 요청`);

        // Enhanced prompt for video generation
        const enhancedPrompt = `${visualDescription}, smooth motion, professional quality video, consistent visual style, cohesive color grading, high resolution, no text or watermarks`;

        // Convert aspect ratio format for Sora
        // Sora supports: "1080x1920" (9:16), "1920x1080" (16:9), "1080x1080" (1:1)
        let size;
        if (aspectRatio === '16:9') {
            size = '1920x1080';
        } else if (aspectRatio === '1:1') {
            size = '1080x1080';
        } else {
            // Default 9:16 (vertical for shorts)
            size = '1080x1920';
        }

        // Submit to OpenAI Sora API
        const submitResponse = await fetch('https://api.openai.com/v1/videos/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sora',
                prompt: enhancedPrompt,
                size: size,
                duration: Math.min(duration, 20),  // Sora supports up to 20 seconds
                n: 1
            })
        });

        if (!submitResponse.ok) {
            const errorData = await submitResponse.json();
            console.error('OpenAI Sora API Error:', errorData);
            return res.status(500).json({
                error: 'OpenAI Sora API 요청 실패',
                message: errorData.error?.message || `HTTP ${submitResponse.status}`,
                details: errorData
            });
        }

        const submitData = await submitResponse.json();
        console.log('Sora generation submitted:', submitData.id);

        // Return generation_id immediately - frontend will poll for status
        return res.json({
            success: true,
            status: 'SUBMITTED',
            requestId: submitData.id,
            message: 'OpenAI Sora 영상 생성 요청이 제출되었습니다.'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'OpenAI Sora 영상 생성 실패',
            message: error.message
        });
    }
};
