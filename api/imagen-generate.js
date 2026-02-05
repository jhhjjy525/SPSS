// Vercel Serverless Function - Image Generation using OpenAI DALL-E 3
// Ultra high-quality AI image generation with DALL-E 3 model

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
        const { prompt, aspectRatio = '9:16' } = req.body;

        if (!openaiKey) {
            return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
        }

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Enhance prompt for ultra high-quality images
        // CRITICAL: Absolutely no text generation in images
        const enhancedPrompt = `${prompt}, ultra high resolution, 8K quality, professional lighting, photorealistic, masterpiece, sharp details, professional photography, ABSOLUTELY NO TEXT, no letters, no words, no writing, no signs, no labels, no captions, no titles, no typography, no watermarks, no logos, no numbers, no characters, text-free image, clean image without any text elements`;

        console.log(`🎨 OpenAI DALL-E 3 고품질 이미지 생성: "${enhancedPrompt.substring(0, 60)}..."`);

        // Determine image size based on aspect ratio
        // DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792
        let size;
        if (aspectRatio === '16:9') {
            size = '1792x1024';  // landscape
        } else if (aspectRatio === '1:1') {
            size = '1024x1024';  // square
        } else {
            // Default 9:16 (vertical for shorts)
            size = '1024x1792';  // portrait
        }

        console.log(`📸 Model: DALL-E 3, Size: ${size}`);

        // OpenAI DALL-E 3 API 호출
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: enhancedPrompt,
                size: size,
                quality: 'hd',
                n: 1,
                response_format: 'b64_json'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI DALL-E 3 API Error:', errorData);
            throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            throw new Error('No image generated');
        }

        // Get the base64 image from OpenAI response
        const base64 = data.data[0].b64_json;
        const revisedPrompt = data.data[0].revised_prompt;

        console.log('✅ OpenAI DALL-E 3 이미지 생성 완료!');
        if (revisedPrompt) {
            console.log('📝 Revised prompt:', revisedPrompt.substring(0, 100) + '...');
        }

        return res.json({
            success: true,
            images: [{
                index: 0,
                base64: base64,
                mimeType: 'image/png',
                revisedPrompt: revisedPrompt
            }]
        });

    } catch (error) {
        console.error('Image Generation Error:', error);
        res.status(500).json({
            error: 'Image generation error',
            message: error.message
        });
    }
};
