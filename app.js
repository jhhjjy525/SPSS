/* ========================================
   신한 Premier Shorts Studio - App Logic
   ======================================== */

// Configuration
const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyAfm9y52h9ipjPVsunCdVr3OOH8crjDJIY',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    // Auto-detect: Vercel uses relative paths, localhost uses port 3000
    BACKEND_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : '',
    // FAL API Key for direct browser video generation
    FAL_KEY: 'aed91f1c-e379-4a94-a62d-51543ac0cb86:d755834a60c7e0dffb9dffbefa65a13e',
    PASSWORD: '7688',
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    MAX_CHARS: 10000
};

// Enhanced Style Templates with Detailed Prompts (차별화 강화)
const STYLE_TEMPLATES = {
    premium: `Premium luxury financial services aesthetic: Opulent marble surfaces with gold veining,
    crystal chandeliers casting warm ambient glow, plush leather furniture in rich burgundy and navy,
    polished mahogany wood accents, elegant silk draperies, exclusive VIP lounge atmosphere,
    soft golden hour lighting filtering through floor-to-ceiling windows overlooking city skyline,
    close-up details of luxury items: fountain pen on premium paper, crystal whiskey glass, gold watch,
    shallow depth of field with creamy bokeh, cinematic anamorphic lens flares,
    camera slowly gliding on professional gimbal with smooth parallax movement,
    subtle particle effects like dust motes in sunbeams, rich color grading with deep shadows and warm highlights,
    sophisticated Korean/Asian business professionals in tailored suits (占max 40% of frame),
    focus on environment and luxury details rather than people`,

    modern: `Contemporary minimalist tech aesthetic: Ultra-clean white spaces with glass and chrome elements,
    geometric LED lighting strips in cool blue tones, holographic UI displays and floating data visualizations,
    sleek touchscreen tablets and smartphones with glowing screens, wireless charging pads,
    modern open-plan office with standing desks and ergonomic chairs, indoor plants,
    bright diffused natural light from large windows, high contrast sharp imagery,
    dynamic camera movements: whip pans, dolly zooms, orbital shots around technology,
    vibrant corporate blue and white color palette with cyan accents, clean sans-serif typography mockups,
    abstract 3D geometric shapes floating in space, grid patterns and circuit board aesthetics,
    young Korean professionals using digital devices (占max 30% of frame),
    emphasis on technology, innovation, and digital transformation rather than people`,

    minimal: `Minimalist zen aesthetic: Vast empty white spaces with single point of focus,
    soft diffused lighting creating gentle shadows, pastel color palette of beige, ivory, cream, pale pink,
    organic materials: raw concrete textures, natural wood grain, linen fabric, matte ceramics,
    simple geometric shapes floating in negative space, subtle grain texture overlay,
    极简主义 composition with asymmetric balance, Scandinavian interior design influence,
    soft gradient backgrounds transitioning between warm neutrals, paper texture effects,
    delicate line art illustrations, watercolor wash effects, hand-drawn minimalist icons,
    calm still life arrangements: single branch with leaves, ceramic cup, smooth stones,
    极慢 gentle camera movements, static locked-off shots emphasizing tranquility,
    no people - focus entirely on objects, space, and subtle details,
    whisper-quiet atmosphere with maximum negative space,
    quiet and serene atmosphere, balanced text and whitespace,
    delivering one clear key message effectively,
    gentle ambient sounds or soft piano melody,
    restrained aesthetics conveying trust and stability,
    clean sans-serif typography with ample breathing room`,

    animation: `Vibrant motion design aesthetic: Colorful 2D vector graphics with smooth keyframe animations,
    playful character illustrations and abstract shapes morphing and transforming,
    bright gradient backgrounds: coral pink to sky blue, sunset orange to lavender purple,
    bouncy elastic easing curves (ease-out-back), playful scale and rotation effects,
    isometric 3D graphics showing financial data, animated bar charts and pie charts growing,
    cute icon animations: coins spinning, arrows bouncing, percentage signs pulsing,
    particle effects: confetti bursts, sparkles, floating bubbles, trailing motion lines,
    friendly rounded typography with animated text reveal effects (typewriter, slide-in),
    flat design shadows and highlights creating depth, paper cutout layering effects,
    no realistic people - use stylized illustrated characters or abstract shapes only,
    dynamic camera: zoom in/out on data points, rotate around 3D infographics,
    vibrant saturated colors: electric blue, hot pink, lime green, sunny yellow,
    continuous fluid motion with seamless looping animations`,

    cinematic: `Hollywood blockbuster aesthetic: Epic widescreen 2.35:1 anamorphic composition,
    dramatic teal and orange color grading with crushed blacks and rich highlights,
    volumetric god rays cutting through atmospheric haze and fog, lens flares from practical lights,
    ultra wide-angle establishing shots showing vast landscapes or towering cityscapes at sunrise/sunset,
    slow motion 120fps footage of dramatic moments: fabric flowing, liquid splashing, particles floating,
    sweeping crane shots rising from ground level to bird's eye view, dramatic dolly zoom (Hitchcock effect),
    cinematic depth of field with foreground elements framing the shot, bokeh from street lights,
    gritty film grain texture overlay, subtle vignette darkening edges, letterbox black bars,
    intense backlit silhouettes against brilliant sunsets, rim lighting separating subject from background,
    epic scale: massive buildings, wide open spaces, dramatic weather conditions (storm clouds, rain),
    Korean/Asian cinematic actors in emotional scenes (占max 35% of frame), focus on epic environment,
    high contrast chiaroscuro lighting creating drama, practical light sources (candles, neon signs),
    movie trailer pacing: slow build to intense climax, powerful wide shots emphasizing grandeur`
};

// Usage Guidelines
const STYLE_RECOMMENDATIONS = {
    premium: {
        bestFor: ['High-net-worth client presentations', 'VIP service benefits', 'Wealth management consultation'],
        targetAudience: 'Premium customers, High-net-worth individuals',
        mood: 'Luxurious, Trustworthy, Exclusive'
    },
    
    modern: {
        bestFor: ['Digital service guides', 'New product launches', 'Business process explanations'],
        targetAudience: 'Professional clients, Tech-savvy users',
        mood: 'Clean, Professional, Innovative'
    },
    
    minimal: {
        bestFor: ['Key message delivery', 'Announcements', 'Quick tips and information'],
        targetAudience: 'General audience, All customer segments',
        mood: 'Clear, Focused, Calm'
    },
    
    animation: {
        bestFor: ['Financial product explanations', 'Data visualization', 'Event promotions', 'Educational content'],
        targetAudience: 'Younger customers, Digital generation',
        mood: 'Energetic, Friendly, Engaging'
    },

    cinematic: {
        bestFor: ['Brand storytelling', 'Major announcements', 'Premium service launches', 'Emotional campaigns'],
        targetAudience: 'All premium customers, Brand-conscious clients',
        mood: 'Dramatic, Powerful, Inspiring'
    }
};

// Function to get style prompt
function getStylePrompt(styleName) {
    if (STYLE_TEMPLATES[styleName]) {
        return STYLE_TEMPLATES[styleName];
    }
    console.warn(`Style "${styleName}" not found. Using default "modern" style.`);
    return STYLE_TEMPLATES.modern;
}

// Function to get style recommendations
function getStyleInfo(styleName) {
    return {
        prompt: STYLE_TEMPLATES[styleName] || STYLE_TEMPLATES.modern,
        recommendations: STYLE_RECOMMENDATIONS[styleName] || STYLE_RECOMMENDATIONS.modern
    };
}

// Functions available globally for use in application
// (getStylePrompt, getStyleInfo, STYLE_TEMPLATES, STYLE_RECOMMENDATIONS)

// Voice Preset Settings (5 presets each for male/female)
// 기본 템포는 빠르게 설정
const VOICE_SETTINGS = {
    // 남성 목소리 (5가지)
    'male-announcer':     { rate: 1.1,  pitch: 0.9,  label: '아나운서', desc: '정확하고 명료한' },
    'male-energetic':     { rate: 1.25, pitch: 1.0,  label: '활기찬', desc: '에너지 넘치는' },
    'male-bright':        { rate: 1.15, pitch: 0.95, label: '밝은', desc: '친근하고 밝은' },
    'male-sophisticated': { rate: 1.0,  pitch: 0.8,  label: '세련된', desc: '중후하고 세련된' },
    'male-young':         { rate: 1.2,  pitch: 1.05, label: '젊은', desc: '젊고 트렌디한' },
    // 여성 목소리 (5가지)
    'female-announcer':     { rate: 1.1,  pitch: 1.1,  label: '아나운서', desc: '전문적이고 신뢰감' },
    'female-energetic':     { rate: 1.25, pitch: 1.2,  label: '활기찬', desc: '밝고 활발한' },
    'female-bright':        { rate: 1.15, pitch: 1.15, label: '밝은', desc: '따뜻하고 밝은' },
    'female-sophisticated': { rate: 1.05, pitch: 1.0,  label: '세련된', desc: '고급스럽고 세련된' },
    'female-young':         { rate: 1.2,  pitch: 1.2,  label: '젊은', desc: '젊고 상쾌한' }
};

// BGM File Mapping (bgm 폴더 파일 기준)
const BGM_FILES = {
    'none': null,
    'corporate': 'bgm/Corporate Ambient Inspiration.wav',     // 프로페셔널 - 기업/비즈니스 분위기
    'upbeat': 'bgm/So Happy (Full Track).wav',                // 경쾌한 - 밝고 활기찬
    'emotional': 'bgm/Soft Piano Ambient.wav',                // 감성적인 - 부드러운 피아노
    'cinematic': 'bgm/MA_NDFY_MasterfulHeroes.wav',           // 시네마틱 - 웅장하고 영화적인
    'modern': 'bgm/MA_Awesomemusic_ModernInterior.wav'        // 모던 - 세련되고 현대적인
};

// State
const state = {
    inputContent: '',
    pdfContent: '',
    urlContent: '',
    videoStyle: 'premium',
    customStyle: '',
    generationMode: 'image',  // 'image' = 이미지+Ken Burns, 'video' = OpenAI Sora 영상
    duration: 30,
    subtitleStyle: 'keyword',
    customSubtitleStyle: '',  // 사용자 정의 자막 스타일
    logoFile: null,
    logoPosition: 'top-right',
    logoSize: 20,
    logoHeight: 60, // Logo height in pixels
    // Custom logo position (percentage-based, for drag positioning)
    logoCustomX: null, // null means use preset position
    logoCustomY: null,
    logoCustomSize: null, // null means use slider value
    voicePreset: 'male-announcer',  // 기본값: 남성 아나운서
    customVoice: '',
    voiceCloneFile: null,
    bgmPreset: 'none',
    bgmCustomFile: null,
    bgmVolume: 20,
    videoQuality: '1080p',
    videoRatio: '9:16',
    videoFps: '30',
    disclaimerText: '본 영상은 신한 Premier 패스파인더 전문위원의 기고문을 바탕으로 AI로 생성된 영상입니다.',
    disclaimerEnabled: false,  // 기본값 미표시
    subtitleFont: 'Noto Sans KR',  // 선택된 자막 폰트 (기본: 노토산스)
    subtitleFontSize: 32,  // 자막 폰트 크기 (기본: 32px)
    subtitleMode: 'keyword',  // 자막 모드: 'keyword' (키워드 강조) 또는 'full' (전체 자막)
    script: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeInputListeners();
    initializeUrlListeners();
    initializeStyleListeners();
    initializeDurationListeners();
    initializeSubtitleListeners();
    initializeLogoListeners();
    initializeVoiceListeners();
    initializeVideoListeners();
    initializeScriptListeners();
});

// Tab functionality
function initializeTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');
        });
    });
    
    // Player tabs
    document.querySelectorAll('.player-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const player = btn.dataset.player;
            document.querySelectorAll('.player-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.player-content').forEach(c => c.style.display = 'none');
            btn.classList.add('active');
            document.getElementById(`player-${player}`).style.display = 'block';
        });
    });
}

// Input listeners
function initializeInputListeners() {
    const contentInput = document.getElementById('content-input');
    const charCount = document.getElementById('char-count');
    const pdfInput = document.getElementById('pdf-input');
    const uploadArea = document.getElementById('upload-area');
    
    // Initialize character count on load
    if (contentInput.value) {
        state.inputContent = contentInput.value;
        charCount.textContent = contentInput.value.length;
    }

    contentInput.addEventListener('input', (e) => {
        state.inputContent = e.target.value;
        charCount.textContent = e.target.value.length;
    });

    // Also listen for paste events
    contentInput.addEventListener('paste', () => {
        setTimeout(() => {
            state.inputContent = contentInput.value;
            charCount.textContent = contentInput.value.length;
        }, 0);
    });
    
    uploadArea.addEventListener('click', () => pdfInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handlePdfUpload(e.dataTransfer.files[0]);
    });
    
    pdfInput.addEventListener('change', (e) => {
        if (e.target.files.length) handlePdfUpload(e.target.files[0]);
    });
    
    document.getElementById('file-remove').addEventListener('click', removePdfFile);
}

// URL input listeners
function initializeUrlListeners() {
    const urlInput = document.getElementById('url-input');
    const extractBtn = document.getElementById('extract-url-btn');
    const clearBtn = document.getElementById('url-content-clear');

    extractBtn.addEventListener('click', extractUrlContent);

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            extractUrlContent();
        }
    });

    clearBtn.addEventListener('click', () => {
        document.getElementById('url-content').style.display = 'none';
        document.getElementById('url-text').textContent = '';
        document.getElementById('url-input').value = '';
        state.urlContent = '';
    });
}

// Extract content from URL
async function extractUrlContent() {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();

    if (!url) {
        showToast('URL을 입력해주세요', 'error');
        return;
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        showToast('올바른 URL 형식이 아닙니다', 'error');
        return;
    }

    const loadingEl = document.getElementById('url-loading');
    const contentEl = document.getElementById('url-content');
    const extractBtn = document.getElementById('extract-url-btn');

    loadingEl.style.display = 'block';
    contentEl.style.display = 'none';
    extractBtn.disabled = true;

    try {
        const response = await fetch('/api/extract-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 200));
            throw new Error('서버 응답 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '본문 추출에 실패했습니다');
        }

        if (!data.content || data.content.trim().length === 0) {
            throw new Error('추출된 본문이 없습니다');
        }

        // Store extracted content
        state.urlContent = data.content;
        state.inputContent = data.content;

        // Also update the text input character count
        const charCount = document.getElementById('char-count');
        if (charCount) {
            charCount.textContent = data.content.length;
        }

        // Display extracted content
        document.getElementById('url-title').textContent = data.title || '추출된 본문';
        document.getElementById('url-text').textContent = data.content;
        contentEl.style.display = 'block';

        showToast('본문 추출 완료!', 'success');

    } catch (error) {
        console.error('URL extraction error:', error);
        showToast(error.message || '본문 추출에 실패했습니다', 'error');
    } finally {
        loadingEl.style.display = 'none';
        extractBtn.disabled = false;
    }
}

async function handlePdfUpload(file) {
    if (!file.name.endsWith('.pdf')) {
        showToast('PDF 파일만 업로드 가능합니다', 'error');
        return;
    }
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast('파일 크기는 10MB 이하여야 합니다', 'error');
        return;
    }
    
    document.getElementById('upload-area').style.display = 'none';
    document.getElementById('uploaded-file').style.display = 'flex';
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = formatFileSize(file.size);
    
    try {
        const text = await extractPdfText(file);
        state.pdfContent = text;
        document.getElementById('pdf-content').style.display = 'block';
        document.getElementById('pdf-text').textContent = text.substring(0, 2000) + (text.length > 2000 ? '...' : '');
        showToast('PDF 텍스트 추출 완료', 'success');
    } catch (error) {
        showToast('PDF 텍스트 추출 실패', 'error');
    }
}

async function extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text.trim();
}

function removePdfFile() {
    state.pdfContent = '';
    document.getElementById('upload-area').style.display = 'block';
    document.getElementById('uploaded-file').style.display = 'none';
    document.getElementById('pdf-content').style.display = 'none';
    document.getElementById('pdf-input').value = '';
}

// Style listeners
function initializeStyleListeners() {
    document.querySelectorAll('input[name="video-style"]').forEach(input => {
        input.addEventListener('change', (e) => {
            state.videoStyle = e.target.value;
            document.getElementById('custom-style-input').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
        });
    });

    document.getElementById('custom-style-text').addEventListener('input', (e) => {
        state.customStyle = e.target.value;
    });

    // Generation mode listener (image-based vs AI video-based)
    document.querySelectorAll('input[name="generation-mode"]').forEach(input => {
        input.addEventListener('change', (e) => {
            state.generationMode = e.target.value;
            console.log(`🎬 영상 생성 방식 변경: ${e.target.value === 'image' ? '이미지 기반' : 'AI 영상 기반'}`);
        });
    });
}

// Duration listeners
function initializeDurationListeners() {
    const slider = document.getElementById('duration-slider');
    const input = document.getElementById('duration-input');
    
    slider.addEventListener('input', (e) => {
        state.duration = parseInt(e.target.value);
        input.value = state.duration;
    });
    
    input.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        val = Math.max(10, Math.min(120, val));
        state.duration = val;
        slider.value = val;
        input.value = val;
    });
}

// Subtitle listeners
function initializeSubtitleListeners() {
    // Subtitle mode toggle (키워드 강조 ↔ 전체 자막)
    const subtitleModeToggle = document.getElementById('subtitle-mode-toggle');
    const subtitleModeLabel = document.getElementById('subtitle-mode-label');

    if (subtitleModeToggle && subtitleModeLabel) {
        subtitleModeToggle.addEventListener('change', (e) => {
            state.subtitleMode = e.target.checked ? 'full' : 'keyword';
            subtitleModeLabel.textContent = e.target.checked ? '전체 자막' : '키워드 강조';
            console.log(`📝 자막 모드 변경: ${state.subtitleMode}`);

            // 스크립트가 이미 생성되어 있으면 자막 실시간 업데이트
            if (state.script && state.script.cuts) {
                updateSubtitlesRealtime();
            }
        });
    }

    // Subtitle font selection
    const fontSelect = document.getElementById('subtitle-font-select');
    const fontSizeSelect = document.getElementById('subtitle-font-size');
    const videoPresetInputs = document.querySelectorAll('input[name="video-preset"]');
    const fontPreviewText = document.getElementById('font-preview-text');
    const fontPreviewContainer = document.getElementById('font-preview-container');

    // Function to update preview
    function updateFontPreview() {
        if (!fontPreviewText || !fontPreviewContainer) {
            console.warn('⚠️ 폰트 미리보기 요소를 찾을 수 없습니다.');
            return;
        }

        const selectedFont = fontSelect ? fontSelect.value : 'Noto Sans KR';
        const selectedSize = fontSizeSelect ? parseInt(fontSizeSelect.value) : 32;
        const selectedPreset = document.querySelector('input[name="video-preset"]:checked')?.value || 'youtube-shorts';

        console.log(`📺 폰트 미리보기 업데이트 - 폰트: ${selectedFont}, 크기: ${selectedSize}px, 프리셋: ${selectedPreset}`);

        // Update font and size
        fontPreviewText.style.fontFamily = `"${selectedFont}", sans-serif`;
        fontPreviewText.style.fontSize = `${selectedSize}px`;

        // Update preview text based on script
        if (state.script && state.script.cuts && state.script.cuts.length > 0) {
            // Show subtitles from cuts, cycling through them
            const currentCutIndex = window.previewCutIndex || 0;
            const cut = state.script.cuts[currentCutIndex];
            const subtitleText = state.subtitleMode === 'full'
                ? (cut.narration || '자막 미리보기')
                : (cut.subtitle || cut.narration || '자막 미리보기');

            fontPreviewText.innerHTML = subtitleText.replace(/\n/g, '<br>');

            // Cycle to next cut for next update
            window.previewCutIndex = (currentCutIndex + 1) % state.script.cuts.length;
        } else {
            fontPreviewText.innerHTML = '신한 프리미어 숏폼 자막<br>(줄바꿈)테스트 화면입니다.';
        }

        // Add smooth transition
        fontPreviewContainer.style.transition = 'all 0.3s ease';

        // Update preview container aspect ratio based on preset
        // Clear previous styles
        fontPreviewContainer.style.removeProperty('min-height');

        if (selectedPreset === 'youtube-shorts') {
            // Vertical 9:16
            fontPreviewContainer.style.width = '180px';
            fontPreviewContainer.style.height = '320px';
            fontPreviewContainer.style.margin = '0 auto';
            fontPreviewContainer.style.maxWidth = '180px';
        } else if (selectedPreset === 'youtube-landscape') {
            // Horizontal 16:9
            fontPreviewContainer.style.width = '100%';
            fontPreviewContainer.style.height = '200px';
            fontPreviewContainer.style.margin = '0';
            fontPreviewContainer.style.maxWidth = '100%';
        } else if (selectedPreset === 'square') {
            // Square 1:1
            fontPreviewContainer.style.width = '280px';
            fontPreviewContainer.style.height = '280px';
            fontPreviewContainer.style.margin = '0 auto';
            fontPreviewContainer.style.maxWidth = '280px';
        } else {
            // Custom - default to horizontal
            fontPreviewContainer.style.width = '100%';
            fontPreviewContainer.style.height = '200px';
            fontPreviewContainer.style.margin = '0';
            fontPreviewContainer.style.maxWidth = '100%';
        }

        console.log(`✅ 미리보기 컨테이너 크기 설정: ${fontPreviewContainer.style.width} x ${fontPreviewContainer.style.height}`);
    }

    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => {
            state.subtitleFont = e.target.value;
            console.log(`🔤 자막 폰트 변경: ${e.target.value}`);
            updateFontPreview();
        });
    }

    // Subtitle font size
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            state.subtitleFontSize = parseInt(e.target.value);
            console.log(`📐 자막 폰트 크기 변경: ${e.target.value}px`);
            updateFontPreview();
        });
    }

    // Video preset change listener for preview update
    videoPresetInputs.forEach(input => {
        input.addEventListener('change', updateFontPreview);
    });

    // Initialize preview
    updateFontPreview();
}

// Update subtitles in real-time based on toggle state
function updateSubtitlesRealtime() {
    if (!state.script || !state.script.cuts) {
        console.warn('⚠️ 스크립트가 없어 자막을 업데이트할 수 없습니다.');
        return;
    }

    console.log(`🔄 자막 실시간 업데이트: ${state.subtitleMode}`);

    // Update each cut's displayed subtitle
    state.script.cuts.forEach((cut, index) => {
        const cutElement = document.querySelector(`[data-cut-index="${index}"]`);
        if (!cutElement) return;

        const subtitleElement = cutElement.querySelector('.cut-subtitle');
        if (!subtitleElement) return;

        // Update subtitle based on mode
        if (state.subtitleMode === 'full') {
            // Full subtitle: use narration
            subtitleElement.textContent = cut.narration || '';
        } else {
            // Keyword mode: use keyword subtitle (generated by LLM)
            subtitleElement.textContent = cut.subtitle || cut.narration || '';
        }
    });

    showToast(`✅ 자막 모드 변경: ${state.subtitleMode === 'full' ? '전체 자막' : '키워드 강조'}`, 'success');
}

// Logo listeners
function initializeLogoListeners() {
    const dropzone = document.getElementById('logo-dropzone');
    const input = document.getElementById('logo-input');

    dropzone.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
        if (e.target.files.length) handleLogoUpload(e.target.files[0]);
    });

    // Drag & Drop support for logo
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleLogoUpload(files[0]);
        }
    });

    document.getElementById('logo-remove').addEventListener('click', removeLogo);

    // Logo size/position are now controlled via drag in preview
    // Position buttons (if exist)
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.position-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.logoPosition = btn.dataset.position;
            updateLogoOverlay();
        });
    });
}

function handleLogoUpload(file) {
    if (!file.type.startsWith('image/')) {
        showToast('이미지 파일만 업로드 가능합니다', 'error');
        return;
    }

    state.logoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('logo-preview-img').src = e.target.result;
        document.getElementById('logo-dropzone').style.display = 'none';
        document.getElementById('logo-preview-container').style.display = 'block';
        document.getElementById('logo-settings').style.display = 'flex';
        // Update logo overlay in preview
        updateLogoOverlay();
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    state.logoFile = null;
    document.getElementById('logo-dropzone').style.display = 'flex';
    document.getElementById('logo-preview-container').style.display = 'none';
    document.getElementById('logo-settings').style.display = 'none';
    document.getElementById('logo-input').value = '';
    // Hide logo overlay in preview
    updateLogoOverlay();
}

function updateLogoOverlay() {
    const overlay = document.getElementById('logo-overlay');
    if (!overlay) return;

    // Hide logo-overlay if logo-editor-overlay is active (to avoid duplicates)
    const editorOverlay = document.getElementById('logo-editor-overlay');
    if (editorOverlay) {
        overlay.style.display = 'none';
        return;
    }

    // Show/hide based on logo file existence
    if (state.logoFile) {
        overlay.style.display = 'block';
        overlay.className = 'logo-overlay ' + state.logoPosition;
        const img = document.getElementById('logo-overlay-img');
        if (img) {
            // Set logo image source from state
            if (!img.src || img.src === '' || img.src === window.location.href) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(state.logoFile);
            }
            // Use max-width and fixed height for consistent sizing
            img.style.maxWidth = state.logoSize + '%';
            img.style.width = 'auto';
            img.style.height = state.logoHeight + 'px';
            img.style.objectFit = 'contain';
        }
    } else {
        overlay.style.display = 'none';
    }
}

// Update disclaimer overlay in preview (하단 15% 영역에 표시)
function updateDisclaimerOverlay() {
    let disclaimerOverlay = document.getElementById('disclaimer-overlay');
    const container = document.getElementById('video-container');

    if (!container) return;

    // Create disclaimer overlay if not exists
    if (!disclaimerOverlay) {
        disclaimerOverlay = document.createElement('div');
        disclaimerOverlay.id = 'disclaimer-overlay';
        disclaimerOverlay.style.cssText = `
            position: absolute;
            bottom: 5%;
            left: 0;
            right: 0;
            text-align: center;
            color: rgba(255, 255, 255, 0.85);
            font-size: 10px;
            font-family: "Noto Sans KR", sans-serif;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            pointer-events: none;
            z-index: 100;
        `;
        container.appendChild(disclaimerOverlay);
    }

    // Show/hide based on checkbox state
    if (state.disclaimerEnabled && state.disclaimerText) {
        disclaimerOverlay.style.display = 'block';
        disclaimerOverlay.textContent = state.disclaimerText;
    } else {
        disclaimerOverlay.style.display = 'none';
    }
}

// ============================================
// Logo Editor - Drag and Resize in Preview
// ============================================
function initializeLogoEditor() {
    const container = document.getElementById('video-container');
    if (!container) return;

    // Remove existing editor if any
    const existingEditor = document.getElementById('logo-editor-overlay');
    if (existingEditor) existingEditor.remove();

    if (!state.logoFile) return;

    // Hide the static logo-overlay when editor is active
    const staticOverlay = document.getElementById('logo-overlay');
    if (staticOverlay) staticOverlay.style.display = 'none';

    // Create logo editor overlay
    const editor = document.createElement('div');
    editor.id = 'logo-editor-overlay';
    editor.style.cssText = `
        position: absolute;
        cursor: move;
        z-index: 100;
        border: 2px dashed rgba(255, 215, 0, 0.8);
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const logoImg = document.createElement('img');
    logoImg.id = 'logo-editor-img';
    logoImg.src = document.getElementById('logo-preview-img')?.src || '';
    logoImg.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
    `;
    editor.appendChild(logoImg);

    // Resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = `
        position: absolute;
        right: -6px;
        bottom: -6px;
        width: 12px;
        height: 12px;
        background: #FFD700;
        border-radius: 50%;
        cursor: se-resize;
        z-index: 10;
    `;
    editor.appendChild(resizeHandle);

    // Info tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'logo-editor-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        top: -28px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        white-space: nowrap;
        pointer-events: none;
    `;
    tooltip.textContent = '드래그: 위치 이동 | 우하단: 크기 조절';
    editor.appendChild(tooltip);

    container.appendChild(editor);

    // Set initial position and size based on actual logo image dimensions
    const containerRect = container.getBoundingClientRect();
    const topMarginPercent = 0.07;
    const topMarginPx = containerRect.height * topMarginPercent;

    // Wait for logo image to load to get actual dimensions
    const previewImg = document.getElementById('logo-preview-img');
    const naturalWidth = previewImg?.naturalWidth || 150;
    const naturalHeight = previewImg?.naturalHeight || 60;
    const aspectRatio = naturalWidth / naturalHeight;

    // Store aspect ratio in state for resize functionality
    state.logoAspectRatio = aspectRatio;

    // Calculate editor size to match logo proportions
    // Use saved custom size if available, otherwise calculate default
    let editorWidth, editorHeight;

    if (state.logoCustomSize !== null && state.logoCustomSize !== undefined) {
        // Restore saved size
        editorWidth = (state.logoCustomSize / 100) * containerRect.width;
        editorHeight = editorWidth / aspectRatio;
    } else {
        // Default: fit within top margin area with proper aspect ratio
        editorHeight = state.logoHeight || Math.min(topMarginPx * 0.7, 80);
        editorWidth = editorHeight * aspectRatio;

        // Clamp width to reasonable bounds
        const maxWidth = containerRect.width * 0.4;
        if (editorWidth > maxWidth) {
            editorWidth = maxWidth;
            editorHeight = editorWidth / aspectRatio;
        }
    }

    let initialX, initialY;
    if (state.logoCustomX !== null && state.logoCustomY !== null) {
        initialX = state.logoCustomX * containerRect.width / 100;
        initialY = state.logoCustomY * containerRect.height / 100;
    } else {
        // Default position based on preset
        if (state.logoPosition.includes('left')) {
            initialX = containerRect.width * 0.05;
        } else if (state.logoPosition.includes('right')) {
            initialX = containerRect.width - editorWidth - containerRect.width * 0.05;
        } else {
            initialX = (containerRect.width - editorWidth) / 2;
        }
        initialY = (topMarginPx - editorHeight) / 2;

        // IMPORTANT: Save default position to state for consistent merge rendering
        state.logoCustomX = (initialX / containerRect.width) * 100;
        state.logoCustomY = (initialY / containerRect.height) * 100;
        state.logoCustomSize = (editorWidth / containerRect.width) * 100;
        console.log(`📍 로고 기본 위치 저장: X=${state.logoCustomX.toFixed(1)}%, Y=${state.logoCustomY.toFixed(1)}%`);
    }

    editor.style.left = initialX + 'px';
    editor.style.top = initialY + 'px';
    editor.style.width = editorWidth + 'px';
    editor.style.height = editorHeight + 'px';

    // Drag functionality
    let isDragging = false;
    let isResizing = false;
    let startX, startY, startLeft, startTop, startWidth, startHeight;

    editor.addEventListener('mousedown', (e) => {
        if (e.target === resizeHandle) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = editor.offsetLeft;
        startTop = editor.offsetTop;
        e.preventDefault();
    });

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = editor.offsetWidth;
        startHeight = editor.offsetHeight;
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            let newLeft = startLeft + dx;
            let newTop = startTop + dy;

            // Constrain to container bounds (keep in top margin area)
            const maxX = containerRect.width - editor.offsetWidth;
            const maxY = topMarginPx - editor.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxX));
            newTop = Math.max(0, Math.min(newTop, maxY));

            editor.style.left = newLeft + 'px';
            editor.style.top = newTop + 'px';

            // Update state with percentage values
            state.logoCustomX = (newLeft / containerRect.width) * 100;
            state.logoCustomY = (newTop / containerRect.height) * 100;
        }

        if (isResizing) {
            const dx = e.clientX - startX;
            let newWidth = Math.max(40, startWidth + dx);
            // Use actual logo aspect ratio instead of fixed 0.5
            const logoRatio = state.logoAspectRatio || aspectRatio || 2.5;
            let newHeight = newWidth / logoRatio;

            // Constrain max size (allow up to 100% width)
            const maxWidth = containerRect.width;
            newWidth = Math.min(newWidth, maxWidth);
            newHeight = newWidth / logoRatio;

            editor.style.width = newWidth + 'px';
            editor.style.height = newHeight + 'px';

            // Update state with size percentage (direct mapping, no factor)
            state.logoCustomSize = (newWidth / containerRect.width) * 100;
            state.logoHeight = newHeight;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging || isResizing) {
            isDragging = false;
            isResizing = false;
            // Hide tooltip after first interaction
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.style.display = 'none', 300);
        }
    });

    // Fade out tooltip after a few seconds
    setTimeout(() => {
        tooltip.style.transition = 'opacity 0.3s';
        tooltip.style.opacity = '0';
        setTimeout(() => tooltip.style.display = 'none', 300);
    }, 4000);
}

// Reset logo to preset position
function resetLogoPosition() {
    state.logoCustomX = null;
    state.logoCustomY = null;
    state.logoCustomSize = null;
    initializeLogoEditor();
    showToast('로고 위치가 초기화되었습니다', 'info');
}

// Voice listeners
function initializeVoiceListeners() {
    document.querySelectorAll('input[name="voice-preset"]').forEach(input => {
        input.addEventListener('change', (e) => {
            state.voicePreset = e.target.value;
            document.getElementById('custom-voice-input').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
            document.getElementById('voice-clone-upload').style.display =
                e.target.value === 'clone' ? 'block' : 'none';
        });
    });

    // Voice preview buttons
    document.querySelectorAll('.voice-preview-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            previewVoice(btn.dataset.voice, btn);
        });
    });

    // Voice cloning upload
    const cloneDropzone = document.getElementById('voice-clone-dropzone');
    const cloneInput = document.getElementById('voice-clone-input');
    const clonePreview = document.getElementById('voice-clone-preview');
    const cloneFileName = document.getElementById('clone-file-name');
    const removeCloneBtn = document.getElementById('remove-clone-file');

    if (cloneDropzone) {
        cloneDropzone.addEventListener('click', () => cloneInput.click());

        cloneDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            cloneDropzone.style.borderColor = 'var(--primary)';
            cloneDropzone.style.background = 'rgba(37, 99, 235, 0.05)';
        });

        cloneDropzone.addEventListener('dragleave', () => {
            cloneDropzone.style.borderColor = '';
            cloneDropzone.style.background = '';
        });

        cloneDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            cloneDropzone.style.borderColor = '';
            cloneDropzone.style.background = '';
            if (e.dataTransfer.files.length) {
                handleVoiceCloneUpload(e.dataTransfer.files[0]);
            }
        });

        cloneInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleVoiceCloneUpload(e.target.files[0]);
            }
        });

        removeCloneBtn.addEventListener('click', () => {
            state.voiceCloneFile = null;
            clonePreview.style.display = 'none';
            cloneDropzone.style.display = 'flex';
            cloneInput.value = '';
        });
    }

    function handleVoiceCloneUpload(file) {
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/x-m4a', 'audio/mp4'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
            showToast('MP3, WAV, M4A 파일만 업로드 가능합니다', 'error');
            return;
        }

        if (file.size > 20 * 1024 * 1024) { // 20MB limit
            showToast('파일 크기는 20MB 이하여야 합니다', 'error');
            return;
        }

        state.voiceCloneFile = file;
        cloneFileName.textContent = file.name;
        cloneDropzone.style.display = 'none';
        clonePreview.style.display = 'flex';
        showToast('음성 샘플이 업로드되었습니다', 'success');
    }

    // BGM listeners
    document.querySelectorAll('input[name="bgm-preset"]').forEach(input => {
        input.addEventListener('change', (e) => {
            state.bgmPreset = e.target.value;
            const volumeControl = document.getElementById('bgm-volume-control');
            const uploadArea = document.getElementById('bgm-upload-area');

            if (volumeControl) {
                volumeControl.style.display = e.target.value === 'none' ? 'none' : 'block';
            }
            if (uploadArea) {
                uploadArea.style.display = e.target.value === 'custom-upload' ? 'block' : 'none';
            }
        });
    });

    // BGM file upload
    const bgmDropzone = document.getElementById('bgm-dropzone');
    const bgmFileInput = document.getElementById('bgm-file-input');
    const bgmFilePreview = document.getElementById('bgm-file-preview');
    const bgmFileName = document.getElementById('bgm-file-name');
    const removeBgmBtn = document.getElementById('remove-bgm-file');

    if (bgmDropzone) {
        bgmDropzone.addEventListener('click', () => bgmFileInput.click());

        bgmDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            bgmDropzone.style.borderColor = 'var(--primary)';
            bgmDropzone.style.background = 'rgba(37, 99, 235, 0.05)';
        });

        bgmDropzone.addEventListener('dragleave', () => {
            bgmDropzone.style.borderColor = '';
            bgmDropzone.style.background = '';
        });

        bgmDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            bgmDropzone.style.borderColor = '';
            bgmDropzone.style.background = '';
            if (e.dataTransfer.files.length) {
                handleBgmUpload(e.dataTransfer.files[0]);
            }
        });

        bgmFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleBgmUpload(e.target.files[0]);
            }
        });

        removeBgmBtn.addEventListener('click', () => {
            state.bgmCustomFile = null;
            bgmFilePreview.style.display = 'none';
            bgmDropzone.style.display = 'flex';
            bgmFileInput.value = '';
        });
    }

    function handleBgmUpload(file) {
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
            showToast('MP3, WAV 파일만 업로드 가능합니다', 'error');
            return;
        }

        if (file.size > 30 * 1024 * 1024) { // 30MB limit for BGM
            showToast('파일 크기는 30MB 이하여야 합니다', 'error');
            return;
        }

        state.bgmCustomFile = file;
        bgmFileName.textContent = file.name;
        bgmDropzone.style.display = 'none';
        bgmFilePreview.style.display = 'flex';
        showToast('BGM 파일이 업로드되었습니다', 'success');
    }

    const bgmVolumeSlider = document.getElementById('bgm-volume');
    if (bgmVolumeSlider) {
        bgmVolumeSlider.addEventListener('input', (e) => {
            state.bgmVolume = parseInt(e.target.value);
            document.getElementById('bgm-volume-value').textContent = e.target.value + '%';
        });
    }

    document.getElementById('generate-voice-btn').addEventListener('click', generateVoice);
    document.getElementById('play-full-btn').addEventListener('click', playFullVoice);
}

// Voice preview - generate sample audio for selected voice
let previewAudio = null;
let previewingVoiceId = null;

async function previewVoice(voiceId, btn) {
    // If same voice is playing, stop it (toggle behavior)
    if (previewAudio && previewingVoiceId === voiceId) {
        previewAudio.pause();
        previewAudio = null;
        previewingVoiceId = null;
        btn.classList.remove('playing');
        updatePreviewButtonIcon(btn, false);
        return;
    }

    // Stop any other playing preview
    if (previewAudio) {
        previewAudio.pause();
        previewAudio = null;
        document.querySelectorAll('.voice-preview-btn').forEach(b => {
            b.classList.remove('playing');
            updatePreviewButtonIcon(b, false);
        });
    }

    // Show loading/playing state immediately
    btn.classList.add('playing');
    updatePreviewButtonIcon(btn, true);
    previewingVoiceId = voiceId;

    try {
        const sampleText = '안녕하세요. 신한 Premier 패스파인더입니다. 오늘도 좋은 하루 되세요.';

        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: sampleText,
                voicePreset: voiceId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.message || data.error || '음성 생성 실패';
            console.error('TTS API 오류 상세:', data);
            throw new Error(`TTS 오류: ${errorMsg}`);
        }

        if (!data.audioContent) {
            throw new Error('음성 데이터 없음');
        }

        // Play the audio (Gemini TTS returns wav format)
        const mimeType = data.mimeType || 'audio/wav';
        const audioBlob = base64ToBlob(data.audioContent, mimeType);
        const audioUrl = URL.createObjectURL(audioBlob);
        previewAudio = new Audio(audioUrl);

        previewAudio.onended = () => {
            btn.classList.remove('playing');
            updatePreviewButtonIcon(btn, false);
            URL.revokeObjectURL(audioUrl);
            previewAudio = null;
            previewingVoiceId = null;
        };

        previewAudio.onerror = () => {
            btn.classList.remove('playing');
            updatePreviewButtonIcon(btn, false);
            showToast('음성 재생 오류', 'error');
            previewAudio = null;
            previewingVoiceId = null;
        };

        previewAudio.play();

    } catch (error) {
        console.error('Voice preview error:', error);
        btn.classList.remove('playing');
        updatePreviewButtonIcon(btn, false);
        previewingVoiceId = null;
        showToast('미리듣기 실패: ' + error.message, 'error');
    }
}

// Update play/stop icon in button
function updatePreviewButtonIcon(btn, isPlaying) {
    if (isPlaying) {
        // Change to stop icon (square)
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>`;
    } else {
        // Change to play icon (triangle)
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
    }
}

// Video listeners
function initializeVideoListeners() {
    // Video preset configurations
    const VIDEO_PRESETS = {
        'youtube-shorts': { ratio: '9:16', quality: '1080p', fps: '30' },
        'youtube-landscape': { ratio: '16:9', quality: '1080p', fps: '30' },
        'square': { ratio: '1:1', quality: '1080p', fps: '30' },
        'custom': null
    };

    // Apply preset to video options
    function applyVideoPreset(presetName) {
        const preset = VIDEO_PRESETS[presetName];
        const customOptions = document.getElementById('custom-video-options');

        if (presetName === 'custom') {
            customOptions.style.display = 'flex';
            return;
        }

        customOptions.style.display = 'none';

        if (preset) {
            // Apply ratio
            state.videoRatio = preset.ratio;
            document.querySelectorAll('.ratio-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.ratio === preset.ratio);
            });

            // Apply quality
            state.videoQuality = preset.quality;
            document.getElementById('video-quality').value = preset.quality;

            // Apply FPS
            state.videoFps = preset.fps;
            document.getElementById('video-fps').value = preset.fps;
        }
    }

    // Video preset listeners
    document.querySelectorAll('input[name="video-preset"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            applyVideoPreset(e.target.value);
        });
    });

    // Apply default preset on load
    const defaultPreset = document.querySelector('input[name="video-preset"]:checked');
    if (defaultPreset) {
        applyVideoPreset(defaultPreset.value);
    }

    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.videoRatio = btn.dataset.ratio;
        });
    });

    document.getElementById('video-quality').addEventListener('change', (e) => {
        state.videoQuality = e.target.value;
    });

    document.getElementById('video-fps').addEventListener('change', (e) => {
        state.videoFps = e.target.value;
    });

    // Disclaimer listeners
    const disclaimerInput = document.getElementById('disclaimer-text');
    const disclaimerEnabled = document.getElementById('disclaimer-enabled');

    if (disclaimerInput) {
        disclaimerInput.addEventListener('input', (e) => {
            state.disclaimerText = e.target.value;
            updateDisclaimerOverlay();
        });
    }

    if (disclaimerEnabled) {
        disclaimerEnabled.addEventListener('change', (e) => {
            state.disclaimerEnabled = e.target.checked;
            updateDisclaimerOverlay();
        });
    }

    document.getElementById('generate-video-btn').addEventListener('click', generateVideo);
    document.getElementById('regenerate-video-btn').addEventListener('click', regenerateVideo);
    document.getElementById('download-btn-with-subtitle').addEventListener('click', () => {
        console.log('🔘 자막 포함 다운로드 버튼 클릭됨');
        downloadMergedVideo(true);
    });
    document.getElementById('download-btn-no-subtitle').addEventListener('click', () => {
        console.log('🔘 자막 제외 다운로드 버튼 클릭됨');
        downloadMergedVideo(false);
    });
}

// Regenerate video - restart video generation
function regenerateVideo() {
    if (!state.script) {
        showToast('먼저 스크립트를 생성해주세요', 'error');
        return;
    }
    // Reset video URLs
    state.script.cuts.forEach(cut => {
        cut.videoUrl = null;
        cut.videoBase64 = null;
    });
    // Show password input and hide preview
    document.getElementById('video-preview').style.display = 'none';
    document.getElementById('preview-placeholder').style.display = 'block';
    const nav = document.getElementById('video-cut-nav');
    if (nav) nav.remove();
    showToast('영상 생성 버튼을 다시 클릭해주세요', 'info');
}

// Download merged video with audio
// Uses browser-side Canvas + MediaRecorder + Web Audio API
async function downloadMergedVideo(withSubtitles = true) {
    console.log('📥 downloadMergedVideo 호출됨, withSubtitles:', withSubtitles);

    if (!state.script || !state.script.cuts.some(cut => cut.videoUrl)) {
        showToast('먼저 영상을 생성해주세요', 'error');
        console.log('❌ 영상이 없어서 다운로드 중단');
        return;
    }

    console.log('✅ 영상 데이터 확인됨, 브라우저 합치기 시도');

    // Try browser-side merge first
    try {
        await downloadMergedVideoBrowser(withSubtitles);
        console.log('✅ 브라우저 합치기 완료');
        return;
    } catch (browserError) {
        console.warn('Browser merge failed, trying server...', browserError);
        showToast('브라우저 합치기 실패, 서버 시도 중...', 'info');
    }

    // Fallback to server-side merge
    const hasAudio = state.script.cuts.some(cut => cut.audioContent);

    showToast('🎬 서버에서 영상 합치기 요청 중...', 'info');
    document.getElementById('download-btn-with-subtitle').disabled = true;
    document.getElementById('download-btn-no-subtitle').disabled = true;

    try {
        const cutsData = state.script.cuts.map((cut, index) => ({
            videoUrl: cut.videoUrl,
            audioBase64: cut.audioContent || null,
            duration: cut.duration
        }));

        const response = await fetch(`${CONFIG.BACKEND_URL}/api/merge-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cuts: cutsData,
                includeAudio: hasAudio,
                aspectRatio: state.videoRatio,
                bgmPreset: state.bgmPreset,
                bgmVolume: state.bgmVolume
            })
        });

        if (!response.ok) {
            throw new Error(`영상 합치기 오류: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.downloadUrl) {
            // Download the merged video
            const a = document.createElement('a');
            a.href = data.downloadUrl;
            a.download = `shinhan_shorts_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('✅ 영상 다운로드 시작!', 'success');
        } else if (data.videoBase64) {
            // Download from base64
            const blob = base64ToBlob(data.videoBase64, 'video/mp4');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shinhan_shorts_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('✅ 영상 다운로드 완료!', 'success');
        } else {
            throw new Error('다운로드 URL을 받지 못했습니다');
        }
    } catch (error) {
        console.error('Download error:', error);
        // Fallback: download current cut only
        downloadCurrentCut();
    }

    document.getElementById('download-btn-with-subtitle').disabled = false;
    document.getElementById('download-btn-no-subtitle').disabled = false;
}

// Fallback: download single cut
function downloadCurrentCut() {
    const cutIndex = window.currentVideoCutIndex || 0;
    const cut = state.script?.cuts[cutIndex];

    if (!cut || !cut.videoUrl) {
        showToast('다운로드할 영상이 없습니다', 'error');
        return;
    }

    const a = document.createElement('a');
    a.href = cut.videoUrl;
    a.download = `shinhan_cut_${cutIndex + 1}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✅ 컷 ${cutIndex + 1} 다운로드 시작!`, 'success');
}

// Script listeners
function initializeScriptListeners() {
    document.getElementById('generate-script-btn').addEventListener('click', generateScript);
    document.getElementById('add-cut-btn').addEventListener('click', addCut);
    document.getElementById('regenerate-script-btn').addEventListener('click', generateScript);
}

// LLM-based subtitle generation with emphasis
// Generates complete sentence subtitles from narration and adds emphasis to key phrases
async function generateSubtitlesWithEmphasis(inputContent, cuts) {
    // Only apply to 'keyword' subtitle style
    if (state.subtitleStyle !== 'keyword') {
        console.log('🔍 자막 생성/강조 건너뜀 (스타일:', state.subtitleStyle, ')');
        return cuts;
    }

    console.log('🔍 LLM 기반 완결형 자막 생성 + 강조 시작...');

    // Build narration list for subtitle generation
    const narrationList = cuts.map((cut, i) => `컷 ${i + 1} 나레이션: "${cut.narration}"`).join('\n');

    const prompt = `당신은 금융 마케팅 숏폼 영상의 자막을 생성하는 전문가입니다.

## 원본 콘텐츠 (전체 맥락):
${inputContent.substring(0, 2000)}

## 컷별 나레이션:
${narrationList}

## 작업 지시:
각 컷의 나레이션을 바탕으로 **풍부하고 완결된 문장형 자막**을 생성하고, 핵심 구문/문장을 강조해주세요.

## 자막 생성 규칙 (매우 중요!!):
1. 🔴 반드시 완결된 문장으로 작성 (주어+서술어 포함)
2. 🔴 "~입니다", "~합니다", "~하세요", "~됩니다" 등으로 끝나는 완전한 문장
3. 🔴 각 자막 총 글자수: 25~45자 (줄바꿈 포함) - 충분한 정보 전달
4. 🔴 2~3줄 구성: "첫째줄\\n둘째줄" 또는 "첫째줄\\n둘째줄\\n셋째줄" 형식
5. 🔴 각 줄 10~18자
6. 🔴 나레이션 내용을 풍부하게 반영하여 시청자가 충분히 이해할 수 있도록

## ❌ 금지 사항 (절대 하지 마세요):
- "~된 부동산에" ❌ (불완전 - 문장이 끝나지 않음)
- "~상담하여" ❌ (불완전 - 연결어미로 끝남)
- "~를 아는" ❌ (불완전 - 관형형으로 끝남)
- "~결정은" ❌ (불완전 - 조사로 끝남)

## ✅ 올바른 예시:
- "부동산 세금 문제는\\n**전문가 절세 방법**으로\\n해결하세요" ✅
- "신한 프리미어 고객이라면\\n**맞춤 상담 서비스**를\\n경험해보세요" ✅
- "정확한 **자산 가치 평가**가\\n성공적인 투자의\\n첫걸음입니다" ✅
- "상속 증여 계획 시\\n**세금 부담 최소화**가\\n핵심 전략입니다" ✅

## 강조 규칙 (구문/문장 단위 강조 가능):
- 핵심 구문/문장(4~15글자)을 **구문** 형식으로 1~2개 강조
- 강조 대상: 핵심 메시지, 행동 유도 문구, 숫자/금액, 전문용어, 브랜드명, 혜택 설명
- 단어 하나보다는 의미 있는 구문/문장 단위로 강조 (예: "절세" → "전문가 절세 방법")
- 시청자의 시선을 끄는 핵심 메시지에 강조 적용

## 출력 형식 (JSON만, 설명 없이):
{"subtitles":["첫째줄 텍스트\\n**강조 구문**이 포함된\\n둘째줄", "**핵심 메시지**가\\n담긴 자막입니다", ...]}

JSON만 출력:`;

    try {
        const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
            })
        });

        if (!response.ok) {
            console.warn('자막 생성 API 오류:', response.status);
            return cuts;
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0]) {
            console.warn('자막 생성 응답 없음');
            return cuts;
        }

        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);

            if (result.subtitles && Array.isArray(result.subtitles)) {
                // Update each cut's subtitle with the new generated version
                result.subtitles.forEach((newSubtitle, index) => {
                    if (cuts[index] && newSubtitle) {
                        const oldSubtitle = cuts[index].subtitle;
                        cuts[index].subtitle = newSubtitle;
                        console.log(`  ✅ 컷 ${index + 1} 자막 생성: "${oldSubtitle}" → "${newSubtitle}"`);
                    }
                });

                console.log('🔍 완결형 자막 생성 + 강조 완료!');
            }
        }
    } catch (error) {
        console.warn('자막 생성 실패:', error.message);
        // Return original cuts if generation fails
    }

    return cuts;
}

// Generate Script
async function generateScript() {
    const content = state.inputContent || state.pdfContent || state.urlContent;
    if (!content.trim()) {
        showToast('콘텐츠를 먼저 입력해주세요', 'error');
        return;
    }

    // For custom style: translate Korean to English, don't use preset
    let styleDesc;
    let stylePrefix;
    if (state.videoStyle === 'custom' && state.customStyle) {
        // Custom style - translate to English during prompt
        styleDesc = `User's custom style request (translate to English): "${state.customStyle}"`;
        stylePrefix = 'Custom cinematic style based on user request';
    } else {
        styleDesc = STYLE_TEMPLATES[state.videoStyle] || STYLE_TEMPLATES['premium'];
        stylePrefix = `Cinematic ${state.videoStyle} style`;
    }

    // Generate subtitle guidelines based on selected style
    const subtitleGuidelines = getSubtitleGuidelines(state.subtitleStyle, state.customSubtitleStyle);

    document.getElementById('generate-script-btn').disabled = true;
    document.getElementById('script-loading').style.display = 'block';
    document.getElementById('script-result').style.display = 'none';

    console.log('🎬 스크립트 생성 시작...');

    // Calculate number of cuts (each cut should be 8-12 seconds for richer narration)
    // Target: total duration / 9 seconds per cut (50% longer than before)
    const avgCutDuration = 9;
    const numCuts = Math.max(2, Math.round(state.duration / avgCutDuration));
    const durationPerCut = Math.round(state.duration / numCuts);

    // Calculate max narration length per cut based on voice speed (fixed at 1.2x for shorts)
    // Base: 7.5 characters per second at normal speed, 1.2x = 9 chars/sec
    const charsPerSecond = 9;  // 숏폼 최적화: 빠른 템포 (1.2x)
    const maxNarrationChars = Math.round(durationPerCut * charsPerSecond);

    const prompt = `🚨🚨🚨 가장 중요 - 아래 입력 콘텐츠를 기반으로만 스크립트를 생성하세요! 🚨🚨🚨

=== 입력 콘텐츠 (이 내용을 바탕으로 스크립트 작성) ===
${content.substring(0, 3000)}
=== 입력 콘텐츠 끝 ===

위 입력 콘텐츠의 핵심 메시지와 정보를 ${state.duration}초 숏폼 영상 스크립트로 변환하세요.
입력 콘텐츠와 무관한 내용은 절대 생성하지 마세요!

STYLE: ${state.videoStyle === 'custom' ? state.customStyle : styleDesc}

⚠️ 타이밍 요구사항:
- 총 영상 길이: ${state.duration}초
- 컷 수: ${numCuts}개
- 컷당 길이: ${durationPerCut}초
- 음성 속도: 1.2x (숏폼 빠른 템포)
- 컷당 나레이션: 최대 ${maxNarrationChars}자

✅ 나레이션 규칙:
- 입력 콘텐츠의 핵심 내용을 자연스러운 구어체로 전달
- 뉴스 앵커처럼 완전한 문장 사용 ("~합니다", "~입니다" 등)
- 시청자에게 말하듯 자연스러운 톤

⛔ 금지사항:
- 키워드 나열 금지
- 헤드라인 스타일 금지
- 불완전 문장 금지
- 입력 콘텐츠와 무관한 내용 금지

REQUIREMENTS:
- Narration: 입력 콘텐츠 기반 완전한 구어체 한국어 문장 (최대 ${maxNarrationChars}자)
- Subtitle (keyword mode): 나레이션 핵심 키워드 요약 (완결된 문장, 25~45자, 2~3줄)
- Subtitle (full mode): 나레이션 전체 텍스트 그대로
- Visual Description Flux: Flux AI 이미지 생성용 프롬프트 (영어)
- Visual Description Kling: Kling Image-to-Video용 동작/카메라 움직임 프롬프트 (영어)

VISUAL DESCRIPTION FLUX (이미지 생성용):
- 정적인 장면 묘사에 집중
- 포함 요소: 주제, 비주얼 스타일, 주요 피사체, 소품, 환경, 배경, 조명, 색상 팔레트
- 10문장 이상의 상세한 영어 설명
- 인물이 등장하면 반드시 "Korean person" 명시하고 50% 이하 비중
- 텍스트/문자 포함 금지
- Example: "Premium luxury financial office, marble desk surface with gold veining, Korean business professional in background, soft golden hour lighting, warm ambient glow, minimalist composition, no text, clean image"

VISUAL DESCRIPTION KLING (영상 동작용):
- 카메라 움직임과 피사체 동작에 집중
- 포함 요소: 카메라 무브먼트, 피사체 움직임, 전환 효과
- 5~7문장의 동작 중심 영어 설명
- Ken Burns 효과, 팬, 줌, 회전 등 구체적 움직임 명시
- Example: "Slow zoom in towards the desk surface, gentle Ken Burns effect panning left to right, subtle parallax movement revealing depth, smooth camera glide revealing golden details, elegant transition with soft focus shift"

⚠️ PERSON PROPORTION LIMIT (매우 중요):
- 인물/사람이 이미지에서 차지하는 비중은 최대 50% 이하로 제한
- 환경, 배경, 오브젝트, 개념적 요소를 더 강조할 것
- 인물이 필요한 경우에도 배경이나 환경이 주가 되고 인물은 보조 요소로
- 가능하면 인물 없이 개념, 데이터 시각화, 환경, 사물로 표현
- Person/human figures must occupy MAXIMUM 50% of the image or less
- Focus more on environments, objects, data visualization, abstract concepts
- When people are needed, make them secondary elements with environment as main focus

RULES:
- NO text/letters/words in images
- If people appear, specify "Korean person" AND ensure they occupy less than 50% of frame
- Prefer scenes without people: landscapes, objects, abstract concepts, data charts
- End each visualDescription with "no text, clean image"
- ${state.videoStyle === 'custom' ? 'Translate Korean style to English' : `Start with "${stylePrefix}"`}

${subtitleGuidelines}

OUTPUT JSON ONLY (no markdown, no explanation):
{
  "cuts": [
    {
      "cutNumber": 1,
      "duration": ${durationPerCut},
      "narration": "[입력 콘텐츠 기반 나레이션]",
      "subtitle": "[키워드 강조 모드용 완결된 문장 자막]",
      "visualDescriptionFlux": "${stylePrefix}, [정적 이미지 장면 설명], no text, clean image",
      "visualDescriptionKling": "[카메라 움직임과 피사체 동작 설명]"
    }
  ]
}`;

    try {
        const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
            })
        });

        const data = await response.json();

        // Check for API errors
        if (!response.ok) {
            if (response.status === 429) {
                showToast('⚠️ API 할당량 초과: 잠시 후 다시 시도해주세요 (1분 대기 권장)', 'error');
                console.error('API Rate Limit:', data);
            } else if (response.status === 400) {
                showToast('⚠️ 잘못된 요청: API 키를 확인해주세요', 'error');
                console.error('API Error 400:', data);
            } else {
                showToast(`⚠️ API 오류 (${response.status}): ${data.error?.message || '알 수 없는 오류'}`, 'error');
                console.error('API Error:', data);
            }
            return;
        }

        // Check if response has expected structure
        if (!data.candidates || !data.candidates[0]) {
            showToast('⚠️ API 응답 형식 오류: 응답을 파싱할 수 없습니다', 'error');
            console.error('Invalid API response structure:', data);
            return;
        }

        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            state.script = JSON.parse(jsonMatch[0]);

            // Post-process subtitles to ensure 2-line format
            state.script.cuts.forEach((cut, index) => {
                if (cut.subtitle) {
                    cut.subtitle = ensureTwoLineSubtitle(cut.subtitle);
                    console.log(`컷 ${index + 1} 자막: "${cut.subtitle}"`);
                }
            });

            // LLM 기반 완결형 자막 생성 + 강조 (주요 키워드 강조 스타일인 경우에만)
            if (state.subtitleStyle === 'keyword') {
                const loadingText = document.getElementById('script-loading').querySelector('p');
                if (loadingText) loadingText.textContent = '완결형 자막 생성 중...';
                const inputContent = state.inputContent || state.pdfContent || state.urlContent;
                state.script.cuts = await generateSubtitlesWithEmphasis(inputContent, state.script.cuts);
            }

            renderScript();
            showToast('✅ 스크립트가 생성되었습니다', 'success');
        } else {
            throw new Error('JSON not found in response');
        }
    } catch (error) {
        console.error('Script generation error:', error);
        if (error.name === 'SyntaxError') {
            showToast('⚠️ 응답 파싱 실패: JSON 형식이 올바르지 않습니다', 'error');
        } else if (error.message.includes('fetch')) {
            showToast('⚠️ 네트워크 오류: 인터넷 연결을 확인해주세요', 'error');
        } else {
            showToast('⚠️ 스크립트 생성 실패: 다시 시도해주세요', 'error');
        }
    }
    
    document.getElementById('generate-script-btn').disabled = false;
    document.getElementById('script-loading').style.display = 'none';
}

function renderScript() {
    if (!state.script) return;
    
    const container = document.getElementById('cuts-container');
    container.innerHTML = '';
    
    let timeOffset = 0;
    state.script.cuts.forEach((cut, index) => {
        const startTime = formatTime(timeOffset);
        const endTime = formatTime(timeOffset + cut.duration);
        timeOffset += cut.duration;
        
        // Check if cut has uploaded media
        const hasUploadedMedia = cut.uploadedMedia ? true : false;
        const mediaPreviewHtml = hasUploadedMedia
            ? `<div class="cut-media-preview">
                   ${cut.uploadedMedia.type === 'video'
                       ? `<video src="${cut.uploadedMedia.url}" controls></video>`
                       : `<img src="${cut.uploadedMedia.url}" alt="업로드된 이미지">`
                   }
                   <button class="cut-media-remove" onclick="removeCutMedia(${index})" title="미디어 삭제">✕</button>
               </div>`
            : '';

        const cutHtml = `
            <div class="cut-card" data-index="${index}" data-cut-index="${index}">
                <div class="cut-header">
                    <div class="cut-number">
                        <span class="cut-badge">컷 ${index + 1}</span>
                        <span class="cut-time">${startTime} ~ ${endTime}</span>
                    </div>
                    <button class="cut-delete" onclick="deleteCut(${index})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="cut-content">
                    <div class="cut-field">
                        <label>나레이션</label>
                        <textarea onchange="updateCut(${index}, 'narration', this.value)">${cut.narration}</textarea>
                    </div>
                    <div class="cut-field">
                        <label>자막 (** 로 강조 가능, 예: **중요**)</label>
                        <textarea class="cut-subtitle" onchange="updateCut(${index}, 'subtitle', this.value)" placeholder="자막 내용을 입력하세요...">${cut.subtitle || cut.narration || ''}</textarea>
                    </div>
                    <div class="cut-field">
                        <label>🖼️ Visual Description (Flux - 이미지 생성용)</label>
                        <textarea onchange="updateCut(${index}, 'visualDescriptionFlux', this.value)" placeholder="정적 이미지 장면 설명...">${cut.visualDescriptionFlux || cut.visualDescription || ''}</textarea>
                    </div>
                    <div class="cut-field">
                        <label>🎬 Visual Description (Kling - 영상 동작용)</label>
                        <textarea onchange="updateCut(${index}, 'visualDescriptionKling', this.value)" placeholder="카메라 움직임과 피사체 동작...">${cut.visualDescriptionKling || 'Smooth Ken Burns effect, slow zoom in, gentle camera movement'}</textarea>
                    </div>
                    <div class="cut-field cut-media-upload">
                        <label>
                            영상/이미지 소스
                            <span class="cut-media-hint">(선택 사항 - 업로드 시 AI 생성 대신 사용)</span>
                        </label>
                        ${mediaPreviewHtml}
                        ${!hasUploadedMedia ? `
                        <div class="cut-media-tabs">
                            <button class="cut-media-tab active" onclick="switchCutMediaTab(${index}, 'file')" id="cut-tab-file-${index}">📁 파일 업로드</button>
                            <button class="cut-media-tab" onclick="switchCutMediaTab(${index}, 'youtube')" id="cut-tab-youtube-${index}">▶️ YouTube</button>
                        </div>
                        <div class="cut-media-panel" id="cut-panel-file-${index}">
                            <div class="cut-media-dropzone" onclick="document.getElementById('cut-media-input-${index}').click()" id="cut-dropzone-${index}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <span>영상 또는 이미지 파일 클릭/드래그</span>
                                <span class="file-types">MP4, MOV, JPG, PNG, GIF (최대 50MB)</span>
                            </div>
                            <input type="file" id="cut-media-input-${index}" accept="video/*,image/*" style="display:none" onchange="handleCutMediaUpload(${index}, this.files[0])">
                        </div>
                        <div class="cut-media-panel" id="cut-panel-youtube-${index}" style="display:none;">
                            <div class="youtube-input-group">
                                <input type="text" id="cut-youtube-url-${index}" placeholder="YouTube URL (예: https://youtube.com/watch?v=...)" class="youtube-url-input">
                                <div class="youtube-time-inputs">
                                    <label>시작: <input type="text" id="cut-youtube-start-${index}" placeholder="0:00" class="youtube-time-input"></label>
                                    <label>길이: <input type="text" id="cut-youtube-duration-${index}" placeholder="${cut.duration || 5}초" class="youtube-time-input" value="${cut.duration || 5}"></label>
                                </div>
                                <button class="youtube-extract-btn" onclick="extractYouTubeClip(${index})">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                    영상 추출
                                </button>
                            </div>
                            <div class="youtube-status" id="cut-youtube-status-${index}"></div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cutHtml);

        // Add drag & drop event listeners for this cut's dropzone
        const dropzone = document.getElementById(`cut-dropzone-${index}`);
        if (dropzone) {
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('drag-over');
            });

            dropzone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('drag-over');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('drag-over');

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleCutMediaUpload(index, files[0]);
                }
            });
        }
    });

    document.getElementById('total-cuts').textContent = state.script.cuts.length;
    document.getElementById('total-duration').textContent = timeOffset;
    document.getElementById('script-result').style.display = 'block';
}

function updateCut(index, field, value) {
    if (state.script && state.script.cuts[index]) {
        state.script.cuts[index][field] = value;
    }
}

function deleteCut(index) {
    if (state.script && state.script.cuts.length > 1) {
        state.script.cuts.splice(index, 1);
        renderScript();
    } else {
        showToast('최소 1개의 컷이 필요합니다', 'warning');
    }
}

function addCut() {
    if (!state.script) return;
    state.script.cuts.push({
        cutNumber: state.script.cuts.length + 1,
        duration: 5,
        narration: '새 나레이션을 입력하세요',
        visualDescription: 'Enter visual description here'
    });
    renderScript();
}

// Handle cut media (video/image) upload
async function handleCutMediaUpload(cutIndex, file) {
    if (!file) return;

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showToast('파일 크기가 50MB를 초과합니다', 'error');
        return;
    }

    // Determine file type
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
        showToast('지원하지 않는 파일 형식입니다', 'error');
        return;
    }

    // Create object URL for preview
    const fileUrl = URL.createObjectURL(file);

    // Store in cut data
    if (state.script && state.script.cuts[cutIndex]) {
        state.script.cuts[cutIndex].uploadedMedia = {
            file: file,
            url: fileUrl,
            type: isVideo ? 'video' : 'image',
            name: file.name
        };

        console.log(`📎 컷 ${cutIndex + 1}에 ${isVideo ? '영상' : '이미지'} 업로드됨:`, file.name);
        showToast(`컷 ${cutIndex + 1}에 ${isVideo ? '영상' : '이미지'} 업로드됨`, 'success');
        renderScript();
    }
}

// Remove uploaded media from cut
function removeCutMedia(cutIndex) {
    if (state.script && state.script.cuts[cutIndex]) {
        const cut = state.script.cuts[cutIndex];
        if (cut.uploadedMedia) {
            // Revoke object URL to free memory
            if (cut.uploadedMedia.url) {
                URL.revokeObjectURL(cut.uploadedMedia.url);
            }
            delete cut.uploadedMedia;
            console.log(`🗑️ 컷 ${cutIndex + 1} 업로드 미디어 삭제됨`);
            showToast(`컷 ${cutIndex + 1} 미디어 삭제됨`, 'info');
            renderScript();
        }
    }
}

// Switch between file upload and YouTube tabs
function switchCutMediaTab(cutIndex, tabType) {
    // Update tab buttons
    const fileTab = document.getElementById(`cut-tab-file-${cutIndex}`);
    const youtubeTab = document.getElementById(`cut-tab-youtube-${cutIndex}`);
    const filePanel = document.getElementById(`cut-panel-file-${cutIndex}`);
    const youtubePanel = document.getElementById(`cut-panel-youtube-${cutIndex}`);

    if (tabType === 'file') {
        fileTab.classList.add('active');
        youtubeTab.classList.remove('active');
        filePanel.style.display = 'block';
        youtubePanel.style.display = 'none';
    } else {
        fileTab.classList.remove('active');
        youtubeTab.classList.add('active');
        filePanel.style.display = 'none';
        youtubePanel.style.display = 'block';
    }
}

// Parse time string (e.g., "1:30" or "90") to seconds
function parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    timeStr = timeStr.trim();

    // If it's just a number, treat as seconds
    if (/^\d+$/.test(timeStr)) {
        return parseInt(timeStr);
    }

    // Parse mm:ss or hh:mm:ss format
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

// Extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
    if (!url) return null;

    // Various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Extract YouTube clip and add to cut
async function extractYouTubeClip(cutIndex) {
    const urlInput = document.getElementById(`cut-youtube-url-${cutIndex}`);
    const startInput = document.getElementById(`cut-youtube-start-${cutIndex}`);
    const durationInput = document.getElementById(`cut-youtube-duration-${cutIndex}`);
    const statusEl = document.getElementById(`cut-youtube-status-${cutIndex}`);

    const url = urlInput.value.trim();
    const startTime = parseTimeToSeconds(startInput.value);
    const duration = parseInt(durationInput.value) || 5;

    if (!url) {
        showToast('YouTube URL을 입력해주세요', 'error');
        return;
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
        showToast('올바른 YouTube URL이 아닙니다', 'error');
        return;
    }

    statusEl.innerHTML = '<span class="loading-spinner-small"></span> YouTube 영상 추출 중...';
    statusEl.className = 'youtube-status loading';

    try {
        console.log(`📹 YouTube 영상 추출 시작: ${videoId}, 시작: ${startTime}s, 길이: ${duration}s`);

        const response = await fetch(`${CONFIG.BACKEND_URL}/api/youtube-extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videoId: videoId,
                startTime: startTime,
                duration: duration
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `추출 실패: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.videoUrl) {
            // Store the extracted video/image in cut data
            if (state.script && state.script.cuts[cutIndex]) {
                const mediaType = data.isImage ? 'image' : 'video';
                state.script.cuts[cutIndex].uploadedMedia = {
                    url: data.videoUrl,
                    type: mediaType,
                    name: data.isImage ? `YouTube_${videoId}_thumbnail.jpg` : `YouTube_${videoId}_${startTime}s.mp4`,
                    source: 'youtube',
                    videoId: videoId
                };

                if (data.isImage) {
                    statusEl.innerHTML = '✅ 썸네일 이미지 추출 완료 (영상 추출 불가)';
                    showToast(`컷 ${cutIndex + 1}에 YouTube 썸네일 추가됨`, 'success');
                } else {
                    statusEl.innerHTML = '✅ 영상 추출 완료!';
                    showToast(`컷 ${cutIndex + 1}에 YouTube 영상 추가됨`, 'success');
                }
                statusEl.className = 'youtube-status success';

                console.log(`✅ YouTube ${data.isImage ? '썸네일' : '영상'} 추출 완료:`, data.videoUrl);

                // Re-render to show the video preview
                setTimeout(() => renderScript(), 500);
            }
        } else {
            throw new Error(data.message || '영상 추출 실패');
        }

    } catch (error) {
        console.error('YouTube 추출 오류:', error);
        statusEl.innerHTML = `❌ 오류: ${error.message}`;
        statusEl.className = 'youtube-status error';
        showToast(`YouTube 추출 실패: ${error.message}`, 'error');
    }
}

// Create video from uploaded image (similar to AI-generated but using uploaded file)
async function createVideoFromUploadedImage(imageUrl, duration, aspectRatio, subtitle = '', cutIndex = 0) {
    // Convert image URL to base64
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
            // Create a canvas to get base64
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);

            try {
                const base64 = tempCanvas.toDataURL('image/jpeg').split(',')[1];
                const videoBlob = await createVideoFromImage(base64, duration, aspectRatio, subtitle, cutIndex);
                resolve(URL.createObjectURL(videoBlob));
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = () => reject(new Error('Failed to load uploaded image'));
        img.src = imageUrl;
    });
}

// Create video from uploaded video (add subtitle overlay)
async function createVideoFromUploadedVideo(videoUrl, duration, aspectRatio, subtitle = '', cutIndex = 0) {
    // If no subtitle needed, return as is (but trim to duration if needed)
    // Otherwise, add subtitle overlay using canvas
    return new Promise(async (resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;

        video.onloadedmetadata = async () => {
            // Determine dimensions based on aspect ratio (Full HD quality)
            let width, height;
            if (aspectRatio === '16:9') {
                width = 1920;
                height = 1080;
            } else if (aspectRatio === '1:1') {
                width = 1080;
                height = 1080;
            } else {
                // 9:16 vertical (Full HD)
                width = 1080;
                height = 1920;
            }

            // Calculate margin areas
            const marginPercent = 0.07;
            const topMarginHeight = Math.round(height * marginPercent);
            const bottomMarginHeight = Math.round(height * marginPercent);
            const contentHeight = height - topMarginHeight - bottomMarginHeight;
            const marginColor = '#0A1628';

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // High-quality rendering settings
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Set up MediaRecorder
            const stream = canvas.captureStream(30);
            let recorderMime = 'video/webm';
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                recorderMime = 'video/webm;codecs=vp8';
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: recorderMime,
                videoBitsPerSecond: 8000000
            });

            const chunks = [];
            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(URL.createObjectURL(blob));
            };

            // Get subtitle style if needed
            const subtitlePreset = state.subtitleStyle || 'keyword';

            // Start recording
            mediaRecorder.start();
            video.currentTime = 0;
            video.play();

            const targetDuration = duration * 1000;
            const startTime = performance.now();

            const drawFrame = () => {
                const elapsed = performance.now() - startTime;

                // Draw margins
                ctx.fillStyle = marginColor;
                ctx.fillRect(0, 0, width, topMarginHeight);
                ctx.fillRect(0, height - bottomMarginHeight, width, bottomMarginHeight);

                // Draw video frame (scaled to fit content area)
                const videoAspect = video.videoWidth / video.videoHeight;
                const contentAspect = width / contentHeight;
                let drawWidth, drawHeight, drawX, drawY;

                if (videoAspect > contentAspect) {
                    drawWidth = width;
                    drawHeight = width / videoAspect;
                    drawX = 0;
                    drawY = topMarginHeight + (contentHeight - drawHeight) / 2;
                } else {
                    drawHeight = contentHeight;
                    drawWidth = contentHeight * videoAspect;
                    drawX = (width - drawWidth) / 2;
                    drawY = topMarginHeight;
                }

                ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

                // Draw subtitle if exists
                if (subtitle && subtitle.trim()) {
                    drawSubtitleOnCanvas(ctx, subtitle, width, height, topMarginHeight, bottomMarginHeight, cutIndex, subtitlePreset);
                }

                // Continue drawing or stop
                if (elapsed < targetDuration && !video.paused && !video.ended) {
                    requestAnimationFrame(drawFrame);
                } else {
                    video.pause();
                    setTimeout(() => mediaRecorder.stop(), 100);
                }
            };

            drawFrame();
        };

        video.onerror = () => reject(new Error('Failed to load uploaded video'));
        video.src = videoUrl;
        video.load();
    });
}

// Generate Voice with Backend TTS API
async function generateVoice() {
    if (!state.script) {
        showToast('먼저 스크립트를 생성해주세요', 'error');
        return;
    }

    document.getElementById('generate-voice-btn').disabled = true;
    document.getElementById('voice-loading').style.display = 'block';
    document.getElementById('voice-result').style.display = 'none';

    console.log(`🎤 ElevenLabs 배치 TTS 요청 중...`);

    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/tts/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cuts: state.script.cuts,
                voicePreset: state.voicePreset
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.message || data.error || `HTTP ${response.status}`;
            console.error('배치 TTS API 오류 상세:', data);
            throw new Error(`TTS API 오류: ${errorMsg}`);
        }

        if (data.success && data.results) {
            // Store audio content for each cut and calculate actual audio duration
            const totalCuts = state.script.cuts.length;

            console.log('🎤 TTS 오디오 길이 분석 및 컷 시간 자동 조절 시작...');

            for (let index = 0; index < totalCuts; index++) {
                const cut = state.script.cuts[index];
                if (data.results[index]) {
                    cut.audioContent = data.results[index].audioContent;
                    cut.audioMimeType = data.results[index].mimeType || 'audio/wav';

                    // Check if audioContent exists before measuring duration
                    if (!cut.audioContent) {
                        console.error(`  컷 ${index + 1}: 오디오 데이터 없음 (TTS API 오류) - 에러: ${data.results[index].error || '알 수 없음'}`);
                        continue;
                    }

                    // Calculate actual audio duration from base64
                    try {
                        const audioDuration = await getAudioDuration(cut.audioContent, cut.audioMimeType);
                        // Add 1.5 second buffer to ensure audio doesn't get cut off
                        const adjustedDuration = Math.max(5, audioDuration + 1.5);
                        cut.duration = Math.ceil(adjustedDuration); // Round up to whole second

                        console.log(`  컷 ${index + 1}: 음성 ${audioDuration.toFixed(1)}s + 1.5s 버퍼 → 컷 시간 ${cut.duration}s (${cut.audioMimeType})`);
                    } catch (durationError) {
                        console.warn(`  컷 ${index + 1}: 오디오 길이 측정 실패, 기본값 유지`, durationError);
                    }
                }

                // Update progress bar
                document.getElementById('voice-progress').style.width = ((index + 1) / totalCuts * 100) + '%';
            }

            console.log('✅ 컷 시간 자동 조절 완료');

            // Calculate total duration (now based on adjusted durations)
            const totalDuration = state.script.cuts.reduce((sum, cut) => sum + cut.duration, 0);
            document.getElementById('total-time').textContent = formatTime(totalDuration);

            renderVoiceResult();
            generateWaveform();

            document.getElementById('voice-result').style.display = 'block';
            showToast('✅ 음성 생성 완료!', 'success');
        } else {
            throw new Error('Invalid TTS response');
        }
    } catch (error) {
        console.error('TTS generation error:', error);
        showToast(`⚠️ 음성 생성 실패: ${error.message}`, 'error');
    }

    document.getElementById('generate-voice-btn').disabled = false;
    document.getElementById('voice-loading').style.display = 'none';
}

function renderVoiceResult() {
    const list = document.getElementById('cuts-audio-list');
    list.innerHTML = '';

    state.script.cuts.forEach((cut, i) => {
        list.insertAdjacentHTML('beforeend', `
            <div class="cut-audio-item" data-cut-index="${i}">
                <span class="cut-label">컷 ${i + 1}</span>
                <span class="cut-duration">${cut.duration}초</span>
                <button class="cut-play-btn" onclick="playVoiceDemo(${i})">
                    <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21"/>
                    </svg>
                    <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                </button>
                <div class="cut-progress-container" style="flex:1; height:30px; background:var(--bg-glass); border-radius:4px; position:relative; overflow:hidden; cursor:pointer;" onclick="seekCutAudio(event, ${i})">
                    <div class="cut-progress-bar" id="cut-progress-${i}" style="position:absolute; left:0; top:0; height:100%; width:0%; background:linear-gradient(90deg, var(--primary), var(--secondary)); opacity:0.3; transition:width 0.1s;"></div>
                    <input type="range" class="cut-seek-bar" id="cut-seek-${i}" min="0" max="100" value="0" style="position:absolute; width:100%; height:100%; opacity:0; cursor:pointer;" oninput="seekCutAudioInput(${i}, this.value)">
                    <span class="cut-time-display" id="cut-time-${i}" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:11px; color:var(--text-secondary);">0:00</span>
                </div>
            </div>
        `);
    });

    // Initialize seek bar for full playback
    initializeSeekBar();
}

function generateWaveform() {
    const waveform = document.getElementById('waveform');
    waveform.innerHTML = '';
    for (let i = 0; i < 80; i++) {
        const bar = document.createElement('div');
        bar.className = 'waveform-bar';
        bar.style.height = (Math.random() * 28 + 8) + 'px';
        waveform.appendChild(bar);
    }
}

function playVoiceDemo(index) {
    const cut = state.script.cuts[index];

    if (!cut.audioContent) {
        showToast('먼저 음성을 생성해주세요', 'error');
        return;
    }

    // If same audio is playing, pause it
    if (window.currentAudio && window.currentCutIndex === index) {
        if (window.currentAudio.paused) {
            window.currentAudio.play();
            updateCutPlayButton(index, true);
        } else {
            window.currentAudio.pause();
            updateCutPlayButton(index, false);
        }
        return;
    }

    // Stop any currently playing audio
    if (window.currentAudio) {
        window.currentAudio.pause();
        resetCutProgress(window.currentCutIndex);
        window.currentAudio = null;
    }

    // Create audio from base64
    const audioBlob = base64ToBlob(cut.audioContent, cut.audioMimeType || 'audio/wav');
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    window.currentAudio = audio;
    window.currentCutIndex = index;
    window.currentAudioUrl = audioUrl;

    // Update UI to show playing state
    updateCutPlayButton(index, true);

    // Update progress bar as audio plays
    audio.ontimeupdate = () => {
        const progressBar = document.getElementById(`cut-progress-${index}`);
        const seekBar = document.getElementById(`cut-seek-${index}`);
        const timeDisplay = document.getElementById(`cut-time-${index}`);
        if (progressBar && audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = percent + '%';
            if (seekBar) seekBar.value = percent;
            if (timeDisplay) timeDisplay.textContent = formatTime(Math.floor(audio.currentTime));
        }
    };

    audio.onended = () => {
        updateCutPlayButton(index, false);
        resetCutProgress(index);
        URL.revokeObjectURL(audioUrl);
        window.currentAudio = null;
        window.currentCutIndex = null;
    };

    audio.onerror = () => {
        updateCutPlayButton(index, false);
        showToast('음성 재생 중 오류가 발생했습니다', 'error');
        URL.revokeObjectURL(audioUrl);
        window.currentAudio = null;
        window.currentCutIndex = null;
    };

    audio.play();
}

function updateCutPlayButton(index, isPlaying) {
    document.querySelectorAll('.cut-play-btn').forEach((btn, i) => {
        const playIcon = btn.querySelector('.play-icon');
        const pauseIcon = btn.querySelector('.pause-icon');
        if (i === index) {
            btn.classList.toggle('playing', isPlaying);
            if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
            if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
        } else {
            btn.classList.remove('playing');
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        }
    });
}

function resetCutProgress(index) {
    const progressBar = document.getElementById(`cut-progress-${index}`);
    const seekBar = document.getElementById(`cut-seek-${index}`);
    const timeDisplay = document.getElementById(`cut-time-${index}`);
    if (progressBar) progressBar.style.width = '0%';
    if (seekBar) seekBar.value = 0;
    if (timeDisplay) timeDisplay.textContent = '0:00';
    updateCutPlayButton(index, false);
}

function seekCutAudio(event, index) {
    // This is handled by the range input now
}

function seekCutAudioInput(index, value) {
    if (window.currentAudio && window.currentCutIndex === index) {
        const time = (value / 100) * window.currentAudio.duration;
        window.currentAudio.currentTime = time;
    }
}

function initializeSeekBar() {
    const seekBar = document.getElementById('seek-bar');
    if (!seekBar) return;

    seekBar.addEventListener('input', (e) => {
        if (window.fullAudio && window.fullAudio.duration) {
            const time = (e.target.value / 100) * window.fullAudio.duration;
            window.fullAudio.currentTime = time;
        }
    });
}

function playFullVoice() {
    if (!state.script) return;

    // Stop if already playing
    if (window.fullAudio) {
        if (window.fullAudio.paused) {
            window.fullAudio.play();
            updatePlayFullBtn(true);
        } else {
            window.fullAudio.pause();
            updatePlayFullBtn(false);
        }
        return;
    }

    // Create combined audio by playing sequentially
    window.fullPlaybackIndex = 0;
    window.fullPlaybackStartTime = 0;
    playFullNextCut(0);
}

function playFullNextCut(index) {
    if (!state.script || index >= state.script.cuts.length) {
        updatePlayFullBtn(false);
        window.fullAudio = null;
        window.fullPlaybackIndex = null;
        document.getElementById('seek-bar').value = 0;
        document.getElementById('current-time').textContent = '0:00';
        return;
    }

    const cut = state.script.cuts[index];

    if (!cut.audioContent) {
        showToast('먼저 음성을 생성해주세요', 'error');
        updatePlayFullBtn(false);
        return;
    }

    // Calculate total duration for seek bar
    const totalDuration = state.script.cuts.reduce((sum, c) => sum + c.duration, 0);
    const previousDuration = state.script.cuts.slice(0, index).reduce((sum, c) => sum + c.duration, 0);

    // Create audio from base64
    const audioBlob = base64ToBlob(cut.audioContent, cut.audioMimeType || 'audio/wav');
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    window.fullAudio = audio;
    window.fullPlaybackIndex = index;
    updatePlayFullBtn(true);

    // Update seek bar and time display
    audio.ontimeupdate = () => {
        const currentTotal = previousDuration + audio.currentTime;
        const percent = (currentTotal / totalDuration) * 100;
        document.getElementById('seek-bar').value = percent;
        document.getElementById('current-time').textContent = formatTime(Math.floor(currentTotal));
    };

    audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        window.fullAudio = null;
        playFullNextCut(index + 1);
    };

    audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        window.fullAudio = null;
        updatePlayFullBtn(false);
        showToast('음성 재생 중 오류가 발생했습니다', 'error');
    };

    audio.play();
}

function updatePlayFullBtn(isPlaying) {
    const playIcon = document.querySelector('#play-full-btn .play-icon');
    const pauseIcon = document.querySelector('#play-full-btn .pause-icon');
    if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
    if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
}

// Generate Video (supports both image-based and AI video-based modes)
async function generateVideo() {
    const password = document.getElementById('video-password').value;
    if (password !== CONFIG.PASSWORD) {
        showToast('비밀번호가 올바르지 않습니다', 'error');
        return;
    }

    if (!state.script) {
        showToast('먼저 스크립트를 생성해주세요', 'error');
        return;
    }

    document.getElementById('generate-video-btn').disabled = true;
    document.getElementById('video-loading').style.display = 'block';

    const totalCuts = state.script.cuts.length;
    const isImageMode = state.generationMode === 'image';

    document.getElementById('video-loading-status').textContent = `컷 1/${totalCuts} 생성 중...`;
    document.getElementById('video-progress').style.width = '0%';
    document.getElementById('video-progress-text').textContent = '0%';

    console.log(`🎬 영상 생성 시작 (${isImageMode ? '이미지+Ken Burns' : 'OpenAI Sora 영상'} 모드)...`);

    try {
        let successCount = 0;

        // Generate videos one by one
        for (let i = 0; i < totalCuts; i++) {
            const cut = state.script.cuts[i];
            const subtitle = cut.subtitle || '';

            // Check if cut has uploaded media first
            if (cut.uploadedMedia) {
                const modeLabel = cut.uploadedMedia.type === 'video' ? '📹 업로드 영상' : '📷 업로드 이미지';
                document.getElementById('video-loading-status').textContent = `컷 ${i + 1}/${totalCuts} ${modeLabel} 처리 중...`;
                console.log(`  - 컷 ${i + 1}/${totalCuts} ${modeLabel} 처리 시작...`);

                try {
                    let videoUrl;

                    if (cut.uploadedMedia.type === 'video') {
                        // Use uploaded video (add subtitle overlay)
                        videoUrl = await createVideoFromUploadedVideo(
                            cut.uploadedMedia.url,
                            cut.duration || 5,
                            state.videoRatio,
                            subtitle,
                            i
                        );
                    } else {
                        // Use uploaded image (Ken Burns effect + subtitle)
                        videoUrl = await createVideoFromUploadedImage(
                            cut.uploadedMedia.url,
                            cut.duration || 5,
                            state.videoRatio,
                            subtitle,
                            i
                        );
                    }

                    if (videoUrl) {
                        cut.videoUrl = videoUrl;
                        // Store original uploaded media URL for subtitle-free download
                        cut.originalUploadedUrl = cut.uploadedMedia.url;
                        cut.originalUploadedType = cut.uploadedMedia.type;
                        successCount++;
                        console.log(`  ✅ 컷 ${i + 1} 업로드 미디어 처리 완료`);
                    }

                    // Update progress
                    const progress = Math.round(((i + 1) / totalCuts) * 100);
                    document.getElementById('video-progress').style.width = progress + '%';
                    document.getElementById('video-progress-text').textContent = progress + '%';

                    if (i < totalCuts - 1) {
                        await new Promise(r => setTimeout(r, 500));
                    }
                    continue;

                } catch (uploadError) {
                    console.error(`  ❌ 컷 ${i + 1} 업로드 미디어 처리 실패:`, uploadError.message);
                    showToast(`컷 ${i + 1} 업로드 미디어 처리 실패 - AI 생성으로 전환`, 'warning');
                    // Fall through to AI generation
                }
            }

            const modeLabel = isImageMode ? '🖼️ 이미지+줌' : '🎬 AI 영상';
            document.getElementById('video-loading-status').textContent = `컷 ${i + 1}/${totalCuts} ${modeLabel} 생성 중...`;
            console.log(`  - 컷 ${i + 1}/${totalCuts} ${modeLabel} 시작...`);

            const enhancedPrompt = `${cut.visualDescription}, professional composition, professional lighting, high resolution, detailed, masterpiece quality, ABSOLUTELY NO TEXT, no letters, no words, no signs, no writing, text-free clean image, IMPORTANT: human figures must occupy MAXIMUM 50% of frame or less, prefer scenes without people, focus on environments objects and concepts, if humans appear make them secondary elements, wide shot perspective, environment-focused composition`;

            try {
                let videoResult;

                if (isImageMode) {
                    // Image-based: High-quality image + Ken Burns zoom effect (fast, low cost)
                    videoResult = await generateImageBasedVideo(enhancedPrompt, state.videoRatio, cut.duration || 5, subtitle, i);
                } else {
                    // AI Video-based: OpenAI Sora moving video generation (slow, high cost)
                    videoResult = await generateSoraAIVideo(enhancedPrompt, state.videoRatio, cut.duration || 5, subtitle, i);
                }

                if (videoResult && videoResult.videoUrl) {
                    // Validate video duration matches expected cut duration (strict check)
                    const expectedDuration = cut.duration || 5;
                    const actualDuration = await getVideoDuration(videoResult.videoUrl);
                    const durationTolerance = 0.5; // Strict: Allow only 0.5 second tolerance
                    const maxRetries = 3; // Maximum retry attempts

                    let finalVideoUrl = videoResult.videoUrl;
                    let finalOriginalData = videoResult.originalImageBase64 || videoResult.originalSoraVideoUrl;
                    let finalDuration = actualDuration;

                    // Retry loop for duration matching
                    for (let retry = 0; retry < maxRetries; retry++) {
                        if (Math.abs(finalDuration - expectedDuration) <= durationTolerance) {
                            break; // Duration is acceptable
                        }

                        console.warn(`  ⚠️ 컷 ${i + 1} 시간 불일치 (시도 ${retry + 1}/${maxRetries}): 예상 ${expectedDuration}s, 실제 ${finalDuration.toFixed(1)}s - 재생성 중...`);
                        document.getElementById('video-loading-status').textContent = `컷 ${i + 1}/${totalCuts} 시간 보정 중 (${retry + 1}/${maxRetries})...`;

                        try {
                            // Regenerate with exact duration
                            const retryResult = await generateImageBasedVideo(enhancedPrompt, state.videoRatio, expectedDuration, subtitle, i);
                            if (retryResult && retryResult.videoUrl) {
                                const retryDuration = await getVideoDuration(retryResult.videoUrl);
                                // Use if it's better than current
                                if (Math.abs(retryDuration - expectedDuration) < Math.abs(finalDuration - expectedDuration)) {
                                    finalVideoUrl = retryResult.videoUrl;
                                    finalOriginalData = retryResult.originalImageBase64;
                                    finalDuration = retryDuration;
                                    console.log(`  🔄 컷 ${i + 1} 재시도 ${retry + 1}: ${retryDuration.toFixed(1)}s (개선됨)`);
                                }
                            }
                        } catch (retryError) {
                            console.warn(`  ⚠️ 컷 ${i + 1} 재생성 실패:`, retryError.message);
                        }

                        // Short delay before next retry
                        await new Promise(r => setTimeout(r, 500));
                    }

                    cut.videoUrl = finalVideoUrl;
                    // Store original data for subtitle-free download
                    if (isImageMode) {
                        cut.originalImageBase64 = finalOriginalData;
                    } else {
                        cut.originalSoraVideoUrl = finalOriginalData;
                    }
                    successCount++;

                    if (Math.abs(finalDuration - expectedDuration) <= durationTolerance) {
                        console.log(`  ✅ 컷 ${i + 1} 완료 (${finalDuration.toFixed(1)}s / 목표 ${expectedDuration}s)`);
                    } else {
                        console.warn(`  ⚠️ 컷 ${i + 1} 시간 차이 있음 (${finalDuration.toFixed(1)}s / 목표 ${expectedDuration}s) - 최선의 결과 사용`);
                    }
                } else {
                    console.warn(`  ⚠️ 컷 ${i + 1} URL 없음`);
                }

            } catch (cutError) {
                console.error(`  ❌ 컷 ${i + 1} 실패:`, cutError.message);
                // If AI video fails, fallback to image-based
                if (!isImageMode) {
                    console.log(`  🔄 컷 ${i + 1} 이미지 기반으로 폴백 시도...`);
                    try {
                        const fallbackResult = await generateImageBasedVideo(enhancedPrompt, state.videoRatio, cut.duration || 5, subtitle, i);
                        if (fallbackResult && fallbackResult.videoUrl) {
                            cut.videoUrl = fallbackResult.videoUrl;
                            cut.originalImageBase64 = fallbackResult.originalImageBase64;
                            successCount++;
                            console.log(`  ✅ 컷 ${i + 1} 폴백 성공`);
                        }
                    } catch (fallbackError) {
                        console.error(`  ❌ 컷 ${i + 1} 폴백도 실패:`, fallbackError.message);
                    }
                }
            }

            // Update progress
            const progress = Math.round(((i + 1) / totalCuts) * 100);
            document.getElementById('video-progress').style.width = progress + '%';
            document.getElementById('video-progress-text').textContent = progress + '%';

            // Short delay between cuts (longer for AI video mode)
            if (i < totalCuts - 1) {
                await new Promise(r => setTimeout(r, isImageMode ? 1500 : 3000));
            }
        }

        // Display results
        if (successCount > 0) {
            displayVideoPreview(0);

            // Logo is now rendered during merge (not baked into individual cuts)
            // Show logo editor overlay so user can adjust position before download
            if (state.logoFile) {
                setTimeout(() => initializeLogoEditor(), 100);
            }

            showToast(`✅ 영상 생성 완료! (성공: ${successCount}/${totalCuts})`, 'success');
            showToast('💡 로고 위치 조정 후 다운로드하면 적용됩니다', 'info');
        } else {
            showToast('⚠️ 영상 생성 실패', 'error');
        }

    } catch (error) {
        console.error('Video generation error:', error);
        showToast('⚠️ 영상 생성 실패: ' + error.message, 'error');
    }

    document.getElementById('generate-video-btn').disabled = false;
    document.getElementById('video-loading').style.display = 'none';
}

// Image-based video generation (Ken Burns effect)
// Returns { videoUrl, originalImageBase64 } for subtitle-free download support
async function generateImageBasedVideo(prompt, aspectRatio, duration, subtitle = '', cutIndex = 0) {
    // Step 1: Generate image using FAL.ai via server API
    console.log('    - 이미지 생성 중 (FAL.ai Flux)...');

    const imageResponse = await fetch(`${CONFIG.BACKEND_URL}/api/imagen-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: prompt,
            aspectRatio: aspectRatio
        })
    });

    if (!imageResponse.ok) {
        const errorData = await imageResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();

    if (!imageData.success || !imageData.images || imageData.images.length === 0) {
        throw new Error('No image generated');
    }

    const imageBase64 = imageData.images[0].base64;
    console.log('    - 이미지 생성 완료!');

    // Step 2: Create video from image using Canvas + MediaRecorder (with subtitle)
    console.log('    - 브라우저에서 영상 렌더링 중...');

    const videoBlob = await createVideoFromImage(imageBase64, duration, aspectRatio, subtitle, cutIndex);
    const videoUrl = URL.createObjectURL(videoBlob);

    console.log('    - 영상 렌더링 완료!');

    // Return both videoUrl and original image for subtitle-free download
    return { videoUrl, originalImageBase64: imageBase64 };
}

// OpenAI Sora Video Generation (actual moving video)
async function generateSoraAIVideo(prompt, aspectRatio, duration, subtitle = '', cutIndex = 0) {
    console.log('    - OpenAI Sora 영상 생성 시작...');

    // Step 1: Submit video generation request
    const submitResponse = await fetch(`${CONFIG.BACKEND_URL}/api/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            visualDescription: prompt + ', smooth motion, smooth camera movement, no text, humans must occupy maximum 50% of frame, wide shot',
            aspectRatio: aspectRatio,
            duration: Math.min(duration, 20)  // Sora supports up to 20 seconds
        })
    });

    if (!submitResponse.ok) {
        throw new Error(`Sora submit failed: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.requestId;

    if (!requestId) {
        throw new Error('No requestId returned from Sora');
    }

    console.log(`    - Sora 요청 ID: ${requestId}`);

    // Step 2: Poll for completion (max 180 seconds for Sora)
    const maxWaitTime = 180000;
    const pollInterval = 5000;
    const startTime = Date.now();
    let lastStatus = '';

    while (Date.now() - startTime < maxWaitTime) {
        await new Promise(r => setTimeout(r, pollInterval));

        try {
            const statusResponse = await fetch(`${CONFIG.BACKEND_URL}/api/video-status?requestId=${requestId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (statusResponse.ok) {
                const statusData = await statusResponse.json();

                if (statusData.status !== lastStatus) {
                    console.log(`    - Sora 상태: ${statusData.status}`);
                    lastStatus = statusData.status;
                }

                if (statusData.status === 'COMPLETED' && statusData.videoUrl) {
                    console.log('    - ✅ Sora 영상 생성 완료!', statusData.videoUrl);

                    // Step 3: Add subtitle overlay to the Sora video
                    const finalVideoUrl = await overlaySubtitleOnVideo(statusData.videoUrl, subtitle, cutIndex, aspectRatio);

                    // Return both videoUrl and original Sora URL for subtitle-free download
                    return { videoUrl: finalVideoUrl, originalSoraVideoUrl: statusData.videoUrl };
                }

                if (statusData.status === 'FAILED' || statusData.status === 'ERROR') {
                    console.error('    - ❌ Sora 영상 생성 실패:', statusData.error || statusData.debug);
                    throw new Error(`Sora generation failed: ${statusData.error || 'Unknown error'}`);
                }
            } else {
                console.warn(`    - ⚠️ 상태 확인 응답 오류: ${statusResponse.status}`);
            }
        } catch (pollError) {
            console.warn(`    - ⚠️ 폴링 오류:`, pollError.message);
        }

        // Update progress text
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        document.getElementById('video-loading-status').textContent = `OpenAI Sora 영상 생성 중... (${elapsed}초)`;
    }

    throw new Error('Sora video generation timeout (180s)');
}

// Overlay subtitle on external video (for Sora videos)
async function overlaySubtitleOnVideo(videoUrl, subtitle, cutIndex, aspectRatio) {
    console.log('    - Sora 영상에 자막 오버레이 중...', videoUrl);

    // Load the video
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    // Try loading the video with timeout
    let videoLoaded = false;
    await new Promise((resolve, reject) => {
        video.onloadeddata = () => {
            videoLoaded = true;
            console.log(`    - ✅ Sora 비디오 로드 완료: ${video.videoWidth}x${video.videoHeight}`);
            resolve();
        };
        video.onerror = (e) => {
            console.error('    - ❌ Sora 비디오 로드 실패:', e);
            reject(new Error('Failed to load Sora video'));
        };
        video.src = videoUrl;
        video.load();

        // Timeout after 15 seconds
        setTimeout(() => {
            if (!videoLoaded) {
                console.warn('    - ⚠️ Sora 비디오 로드 타임아웃');
                resolve(); // Still continue to try
            }
        }, 15000);
    });

    // Determine dimensions
    let width = video.videoWidth || 720;
    let height = video.videoHeight || 1280;

    // Create canvas for overlay
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Calculate margin areas
    const marginPercent = 0.07;
    const topMarginHeight = Math.round(height * marginPercent);
    const bottomMarginHeight = Math.round(height * marginPercent);
    const contentHeight = height - topMarginHeight - bottomMarginHeight;
    const marginColor = '#0A1628';

    // Set up MediaRecorder with compatible codec
    const stream = canvas.captureStream(30);

    // Try VP8 first (more compatible), fallback to VP9
    let recorderMime = 'video/webm';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        recorderMime = 'video/webm;codecs=vp8';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        recorderMime = 'video/webm;codecs=vp9';
    }

    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: recorderMime,
        videoBitsPerSecond: 8000000
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: recorderMime });
            const url = URL.createObjectURL(blob);
            resolve(url);
        };

        mediaRecorder.start();
        video.currentTime = 0;

        const drawFrame = () => {
            // Draw margins
            ctx.fillStyle = marginColor;
            ctx.fillRect(0, 0, width, topMarginHeight);
            ctx.fillRect(0, height - bottomMarginHeight, width, bottomMarginHeight);

            // Draw video in content area
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, topMarginHeight, width, contentHeight);
            ctx.clip();

            // Scale video to fit content area
            const videoAspect = video.videoWidth / video.videoHeight;
            const contentAspect = width / contentHeight;
            let drawWidth, drawHeight, drawX, drawY;

            if (videoAspect > contentAspect) {
                drawHeight = contentHeight;
                drawWidth = drawHeight * videoAspect;
            } else {
                drawWidth = width;
                drawHeight = drawWidth / videoAspect;
            }
            drawX = (width - drawWidth) / 2;
            drawY = topMarginHeight + (contentHeight - drawHeight) / 2;

            ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();

            // NOTE: Logo and disclaimer are drawn during merge, not per-cut
            // This ensures consistency across all cuts

            // Draw subtitle (pass subtitleStyle for proper rendering)
            if (subtitle) {
                drawSubtitleOnCanvas(ctx, subtitle, width, height, topMarginHeight, bottomMarginHeight, cutIndex, state.subtitleStyle);
            }

            if (!video.ended && !video.paused) {
                requestAnimationFrame(drawFrame);
            } else {
                setTimeout(() => mediaRecorder.stop(), 100);
            }
        };

        video.play().then(() => {
            drawFrame();
        }).catch(reject);
    });
}

// Helper: Wrap subtitle text to max characters per line (맥락 유지)
function wrapSubtitleText(text, maxChars) {
    if (!text || maxChars <= 0) return text;

    // Clean text for length calculation (remove emphasis markers)
    const cleanText = (str) => str.replace(/\*\*(.+?)\*\*|\[(.+?)\]/g, '$1$2');

    // 한국어 조사/어미 패턴 (앞 단어와 분리되면 안 되는 것들)
    // 줄 시작에 이것들이 오면 이전 줄과 합쳐야 함
    const koreanParticles = /^(의|를|을|에|이|가|와|과|도|은|는|로|으로|에서|까지|부터|만|조차|마저|처럼|같이|보다|대로|든지|라도|이나|나|요|입니다|합니다|됩니다|습니다|있습니다|니다|세요|해요|어요|지요|죠|네요|군요|구나|다고|라고|하고|인데|는데|한데|지만|려고|으려고|기|게|히|씩|째|들|란|적|중|화|성|력|감|상|점)/;

    // 1단계: 조사로 시작하는 줄을 이전 줄과 합치기
    const rawLines = text.split('\n').map(l => l.trim()).filter(l => l);
    const mergedLines = [];

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const cleanedLine = cleanText(line);

        // 현재 줄이 조사로 시작하는지 확인
        if (i > 0 && koreanParticles.test(cleanedLine)) {
            // 이전 줄과 합치기 (공백 없이 - 조사는 바로 붙어야 함)
            const prevLine = mergedLines.pop();
            mergedLines.push(prevLine + line);
        } else {
            mergedLines.push(line);
        }
    }

    // 2단계: 합쳐진 줄들을 maxChars 기준으로 다시 줄바꿈
    const wrappedLines = [];

    mergedLines.forEach(line => {
        const cleanedLine = cleanText(line);

        // If line is already within limit, keep it
        if (cleanedLine.length <= maxChars) {
            wrappedLines.push(line);
            return;
        }

        // 문자 단위로 처리하되, 강조 마커와 조사를 고려
        // 먼저 토큰화: 강조된 단어, 일반 단어(조사 포함), 공백
        const tokens = [];
        let remaining = line;

        while (remaining.length > 0) {
            // 강조 마커 체크 (**text**)
            const emphMatch = remaining.match(/^(\*\*[^*]+\*\*)/);
            if (emphMatch) {
                tokens.push({ text: emphMatch[1], clean: cleanText(emphMatch[1]), isEmphasis: true });
                remaining = remaining.slice(emphMatch[1].length);
                continue;
            }

            // 대괄호 강조 체크 ([text])
            const bracketMatch = remaining.match(/^(\[[^\]]+\])/);
            if (bracketMatch) {
                tokens.push({ text: bracketMatch[1], clean: cleanText(bracketMatch[1]), isEmphasis: true });
                remaining = remaining.slice(bracketMatch[1].length);
                continue;
            }

            // 공백 체크
            const spaceMatch = remaining.match(/^(\s+)/);
            if (spaceMatch) {
                tokens.push({ text: spaceMatch[1], clean: '', isSpace: true });
                remaining = remaining.slice(spaceMatch[1].length);
                continue;
            }

            // 일반 텍스트 (다음 강조마커, 공백, 또는 끝까지)
            const textMatch = remaining.match(/^([^\s*\[\]]+)/);
            if (textMatch) {
                tokens.push({ text: textMatch[1], clean: textMatch[1], isText: true });
                remaining = remaining.slice(textMatch[1].length);
                continue;
            }

            // 기타 문자
            tokens.push({ text: remaining[0], clean: remaining[0] });
            remaining = remaining.slice(1);
        }

        // 토큰들을 줄로 조합
        let currentLine = '';
        let currentCleanLength = 0;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const tokenCleanLen = token.clean.length;

            // 공백 처리
            if (token.isSpace) {
                if (currentLine) currentLine += token.text;
                continue;
            }

            // 다음 토큰 미리보기 (조사인지 확인)
            let nextParticleLen = 0;
            let nextParticleText = '';
            const nextToken = tokens[i + 1];
            if (nextToken && !nextToken.isSpace && nextToken.clean && koreanParticles.test(nextToken.clean)) {
                nextParticleLen = nextToken.clean.length;
                nextParticleText = nextToken.text;
            }

            // 현재 토큰 + 다음 조사가 maxChars를 넘는지 확인
            const totalNeeded = tokenCleanLen + nextParticleLen;

            if (currentCleanLength + totalNeeded > maxChars && currentLine.trim()) {
                // 현재 토큰이 조사로 시작하면 이전 단어와 함께 다음 줄로
                if (koreanParticles.test(token.clean)) {
                    // 이전 단어 찾기
                    const lastWordMatch = currentLine.match(/(\*\*[^*]+\*\*|\[[^\]]+\]|[^\s*\[\]]+)(\s*)$/);
                    if (lastWordMatch) {
                        const lastWord = lastWordMatch[1];
                        const beforeLastWord = currentLine.slice(0, -lastWordMatch[0].length);
                        if (beforeLastWord.trim()) {
                            wrappedLines.push(beforeLastWord.trim());
                            currentLine = lastWord + token.text;
                            currentCleanLength = cleanText(lastWord).length + tokenCleanLen;
                            continue;
                        }
                    }
                }

                // 현재 줄 저장하고 새 줄 시작
                wrappedLines.push(currentLine.trim());
                currentLine = token.text;
                currentCleanLength = tokenCleanLen;
            } else {
                currentLine += token.text;
                currentCleanLength += tokenCleanLen;
            }

            // 다음 토큰이 조사면 미리 추가 (분리 방지)
            if (nextParticleText && i + 1 < tokens.length) {
                currentLine += nextParticleText;
                currentCleanLength += nextParticleLen;
                i++; // 다음 토큰 건너뛰기
            }
        }

        if (currentLine.trim()) {
            wrappedLines.push(currentLine.trim());
        }
    });

    return wrappedLines.join('\n');
}

// Helper: Draw subtitle on canvas (reusable) - supports different subtitle styles
function drawSubtitleOnCanvas(ctx, subtitle, width, height, topMarginHeight, bottomMarginHeight, cutIndex, subtitleStyle = 'keyword') {
    // Normalize newlines - handle both literal \n and actual newlines
    const normalizedSubtitle = subtitle.replace(/\\n/g, '\n');

    // Apply max chars wrapping
    const wrappedSubtitle = wrapSubtitleText(normalizedSubtitle, state.subtitleMaxChars);
    const subtitleLines = wrappedSubtitle.split('\n').filter(line => line.trim());

    // Font size: use user-selected font size from state
    // Scale based on canvas width for responsive sizing
    const scaleFactor = width / 1080; // 1080p is reference width
    const fontSize = Math.round((state.subtitleFontSize || 32) * scaleFactor);
    const lineHeight = fontSize * 1.5;
    const padding = fontSize * 0.5;

    // 선택된 폰트 사용 (state.subtitleFont) - bold로 일관성 유지
    const fontFamily = `"${state.subtitleFont}", sans-serif`;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const totalHeight = subtitleLines.length * lineHeight + padding * 2;
    const contentHeight = height - topMarginHeight - bottomMarginHeight;

    // Position based on content hash (or center for 'full' style)
    let subtitleCenterY;
    if (subtitleStyle === 'full') {
        // Full subtitles always centered in content area
        subtitleCenterY = topMarginHeight + contentHeight / 2;
    } else {
        const positionHash = subtitle.length % 3;
        if (positionHash === 0) {
            subtitleCenterY = height - bottomMarginHeight - totalHeight / 2 - height * 0.05;
        } else if (positionHash === 1) {
            subtitleCenterY = topMarginHeight + contentHeight / 2;
        } else {
            subtitleCenterY = topMarginHeight + totalHeight / 2 + height * 0.05;
        }
    }

    // Calculate position (no background box - transparent)
    const cleanLine = (line) => line.replace(/\*\*(.+?)\*\*|\[(.+?)\]/g, '$1$2');
    const maxLineWidth = Math.max(...subtitleLines.map(line => ctx.measureText(cleanLine(line)).width));
    const bgWidth = maxLineWidth + padding * 4;
    const bgHeight = totalHeight;
    const bgX = (width - bgWidth) / 2;
    const bgY = subtitleCenterY - totalHeight / 2;

    // Get emphasis style for 'keyword' mode
    const emphasisStyle = EMPHASIS_STYLES[cutIndex % EMPHASIS_STYLES.length];

    // Draw lines based on subtitle style
    subtitleLines.forEach((line, i) => {
        const textY = bgY + padding + lineHeight * 0.5 + i * lineHeight;

        if (subtitleStyle === 'full') {
            // FULL STYLE: Plain white text, no emphasis markers
            const cleanText = cleanLine(line);
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.lineJoin = 'round';

            // Black outline for visibility (두꺼운 테두리)
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 10;
            ctx.strokeText(cleanText, width / 2, textY);

            // White fill
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(cleanText, width / 2, textY);
        } else {
            // KEYWORD or CUSTOM STYLE: With emphasis highlighting
            const parts = parseEmphasisLine(line);

            let totalWidth = 0;
            parts.forEach(part => {
                ctx.font = part.emphasis
                    ? `bold ${Math.round(fontSize * emphasisStyle.scale)}px ${fontFamily}`
                    : `bold ${fontSize}px ${fontFamily}`;
                totalWidth += ctx.measureText(part.text).width;
            });

            let currentX = width / 2 - totalWidth / 2;

            parts.forEach(part => {
                ctx.font = part.emphasis
                    ? `bold ${Math.round(fontSize * emphasisStyle.scale)}px ${fontFamily}`
                    : `bold ${fontSize}px ${fontFamily}`;

                const partWidth = ctx.measureText(part.text).width;

                // 모든 그림자/상태 초기화
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.globalAlpha = 1.0;
                ctx.textAlign = 'left';
                ctx.lineJoin = 'round';

                if (part.emphasis) {
                    // 강조 텍스트 - 드롭쉐도우 + 테두리
                    ctx.shadowColor = emphasisStyle.shadowColor || '#000000';
                    ctx.shadowBlur = emphasisStyle.shadowBlur || 6;
                    ctx.shadowOffsetX = emphasisStyle.shadowOffsetX || 3;
                    ctx.shadowOffsetY = emphasisStyle.shadowOffsetY || 3;

                    // 테두리
                    ctx.strokeStyle = emphasisStyle.strokeColor;
                    ctx.lineWidth = emphasisStyle.strokeWidth;
                    ctx.strokeText(part.text, currentX, textY);

                    // 그림자 리셋 후 채우기
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;

                    ctx.fillStyle = emphasisStyle.color;
                    ctx.fillText(part.text, currentX, textY);
                } else {
                    // 일반 흰색 텍스트 (두꺼운 테두리)
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 8;
                    ctx.strokeText(part.text, currentX, textY);

                    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                    ctx.shadowBlur = 6;
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 3;
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(part.text, currentX, textY);

                    // 그림자 리셋
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }

                currentX += partWidth;
            });
        }
    });
}

// Helper: Parse emphasis markers in line
function parseEmphasisLine(line) {
    const parts = [];
    const regex = /\*\*(.+?)\*\*|\[(.+?)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ text: line.slice(lastIndex, match.index), emphasis: false });
        }
        parts.push({ text: match[1] || match[2], emphasis: true });
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
        parts.push({ text: line.slice(lastIndex), emphasis: false });
    }
    return parts.length > 0 ? parts : [{ text: line, emphasis: false }];
}

// Legacy function (kept for compatibility)
async function generateSoraVideoDirectly(prompt, aspectRatio, duration, subtitle = '', cutIndex = 0) {
    return generateImageBasedVideo(prompt, aspectRatio, duration, subtitle, cutIndex);
}

// Old Image Generation + Browser Rendering (using OpenAI for image generation)
async function _legacyGenerateSoraVideoDirectly(prompt, aspectRatio, duration, subtitle = '', cutIndex = 0) {
    // Step 1: Generate image using FAL.ai via server API
    console.log('    - 이미지 생성 중 (FAL.ai Flux)...');

    const imageResponse = await fetch(`${CONFIG.BACKEND_URL}/api/imagen-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: prompt,
            aspectRatio: aspectRatio
        })
    });

    if (!imageResponse.ok) {
        const errorData = await imageResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();

    if (!imageData.success || !imageData.images || imageData.images.length === 0) {
        throw new Error('No image generated');
    }

    const imageBase64 = imageData.images[0].base64;
    console.log('    - 이미지 생성 완료!');

    // Step 2: Create video from image using Canvas + MediaRecorder (with subtitle)
    console.log('    - 브라우저에서 영상 렌더링 중...');

    const videoBlob = await createVideoFromImage(imageBase64, duration, aspectRatio, subtitle, cutIndex);
    const videoUrl = URL.createObjectURL(videoBlob);

    console.log('    - 영상 렌더링 완료!');
    return videoUrl;
}

// Load image from URL and convert to base64
async function loadImageAsBase64(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Get base64 without the data URL prefix
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
        };

        img.onerror = () => reject(new Error('Failed to load image from Pollinations.ai'));
        img.src = imageUrl;
    });
}

// Create video from single image with Ken Burns effect
async function createVideoFromImage(imageBase64, duration, aspectRatio, subtitle = '', cutIndex = 0) {
    // Determine dimensions (Full HD quality for all ratios)
    let width, height;
    if (aspectRatio === '16:9') {
        width = 1920;
        height = 1080;
    } else if (aspectRatio === '1:1') {
        width = 1080;
        height = 1080;
    } else {
        // 9:16 vertical (Full HD)
        width = 1080;
        height = 1920;
    }

    // Create video using Canvas + MediaRecorder (Ken Burns zoom effect + subtitle)
    return await createVideoWithCanvas(imageBase64, duration, width, height, subtitle, cutIndex);
}

// 다양한 한글 폰트 (랜덤 적용)
const SUBTITLE_FONTS = [
    '"Noto Sans KR", sans-serif',           // 노토산스 - 깔끔하고 가독성 좋음
    '"Black Han Sans", sans-serif',         // 블랙한산스 - 임팩트 있는 제목용
    '"Jua", sans-serif',                    // 주아 - 친근하고 부드러운
    '"Dongle", sans-serif',                 // 동글 - 귀엽고 둥근 느낌
    '"Orbit", sans-serif',                  // 오빗 - 현대적이고 기하학적
    '"Do Hyeon", sans-serif'                // 도현 - 현대적이고 둥근 느낌
];

// Emphasis style variations for subtitles - 그림자/테두리 강조 스타일 (두꺼운 테두리)
const EMPHASIS_STYLES = [
    // 골드 프리미엄 (Gold Premium)
    { color: '#FFD700', scale: 1.25, strokeWidth: 10, strokeColor: '#5C4813', shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 },
    // 시안 블루 (Cyan Blue)
    { color: '#00E5FF', scale: 1.25, strokeWidth: 10, strokeColor: '#003344', shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 },
    // 핫핑크 팝 (Hot Pink Pop)
    { color: '#FF69B4', scale: 1.25, strokeWidth: 10, strokeColor: '#660033', shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 },
    // 일렉트릭 블루 (Electric Blue)
    { color: '#4FC3F7', scale: 1.25, strokeWidth: 10, strokeColor: '#0D47A1', shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 },
    // 선셋 오렌지 (Sunset Orange)
    { color: '#FF7043', scale: 1.25, strokeWidth: 10, strokeColor: '#BF360C', shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 },
    // 라임 그린 (Lime Green)
    { color: '#B2FF59', scale: 1.25, strokeWidth: 10, strokeColor: '#33691E', shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 },
    // 바이올렛 (Violet)
    { color: '#E040FB', scale: 1.25, strokeWidth: 10, strokeColor: '#4A148C', shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 },
    // 선샤인 옐로우 (Sunshine Yellow)
    { color: '#FFFF00', scale: 1.25, strokeWidth: 12, strokeColor: '#5D4037', shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 },
    // 레드 파워 (Red Power)
    { color: '#FF1744', scale: 1.25, strokeWidth: 10, strokeColor: '#B71C1C', shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 },
    // 화이트 클래식 (White Classic)
    { color: '#FFFFFF', scale: 1.25, strokeWidth: 12, strokeColor: '#000000', shadowColor: '#333333', shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 }
];

// Canvas-based video creation with EXACT duration (time-based, not frame-based)
// Includes: 15% top/bottom margins, enhanced subtitles, logo, disclaimer
async function createVideoWithCanvas(imageBase64, duration, width, height, subtitle = '', cutIndex = 0) {
    return new Promise(async (resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // High-quality rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calculate margin areas (15% top, 15% bottom)
        const marginPercent = 0.07;
        const topMarginHeight = Math.round(height * marginPercent);
        const bottomMarginHeight = Math.round(height * marginPercent);
        const contentHeight = height - topMarginHeight - bottomMarginHeight;

        // Margin color (dark navy for Shinhan brand)
        const marginColor = '#0A1628';

        // Note: Logo is now rendered during mergeVideosInBrowser() for position flexibility
        // Individual cuts don't include logo so user can adjust position before final merge

        const img = new Image();
        img.onload = () => {
            // Set up MediaRecorder with compatible codec
            const stream = canvas.captureStream(30);

            // Try VP8 first (more compatible), fallback to VP9
            let recorderMime = 'video/webm';
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                recorderMime = 'video/webm;codecs=vp8';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                recorderMime = 'video/webm;codecs=vp9';
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: recorderMime,
                videoBitsPerSecond: 8000000
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: recorderMime });
                resolve(blob);
            };

            // Animation effect types - 매끄러운 Ken Burns 효과 (부드러운 움직임)
            const EFFECTS = [
                { name: 'zoomIn', startScale: 1.0, endScale: 1.12, panX: 0, panY: 0 },           // 줌 인 (부드럽게)
                { name: 'zoomOut', startScale: 1.12, endScale: 1.0, panX: 0, panY: 0 },          // 줌 아웃 (부드럽게)
                { name: 'panLeft', startScale: 1.1, endScale: 1.1, panX: 0.06, panY: 0 },        // 왼쪽 패닝 (완만)
                { name: 'panRight', startScale: 1.1, endScale: 1.1, panX: -0.06, panY: 0 },      // 오른쪽 패닝 (완만)
                { name: 'panUp', startScale: 1.1, endScale: 1.1, panX: 0, panY: 0.05 },          // 위로 패닝 (완만)
                { name: 'panDown', startScale: 1.1, endScale: 1.1, panX: 0, panY: -0.05 },       // 아래로 패닝 (완만)
                { name: 'zoomPanLeft', startScale: 1.0, endScale: 1.1, panX: 0.04, panY: 0 },    // 줌+왼쪽 (완만)
                { name: 'zoomPanRight', startScale: 1.0, endScale: 1.1, panX: -0.04, panY: 0 },  // 줌+오른쪽 (완만)
            ];

            // Select effect based on cut index
            const effect = EFFECTS[cutIndex % EFFECTS.length];
            const startScale = effect.startScale;
            const endScale = effect.endScale;
            const durationMs = duration * 1000;
            const startTime = performance.now();

            console.log(`    - 효과: ${effect.name}`);

            // Parse subtitle (handle both literal \n and actual newlines)
            const normalizedSubtitle = subtitle ? subtitle.replace(/\\n/g, '\n') : '';
            // Apply max chars wrapping
            const wrappedSubtitle = wrapSubtitleText(normalizedSubtitle, state.subtitleMaxChars);
            const subtitleLines = wrappedSubtitle.split('\n').filter(line => line.trim());

            mediaRecorder.start();

            // Use requestAnimationFrame for smoother animation (browser-optimized, ~60 FPS)
            let lastFrameTime = 0;
            const minFrameInterval = 16; // ~60 FPS cap

            const animate = (currentTime) => {
                // Smooth frame timing
                if (currentTime - lastFrameTime < minFrameInterval) {
                    requestAnimationFrame(animate);
                    return;
                }
                lastFrameTime = currentTime;

                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / durationMs, 1.0);

                // Smooth cubic easing (ease-in-out) for buttery smooth animation
                const easeProgress = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                // Calculate current scale with easing
                const scale = startScale + (endScale - startScale) * easeProgress;

                // Calculate pan offset with easing
                const panOffsetX = effect.panX * width * easeProgress;
                const panOffsetY = effect.panY * contentHeight * easeProgress;

                // Draw top margin (solid color)
                ctx.fillStyle = marginColor;
                ctx.fillRect(0, 0, width, topMarginHeight);

                // Draw bottom margin (solid color)
                ctx.fillRect(0, height - bottomMarginHeight, width, bottomMarginHeight);

                // Draw image in content area (between margins)
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, topMarginHeight, width, contentHeight);
                ctx.clip();

                const imgAspect = img.width / img.height;
                const contentAspect = width / contentHeight;

                let drawWidth, drawHeight, baseX, baseY;

                if (imgAspect > contentAspect) {
                    drawHeight = contentHeight * scale;
                    drawWidth = drawHeight * imgAspect;
                } else {
                    drawWidth = width * scale;
                    drawHeight = drawWidth / imgAspect;
                }

                // Base position (centered)
                baseX = (width - drawWidth) / 2;
                baseY = topMarginHeight + (contentHeight - drawHeight) / 2;

                // Apply pan offset for Ken Burns effect
                const drawX = baseX + panOffsetX;
                const drawY = baseY + panOffsetY;

                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                ctx.restore();

                // Note: Logo is rendered during merge, not in individual cuts
                // This allows users to adjust logo position before final download

                // NOTE: Logo and disclaimer are drawn during merge, not per-cut
                // This ensures consistency across all cuts

                // Draw enhanced subtitle overlay with varied positions (style-dependent)
                if (subtitleLines.length > 0) {
                    // Font size varies by style: 'full' uses smaller font for more text
                    const fontSize = state.subtitleStyle === 'full'
                        ? Math.round(width * 0.055)
                        : Math.round(width * 0.07);
                    const lineHeight = fontSize * 1.5;
                    const padding = fontSize * 0.5;

                    // 선택된 폰트 사용 (state.subtitleFont) - bold로 일관성 유지
                    const fontFamily = `"${state.subtitleFont}", sans-serif`;
                    ctx.font = `bold ${fontSize}px ${fontFamily}`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Calculate total subtitle height
                    const totalHeight = subtitleLines.length * lineHeight + padding * 2;

                    // Determine subtitle position based on style and cut
                    let subtitleCenterY;
                    if (state.subtitleStyle === 'full') {
                        // Full subtitles: always centered in content area
                        subtitleCenterY = topMarginHeight + contentHeight / 2;
                    } else {
                        // Keyword/Custom: Use hash for varied positions
                        const positionHash = subtitle.length % 3;
                        if (positionHash === 0) {
                            // Bottom position (above bottom margin)
                            subtitleCenterY = height - bottomMarginHeight - totalHeight / 2 - height * 0.05;
                        } else if (positionHash === 1) {
                            // Middle position
                            subtitleCenterY = topMarginHeight + contentHeight / 2;
                        } else {
                            // Top position (below top margin)
                            subtitleCenterY = topMarginHeight + totalHeight / 2 + height * 0.05;
                        }
                    }

                    // Parse lines for emphasis markers: **강조텍스트** or [강조텍스트]
                    const parseLine = (line) => {
                        const parts = [];
                        const regex = /\*\*(.+?)\*\*|\[(.+?)\]/g;
                        let lastIndex = 0;
                        let match;

                        while ((match = regex.exec(line)) !== null) {
                            if (match.index > lastIndex) {
                                parts.push({ text: line.slice(lastIndex, match.index), emphasis: false });
                            }
                            parts.push({ text: match[1] || match[2], emphasis: true });
                            lastIndex = regex.lastIndex;
                        }
                        if (lastIndex < line.length) {
                            parts.push({ text: line.slice(lastIndex), emphasis: false });
                        }
                        return parts.length > 0 ? parts : [{ text: line, emphasis: false }];
                    };

                    // Calculate max line width considering emphasis markers removed
                    const cleanLine = (line) => line.replace(/\*\*(.+?)\*\*|\[(.+?)\]/g, '$1$2');
                    const maxLineWidth = Math.max(...subtitleLines.map(line => ctx.measureText(cleanLine(line)).width));
                    const bgWidth = maxLineWidth + padding * 4;
                    const bgHeight = totalHeight;
                    const bgX = (width - bgWidth) / 2;
                    const bgY = subtitleCenterY - totalHeight / 2;

                    // NO background box - subtitle text only with outline for visibility
                    // (Background box removed per user request)

                    // Get emphasis style for this cut (varies by cutIndex)
                    const emphasisStyle = EMPHASIS_STYLES[cutIndex % EMPHASIS_STYLES.length];

                    // Draw text line by line - style depends on subtitleStyle setting
                    subtitleLines.forEach((line, i) => {
                        const textY = bgY + padding + lineHeight * 0.5 + i * lineHeight;

                        if (state.subtitleStyle === 'full') {
                            // FULL STYLE: Plain white text, no emphasis - remove any markers
                            const cleanText = cleanLine(line);
                            ctx.font = `bold ${fontSize}px ${fontFamily}`;
                            ctx.textAlign = 'center';
                            ctx.lineJoin = 'round';

                            // Black outline for visibility (두꺼운 테두리)
                            ctx.strokeStyle = '#000000';
                            ctx.lineWidth = 10;
                            ctx.strokeText(cleanText, width / 2, textY);

                            // White fill
                            ctx.fillStyle = '#FFFFFF';
                            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                            ctx.shadowBlur = 6;
                            ctx.shadowOffsetX = 1;
                            ctx.shadowOffsetY = 1;
                            ctx.fillText(cleanText, width / 2, textY);
                        } else {
                            // KEYWORD/CUSTOM STYLE: With emphasis highlighting
                            const parts = parseLine(line);

                            // Calculate total width for centering (considering emphasis scale)
                            let totalWidth = 0;
                            parts.forEach(part => {
                                ctx.font = part.emphasis
                                    ? `bold ${Math.round(fontSize * emphasisStyle.scale)}px ${fontFamily}`
                                    : `bold ${fontSize}px ${fontFamily}`;
                                totalWidth += ctx.measureText(part.text).width;
                            });

                            let currentX = width / 2 - totalWidth / 2;

                            parts.forEach((part) => {
                                // Set font size (larger for emphasis) - 일관된 bold 사용
                                ctx.font = part.emphasis
                                    ? `bold ${Math.round(fontSize * emphasisStyle.scale)}px ${fontFamily}`
                                    : `bold ${fontSize}px ${fontFamily}`;

                                const partWidth = ctx.measureText(part.text).width;

                                // 모든 그림자/상태 초기화
                                ctx.shadowColor = 'transparent';
                                ctx.shadowBlur = 0;
                                ctx.shadowOffsetX = 0;
                                ctx.shadowOffsetY = 0;
                                ctx.globalAlpha = 1.0;
                                ctx.textAlign = 'left';
                                ctx.lineJoin = 'round';

                                if (part.emphasis) {
                                    // 강조 텍스트 - 그림자/테두리 기반 효과

                                    // 1단계: 드롭쉐도우 배경 (깊이감)
                                    ctx.shadowColor = emphasisStyle.shadowColor || '#000000';
                                    ctx.shadowBlur = emphasisStyle.shadowBlur || 6;
                                    ctx.shadowOffsetX = emphasisStyle.shadowOffsetX || 3;
                                    ctx.shadowOffsetY = emphasisStyle.shadowOffsetY || 3;

                                    // 바깥쪽 두꺼운 테두리
                                    ctx.strokeStyle = emphasisStyle.strokeColor;
                                    ctx.lineWidth = emphasisStyle.strokeWidth;
                                    ctx.strokeText(part.text, currentX, textY);

                                    // 2단계: 그림자 없이 추가 테두리
                                    ctx.shadowColor = 'transparent';
                                    ctx.shadowBlur = 0;
                                    ctx.shadowOffsetX = 0;
                                    ctx.shadowOffsetY = 0;

                                    // 중간 테두리
                                    ctx.strokeStyle = emphasisStyle.strokeColor;
                                    ctx.lineWidth = emphasisStyle.strokeWidth - 2;
                                    ctx.strokeText(part.text, currentX, textY);

                                    // 3단계: 메인 컬러 채우기
                                    ctx.fillStyle = emphasisStyle.color;
                                    ctx.fillText(part.text, currentX, textY);

                                    // 하이라이트 (선택적)
                                    ctx.globalAlpha = 0.15;
                                    ctx.fillStyle = '#FFFFFF';
                                    ctx.fillText(part.text, currentX, textY - 1);
                                    ctx.globalAlpha = 1.0;
                                } else {
                                    // 일반 흰색 텍스트 (두꺼운 테두리)
                                    // 그림자 초기화 확인
                                    ctx.shadowColor = 'transparent';
                                    ctx.shadowBlur = 0;
                                    ctx.shadowOffsetX = 0;
                                    ctx.shadowOffsetY = 0;

                                    // 검은 테두리
                                    ctx.strokeStyle = '#000000';
                                    ctx.lineWidth = 8;
                                    ctx.strokeText(part.text, currentX, textY);

                                    // 흰색 채우기 + 그림자
                                    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                                    ctx.shadowBlur = 6;
                                    ctx.shadowOffsetX = 3;
                                    ctx.shadowOffsetY = 3;
                                    ctx.fillStyle = '#FFFFFF';
                                    ctx.fillText(part.text, currentX, textY);

                                    // 그림자 리셋
                                    ctx.shadowColor = 'transparent';
                                    ctx.shadowBlur = 0;
                                    ctx.shadowOffsetX = 0;
                                    ctx.shadowOffsetY = 0;
                                }

                                currentX += partWidth;
                            });
                        }

                        // Reset font for next line (bold 일관성 유지)
                        ctx.font = `bold ${fontSize}px ${fontFamily}`;
                    });

                    // Reset shadow and text align
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.textAlign = 'center';
                }

                // Continue animation or stop
                if (elapsed < durationMs) {
                    requestAnimationFrame(animate);
                } else {
                    // Animation complete - stop recording
                    setTimeout(() => mediaRecorder.stop(), 100);
                }
            };

            // Start animation with requestAnimationFrame for smooth rendering
            requestAnimationFrame(animate);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = `data:image/jpeg;base64,${imageBase64}`;
    });
}

// Helper: Load logo image from state
async function loadLogoImage() {
    return new Promise((resolve, reject) => {
        if (!state.logoFile) {
            reject(new Error('No logo file'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(state.logoFile);
    });
}

// Fallback: FAL API call via server proxy
async function generateVideoWithFal(prompt, aspectRatio, duration) {
    const submitResponse = await fetch(`${CONFIG.BACKEND_URL}/api/fal-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'submit',
            prompt: prompt,
            aspectRatio: aspectRatio,
            duration: Math.min(duration, 5)
        })
    });

    if (!submitResponse.ok) {
        const errorData = await submitResponse.json();
        throw new Error(`Submit failed: ${errorData.error || submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.requestId;

    if (!requestId) {
        throw new Error('No requestId returned');
    }

    console.log(`    - FAL Request ID: ${requestId}`);

    const maxWaitTime = 180000;
    const pollInterval = 5000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
        await new Promise(r => setTimeout(r, pollInterval));

        const statusResponse = await fetch(`${CONFIG.BACKEND_URL}/api/fal-proxy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'status',
                requestId: requestId
            })
        });

        if (statusResponse.ok) {
            const statusData = await statusResponse.json();

            if (statusData.status === 'COMPLETED' && statusData.videoUrl) {
                return statusData.videoUrl;
            }

            console.log(`    - 상태: ${statusData.status || 'processing'}`);
        }
    }

    throw new Error('Timeout waiting for video generation');
}

function displayVideoPreview(cutIndex) {
    const cut = state.script.cuts[cutIndex];
    if (!cut) return;

    window.currentVideoCutIndex = cutIndex;

    document.getElementById('video-loading').style.display = 'none';
    document.getElementById('preview-placeholder').style.display = 'none';
    document.getElementById('video-preview').style.display = 'block';

    const container = document.getElementById('video-container');
    container.className = 'video-container';
    if (state.videoRatio === '16:9') container.classList.add('horizontal');
    else if (state.videoRatio === '1:1') container.classList.add('square');

    const videoElement = document.getElementById('preview-video');

    // Remove any existing demo image
    const existingImg = container.querySelector('img:not(#logo-overlay-img)');
    if (existingImg) existingImg.remove();

    // Add cut navigation if not exists
    if (!document.getElementById('video-cut-nav')) {
        const navHtml = `
            <div id="video-cut-nav" class="video-cut-nav" style="display:flex; justify-content:center; align-items:center; gap:12px; padding:12px; background:var(--bg-glass); border-radius:8px; margin-bottom:12px;">
                <button id="prev-cut-btn" onclick="navigateVideoCut(-1)" style="padding:8px 16px; border:none; background:var(--bg-dark); color:var(--text-primary); border-radius:6px; cursor:pointer;">◀ 이전</button>
                <span id="video-cut-indicator" style="font-weight:600; min-width:80px; text-align:center;">컷 1/${state.script.cuts.length}</span>
                <button id="next-cut-btn" onclick="navigateVideoCut(1)" style="padding:8px 16px; border:none; background:var(--bg-dark); color:var(--text-primary); border-radius:6px; cursor:pointer;">다음 ▶</button>
            </div>
        `;
        container.parentElement.insertAdjacentHTML('afterbegin', navHtml);
    }
    document.getElementById('video-cut-indicator').textContent = `컷 ${cutIndex + 1}/${state.script.cuts.length}`;

    if (cut.videoUrl) {
        // Use GCS URL if available
        videoElement.src = cut.videoUrl;
        videoElement.style.display = 'block';
        videoElement.controls = true;
    } else if (cut.videoBase64) {
        // Use base64 content
        const videoBlob = base64ToBlob(cut.videoBase64, 'video/mp4');
        const videoUrl = URL.createObjectURL(videoBlob);
        videoElement.src = videoUrl;
        videoElement.style.display = 'block';
        videoElement.controls = true;
    } else {
        // Fallback to demo visualization with message
        createDemoVideoVisualization(cutIndex);
    }

    // Update overlays after preview is displayed
    updateLogoOverlay();
    updateDisclaimerOverlay();
}

function navigateVideoCut(direction) {
    const newIndex = window.currentVideoCutIndex + direction;
    if (newIndex >= 0 && newIndex < state.script.cuts.length) {
        displayVideoPreview(newIndex);
        // Re-initialize logo editor after cut change
        if (state.logoFile) {
            setTimeout(() => initializeLogoEditor(), 100);
        }
    }
}

function createDemoVideoVisualization(cutIndex = 0) {
    const videoElement = document.getElementById('preview-video');
    const container = document.getElementById('video-container');
    const cut = state.script?.cuts[cutIndex];

    // Hide video element
    videoElement.style.display = 'none';

    // Remove existing demo
    const existingDemo = container.querySelector('.demo-preview');
    if (existingDemo) existingDemo.remove();

    // Create demo preview container
    const demoDiv = document.createElement('div');
    demoDiv.className = 'demo-preview';
    demoDiv.style.cssText = `
        width: 100%; height: 100%; display: flex; flex-direction: column;
        justify-content: center; align-items: center; padding: 24px;
        background: linear-gradient(135deg, #2563EB 0%, #10B981 100%);
        color: white; text-align: center; box-sizing: border-box;
    `;

    const narration = cut?.narration || '나레이션 없음';
    const visualDesc = cut?.visualDescription?.substring(0, 150) || '영상 설명 없음';

    demoDiv.innerHTML = `
        <div style="font-size: 14px; opacity: 0.8; margin-bottom: 8px;">컷 ${cutIndex + 1} 미리보기</div>
        <div style="font-size: 20px; font-weight: 600; margin-bottom: 16px; line-height: 1.4;">${narration}</div>
        <div style="font-size: 12px; opacity: 0.7; max-width: 280px; line-height: 1.5;">${visualDesc}...</div>
        <div style="margin-top: 24px; padding: 12px 20px; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 13px;">
            ⚠️ OpenAI Sora API 연동 후 실제 영상이 생성됩니다
        </div>
    `;

    container.appendChild(demoDiv);
}

// Get subtitle guidelines based on style
function getSubtitleGuidelines(subtitleStyle, customStyle = '') {
    switch (subtitleStyle) {
        case 'keyword':
            return `6. SUBTITLE Guidelines (🚨 주요 구문 강조 스타일 - 완결된 문장형):
   - 🔴 FORMAT: "첫째줄\\n둘째줄\\n셋째줄\\n넷째줄" (\\n으로 3-4줄 구분!)
   - 🔴 EMPHASIS: 핵심 구문(4-8글자)을 **구문** 형식으로 감싸서 강조!
   - 🔴 Each line: 한글 15~25자 (풍부한 완결된 문장으로)
   - 🔴 전체 자막 분량: 60-80자 (나레이션 핵심을 완결된 문장으로 요약)
   - 🔴 반드시 완결된 문장 형태로 작성 (주어+서술어 포함)

   📌 구문 강조 규칙:
     - 문장 내 핵심 구문(의미 단위) 1-2개만 **구문** 로 감싸기
     - 4-8글자의 의미있는 구문 단위로 강조
     - 반드시 완결된 문장 형태로 작성 (~합니다, ~입니다, ~하세요)
     - 3-4줄로 풍부하게 작성

   ✅ CORRECT EXAMPLES:
     * "**부동산 상속**을 준비할 때\\n세금을 크게 절약할 수 있는\\n방법이 있습니다\\n전문가와 상담해 보세요"
     * "**미래를 준비**하는 가장\\n현명한 방법은 지금 바로\\n시작하는 것입니다\\n함께 알아보겠습니다"
     * "요즘 **부동산 시장**이\\n많이 변하고 있습니다\\n여러분은 어떻게\\n대비하고 계신가요"

   ❌ WRONG: "**부동산**" (단어만 강조 - 너무 짧음)
   ❌ WRONG: "상속 증여 세금" (문장이 아님 - 금지!)
   ✅ RIGHT: "**상속과 증여**를 미리\\n준비하시면 세금을\\n크게 절약할 수 있습니다"`;

        case 'full':
            return `6. SUBTITLE Guidelines (🚨 전체 자막 스타일 - 나레이션 전체 표시):
   - 🔴 FORMAT: "첫째줄\\n둘째줄\\n셋째줄" (\\n으로 줄 구분)
   - 🔴 FULL NARRATION: 나레이션 내용을 그대로 자막으로 표시
   - 🔴 Each line: 한글 12~18자 (읽기 편한 길이로 줄바꿈)
   - 🔴 NO EMPHASIS MARKERS: **강조** 또는 [강조] 형식 사용 금지!
   - 🔴 흰색 폰트로 표시되므로 마커 없이 순수 텍스트만

   📌 전체 자막 규칙:
     - 나레이션 텍스트를 읽기 좋게 줄바꿈하여 표시
     - 한 줄에 12~18자 유지 (3-4줄 가능)
     - 강조 표시 절대 사용 금지
     - 모든 내용을 빠짐없이 표시

   ✅ CORRECT EXAMPLES:
     * "상속과 증여 시\\n부동산의 가치는\\n시가로 평가됩니다"
     * "요즘 부동산 시장이\\n많이 변하고 있습니다\\n어떻게 대비하시겠습니까"

   ❌ WRONG: "**상속**과 증여 시..." (강조 마커 사용 - 금지!)
   ❌ WRONG: "[상속과 증여]는..." (강조 마커 사용 - 금지!)
   ✅ RIGHT: "상속과 증여 시\\n부동산의 가치는..." (순수 텍스트만)`;

        case 'custom':
            if (customStyle && customStyle.trim()) {
                // Translate Korean custom style description to English for the prompt
                return `6. SUBTITLE Guidelines (🚨 사용자 정의 스타일):
   - 🔴 FORMAT: "첫째줄\\n둘째줄" (\\n으로 줄 구분)
   - 🔴 USER CUSTOM STYLE REQUEST: "${customStyle}"
   - 🔴 Apply the user's custom subtitle style as specified above
   - 🔴 Translate the style request to visual subtitle format
   - 🔴 Each line: 한글 8~18자 권장
   - 🔴 자연스러운 문장 사용

   📌 사용자 지정 규칙:
     - 위 사용자 요청 스타일을 자막에 반영
     - 기본 포맷(\\n 줄바꿈)은 유지
     - 사용자가 강조를 원하면 **키워드** 형식 사용`;
            }
            // Fallback to keyword style if no custom style provided
            return getSubtitleGuidelines('keyword');

        default:
            return getSubtitleGuidelines('keyword');
    }
}

// Utility functions
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

// Get audio duration from base64 audio content
async function getAudioDuration(base64Audio, mimeType = 'audio/wav') {
    return new Promise((resolve, reject) => {
        const audioBlob = base64ToBlob(base64Audio, mimeType);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio();

        audio.onloadedmetadata = () => {
            const duration = audio.duration;
            URL.revokeObjectURL(audioUrl);
            resolve(duration);
        };

        audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            reject(new Error('오디오 메타데이터 로드 실패'));
        };

        // Timeout fallback (5 seconds)
        setTimeout(() => {
            if (audio.duration && isFinite(audio.duration)) {
                URL.revokeObjectURL(audioUrl);
                resolve(audio.duration);
            } else {
                URL.revokeObjectURL(audioUrl);
                reject(new Error('오디오 길이 측정 타임아웃'));
            }
        }, 5000);

        audio.src = audioUrl;
    });
}

// Helper: Wrap text at specified character limit (default 50)
function wrapDisclaimerText(text, maxChars = 50) {
    if (!text || text.length <= maxChars) return [text];

    const lines = [];
    let currentLine = '';
    const words = text.split(' ');

    for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxChars) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);

    return lines;
}

// Helper: Draw multi-line disclaimer on canvas
function drawDisclaimerOnCanvas(ctx, text, centerX, baseY, fontSize, canvasWidth) {
    const lines = wrapDisclaimerText(text, 50);
    const lineHeight = fontSize * 1.3;

    ctx.font = `${fontSize}px "Noto Sans KR", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Center the lines vertically around baseY
    const totalHeight = lines.length * lineHeight;
    const startY = baseY - (totalHeight / 2) + (lineHeight / 2);

    lines.forEach((line, i) => {
        ctx.fillText(line, centerX, startY + (i * lineHeight));
    });
}

// Helper: Get video duration from URL
async function getVideoDuration(videoUrl) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            const duration = video.duration;
            if (duration && isFinite(duration)) {
                resolve(duration);
            } else {
                resolve(5); // Default fallback
            }
        };

        video.onerror = () => {
            console.warn('비디오 메타데이터 로드 실패, 기본값 사용');
            resolve(5); // Default fallback instead of reject
        };

        // Timeout fallback (3 seconds)
        setTimeout(() => {
            if (video.duration && isFinite(video.duration)) {
                resolve(video.duration);
            } else {
                resolve(5); // Default fallback
            }
        }, 3000);

        video.src = videoUrl;
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Clean subtitle - ** 마커 제거, [키워드] 강조는 유지
function cleanEmphasisMarkers(subtitle) {
    if (!subtitle) return subtitle;

    let result = subtitle;

    // Remove ALL ** markers (convert **text** to [text] for emphasis)
    result = result.replace(/\*\*([^*]+)\*\*/g, '[$1]');

    // Remove orphan ** markers
    result = result.replace(/\*\*/g, '');
    result = result.replace(/\*/g, '');

    // Remove other invalid markdown markers (but keep [keyword])
    result = result.replace(/\[\[/g, '[');
    result = result.replace(/\]\]/g, ']');
    result = result.replace(/##/g, '');
    result = result.replace(/__/g, '');
    result = result.replace(/~~/g, '');

    // Clean up multiple spaces
    result = result.replace(/  +/g, ' ');

    // Trim each line
    const lines = result.split('\n').map(line => line.trim());
    result = lines.join('\n');

    return result.trim();
}

// Ensure subtitle is always 2 lines - 단어 중간 분리 절대 금지! (완전 재작성)
function ensureTwoLineSubtitle(subtitle) {
    if (!subtitle) return '내용 없음\n자막 없음';

    // First clean up any malformed emphasis markers
    subtitle = cleanEmphasisMarkers(subtitle);

    // Normalize newlines
    subtitle = subtitle.replace(/\\n/g, '\n');

    // Already has newline - validate and return
    if (subtitle.includes('\n')) {
        const parts = subtitle.split('\n').filter(p => p.trim());
        if (parts.length >= 2) {
            return parts.slice(0, 2).join('\n');
        }
        // Only 1 real line, need to split
        subtitle = parts[0] || subtitle.replace(/\n/g, ' ');
    }

    const text = subtitle.trim();

    // If too short, add second line
    if (text.length < 4) {
        return `${text}\n확인하세요`;
    }

    // === 단어 기반 분리 로직 (절대 단어 중간에서 자르지 않음) ===

    // Split by spaces first to get "words" (includes punctuation attached)
    // For Korean, also consider comma, period as natural break points
    const segments = text.split(/(\s+|(?<=[,.])\s*)/g).filter(s => s && s.trim());

    if (segments.length === 1) {
        // No spaces - try to split by punctuation
        const punctMatch = text.match(/^(.+?[,\.!?])(.+)$/);
        if (punctMatch) {
            return `${punctMatch[1].trim()}\n${punctMatch[2].trim()}`;
        }
        // Try Korean particles as split points
        const particles = ['은', '는', '이', '가', '을', '를', '에서', '에', '의', '로', '와', '과', '도', '만'];
        for (const particle of particles) {
            const idx = text.indexOf(particle);
            if (idx > 2 && idx < text.length - 2) {
                const splitPoint = idx + particle.length;
                return `${text.slice(0, splitPoint).trim()}\n${text.slice(splitPoint).trim()}`;
            }
        }
        // Last resort: split at rough middle but never mid-character
        const mid = Math.floor(text.length / 2);
        return `${text.slice(0, mid)}\n${text.slice(mid)}`;
    }

    // Multiple segments - find best split point (closest to middle by character count)
    const totalLen = text.length;
    const targetMid = totalLen / 2;

    let bestSplitIdx = 1;
    let bestDiff = Infinity;
    let runningLen = 0;

    for (let i = 0; i < segments.length - 1; i++) {
        runningLen += segments[i].length;
        const diff = Math.abs(runningLen - targetMid);

        // Prefer splits after certain patterns (comma, particles)
        let bonus = 0;
        const seg = segments[i].trim();
        if (seg.endsWith(',') || seg.endsWith('.')) bonus = 5;
        if (['은', '는', '이', '가', '을', '를'].some(p => seg.endsWith(p))) bonus = 3;

        if (diff - bonus < bestDiff) {
            bestDiff = diff - bonus;
            bestSplitIdx = i + 1;
        }
    }

    const line1 = segments.slice(0, bestSplitIdx).join('').trim();
    const line2 = segments.slice(bestSplitIdx).join('').trim();

    // Ensure both lines have content
    if (!line1 || !line2) {
        // Fallback: just split segments in half
        const halfIdx = Math.ceil(segments.length / 2);
        return `${segments.slice(0, halfIdx).join('').trim()}\n${segments.slice(halfIdx).join('').trim()}`;
    }

    return `${line1}\n${line2}`;
}

// ============================================
// FFmpeg.wasm - Browser-side Video Merging
// (No server-side FFmpeg required!)
// ============================================

// Merge videos in browser using Canvas + MediaRecorder + Web Audio API
// Includes logo overlay on merged video (logo position from state)
async function mergeVideosInBrowser(cuts, includeTTS = true, bgmPreset = 'none', bgmVolume = 20, withSubtitles = true) {
    const validCuts = cuts.filter(c => c.videoUrl);
    if (validCuts.length === 0) {
        throw new Error('합칠 영상이 없습니다');
    }

    // Ensure loading UI elements exist
    const loadingEl = document.getElementById('video-loading');
    const loadingStatusEl = document.getElementById('video-loading-status');
    const progressEl = document.getElementById('video-progress');
    const progressTextEl = document.getElementById('video-progress-text');

    if (loadingEl) loadingEl.style.display = 'block';
    if (loadingStatusEl) loadingStatusEl.textContent = '영상 합치기 준비 중...';
    if (progressEl) progressEl.style.width = '0%';
    if (progressTextEl) progressTextEl.textContent = '0%';

    // Helper function to update progress
    const updateProgress = (step, total, message) => {
        const percent = Math.round((step / total) * 100);
        if (progressEl) progressEl.style.width = `${percent}%`;
        if (progressTextEl) progressTextEl.textContent = `${percent}%`;
        if (loadingStatusEl) loadingStatusEl.textContent = message;
    };

    try {
        updateProgress(1, 10, '로고 및 리소스 준비 중...');

        // Step 0: Load logo image if available (will be overlaid during merge)
        let logoImg = null;
        if (state.logoFile) {
            try {
                logoImg = await loadLogoImage();
                console.log('✅ 로고 로딩 완료 (합치기용)');
            } catch (e) {
                console.warn('로고 로딩 실패:', e);
            }
        }

        updateProgress(2, 10, '영상 컷 로딩 시작...');

        // Step 1: Load all video elements and decode TTS audio buffers
        const videoElements = [];
        const ttsBuffers = []; // Pre-decoded TTS audio buffers

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();

        // Logo and margins are now rendered during merge for position flexibility

        for (let i = 0; i < cuts.length; i++) {
            const cut = cuts[i];
            if (!cut.videoUrl) continue;

            const subtitleLabel = withSubtitles ? '' : ' (자막 제외)';
            updateProgress(2 + (i / cuts.length) * 3, 10, `컷 ${i + 1}/${cuts.length} 로딩 중...${subtitleLabel}`);

            // Determine video source based on subtitle option
            let videoSrc = cut.videoUrl;

            if (!withSubtitles) {
                // For subtitle-free download, regenerate or use original source
                if (cut.originalUploadedUrl) {
                    // Uploaded media: Regenerate without subtitle overlay
                    console.log(`  📦 컷 ${i + 1}: 업로드 미디어 자막 제외 처리 중...`);
                    if (loadingStatusEl) loadingStatusEl.textContent = `컷 ${i + 1}/${cuts.length} 자막 제외 렌더링...`;
                    if (cut.originalUploadedType === 'video') {
                        // Use original uploaded video without subtitle
                        videoSrc = cut.originalUploadedUrl;
                        console.log(`  ✅ 컷 ${i + 1}: 원본 업로드 영상 사용 (자막 없음)`);
                    } else {
                        // Image: Regenerate video from uploaded image without subtitle
                        videoSrc = await createVideoFromUploadedImage(cut.originalUploadedUrl, cut.duration || 5, state.videoRatio, '', i);
                        console.log(`  ✅ 컷 ${i + 1}: 업로드 이미지 자막 제외 영상 생성 완료`);
                    }
                } else if (cut.originalImageBase64) {
                    // Image-based: Regenerate video from original image without subtitle
                    console.log(`  📦 컷 ${i + 1}: 자막 없이 영상 재생성 중...`);
                    if (loadingStatusEl) loadingStatusEl.textContent = `컷 ${i + 1}/${cuts.length} 자막 제외 렌더링...`;
                    const noSubtitleBlob = await createVideoFromImage(cut.originalImageBase64, cut.duration || 5, state.videoRatio, '', i);
                    videoSrc = URL.createObjectURL(noSubtitleBlob);
                    console.log(`  ✅ 컷 ${i + 1}: 자막 제외 영상 생성 완료`);
                } else if (cut.originalSoraVideoUrl) {
                    // Sora-based: Use original video URL without subtitle overlay
                    console.log(`  📦 컷 ${i + 1}: 원본 Sora 영상 사용 (자막 없음)`);
                    videoSrc = cut.originalSoraVideoUrl;
                }
            }

            // Load video with better reliability (use canplaythrough instead of loadeddata)
            const video = document.createElement('video');
            video.src = videoSrc;
            video.muted = true;
            video.playsInline = true;
            video.preload = 'auto';

            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    console.warn(`컷 ${i + 1} 로딩 타임아웃 - 강제 진행`);
                    resolve();
                }, 15000); // 15초 타임아웃

                video.oncanplaythrough = () => {
                    clearTimeout(timeoutId);
                    resolve();
                };
                video.onloadeddata = () => {
                    // Fallback: also resolve on loadeddata
                    clearTimeout(timeoutId);
                    resolve();
                };
                video.onerror = (e) => {
                    clearTimeout(timeoutId);
                    console.error(`컷 ${i + 1} 로딩 실패:`, e);
                    // Continue instead of rejecting to allow partial merge
                    resolve();
                };
                video.load(); // Force load
            });

            console.log(`✅ 컷 ${i + 1} 로딩 완료 (${video.duration?.toFixed(1)}s)`);
            videoElements.push({ video, cut, index: i });

            // Pre-decode TTS audio if available
            if (includeTTS && cut.audioContent) {
                try {
                    const mimeType = cut.audioMimeType || 'audio/wav';
                    const ttsResponse = await fetch(`data:${mimeType};base64,${cut.audioContent}`);
                    const ttsArrayBuffer = await ttsResponse.arrayBuffer();
                    const ttsBuffer = await audioContext.decodeAudioData(ttsArrayBuffer);
                    ttsBuffers.push({ buffer: ttsBuffer, cutIndex: i });
                    console.log(`✅ TTS ${i + 1} 디코딩 완료 (${mimeType})`);
                } catch (e) {
                    console.warn(`TTS 디코딩 실패 (컷 ${i + 1}):`, e);
                }
            }
        }

        // Step 2: Determine canvas size from first video
        const firstVideo = videoElements[0].video;
        const canvasWidth = firstVideo.videoWidth || 1080;
        const canvasHeight = firstVideo.videoHeight || 1920;

        // Step 3: Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        // High-quality rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Step 4: Load BGM if selected
        let bgmSource = null;
        let bgmGain = null;
        if (bgmPreset && bgmPreset !== 'none' && BGM_FILES[bgmPreset]) {
            try {
                if (loadingStatusEl) loadingStatusEl.textContent = 'BGM 로딩 중...';
                const bgmResponse = await fetch(BGM_FILES[bgmPreset]);
                if (bgmResponse.ok) {
                    const bgmArrayBuffer = await bgmResponse.arrayBuffer();
                    const bgmBuffer = await audioContext.decodeAudioData(bgmArrayBuffer);
                    bgmSource = audioContext.createBufferSource();
                    bgmSource.buffer = bgmBuffer;
                    bgmSource.loop = true;
                    bgmGain = audioContext.createGain();
                    bgmGain.gain.value = bgmVolume / 100;
                    bgmSource.connect(bgmGain);
                    bgmGain.connect(destination);
                }
            } catch (bgmError) {
                console.warn('BGM 로딩 실패:', bgmError);
            }
        }

        // Step 5: Set up MediaRecorder with MP4 preference
        const canvasStream = canvas.captureStream(30);
        const audioStream = destination.stream;

        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // Try codecs in order: MP4 first (most universal), then WebM fallbacks
        const mimeTypes = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',  // H.264 Baseline + AAC-LC (most compatible MP4)
            'video/mp4;codecs=h264,aac',               // H.264 + AAC
            'video/mp4',                               // Generic MP4
            'video/webm;codecs=vp8,vorbis',           // VP8 + Vorbis (WebM fallback)
            'video/webm;codecs=vp9,vorbis',           // VP9 + Vorbis
            'video/webm;codecs=vp8',                   // VP8 only
            'video/webm'                               // Default WebM
        ];

        let selectedMimeType = 'video/webm';
        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                selectedMimeType = mimeType;
                console.log(`✅ 사용 코덱: ${mimeType}`);
                break;
            }
        }

        // Log all supported codecs for debugging
        console.log('📹 지원 코덱 확인:', mimeTypes.filter(m => MediaRecorder.isTypeSupported(m)));

        const mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: selectedMimeType,
            videoBitsPerSecond: 8000000,  // Higher bitrate for better quality
            audioBitsPerSecond: 128000
        });

        // Store mime type for download
        window.mergedVideoMimeType = selectedMimeType;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        // Step 6: Record each cut sequentially using time-based approach (MORE RELIABLE)
        if (loadingStatusEl) loadingStatusEl.textContent = '영상 녹화 중...';

        return new Promise(async (resolve, reject) => {
            mediaRecorder.onstop = () => {
                // Use the selected mime type for the blob
                const blobType = selectedMimeType.split(';')[0]; // e.g., 'video/webm'
                const blob = new Blob(chunks, { type: blobType });
                console.log(`📦 최종 영상 Blob: ${blobType}, 크기: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                updateProgress(10, 10, '영상 합치기 완료!');
                audioContext.close();
                resolve(blob);
            };

            mediaRecorder.onerror = reject;
            mediaRecorder.start(100); // Collect data every 100ms for reliability

            // Start BGM
            if (bgmSource) {
                bgmSource.start(0);
            }

            // Process each cut sequentially
            const totalCutsToMerge = videoElements.length;
            const progressEl = document.getElementById('video-progress');
            for (let cutIdx = 0; cutIdx < totalCutsToMerge; cutIdx++) {
                const { video } = videoElements[cutIdx];
                if (loadingStatusEl) loadingStatusEl.textContent = `컷 ${cutIdx + 1}/${totalCutsToMerge} 녹화 중...`;
                if (progressEl) progressEl.style.width = `${((cutIdx) / totalCutsToMerge) * 100}%`;

                // Find matching TTS buffer for this cut
                const originalIndex = videoElements[cutIdx].index;
                const ttsItem = ttsBuffers.find(t => t.cutIndex === originalIndex);

                // Reset video and wait for it to be ready
                video.currentTime = 0;
                video.muted = true; // Ensure muted for autoplay

                // Wait for video to seek to start
                await new Promise((resolve) => {
                    const onSeeked = () => {
                        video.removeEventListener('seeked', onSeeked);
                        resolve();
                    };
                    video.addEventListener('seeked', onSeeked);
                    // Timeout fallback
                    setTimeout(resolve, 500);
                });

                // Start TTS for this cut
                let currentTtsSource = null;
                if (ttsItem) {
                    currentTtsSource = audioContext.createBufferSource();
                    currentTtsSource.buffer = ttsItem.buffer;
                    const ttsGain = audioContext.createGain();
                    ttsGain.gain.value = 1.0;
                    currentTtsSource.connect(ttsGain);
                    ttsGain.connect(destination);
                }

                // Play video and record using time-based approach
                await new Promise(async (resolvecut) => {
                    const cutDuration = video.duration || 5;
                    const startTime = performance.now();
                    let frameCount = 0;

                    console.log(`🎬 컷 ${cutIdx + 1} 녹화 시작 (${cutDuration.toFixed(1)}s)`);
                    updateProgress(5 + (cutIdx / cuts.length) * 4, 10, `컷 ${cutIdx + 1}/${cuts.length} 녹화 중...`);

                    // Start TTS when video starts
                    if (currentTtsSource) {
                        currentTtsSource.start(0);
                    }

                    // Start video with retry
                    let playAttempts = 0;
                    const maxPlayAttempts = 3;

                    while (playAttempts < maxPlayAttempts) {
                        try {
                            await video.play();
                            console.log(`✅ 컷 ${cutIdx + 1} 재생 시작`);
                            break;
                        } catch (e) {
                            playAttempts++;
                            console.warn(`Video play attempt ${playAttempts} failed:`, e.message);
                            if (playAttempts >= maxPlayAttempts) {
                                console.error('Video play failed after retries');
                                // Draw static frame instead
                                for (let i = 0; i < cutDuration * 30; i++) {
                                    ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
                                    await new Promise(r => setTimeout(r, 33));
                                }
                                resolvecut();
                                return;
                            }
                            await new Promise(r => setTimeout(r, 200));
                        }
                    }

                    // Calculate logo dimensions (7% top margin)
                    const topMarginHeight = canvasHeight * 0.07;

                    // Draw frames using setInterval for reliability
                    const frameInterval = setInterval(() => {
                        const elapsed = (performance.now() - startTime) / 1000;

                        if (elapsed >= cutDuration || video.ended) {
                            clearInterval(frameInterval);
                            video.pause();
                            console.log(`✅ 컷 ${cutIdx + 1} 녹화 완료 (${frameCount} 프레임)`);

                            // Stop TTS
                            if (currentTtsSource) {
                                try { currentTtsSource.stop(); } catch (e) {}
                            }

                            // Small delay before next cut
                            setTimeout(resolvecut, 50);
                            return;
                        }

                        // Draw current frame (video already has margins and subtitles baked in)
                        if (!video.paused && !video.ended) {
                            ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
                            frameCount++;

                            // Overlay logo on top of video frame (using current state position)
                            if (logoImg) {
                                const logoSizePercent = state.logoCustomSize || state.logoSize;
                                // Allow larger logos: max 90% of top margin height, direct percentage for width
                                const logoMaxHeight = topMarginHeight * 0.9;
                                const logoMaxWidth = canvasWidth * (logoSizePercent / 100);
                                const logoScale = Math.min(logoMaxWidth / logoImg.width, logoMaxHeight / logoImg.height);
                                const logoW = logoImg.width * logoScale;
                                const logoH = logoImg.height * logoScale;

                                let logoX, logoY;

                                // Use custom position if set by user in editor, otherwise use preset
                                if (state.logoCustomX !== null && state.logoCustomY !== null) {
                                    // X: percentage of canvas width (direct mapping)
                                    logoX = (state.logoCustomX / 100) * canvasWidth;

                                    // Y: Map from preview percentage to actual canvas position
                                    // Preview container shows full height, but logo should stay in top margin
                                    // Scale Y to be within top margin area (0-15% of canvas height)
                                    const yInTopMargin = (state.logoCustomY / 15) * topMarginHeight;
                                    // Clamp to ensure logo stays within top margin
                                    logoY = Math.max(0, Math.min(yInTopMargin, topMarginHeight - logoH));

                                    // Debug log for position verification
                                    if (frameCount === 1) {
                                        console.log(`📍 로고 위치: X=${logoX.toFixed(0)}px (${state.logoCustomX.toFixed(1)}%), Y=${logoY.toFixed(0)}px (원본 ${state.logoCustomY.toFixed(1)}% → 마진 내 ${(logoY/topMarginHeight*100).toFixed(1)}%)`);
                                    }
                                } else {
                                    // Default: center in top margin
                                    logoY = (topMarginHeight - logoH) / 2;

                                    if (state.logoPosition.includes('left')) {
                                        logoX = canvasWidth * 0.05;
                                    } else if (state.logoPosition.includes('right')) {
                                        logoX = canvasWidth - logoW - canvasWidth * 0.05;
                                    } else {
                                        logoX = (canvasWidth - logoW) / 2;
                                    }
                                }

                                ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

                                // Log once per cut
                                if (frameCount === 1) {
                                    console.log(`🏷️ 로고 삽입: ${logoW.toFixed(0)}x${logoH.toFixed(0)}px at (${logoX.toFixed(0)}, ${logoY.toFixed(0)})`);
                                }
                            }

                            // Draw disclaimer text at bottom margin (if enabled)
                            // This is drawn during merge for consistency across all cuts
                            if (state.disclaimerEnabled && state.disclaimerText) {
                                const disclaimerFontSize = Math.round(canvasWidth * 0.028);
                                const bottomMarginY = canvasHeight - (topMarginHeight / 2);
                                drawDisclaimerOnCanvas(ctx, state.disclaimerText, canvasWidth / 2, bottomMarginY, disclaimerFontSize, canvasWidth);

                                // Log once per cut
                                if (frameCount === 1) {
                                    console.log(`📝 주의문구 삽입: "${state.disclaimerText.substring(0, 30)}..." at Y=${bottomMarginY.toFixed(0)}px`);
                                }
                            }
                        }
                    }, 1000 / 30); // 30 FPS
                });
            }

            // All cuts done - stop recording
            if (loadingStatusEl) loadingStatusEl.textContent = '영상 인코딩 중...';
            if (progressEl) progressEl.style.width = '100%';

            setTimeout(() => {
                console.log('🎬 모든 컷 녹화 완료, 인코딩 중...');
                updateProgress(9, 10, '영상 인코딩 중...');
                mediaRecorder.stop();
                if (bgmSource) {
                    try { bgmSource.stop(); } catch (e) {}
                }
            }, 200);
        });

    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

// Helper: Convert base64 to Uint8Array
function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Browser-side download merged video (no server FFmpeg needed)
async function downloadMergedVideoBrowser(withSubtitles = true) {
    console.log('📥 downloadMergedVideoBrowser 호출됨, withSubtitles:', withSubtitles);

    if (!state.script || !state.script.cuts.some(cut => cut.videoUrl)) {
        showToast('먼저 영상을 생성해주세요', 'error');
        return;
    }

    const hasAudio = state.script.cuts.some(cut => cut.audioContent);

    const subtitleText = withSubtitles ? '자막 포함' : '자막 제외';

    // Show loading UI
    const loadingEl = document.getElementById('video-loading');
    const loadingStatusEl = document.getElementById('video-loading-status');
    const progressEl = document.getElementById('video-progress');

    if (loadingEl) loadingEl.style.display = 'block';
    if (loadingStatusEl) loadingStatusEl.textContent = `${subtitleText} 영상 준비 중...`;
    if (progressEl) progressEl.style.width = '0%';

    showToast(`🎬 ${subtitleText} 영상 합치는 중...`, 'info');

    const btnWithSub = document.getElementById('download-btn-with-subtitle');
    const btnNoSub = document.getElementById('download-btn-no-subtitle');
    if (btnWithSub) btnWithSub.disabled = true;
    if (btnNoSub) btnNoSub.disabled = true;

    // Debug: Check if original data exists for subtitle-free download
    if (!withSubtitles) {
        console.log('🔍 자막 제외 다운로드 - 원본 데이터 확인:');
        state.script.cuts.forEach((cut, i) => {
            console.log(`  컷 ${i + 1}: originalImageBase64=${!!cut.originalImageBase64}, originalSoraVideoUrl=${!!cut.originalSoraVideoUrl}, originalUploadedUrl=${!!cut.originalUploadedUrl}`);
        });
    }

    try {
        const blob = await mergeVideosInBrowser(
            state.script.cuts,
            hasAudio,
            state.bgmPreset,
            state.bgmVolume,
            withSubtitles
        );

        // Validate blob
        console.log(`📦 합쳐진 영상 크기: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

        if (blob.size < 10000) {
            throw new Error('영상 파일이 너무 작습니다. 녹화에 실패했을 수 있습니다.');
        }

        // Determine file extension based on mime type
        const mimeType = window.mergedVideoMimeType || 'video/webm';
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        console.log(`📁 파일 형식: ${mimeType} -> .${extension}`);

        // Download the merged video
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const subtitleSuffix = withSubtitles ? '' : '_no_subtitle';
        a.download = `shinhan_shorts${subtitleSuffix}_${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        const subtitleLabel = withSubtitles ? '자막 포함' : '자막 제외';
        showToast(`✅ ${subtitleLabel} 영상 다운로드 완료! (.${extension}, ${(blob.size / 1024 / 1024).toFixed(1)} MB)`, 'success');

    } catch (error) {
        console.error('Browser merge error:', error);
        showToast('⚠️ 브라우저 영상 합치기 실패: ' + error.message, 'error');
        // Fallback to single cut download
        downloadCurrentCut();
    }

    // Hide loading UI
    const downloadLoadingEl = document.getElementById('video-loading');
    if (downloadLoadingEl) downloadLoadingEl.style.display = 'none';

    const btnWithSubEnd = document.getElementById('download-btn-with-subtitle');
    const btnNoSubEnd = document.getElementById('download-btn-no-subtitle');
    if (btnWithSubEnd) btnWithSubEnd.disabled = false;
    if (btnNoSubEnd) btnNoSubEnd.disabled = false;

    console.log('📥 downloadMergedVideoBrowser 완료');
}
// Fix deployment 1770352623
