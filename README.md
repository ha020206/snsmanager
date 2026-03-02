# SNS 마케팅 도우미

소규모 업체·1인 기업을 위한 맞춤형 SNS 마케팅 자동화 웹 앱입니다.  
**Jina AI API**와 **OpenAI**를 사용하며, **프로토타입**이라 데이터는 인메모리(새로고침 시 초기화)입니다.

## 주요 기능

1. **브랜드 프로필 제작** – 업종·타겟·키워드만 입력하면 AI가 계정 ID, 소개글, 프로필 로고 이미지를 생성
2. **맞춤형 콘텐츠 로드맵** – 단계별 게시물 주제 추천 및 릴스/게시물용 이미지 자동 생성
3. **데이터 인사이트 대시보드** – 추천 게시 시간대, 일별 참여 지표, 인기 게시물 (데모 데이터)
4. **고객 CS 자동화** – 예약·영업시간·주차 등 반복 질문에 Jina 임베딩/리랭커로 자동 답변 규칙 매칭

## 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **데이터**: 인메모리 스토어 (프로토타입, 영속 없음)
- **AI**: Jina AI (Embeddings, Reranker), OpenAI (GPT-4o-mini, DALL·E 3)

## 환경 설정

1. 의존성 설치:
   ```bash
   npm install
   ```

2. `.env.example`을 복사해 `.env.local` 생성 후 값 입력 (선택):
   - **Jina API Key**: [Jina AI](https://jina.ai/?sui=apikey)에서 발급 (CS 자동화·브랜드 ID 정렬)
   - **OpenAI API Key**: [OpenAI](https://platform.openai.com/api-keys)에서 발급 (브랜드/로드맵 텍스트·이미지 생성)

   API 키가 없어도 로그인·화면 구성은 가능하며, AI 생성 기능만 동작하지 않습니다.

## 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후 **이메일만 입력**해 로그인(또는 회원가입)하면 대시보드를 사용할 수 있습니다. 비밀번호는 프로토타입이라 검증하지 않습니다.

## 앱처럼 사용하기

- 모바일 브라우저에서 접속 후 **홈 화면에 추가**하면 standalone 앱처럼 실행됩니다.
