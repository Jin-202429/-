# AI Notification Priority Classifier (Harness AI)

## 1. 어떤 병목을 다루는가
- **병목 Task**: 수십 개의 이메일, 슬랙, 메시지 알림 중 중요한 것을 분류하고 요약하여 우선순위를 결정한다.
- **빈도**: 매일 아침 및 수시 (일 10회 이상) / 1회당 약 20~30분 소요
- **왜 병목인가**: 
  - 단순 광고나 공지 사이에 섞인 "마감 임박 과제"나 "상사의 긴급 요청"을 찾기 위해 모든 알림을 전수 조사해야 함.
  - 확인 과정에서 주의력이 분산되어 본업에 집중하기까지 다시 시간이 걸리는 '컨텍스트 스위칭' 비용이 발생함.
  - 중요한 알림을 놓칠 경우의 심리적 압박과 실제 업무/학습 손실이 큼.

## 2. 왜 AI Agent로 만들었는가
- **룰베이스/매크로/기존 도구로 안 되는 이유**: 
  - "확인 부탁드립니다"라는 같은 문장이라도 발신자(팀장 vs 뉴스레터)와 맥락(내일 회의 vs 다음 주 이벤트)에 따라 중요도가 천차만별임.
  - 키워드 매칭만으로는 완곡한 표현 속의 긴급성을 간파하기 어려움.
- **AI 판단이 필요한 지점**: 
  - 발신자와 수신자의 관계(Context)를 고려한 중요도 판별.
  - 텍스트 내 포함된 마감일과 현재 시각을 비교하여 긴급도 도출.
  - 산재된 정보를 한 줄 요약하고 사용자에게 필요한 Actionable Item 추천.

## 3. Agent 구조
- **입력 → 처리 → 출력**: 
  - `메시지 원문 리스트 + 사용자 컨텍스트 → Gemini 1.5 Flash (맥락 추론 및 분류) → 우선순위별 정렬 및 액션 추천 UI`
- **사용 도구**: Gemini 1.5 Flash API, React, Tailwind CSS, Lucide Icons
- **핵심 제약 (Steering 요약)**:
  - 비용 상한: Gemini 1.5 Flash 사용으로 낮은 토큰 비용 유지.
  - 도구 화이트리스트: @google/generative-ai SDK.
  - 사람 개입이 필요한 조건: AI 분류 근거가 "판단 불확실"로 나올 경우 사용자 직접 확인 유도.

## 4. 실행 방법
```bash
npm run dev
```
- **필요한 환경변수**: `GEMINI_API_KEY` (.env.example 참조)
- **선행 조건**: Google AI Studio에서 API 키 발급 필요.

## 5. 테스트 입력 형식
- **위치**: `test-input/` 폴더
- **형식**: `.json`
- **구조**: `[{ "id": number, "sender": string, "channel": string, "body": string }]`

## 6. 실행 결과 (5회)
- **핵심 출력 필드**: `priority` (긴급/오늘처리/참고용), `summary` (요약), `reason` (판단 근거), `action` (추천 행동)
- **검증 결과**: 
  - Case 1 (상사 요청): 5회 모두 '긴급' 판정 (Match 100%)
  - Case 2 (교수 공지): 5회 모두 '긴급' 또는 '오늘처리' (마감 시간에 따라 일관적 분류)
  - Case 3 (광고): 5회 모두 '참고용' 판정 (Match 100%)

---

## 자산 위치 안내 (채점자용)

| 항목 | 위치 |
|---|---|
| 사용자 시나리오·수용 기준 | `.kiro/specs/notification-priority-classifier/requirements.md` |
| 구현 설계 | `.kiro/specs/notification-priority-classifier/design.md` |
| 실행 단계 분해 | `.kiro/specs/notification-priority-classifier/tasks.md` |
| 전역 규칙·도메인 컨텍스트 | `.kiro/specs/notification-priority-classifier/steering.md` |
| 자가 검증 항목 | `CHECKLIST.md` |
| 테스트 입력 | `test-input/case-*.json` |
