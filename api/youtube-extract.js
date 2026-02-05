/**
 * YouTube Video Extraction API
 * Extracts video clips from YouTube using cobalt.tools API (free, open-source)
 */

const https = require('https');
const http = require('http');

// Cobalt API endpoint (free YouTube downloader)
const COBALT_API = 'https://api.cobalt.tools/api/json';

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
        const { videoId, startTime = 0, duration = 5 } = req.body;

        if (!videoId) {
            return res.status(400).json({ error: 'videoId가 필요합니다' });
        }

        console.log(`📹 YouTube 추출 요청: ${videoId}, 시작: ${startTime}s, 길이: ${duration}s`);

        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Use Cobalt API to get download URL
        const cobaltResponse = await callCobaltAPI(youtubeUrl);

        if (cobaltResponse.status === 'stream' || cobaltResponse.status === 'redirect') {
            // Return the video URL for client-side processing
            const videoUrl = cobaltResponse.url;

            console.log(`✅ YouTube 영상 URL 추출 성공`);

            return res.json({
                success: true,
                videoUrl: videoUrl,
                videoId: videoId,
                startTime: startTime,
                duration: duration,
                message: '영상 URL 추출 완료. 클라이언트에서 트리밍 처리됩니다.'
            });
        } else if (cobaltResponse.status === 'error') {
            throw new Error(cobaltResponse.text || 'Cobalt API 오류');
        } else {
            // Fallback: Return YouTube thumbnail for image-based approach
            console.log('⚠️ 영상 추출 실패, 썸네일로 대체');

            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

            return res.json({
                success: true,
                videoUrl: thumbnailUrl,
                isImage: true,
                videoId: videoId,
                message: '영상 대신 썸네일 이미지가 사용됩니다.'
            });
        }

    } catch (error) {
        console.error('❌ YouTube 추출 오류:', error.message);

        // Fallback to thumbnail
        const { videoId } = req.body || {};
        if (videoId) {
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            return res.json({
                success: true,
                videoUrl: thumbnailUrl,
                isImage: true,
                videoId: videoId,
                message: '영상 추출 실패. 썸네일 이미지가 사용됩니다.'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'YouTube 추출 실패',
            message: error.message
        });
    }
};

// Call Cobalt API
function callCobaltAPI(url) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            url: url,
            vCodec: 'h264',
            vQuality: '720',
            aFormat: 'mp3',
            filenamePattern: 'basic',
            isAudioOnly: false,
            isTTFullAudio: false,
            isAudioMuted: false,
            dubLang: false,
            disableMetadata: false
        });

        const options = {
            hostname: 'api.cobalt.tools',
            port: 443,
            path: '/api/json',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Accept': 'application/json',
                'User-Agent': 'ShinhanPremiereShorts/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    reject(new Error('API 응답 파싱 실패'));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('API 요청 시간 초과'));
        });

        req.write(postData);
        req.end();
    });
}
