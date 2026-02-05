// Vercel Serverless Function - Batch TTS using FAL.ai ElevenLabs
// Supports Korean with high-quality multilingual voices

/*
============================================================
 ElevenLabs Voice Options (FAL.ai 지원 음성)
============================================================
【남성】Roger, Charlie, George, Callum, River, Liam, Will,
       Eric, Chris, Brian, Daniel, Bill

【여성】Aria, Sarah, Laura, Charlotte, Alice, Matilda,
       Jessica, Lily, Rachel (기본)
============================================================
*/

// Voice mappings - ElevenLabs voices for Korean TTS
const VOICE_MAPPINGS = {
    // ========== 남성 목소리 (5가지) ==========
    'male-announcer': {
        voice: 'Brian',
        description: '아나운서 남성 - 뉴스 앵커처럼 또렷하고 신뢰감 있는',
        stability: 0.6,
        similarity_boost: 0.8
    },
    'male-energetic': {
        voice: 'Charlie',
        description: '활기찬 남성 - 쇼호스트처럼 에너지 넘치는',
        stability: 0.4,
        similarity_boost: 0.75
    },
    'male-bright': {
        voice: 'Liam',
        description: '밝은 남성 - 라디오 DJ처럼 친근하고 따뜻한',
        stability: 0.5,
        similarity_boost: 0.75
    },
    'male-sophisticated': {
        voice: 'George',
        description: '세련된 남성 - 다큐멘터리 내레이션처럼 중후한',
        stability: 0.7,
        similarity_boost: 0.85
    },
    'male-young': {
        voice: 'Daniel',
        description: '젊은 남성 - 유튜버처럼 젊고 캐주얼한',
        stability: 0.45,
        similarity_boost: 0.7
    },

    // ========== 여성 목소리 (5가지) ==========
    'female-announcer': {
        voice: 'Rachel',
        description: '아나운서 여성 - 뉴스 앵커처럼 전문적이고 또렷한',
        stability: 0.6,
        similarity_boost: 0.8
    },
    'female-energetic': {
        voice: 'Aria',
        description: '활기찬 여성 - 쇼핑호스트처럼 밝고 생기있는',
        stability: 0.4,
        similarity_boost: 0.75
    },
    'female-bright': {
        voice: 'Charlotte',
        description: '밝은 여성 - 안내방송처럼 따뜻하고 부드러운',
        stability: 0.55,
        similarity_boost: 0.8
    },
    'female-sophisticated': {
        voice: 'Sarah',
        description: '세련된 여성 - 프리미엄 브랜드처럼 차분하고 우아한',
        stability: 0.7,
        similarity_boost: 0.85
    },
    'female-young': {
        voice: 'Lily',
        description: '젊은 여성 - 귀엽고 발랄한 10~20대 스타일',
        stability: 0.45,
        similarity_boost: 0.7
    }
};

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
            return res.status(500).json({ error: 'FAL_KEY not configured' });
        }

        const { cuts, voicePreset = 'male-announcer' } = req.body;

        if (!cuts || !Array.isArray(cuts)) {
            return res.status(400).json({ error: '컷 데이터가 필요합니다' });
        }

        const voiceConfig = VOICE_MAPPINGS[voicePreset] || VOICE_MAPPINGS['male-announcer'];

        console.log(`🎤 ElevenLabs 배치 TTS 요청: ${cuts.length}개 컷`);
        console.log(`   📌 프리셋: ${voicePreset} (${voiceConfig.voice})`);

        const results = [];

        for (let i = 0; i < cuts.length; i++) {
            const cut = cuts[i];
            console.log(`  - 컷 ${i + 1}/${cuts.length} 생성 중...`);

            try {
                // FAL.ai ElevenLabs API 호출 - 숏폼 최적화 속도 1.15x
                const response = await fetch('https://fal.run/fal-ai/elevenlabs/tts/multilingual-v2', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Key ${falKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: cut.narration,
                        voice: voiceConfig.voice,
                        stability: voiceConfig.stability,
                        similarity_boost: voiceConfig.similarity_boost,
                        speed: 1.15,  // 숏폼 최적화: 빠른 템포
                        language_code: 'ko'
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();

                if (!data.audio || !data.audio.url) {
                    throw new Error('오디오 데이터가 응답에 없습니다');
                }

                // 오디오 URL에서 데이터 가져와서 base64로 변환
                const audioResponse = await fetch(data.audio.url);
                if (!audioResponse.ok) {
                    throw new Error(`오디오 다운로드 실패: ${audioResponse.status}`);
                }

                const arrayBuffer = await audioResponse.arrayBuffer();
                const base64Audio = Buffer.from(arrayBuffer).toString('base64');

                console.log(`     ✓ 컷 ${i + 1} 오디오 생성 완료`);

                results.push({
                    cutIndex: i,
                    audioContent: base64Audio,
                    mimeType: 'audio/mpeg',
                    duration: cut.duration
                });

            } catch (cutError) {
                console.error(`  ❌ 컷 ${i + 1} 오류:`, cutError.message);
                results.push({
                    cutIndex: i,
                    audioContent: null,
                    duration: cut.duration,
                    error: cutError.message
                });
            }
        }

        console.log(`✅ ElevenLabs 배치 TTS 완료: ${voiceConfig.description}`);
        res.json({
            success: true,
            results,
            voice: voiceConfig.description,
            settings: {
                voiceName: voiceConfig.voice
            }
        });

    } catch (error) {
        console.error('❌ ElevenLabs 배치 TTS 오류:', error.message);
        res.status(500).json({
            error: '배치 TTS 생성 실패',
            message: error.message
        });
    }
};
