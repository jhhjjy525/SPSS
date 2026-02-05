# 신한 Premier Shorts Studio

AI 기반 숏츠 영상 자동 생성 플랫폼 - Google Cloud TTS & Vertex AI Veo 통합

## 주요 기능

- 📝 **AI 스크립트 생성**: Gemini API를 활용한 자동 스크립트 작성
- 🎤 **고품질 TTS**: Google Cloud Text-to-Speech로 8가지 한국어 음성 프리셋
- 🎬 **AI 영상 생성**: Vertex AI Veo를 활용한 프로페셔널 영상 생성
- 🎨 **다양한 스타일**: Premium, Modern, Minimal, Animation 템플릿
- 🏷️ **로고 오버레이**: 커스텀 로고 추가 및 위치/크기 조정

---

## 시스템 요구사항

- Node.js 16.x 이상
- Google Cloud 계정 및 프로젝트
- Gemini API 키

---

## 설치 및 설정

### 1. 저장소 클론 및 의존성 설치

```bash
# 의존성 설치
npm install
```

### 2. Google Cloud 프로젝트 설정

#### 2.1 Google Cloud 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

#### 2.2 필수 API 활성화
다음 API를 활성화해주세요:
- **Cloud Text-to-Speech API**
- **Vertex AI API**

```bash
# gcloud CLI를 사용하는 경우
gcloud services enable texttospeech.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

#### 2.3 서비스 계정 생성 및 키 발급
1. Google Cloud Console → IAM 및 관리 → 서비스 계정
2. "서비스 계정 만들기" 클릭
3. 다음 역할 부여:
   - **Cloud Text-to-Speech 사용자**
   - **Vertex AI 사용자**
4. 키 탭 → "키 추가" → JSON 형식 선택
5. 다운로드한 JSON 파일을 프로젝트 루트에 `service-account-key.json`으로 저장

⚠️ **보안 주의**: `service-account-key.json` 파일은 절대 Git에 커밋하지 마세요!

### 3. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 값을 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
# Google Cloud 프로젝트 설정
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Vertex AI 설정
VERTEX_AI_REGION=us-central1

# 서버 설정
PORT=3000

# Gemini API (스크립트 생성용)
GEMINI_API_KEY=your-gemini-api-key
```

#### 환경 변수 설명:
- `GOOGLE_CLOUD_PROJECT_ID`: Google Cloud 프로젝트 ID
- `GOOGLE_APPLICATION_CREDENTIALS`: 서비스 계정 키 파일 경로
- `VERTEX_AI_REGION`: Vertex AI 리전 (기본: us-central1)
- `PORT`: 백엔드 서버 포트 (기본: 3000)
- `GEMINI_API_KEY`: Gemini API 키 ([여기서 발급](https://aistudio.google.com/app/apikey))

### 4. 프론트엔드 설정

[app.js:7](app.js#L7) 파일에서 Gemini API 키를 업데이트하세요:

```javascript
const CONFIG = {
    GEMINI_API_KEY: 'your-gemini-api-key',
    BACKEND_URL: 'http://localhost:3000',
    // ...
};
```

---

## 실행 방법

### 1. 백엔드 서버 시작

```bash
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 2. 프론트엔드 접속

브라우저에서 다음 URL을 엽니다:
```
http://localhost:3000/index.html
```

---

## API 엔드포인트

### TTS (Text-to-Speech)

#### POST `/api/tts`
단일 텍스트를 음성으로 변환

**요청:**
```json
{
  "text": "안녕하세요",
  "voicePreset": "male-1"
}
```

**응답:**
```json
{
  "success": true,
  "audioContent": "base64-encoded-mp3",
  "format": "mp3"
}
```

#### POST `/api/tts/batch`
여러 컷의 음성을 한 번에 생성

**요청:**
```json
{
  "cuts": [
    {
      "narration": "첫 번째 나레이션",
      "duration": 8
    }
  ],
  "voicePreset": "female-1"
}
```

### Video Generation (Veo)

#### POST `/api/generate-video`
단일 영상 생성

**요청:**
```json
{
  "visualDescription": "A professional office scene with modern design...",
  "aspectRatio": "9:16",
  "duration": 5
}
```

#### POST `/api/generate-video/batch`
여러 컷의 영상을 한 번에 생성

**요청:**
```json
{
  "cuts": [
    {
      "visualDescription": "Detailed English description...",
      "duration": 8
    }
  ],
  "aspectRatio": "9:16"
}
```

### Health Check

#### GET `/api/health`
서버 및 서비스 상태 확인

---

## 음성 프리셋

### 남성 음성
- `male-1`: 차분한 (Neural2-C, rate: 0.9, pitch: -2.0)
- `male-2`: 활기찬 (Neural2-C, rate: 1.15, pitch: 0.0)
- `male-3`: 중후한 (Wavenet-C, rate: 0.85, pitch: -4.0)
- `male-4`: 친근한 (Wavenet-A, rate: 1.0, pitch: -1.0)

### 여성 음성
- `female-1`: 전문적인 (Neural2-A, rate: 0.95, pitch: 2.0)
- `female-2`: 밝은 (Neural2-B, rate: 1.1, pitch: 4.0)
- `female-3`: 세련된 (Wavenet-A, rate: 0.9, pitch: 1.0)
- `female-4`: 따뜻한 (Wavenet-B, rate: 1.0, pitch: 2.0)

---

## 비용 안내

### Google Cloud Text-to-Speech
- **Neural2 음성**: $0.000016/문자 (~$16/100만 문자)
- **Wavenet 음성**: $0.000016/문자 (~$16/100만 문자)

### Vertex AI Veo
- **영상 생성**: 약 $0.13/초
- 예시: 30초 영상 = 약 $3.90

⚠️ 비용 관리를 위해 [Google Cloud Billing](https://console.cloud.google.com/billing)에서 예산 알림을 설정하는 것을 권장합니다.

---

## 문제 해결

### 1. "GOOGLE_APPLICATION_CREDENTIALS not found" 오류
- `.env` 파일에 올바른 경로가 설정되어 있는지 확인
- `service-account-key.json` 파일이 프로젝트 루트에 있는지 확인

### 2. "API not enabled" 오류
- Google Cloud Console에서 필수 API가 활성화되어 있는지 확인
- 서비스 계정에 적절한 권한이 부여되어 있는지 확인

### 3. "Rate limit exceeded" 오류
- API 할당량 초과 시 잠시 대기 후 재시도
- [할당량 페이지](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas)에서 증가 요청 가능

### 4. CORS 오류
- 백엔드 서버가 실행 중인지 확인
- [app.js:8](app.js#L8)의 `BACKEND_URL`이 올바른지 확인

---

## 프로젝트 구조

```
SPSS_v1/
├── index.html              # 메인 HTML 파일
├── app.js                  # 프론트엔드 로직
├── styles.css              # 스타일시트
├── server.js               # 백엔드 Express 서버
├── package.json            # Node.js 의존성
├── .env                    # 환경 변수 (gitignore)
├── .env.example            # 환경 변수 템플릿
├── service-account-key.json # Google Cloud 인증 (gitignore)
└── README.md               # 이 파일
```

---

## 기술 스택

### Frontend
- HTML5 / CSS3 / JavaScript (ES6+)
- PDF.js (PDF 텍스트 추출)

### Backend
- Node.js + Express
- Google Cloud Text-to-Speech API
- Google Vertex AI (Veo)

### AI Models
- Gemini 2.0 Flash (스크립트 생성)
- Google TTS Neural2/Wavenet (음성 합성)
- Vertex AI Veo-001 (영상 생성)

---

## 라이선스

MIT License

---

## 지원 및 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.
