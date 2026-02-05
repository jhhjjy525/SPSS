// Vercel Serverless Function - Batch Video Generation (Pika AI)
// Async approach: Submit all jobs and return request IDs immediately

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

        if (!falKey) {
            return res.status(500).json({
                error: 'FAL_KEY 환경 변수가 설정되지 않았습니다'
            });
        }

        const { cuts, aspectRatio = '9:16' } = req.body;

        if (!cuts || !Array.isArray(cuts)) {
            return res.status(400).json({ error: '컷 데이터가 필요합니다' });
        }

        console.log(`🎬 배치 Pika 영상 생성 요청: ${cuts.length}개 컷`);

        const requests = [];

        // Submit all jobs in parallel
        for (let i = 0; i < cuts.length; i++) {
            const cut = cuts[i];
            const enhancedPrompt = `${cut.visualDescription}, consistent visual style, smooth motion, professional quality, cohesive color grading`;

            const submitPromise = fetch('https://queue.fal.run/fal-ai/pika/v2/text-to-video', {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${falKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: enhancedPrompt,
                    aspect_ratio: aspectRatio,
                    duration: Math.min(cut.duration || 5, 5),
                    resolution: "1080p",
                    fps: 24
                })
            }).then(async (response) => {
                if (!response.ok) {
                    const errorText = await response.text();
                    return { cutIndex: i, success: false, error: errorText };
                }
                const data = await response.json();
                return { cutIndex: i, success: true, requestId: data.request_id };
            }).catch(error => {
                return { cutIndex: i, success: false, error: error.message };
            });

            requests.push(submitPromise);
        }

        const results = await Promise.all(requests);

        console.log('All requests submitted');

        return res.json({
            success: true,
            status: 'SUBMITTED',
            results: results,
            message: '모든 영상 생성 요청이 제출되었습니다. 상태를 확인해주세요.'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: '배치 영상 생성 실패',
            message: error.message
        });
    }
};
