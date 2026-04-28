# Design: AI Notification Priority Classifier

## 1. 기술 스택
- **Frontend**: React 19, Vite, Tailwind CSS (High Density Theme)
- **AI Engine**: Google Gemini 1.5 Flash (via @google/generative-ai)
- **State Management**: React Hooks (useState, useEffect)
- **Icons**: Lucide React

## 2. 데이터 구조 (Classification Schema)
```typescript
interface ClassifiedMessage {
  id: number;
  priority: "긴급" | "오늘처리" | "참고용";
  summary: string;
  reason: string;
  action: string;
}
```

## 3. 프롬프트 엔지니어링 전략
- **System Prompt**: 페르소나 설정 및 구체적인 우선순위 판별 기준(Steering Rules) 주입.
- **Few-shot Learning**: 모호한 상황(예: "시간 되실 때")에 대한 한국 비즈니스 맥락 해석 예시 제공.
- **Strict JSON Output**: 모델이 다른 텍스트 없이 순수 JSON 배열만 반환하도록 강제.

## 4. UI/UX 레이아웃
- **Left Panel**: 알림 원문 리스트 및 필터링 옵션.
- **Center Detail**: 선택된 알림에 대한 AI 분석 리포트 (Reasoning, Summary, Suggested Action).
- **Global Action**: 전체 분석 실행 및 사용자 컨텍스트 설정.
