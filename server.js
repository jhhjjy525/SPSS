/* ========================================
   신한 Premier Shorts Studio - Backend Server
   Google Cloud TTS & Vertex AI Veo Integration
   ======================================== */

const express = require('express');
const cors = require('cors');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { fal } = require('@fal-ai/client');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
require('dotenv').config();

// Set FFmpeg path for Windows if needed
// Uncomment and set path if FFmpeg is not in system PATH
// ffmpeg.setFfmpegPath('C:/ffmpeg/bin/ffmpeg.exe');

// Create temp directory for video processing
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Configure FAL AI client
fal.config({
    credentials: process.env.FAL_KEY
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname)); // Serve static files

// Initialize Google Cloud clients
const ttsClient = new TextToSpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});


// Voice name mappings for different presets
// Reference: https://cloud.google.com/text-to-speech/docs/voices
// Korean Male: Neural2-C, Wavenet-C, Wavenet-D, Standard-C, Standard-D
// Korean Female: Neural2-A, Neural2-B, Wavenet-A, Wavenet-B, Standard-A, Standard-B
const VOICE_MAPPINGS = {
    'male-1':   { name: 'ko-KR-Neural2-C', gender: 'MALE' },   // 차분한
    'male-2':   { name: 'ko-KR-Standard-C', gender: 'MALE' },  // 활기찬
    'male-3':   { name: 'ko-KR-Wavenet-C', gender: 'MALE' },   // 중후한
    'male-4':   { name: 'ko-KR-Standard-D', gender: 'MALE' },  // 친근한 (Standard-D = 남성)
    'female-1': { name: 'ko-KR-Neural2-A', gender: 'FEMALE' }, // 전문적인
    'female-2': { name: 'ko-KR-Neural2-B', gender: 'FEMALE' }, // 밝은
    'female-3': { name: 'ko-KR-Wavenet-A', gender: 'FEMALE' }, // 세련된
    'female-4': { name: 'ko-KR-Wavenet-B', gender: 'FEMALE' }  // 따뜻한
};

const VOICE_SETTINGS = {
    'male-1':   { rate: 0.9,  pitch: -2.0 },
    'male-2':   { rate: 1.15, pitch: 0.0 },
    'male-3':   { rate: 0.85, pitch: -4.0 },
    'male-4':   { rate: 1.0,  pitch: -1.0 },
    'female-1': { rate: 0.95, pitch: 2.0 },
    'female-2': { rate: 1.1,  pitch: 4.0 },
    'female-3': { rate: 0.9,  pitch: 1.0 },
    'female-4': { rate: 1.0,  pitch: 2.0 }
};

// ============================================
// Text-to-Speech Endpoint
// ============================================
app.post('/api/tts', async (req, res) => {
    try {
        const { text, voicePreset = 'male-1' } = req.body;

        if (!text) {
            return res.status(400).json({ error: '텍스트가 필요합니다' });
        }

        console.log(`🎤 TTS 요청: ${voicePreset}, 텍스트 길이: ${text.length}`);

        const voiceConfig = VOICE_MAPPINGS[voicePreset] || VOICE_MAPPINGS['male-1'];
        const voiceSettings = VOICE_SETTINGS[voicePreset] || { rate: 1.0, pitch: 0.0 };

        const request = {
            input: { text },
            voice: {
                languageCode: 'ko-KR',
                name: voiceConfig.name,
                ssmlGender: voiceConfig.gender
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: voiceSettings.rate,
                pitch: voiceSettings.pitch
            }
        };

        const [response] = await ttsClient.synthesizeSpeech(request);

        // Convert audio content to base64
        const audioBase64 = response.audioContent.toString('base64');

        console.log('✅ TTS 생성 완료');
        res.json({
            success: true,
            audioContent: audioBase64,
            format: 'mp3'
        });

    } catch (error) {
        console.error('❌ TTS 오류:', error);
        res.status(500).json({
            error: 'TTS 생성 실패',
            message: error.message
        });
    }
});

// ============================================
// Batch TTS for multiple cuts
// ============================================
app.post('/api/tts/batch', async (req, res) => {
    try {
        const { cuts, voicePreset = 'male-1' } = req.body;

        if (!cuts || !Array.isArray(cuts)) {
            return res.status(400).json({ error: '컷 데이터가 필요합니다' });
        }

        console.log(`🎤 배치 TTS 요청: ${cuts.length}개 컷`);

        const results = [];

        for (let i = 0; i < cuts.length; i++) {
            const cut = cuts[i];
            console.log(`  - 컷 ${i + 1}/${cuts.length} 생성 중...`);

            const voiceConfig = VOICE_MAPPINGS[voicePreset] || VOICE_MAPPINGS['male-1'];
            const voiceSettings = VOICE_SETTINGS[voicePreset] || { rate: 1.0, pitch: 0.0 };

            const request = {
                input: { text: cut.narration },
                voice: {
                    languageCode: 'ko-KR',
                    name: voiceConfig.name,
                    ssmlGender: voiceConfig.gender
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: voiceSettings.rate,
                    pitch: voiceSettings.pitch
                }
            };

            const [response] = await ttsClient.synthesizeSpeech(request);
            const audioBase64 = response.audioContent.toString('base64');

            results.push({
                cutIndex: i,
                audioContent: audioBase64,
                duration: cut.duration
            });
        }

        console.log('✅ 배치 TTS 생성 완료');
        res.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('❌ 배치 TTS 오류:', error);
        res.status(500).json({
            error: '배치 TTS 생성 실패',
            message: error.message
        });
    }
});

// ============================================
// Video Generation with Pika AI (fal.ai)
// ============================================

async function generatePikaVideo(prompt, aspectRatio, durationSeconds, stylePreset = '') {
    console.log(`   - Pika API 호출 중...`);
    console.log(`   - 프롬프트: ${prompt.substring(0, 100)}...`);
    console.log(`   - 비율: ${aspectRatio}, 길이: ${durationSeconds}초`);

    // Enhance prompt with quality keywords for better consistency
    const enhancedPrompt = `${prompt}, consistent visual style, smooth motion, professional quality, cohesive color grading`;

    try {
        // Use standard model (v2) for better quality instead of turbo
        const result = await fal.subscribe("fal-ai/pika/v2/text-to-video", {
            input: {
                prompt: enhancedPrompt,
                aspect_ratio: aspectRatio,
                duration: Math.min(durationSeconds, 5), // Pika supports up to 5 seconds
                resolution: "1080p",  // Higher resolution for better quality
                fps: 24  // Cinematic frame rate
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log(`   - 진행 중...`);
                }
            },
        });

        console.log(`   - Pika 응답:`, JSON.stringify(result).substring(0, 200));

        // Pika API returns { data: { video: { url: ... } } }
        // Normalize to { video: { url: ... } }
        if (result.data && result.data.video) {
            return { video: result.data.video };
        }
        return result;

    } catch (error) {
        console.error('   - Pika API Error:', error.message);
        throw error;
    }
}

app.post('/api/generate-video', async (req, res) => {
    try {
        const { visualDescription, aspectRatio = '9:16', duration = 5 } = req.body;

        if (!visualDescription) {
            return res.status(400).json({ error: '영상 설명이 필요합니다' });
        }

        console.log(`🎬 Pika 영상 생성 요청`);

        const result = await generatePikaVideo(visualDescription, aspectRatio, duration);

        console.log('✅ Pika 영상 생성 완료');

        if (result.video && result.video.url) {
            res.json({
                success: true,
                videoUrl: result.video.url,
                metadata: { duration, aspectRatio }
            });
        } else {
            res.json({
                success: true,
                data: result,
                message: '응답 형식을 확인해주세요'
            });
        }

    } catch (error) {
        console.error('❌ Pika 영상 생성 오류:', error);
        res.status(500).json({
            error: 'Pika 영상 생성 실패',
            message: error.message,
            details: 'FAL API 키를 확인해주세요'
        });
    }
});

// ============================================
// Batch Video Generation for multiple cuts (Pika AI)
// ============================================
app.post('/api/generate-video/batch', async (req, res) => {
    try {
        const { cuts, aspectRatio = '9:16' } = req.body;

        if (!cuts || !Array.isArray(cuts)) {
            return res.status(400).json({ error: '컷 데이터가 필요합니다' });
        }

        console.log(`🎬 배치 Pika 영상 생성 요청: ${cuts.length}개 컷`);

        const results = [];

        for (let i = 0; i < cuts.length; i++) {
            const cut = cuts[i];
            const cutDuration = Math.min(cut.duration, 5); // Pika max 5 seconds
            console.log(`  - 컷 ${i + 1}/${cuts.length} 생성 중... (${cutDuration}초)`);

            try {
                const result = await generatePikaVideo(cut.visualDescription, aspectRatio, cutDuration);

                if (result.video && result.video.url) {
                    results.push({
                        cutIndex: i,
                        success: true,
                        videoUrl: result.video.url,
                        duration: cutDuration
                    });
                } else {
                    results.push({
                        cutIndex: i,
                        success: true,
                        data: result,
                        duration: cutDuration
                    });
                }

                console.log(`    ✅ 컷 ${i + 1} 완료`);

            } catch (cutError) {
                console.error(`    ❌ 컷 ${i + 1} 실패:`, cutError.message);
                results.push({
                    cutIndex: i,
                    success: false,
                    error: cutError.message
                });
            }

            // Add delay between requests to avoid rate limits
            if (i < cuts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        console.log('✅ 배치 영상 생성 요청 완료');
        res.json({
            success: true,
            results,
            summary: {
                total: cuts.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length
            }
        });

    } catch (error) {
        console.error('❌ 배치 영상 생성 오류:', error);
        res.status(500).json({
            error: '배치 영상 생성 실패',
            message: error.message
        });
    }
});

// ============================================
// BGM Presets (Royalty-free URLs or local paths)
// ============================================
const BGM_PRESETS = {
    corporate: {
        name: 'Corporate',
        // Use local file in bgm folder
        localPath: path.join(__dirname, 'bgm', 'corporate.mp3')
    },
    upbeat: {
        name: 'Upbeat',
        localPath: path.join(__dirname, 'bgm', 'upbeat.mp3')
    },
    emotional: {
        name: 'Emotional',
        localPath: path.join(__dirname, 'bgm', 'emotional.mp3')
    },
    cinematic: {
        name: 'Cinematic',
        localPath: path.join(__dirname, 'bgm', 'cinematic.mp3')
    }
};

// Create BGM directory if not exists
const BGM_DIR = path.join(__dirname, 'bgm');
if (!fs.existsSync(BGM_DIR)) {
    fs.mkdirSync(BGM_DIR, { recursive: true });
}

// ============================================
// Video Merge - Combine cuts with audio + BGM
// ============================================
app.post('/api/merge-video', async (req, res) => {
    try {
        const { cuts, includeAudio = true, bgmPreset = 'none', bgmVolume = 20 } = req.body;

        if (!cuts || !Array.isArray(cuts) || cuts.length === 0) {
            return res.status(400).json({ error: '컷 데이터가 필요합니다' });
        }

        console.log(`🎬 영상 합치기 요청: ${cuts.length}개 컷`);
        console.log(`   - 오디오 포함: ${includeAudio}`);
        console.log(`   - BGM: ${bgmPreset} (볼륨: ${bgmVolume}%)`);

        const timestamp = Date.now();
        const videoFiles = [];
        const audioFiles = [];
        const tempFiles = []; // Track all temp files for cleanup

        // Download all video files
        for (let i = 0; i < cuts.length; i++) {
            const cut = cuts[i];
            if (!cut.videoUrl) continue;

            const videoPath = path.join(TEMP_DIR, `video_${timestamp}_${i}.mp4`);
            console.log(`  - 컷 ${i + 1} 다운로드 중...`);

            try {
                const response = await axios({
                    method: 'GET',
                    url: cut.videoUrl,
                    responseType: 'stream'
                });
                const writer = fs.createWriteStream(videoPath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                videoFiles.push(videoPath);
                tempFiles.push(videoPath);

                // Save audio if available
                if (includeAudio && cut.audioBase64) {
                    const audioPath = path.join(TEMP_DIR, `audio_${timestamp}_${i}.mp3`);
                    const audioBuffer = Buffer.from(cut.audioBase64, 'base64');
                    fs.writeFileSync(audioPath, audioBuffer);
                    audioFiles.push(audioPath);
                    tempFiles.push(audioPath);
                }
            } catch (err) {
                console.error(`  - 컷 ${i + 1} 다운로드 실패:`, err.message);
            }
        }

        if (videoFiles.length === 0) {
            return res.status(400).json({ error: '다운로드된 영상이 없습니다' });
        }

        console.log(`  - ${videoFiles.length}개 영상 다운로드 완료`);

        // Create file list for FFmpeg concat
        const listPath = path.join(TEMP_DIR, `list_${timestamp}.txt`);
        const listContent = videoFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
        fs.writeFileSync(listPath, listContent);
        tempFiles.push(listPath);

        // Output paths
        const mergedVideoPath = path.join(TEMP_DIR, `merged_${timestamp}.mp4`);
        const mergedAudioPath = path.join(TEMP_DIR, `merged_audio_${timestamp}.mp3`);
        const mixedAudioPath = path.join(TEMP_DIR, `mixed_audio_${timestamp}.mp3`);
        const finalOutputPath = path.join(TEMP_DIR, `final_${timestamp}.mp4`);
        tempFiles.push(mergedVideoPath, mergedAudioPath, mixedAudioPath, finalOutputPath);

        // Step 1: Concatenate videos
        console.log('  - 영상 합치는 중...');
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(listPath)
                .inputOptions(['-f', 'concat', '-safe', '0'])
                .outputOptions(['-c', 'copy'])
                .output(mergedVideoPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        let outputPath = mergedVideoPath;
        let hasProcessedAudio = false;

        // Step 2: Merge TTS audio if available
        if (includeAudio && audioFiles.length > 0) {
            console.log('  - TTS 오디오 합치는 중...');

            const audioListPath = path.join(TEMP_DIR, `audiolist_${timestamp}.txt`);
            const audioListContent = audioFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
            fs.writeFileSync(audioListPath, audioListContent);
            tempFiles.push(audioListPath);

            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(audioListPath)
                    .inputOptions(['-f', 'concat', '-safe', '0'])
                    .outputOptions(['-c', 'copy'])
                    .output(mergedAudioPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            hasProcessedAudio = true;
        }

        // Step 3: Mix BGM with TTS if BGM selected
        let finalAudioPath = mergedAudioPath;

        if (bgmPreset !== 'none' && BGM_PRESETS[bgmPreset]) {
            const bgmConfig = BGM_PRESETS[bgmPreset];
            const bgmPath = bgmConfig.localPath;

            if (fs.existsSync(bgmPath)) {
                console.log(`  - BGM 믹싱 중... (${bgmConfig.name}, 볼륨: ${bgmVolume}%)`);

                // Convert bgmVolume percentage to FFmpeg volume value (0.0 to 1.0)
                const bgmVolumeValue = bgmVolume / 100;
                const ttsVolumeValue = 1.0; // TTS at full volume

                if (hasProcessedAudio) {
                    // Mix TTS + BGM
                    await new Promise((resolve, reject) => {
                        ffmpeg()
                            .input(mergedAudioPath)  // TTS audio
                            .input(bgmPath)          // BGM
                            .complexFilter([
                                `[0:a]volume=${ttsVolumeValue}[tts]`,
                                `[1:a]volume=${bgmVolumeValue}[bgm]`,
                                `[tts][bgm]amix=inputs=2:duration=first:dropout_transition=2[out]`
                            ])
                            .outputOptions(['-map', '[out]', '-c:a', 'aac', '-b:a', '192k'])
                            .output(mixedAudioPath)
                            .on('end', resolve)
                            .on('error', reject)
                            .run();
                    });
                    finalAudioPath = mixedAudioPath;
                } else {
                    // Only BGM (no TTS)
                    finalAudioPath = bgmPath;
                }
                hasProcessedAudio = true;
            } else {
                console.log(`  - ⚠️ BGM 파일 없음: ${bgmPath}`);
            }
        }

        // Step 4: Merge video with final audio
        if (hasProcessedAudio) {
            console.log('  - 영상과 오디오 최종 합치는 중...');
            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(mergedVideoPath)
                    .input(finalAudioPath)
                    .outputOptions([
                        '-c:v', 'copy',
                        '-c:a', 'aac',
                        '-b:a', '192k',
                        '-map', '0:v:0',
                        '-map', '1:a:0',
                        '-shortest'
                    ])
                    .output(finalOutputPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            outputPath = finalOutputPath;
        }

        // Read the final video and send as base64
        console.log('✅ 영상 합치기 완료');
        const videoBuffer = fs.readFileSync(outputPath);
        const videoBase64 = videoBuffer.toString('base64');

        // Cleanup temp files
        setTimeout(() => {
            try {
                tempFiles.forEach(f => {
                    if (fs.existsSync(f)) fs.unlinkSync(f);
                });
            } catch (e) { /* ignore cleanup errors */ }
        }, 5000);

        res.json({
            success: true,
            videoBase64,
            message: '영상 합치기 완료 (TTS + BGM)'
        });

    } catch (error) {
        console.error('❌ 영상 합치기 오류:', error);
        res.status(500).json({
            error: '영상 합치기 실패',
            message: error.message,
            details: 'FFmpeg이 설치되어 있는지 확인해주세요'
        });
    }
});

// ============================================
// Health Check
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        services: {
            tts: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
            pika: !!process.env.FAL_KEY
        },
        timestamp: new Date().toISOString()
    });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
    console.log('\n🚀 신한 Premier Shorts Studio 백엔드 서버 시작!');
    console.log(`📡 포트: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('\n✅ 사용 가능한 API:');
    console.log('   - POST /api/tts - 단일 음성 생성');
    console.log('   - POST /api/tts/batch - 배치 음성 생성');
    console.log('   - POST /api/generate-video - 단일 영상 생성 (Pika AI)');
    console.log('   - POST /api/generate-video/batch - 배치 영상 생성 (Pika AI)');
    console.log('   - GET  /api/health - 상태 확인');
    console.log('\n⚙️  설정 상태:');
    console.log(`   - TTS (Google Cloud): ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅' : '❌'}`);
    console.log(`   - Video (Pika/FAL): ${process.env.FAL_KEY ? '✅' : '❌ FAL_KEY 미설정'}`);
    console.log('\n💡 프론트엔드를 http://localhost:3000/index.html 에서 열어주세요\n');
});

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
});
