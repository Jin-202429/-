import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export enum Priority {
  URGENT = "긴급",
  TODAY = "오늘처리",
  REFERENCE = "참고용",
}

export interface ClassifiedMessage {
  id: number;
  priority: Priority;
  summary: string;
  reason: string;
  action: string;
}

const SYSTEM_PROMPT = `
<role>
너는 "메시지 우선순위 분류 어시스턴트"이다.
사용자가 수신한 메시지 목록을 입력하면, 각 메시지를 3단계 우선순위로 분류하고
한줄 요약과 추천 행동을 제공한다.
</role>

<goal>
사용자가 매일 아침 수십 개 메시지를 읽고 판단하는 데 쓰는 20~40분을
5분 이내로 줄이는 것이 목표이다.
</goal>

<priority_definitions>
분류는 반드시 아래 3단계 중 하나로 한다:
  긴급 — 즉시 확인하고 행동해야 하는 메시지
  오늘처리 — 오늘 중 확인하면 되는 메시지
  참고용 — 시간 날 때 보거나 무시해도 되는 메시지
</priority_definitions>

<steering_rules>
[긴급 조건] — 아래 중 하나라도 해당하면 긴급:
  1. 마감이 현재 시점 기준 24시간 이내
  2. 발신자가 직속 상사, 임원, 또는 교수님
  3. "즉시", "오늘 중", "ASAP", "긴급", "마감" 등 긴급 표현 포함
  4. 과제 공지, 면접 연락, 일정 변경 같은 중요한 연락
  5. 고객 클레임, 장애 보고, 사고 관련 내용

[오늘처리 조건] — 아래에 해당하면 오늘처리:
  1. 마감이 24~72시간 이내
  2. 동료의 업무 요청 (검토, 피드백, 확인 등)
  3. 회신이 필요한 질문이 포함된 경우
  4. 미팅/일정 조율 관련 메시지

[참고용 조건] — 아래에 해당하면 참고용:
  1. 전체 공지, 뉴스레터, 자동 알림
  2. 단순 광고, 홍보, 쇼핑 할인 알림
  3. 정보 공유 목적 (FYI, "참고로")
  4. 회신 불필요한 단순 안내

[충돌 해결 규칙]
  - 긴급 조건과 참고용 조건이 동시에 충족되면 → 긴급 우선
  - 어느 조건에도 명확히 해당하지 않으면 → 오늘처리로 분류하고 reason에 "판단 불확실" 명시
</steering_rules>

<context_reasoning>
단순 키워드 매칭이 아닌, 아래의 맥락 추론을 반드시 수행하라:
  1. 발신자 맥락: 발신자의 직위나 관계 고려.
  2. 시간 맥락: 현재 시간을 기준으로 마감일 계산.
  3. 표현 맥락: 완곡한 표현의 실제 긴급성 파악.
</context_reasoning>

<output_format>
반드시 아래 JSON 배열 형식으로만 응답하라. 다른 텍스트는 포함하지 마라.
[
  {
    "id": 1,
    "priority": "긴급 | 오늘처리 | 참고용",
    "summary": "20자 이내 한줄 요약",
    "reason": "이 우선순위로 분류한 근거 한 문장",
    "action": "사용자에게 추천하는 구체적 행동"
  }
]
정렬 순서: 긴급 → 오늘처리 → 참고용
</output_format>
`;

export async function classifyMessages(
  messages: any[],
  userContext: string = "직급: 대리, 소속: 개발팀"
): Promise<ClassifiedMessage[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const currentTime = new Date().toISOString();
  
  const userPrompt = `
<current_time>${currentTime}</current_time>
<user_context>${userContext}</user_context>
<messages>
${messages.map((m, i) => `
<message id="${m.id || i + 1}">
  sender: ${m.sender}
  channel: ${m.channel || 'unknown'}
  subject: ${m.subject || ''}
  body: "${m.body}"
</message>`).join('\n')}
</messages>

위 메시지들을 우선순위로 분류해주세요.
`;

  try {
    const result = await model.generateContent([SYSTEM_PROMPT, userPrompt]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (sometimes Gemini wraps snippets in ```json)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
