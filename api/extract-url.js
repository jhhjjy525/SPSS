// Vercel Serverless Function - URL Content Extraction
const axios = require('axios');

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
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`📄 Extracting: ${url}`);

        let html;
        let fetchSuccess = false;

        // Method 1: Direct fetch with full browser headers
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1',
                    'Referer': 'https://www.google.com/',
                    'Connection': 'keep-alive'
                },
                timeout: 10000,
                maxRedirects: 5,
                responseType: 'text',
                decompress: true,
                validateStatus: (status) => status < 500
            });
            if (response.status === 200) {
                html = response.data;
                fetchSuccess = true;
                console.log('✅ Direct fetch successful');
            }
        } catch (e) {
            console.log('Direct fetch failed:', e.message);
        }

        // Method 2: Use AllOrigins proxy as fallback
        if (!fetchSuccess) {
            try {
                console.log('Trying AllOrigins proxy...');
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                const proxyResponse = await axios.get(proxyUrl, {
                    timeout: 15000,
                    responseType: 'text'
                });
                html = proxyResponse.data;
                fetchSuccess = true;
                console.log('✅ AllOrigins proxy successful');
            } catch (e) {
                console.log('AllOrigins failed:', e.message);
            }
        }

        // Method 3: Use corsproxy.io as second fallback
        if (!fetchSuccess) {
            try {
                console.log('Trying corsproxy.io...');
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                const proxyResponse = await axios.get(proxyUrl, {
                    timeout: 15000,
                    responseType: 'text'
                });
                html = proxyResponse.data;
                fetchSuccess = true;
                console.log('✅ corsproxy.io successful');
            } catch (e) {
                console.log('corsproxy.io failed:', e.message);
            }
        }

        if (!fetchSuccess || !html) {
            return res.status(502).json({ error: '사이트에서 콘텐츠를 가져올 수 없습니다. 다른 URL을 시도해주세요.' });
        }

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim().replace(/&[^;]+;/g, '') : '';

        // Extract content
        let content = extractContent(html);

        if (!content || content.length < 30) {
            return res.status(400).json({ error: '본문을 추출할 수 없습니다' });
        }

        console.log(`✅ Extracted ${content.length} chars`);

        return res.json({
            success: true,
            title: title,
            content: content.substring(0, 5000)
        });

    } catch (error) {
        console.error('Error:', error.message);

        if (error.response) {
            return res.status(502).json({ error: `사이트 응답 오류: ${error.response.status}` });
        }
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ error: '요청 시간 초과' });
        }

        return res.status(500).json({ error: '본문 추출 실패: ' + error.message });
    }
};

function extractContent(html) {
    // Remove unwanted tags
    let cleaned = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

    // Try article
    let match = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    let content = match ? match[1] : '';

    // Try main
    if (!content || content.length < 100) {
        match = cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        if (match && match[1].length > content.length) content = match[1];
    }

    // Try content divs
    if (!content || content.length < 100) {
        const divPatterns = [
            /<div[^>]*class="[^"]*(?:article|content|news|story|entry)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
        ];
        for (const p of divPatterns) {
            const matches = [...cleaned.matchAll(p)];
            for (const m of matches) {
                if (m[1] && m[1].length > (content?.length || 0)) content = m[1];
            }
        }
    }

    // Fallback to body
    if (!content || content.length < 100) {
        match = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (match) content = match[1];
    }

    // Extract paragraphs
    const paragraphs = [];
    const pMatches = content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    for (const m of pMatches) {
        const text = m[1].replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim();
        if (text.length > 15) paragraphs.push(text);
    }

    if (paragraphs.length > 0) {
        return paragraphs.join('\n\n').replace(/\s+/g, ' ').trim();
    }

    // Strip all HTML
    return content.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}
