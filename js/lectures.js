/* ============================================
   빙글이 Binglee — AI 데일리 강의 📚
   의대생을 위한 하루 하나 Claude/AI 실무 강의
   (Claude Platform Docs 한국어 실무 가이드 기반)
   매일 강의 1개 + 직접 만들어 보는 실습 예제 1개
   ============================================ */

/* 하루에 하나씩 열리는 강의 커리큘럼.
   lecture: 개념 설명 / points: 핵심 요약 / code: 예시 코드
   practice: Claude Code에 그대로 붙여넣는 실습 프롬프트
   docs: 공식 문서 링크 */
const LECTURES = [
  {
    day: 1,
    emoji: '🔑',
    title: 'Claude API 첫 호출 — 나만의 AI 조수 깨우기',
    topic: 'API 키 설정과 Messages API 최소 호출',
    lecture: [
      'ChatGPT나 Claude 웹사이트에서 채팅하는 것과 달리, API를 쓰면 AI를 "내 프로그램의 부품"으로 쓸 수 있어. 예를 들어 족보 500문항을 자동으로 해설하게 하거나, 논문 요약을 매일 아침 받아보는 건 API로만 가능해.',
      '핵심은 단순해. (1) Anthropic Console에서 API 키를 발급받고 (2) 환경 변수 ANTHROPIC_API_KEY로 저장한 뒤 (3) model·max_tokens·messages 세 가지를 담아 요청을 보내면 끝. 응답의 content는 문자열 하나가 아니라 "블록 배열"이라서, type이 text인 블록만 골라 읽어야 해.',
      '주의: API 키는 절대 코드에 직접 쓰거나 GitHub에 올리면 안 돼. 유출되면 즉시 폐기하고 재발급해야 해.',
    ],
    points: [
      'model(모델 ID) · max_tokens(응답 길이 상한) · messages(대화 기록) 세 필드가 최소 요청',
      '응답 content는 블록 배열 — block.type === "text"인 것만 출력',
      'stop_reason이 max_tokens면 응답이 잘린 것 — 정상 종료가 아닐 수 있음',
      'API 키는 환경 변수로만 관리, 저장소 커밋 금지',
    ],
    code: `import anthropic

client = anthropic.Anthropic()  # ANTHROPIC_API_KEY 자동 인식

message = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1000,
    messages=[{"role": "user",
               "content": "심근경색의 5대 증상을 국시 스타일로 정리해 줘."}],
)

for block in message.content:
    if block.type == "text":
        print(block.text)`,
    practice: {
      goal: '의학용어 플래시카드 생성기 만들기',
      desc: '해부학 용어 목록을 넣으면 "용어 → 정의 → 암기 팁" 플래시카드를 자동으로 만들어 주는 파이썬 스크립트를 Claude Code에게 시켜 보자.',
      prompt:
        '파이썬으로 의학용어 플래시카드 생성기를 만들어 줘. terms.txt에서 해부학 용어를 한 줄씩 읽어서, Anthropic API(claude-opus-4-8)로 각 용어의 "정의(2문장) / 임상 연관성 / 암기 팁"을 생성하고 flashcards.md에 저장해. API 키는 환경 변수 ANTHROPIC_API_KEY를 사용하고, 응답의 text 블록만 파싱해.',
    },
    docs: 'https://platform.claude.com/docs/ko/get-started',
  },
  {
    day: 2,
    emoji: '💬',
    title: '멀티턴 대화 — 가상 환자 문진 시뮬레이터의 원리',
    topic: 'Messages API의 무상태성과 대화 기록 관리',
    lecture: [
      'Messages API는 "상태를 저장하지 않아". 서버가 이전 대화를 기억한다고 착각하기 쉬운데, 사실은 매 요청마다 이전 user·assistant 메시지를 전부 다시 보내야 해. 채팅앱이 대화를 이어가는 것처럼 보이는 건, 클라이언트가 기록을 계속 첨부하기 때문이야.',
      'system 필드에는 전체 대화에 적용될 최상위 지침을 넣어. "너는 55세 남성 흉통 환자를 연기하는 표준화 환자다" 같은 역할 지정이 여기 들어가면, 이후 어떤 질문에도 그 역할을 유지해.',
      '재미있는 점: 이전 assistant 턴이 꼭 실제 모델 출력일 필요는 없어. 테스트용으로 합성해 넣어도 돼. 다만 기록이 길어질수록 입력 토큰(=비용)이 늘어난다는 건 기억해.',
    ],
    points: [
      'API는 무상태(stateless) — 매 요청에 전체 대화 기록을 다시 전송',
      'system 필드 = 대화 전체에 적용되는 역할·규칙 지정',
      '대화가 길어질수록 입력 토큰 비용 증가 → 캐싱·요약 필요',
      '이전 assistant 메시지는 합성 가능 (시나리오 테스트에 유용)',
    ],
    code: `history = [
    {"role": "user", "content": "어디가 불편해서 오셨어요?"},
    {"role": "assistant", "content": "가슴이 쥐어짜듯 아파요..."},
    {"role": "user", "content": "언제부터 그러셨나요?"},
]
response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    system="너는 55세 남성 급성 심근경색 표준화 환자다. "
           "학생이 올바른 문진을 하면 그에 맞는 증상만 답하라. "
           "진단명은 절대 먼저 말하지 마라.",
    messages=history,
)`,
    practice: {
      goal: 'CPX 대비 가상 표준화 환자 챗봇 만들기',
      desc: '터미널에서 문진 연습을 할 수 있는 가상 환자를 만들어 보자. 문진이 끝나면 내 병력청취를 채점까지 해 준다.',
      prompt:
        '파이썬 CLI로 CPX 연습용 가상 표준화 환자 챗봇을 만들어 줘. system 프롬프트로 "55세 남성, 급성 심근경색 증례" 역할을 지정하고, 멀티턴 대화 기록을 리스트로 유지해. 사용자가 "문진 종료"를 입력하면 지금까지의 대화를 바탕으로 병력청취 완성도를 10점 만점으로 채점하고 놓친 질문을 알려주는 기능도 넣어 줘. Anthropic API claude-opus-4-8 사용.',
    },
    docs: 'https://platform.claude.com/docs/ko/build-with-claude/working-with-messages',
  },
  {
    day: 3,
    emoji: '🧾',
    title: '응답 해부학 — stop_reason과 usage 읽기',
    topic: '응답 필드의 의미와 예외 처리',
    lecture: [
      '응답 JSON을 해부해 보자. content(실제 출력 블록들), stop_reason(왜 생성이 멈췄는지), usage(토큰 사용량), id(추적용 식별자)가 핵심 장기야. 이 중 stop_reason은 활력징후 같은 존재라서 반드시 먼저 확인해야 해.',
      'stop_reason이 "end_turn"이면 정상 종료, "max_tokens"면 응답이 중간에 잘린 것, "tool_use"면 도구 호출을 기다리는 상태, "refusal"이면 안전상 거부야. HTTP 200이 왔다고 해서 정상 완료라고 가정하면 잘린 답변을 그대로 쓰는 사고가 나.',
      'usage의 입력·출력 토큰 수는 비용 계산의 기초야. 족보 해설 1000개를 돌리기 전에 1개를 돌려 usage를 확인하면 전체 비용을 예측할 수 있어.',
    ],
    points: [
      'stop_reason 먼저 확인: end_turn(정상) / max_tokens(잘림) / tool_use / refusal',
      'usage.input_tokens · output_tokens로 비용 추적',
      'content[0].text만 가정하지 말 것 — 모든 블록의 type 분기',
      '대량 작업 전 1건 파일럿으로 토큰·비용 예측',
    ],
    code: `resp = client.messages.create(
    model="claude-opus-4-8", max_tokens=500,
    messages=[{"role": "user", "content": "쿠싱증후군 감별진단 정리"}])

if resp.stop_reason == "max_tokens":
    print("⚠️ 응답이 잘렸어요 — max_tokens를 늘리세요")
elif resp.stop_reason == "refusal":
    print("⚠️ 안전상 거부된 요청입니다")
else:
    text = "".join(b.text for b in resp.content if b.type == "text")
    print(text)

print(f"입력 {resp.usage.input_tokens} / 출력 {resp.usage.output_tokens} 토큰")`,
    practice: {
      goal: '국시 문제 해설기 + 비용 계산기 만들기',
      desc: '기출 문제를 넣으면 해설을 만들되, 잘린 응답을 감지해 재시도하고 총 사용 토큰·예상 비용을 리포트하는 견고한 스크립트를 만들어 보자.',
      prompt:
        '파이썬으로 국시 기출 해설 생성기를 만들어 줘. questions.json(문항 배열)을 읽어 각 문항의 정답과 해설을 Anthropic API로 생성해. stop_reason이 max_tokens면 max_tokens를 2배로 늘려 1회 재시도하고, refusal이면 건너뛰고 로그를 남겨. 끝나면 총 input/output 토큰 수와 문항당 평균 토큰을 리포트로 출력해 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/build-with-claude/working-with-messages',
  },
  {
    day: 4,
    emoji: '📊',
    title: '구조화된 출력 — AI 답변을 데이터로 받기',
    topic: 'JSON Schema 기반 output_config와 strict tool',
    lecture: [
      '"JSON으로만 답해줘"라고 프롬프트에 부탁하는 것과, API가 문법 수준에서 유효한 JSON을 보장하는 건 완전히 달라. output_config.format에 JSON Schema를 지정하면 응답이 반드시 그 스키마(필수 필드·타입)에 맞게 나와서 파싱 실패·재시도가 사라져.',
      '이게 왜 중요하냐면 — 논문 100편에서 PICO 요소를 추출해 엑셀로 정리한다고 해 봐. 자유 텍스트로 받으면 매번 형식이 달라져서 후처리 지옥이지만, 스키마로 받으면 바로 DataFrame에 넣을 수 있어.',
      '단, 보장이 깨지는 정상 사례도 있어. stop_reason이 refusal이면 안전 응답이 스키마보다 우선하고, max_tokens면 JSON이 중간에 잘릴 수 있어. 그래서 어제 배운 stop_reason 검사가 여기서도 먼저야.',
    ],
    points: [
      'output_config.format = json_schema → 문법적으로 유효한 JSON 보장',
      '객체에는 additionalProperties: false 필수',
      'Python은 Pydantic 기반 messages.parse() 헬퍼 제공',
      'refusal·max_tokens일 땐 보장이 깨짐 → stop_reason 먼저 검사',
    ],
    code: `"output_config": {
  "format": {
    "type": "json_schema",
    "schema": {
      "type": "object",
      "properties": {
        "population":   {"type": "string"},
        "intervention": {"type": "string"},
        "comparison":   {"type": "string"},
        "outcome":      {"type": "string"},
        "study_design": {"type": "string"}
      },
      "required": ["population", "intervention",
                   "comparison", "outcome", "study_design"],
      "additionalProperties": false
    }
  }
}`,
    practice: {
      goal: '논문 초록 PICO 추출기 만들기',
      desc: '초록 텍스트를 넣으면 PICO + 연구설계를 구조화 JSON으로 뽑아 CSV 한 줄로 쌓아 주는 도구. 저널 스터디 발표 준비가 몇 배 빨라진다.',
      prompt:
        '파이썬으로 논문 초록 PICO 추출기를 만들어 줘. abstracts 폴더의 .txt 파일들을 읽어 각 초록에서 Population/Intervention/Comparison/Outcome/연구설계를 Anthropic API의 구조화된 출력(output_config, json_schema)으로 추출하고, 결과를 pico_results.csv에 누적 저장해. 스키마에는 additionalProperties: false를 넣고, stop_reason이 정상일 때만 파싱해 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/build-with-claude/structured-outputs',
  },
  {
    day: 5,
    emoji: '👁️',
    title: '비전 — 이미지를 읽는 AI',
    topic: '이미지 입력과 멀티모달 분석',
    lecture: [
      'Claude는 텍스트만이 아니라 이미지도 읽어. user content를 블록 배열로 만들어 이미지 블록을 먼저, 질문 텍스트를 뒤에 두면 돼. JPEG·PNG·GIF·WebP를 지원하고, 소스는 base64 인코딩·공개 URL·Files API의 file ID 세 가지야.',
      '의대생에게 쓸모가 많아. 손필기 강의노트 사진을 정리된 텍스트로 바꾸거나, 조직 슬라이드·심전도 그림이 있는 족보 스캔본에서 문제를 추출하거나, 도표가 많은 강의 슬라이드를 요약할 수 있어.',
      '주의할 점: 실제 환자 사진·개인정보가 담긴 이미지는 절대 업로드하면 안 돼. 학습 자료라도 저작권과 개인정보를 항상 확인하는 습관이 중요해. 그리고 AI의 이미지 판독은 학습 보조일 뿐, 진단 도구가 아니야.',
    ],
    points: [
      '이미지 블록을 먼저, 질문 텍스트를 뒤에 배치',
      '소스 3종: base64 / 공개 URL / Files API file ID',
      '환자 정보·개인정보가 담긴 이미지는 업로드 금지',
      '해상도가 너무 크면 오류·비용 증가 — 적정 크기로 리사이즈',
    ],
    code: `import base64

with open("lecture_note.jpg", "rb") as f:
    img_b64 = base64.standard_b64encode(f.read()).decode()

resp = client.messages.create(
    model="claude-opus-4-8", max_tokens=2000,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image",
             "source": {"type": "base64",
                        "media_type": "image/jpeg",
                        "data": img_b64}},
            {"type": "text",
             "text": "이 손필기 노트를 마크다운 개요로 정리해 줘."},
        ],
    }])`,
    practice: {
      goal: '손필기 노트 → 마크다운 정리기 만들기',
      desc: '강의 시간에 급하게 쓴 필기 사진들을 폴더에 넣으면, 과목별 마크다운 정리본으로 변환해 주는 도구를 만들어 보자.',
      prompt:
        '파이썬으로 손필기 노트 정리기를 만들어 줘. notes 폴더의 jpg/png 이미지를 base64로 인코딩해 Anthropic API 비전으로 보내고, "필기 내용을 제목·소제목·불릿의 마크다운으로 구조화하되 읽기 불확실한 부분은 [판독불가]로 표시"하도록 해. 이미지 파일명별로 organized/파일명.md 로 저장하고, 처리 전 이미지가 2MB를 넘으면 자동 리사이즈해 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/build-with-claude/vision',
  },
  {
    day: 6,
    emoji: '📄',
    title: 'PDF 지원 — 논문을 통째로 읽히기',
    topic: 'PDF 문서 분석과 비용 관리',
    lecture: [
      'Claude의 PDF 처리는 이중 판독이야. 각 페이지에서 텍스트를 추출하는 동시에 페이지를 이미지로도 변환해서 함께 분석해. 그래서 본문 문장뿐 아니라 표·차트·그림·배치 관계까지 이해할 수 있어. 논문의 Figure와 Table을 읽는다는 뜻이지.',
      '사용법은 이미지와 비슷해. document 블록을 먼저, 질문 text를 뒤에 두면 돼. 같은 논문에 반복해서 질문할 거면 Files API에 올려두고 file ID로 참조하면서 프롬프트 캐싱을 조합하는 게 경제적이야.',
      '비용 감각도 필요해. 페이지당 텍스트만 대략 1,500~3,000 토큰 + 이미지 변환 비용이 추가돼. 30페이지 논문을 통째로 넣기 전에, 필요한 섹션만 분리하는 게 현명해.',
    ],
    points: [
      '텍스트 추출 + 페이지 이미지 분석의 이중 판독 → 표·그림도 이해',
      'document 블록 먼저, 질문 텍스트 뒤에',
      '페이지당 약 1,500~3,000 토큰 + 이미지 비용 — 필요한 페이지만',
      '반복 질문은 Files API + 프롬프트 캐싱 조합',
    ],
    code: `with open("paper.pdf", "rb") as f:
    pdf_b64 = base64.standard_b64encode(f.read()).decode()

resp = client.messages.create(
    model="claude-opus-4-8", max_tokens=3000,
    messages=[{
        "role": "user",
        "content": [
            {"type": "document",
             "source": {"type": "base64",
                        "media_type": "application/pdf",
                        "data": pdf_b64}},
            {"type": "text",
             "text": "이 RCT 논문을 요약해 줘: 연구설계, 1차 결과지표, "
                     "주요 결과(효과크기와 신뢰구간), 한계점 순서로."},
        ],
    }])`,
    practice: {
      goal: '저널 스터디용 논문 요약 도구 만들기',
      desc: 'PDF 논문을 넣으면 발표용 구조화 요약(설계·결과·한계·비판적 평가 포인트)을 만들어 주는 CLI 도구를 만들어 보자.',
      prompt:
        '파이썬 CLI로 의학논문 요약 도구를 만들어 줘. 사용법은 "python summarize.py paper.pdf". PDF를 base64 document 블록으로 Anthropic API에 보내고, 연구설계/대상/개입/1차·2차 결과지표/주요 결과(수치 포함)/한계점/저널클럽 토론 질문 3개 순서의 마크다운 요약을 생성해 paper_summary.md로 저장해. 20페이지가 넘으면 경고를 출력하고 진행 여부를 물어봐 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/build-with-claude/pdf-support',
  },
  {
    day: 7,
    emoji: '⚡',
    title: '프롬프트 캐싱 — 같은 교재를 두 번 읽히지 않기',
    topic: '캐시 경계와 비용 절감 전략',
    lecture: [
      '해리슨 내과학 한 챕터를 컨텍스트로 넣고 질문을 30번 한다고 해 봐. 캐싱이 없으면 30번 모두 챕터 전체의 입력 비용을 내야 해. 프롬프트 캐싱은 반복되는 요청 앞부분(프리픽스)을 캐시해서 후속 요청의 비용과 지연을 크게 줄여 줘.',
      '원리는 콘텐츠 블록에 cache_control 표시를 붙여 "여기까지 캐시해"라고 경계를 정하는 거야. 후속 요청이 같은 모델·같은 앞부분·같은 블록 순서를 유지하면 캐시 적중(hit)이 일어나.',
      '함정: 캐시는 byte 수준으로 동일해야 해. 시스템 프롬프트 한 글자만 바꿔도, 도구 순서만 바꿔도 그 지점 이후 캐시가 깨져. 그래서 변하지 않는 큰 자료는 앞에, 사용자마다 변하는 질문은 뒤에 두는 배치가 핵심이야.',
    ],
    points: [
      'cache_control로 캐시 경계 지정 — 그 지점까지의 프리픽스가 캐시됨',
      '고정 자료(교재·지침)는 앞에, 변하는 질문은 뒤에',
      'usage의 cache_creation / cache_read 토큰으로 적중 확인',
      '모델·시스템·도구·블록 순서가 바뀌면 캐시 무효화',
    ],
    code: `resp = client.messages.create(
    model="claude-opus-4-8", max_tokens=1024,
    system=[
        {"type": "text",
         "text": "너는 내과학 튜터다. 아래 교재 내용에 근거해서만 답하라."},
        {"type": "text",
         "text": TEXTBOOK_CHAPTER,          # 수만 토큰의 교재 챕터
         "cache_control": {"type": "ephemeral"}},  # ← 여기까지 캐시
    ],
    messages=[{"role": "user", "content": "심부전 분류를 설명해 줘."}])

u = resp.usage
print(f"캐시 생성 {u.cache_creation_input_tokens} / "
      f"캐시 적중 {u.cache_read_input_tokens} 토큰")`,
    practice: {
      goal: '교재 기반 Q&A 튜터 만들기 (캐싱 적용)',
      desc: '병리학 강의록 텍스트를 캐시에 올려두고 무한 질문하는 튜터. 캐시 적중률을 눈으로 확인하며 비용이 절감되는 걸 체감해 보자.',
      prompt:
        '파이썬 CLI로 교재 기반 Q&A 튜터를 만들어 줘. textbook.txt(강의록 전문)를 system의 캐시 블록(cache_control ephemeral)으로 넣고, 사용자가 반복 질문할 수 있는 대화 루프를 만들어. 매 응답 뒤에 cache_creation_input_tokens와 cache_read_input_tokens를 출력해 캐시 적중을 확인할 수 있게 하고, "교재에 없는 내용은 없다고 답하라"는 지침도 넣어 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/build-with-claude/prompt-caching',
  },
  {
    day: 8,
    emoji: '🔧',
    title: '도구 사용 — AI에게 손과 발 달아주기',
    topic: 'Tool use 루프의 작동 원리',
    lecture: [
      '모델은 계산기도 검색엔진도 아니야. 하지만 "도구"를 정의해 주면, 필요할 때 그 도구를 불러 달라고 요청할 수 있어. 예를 들어 약물 상호작용 DB 조회 함수를 도구로 등록하면, "와파린이랑 아스피린 같이 먹어도 돼?"라는 질문에 모델이 스스로 조회 함수를 호출해 근거 있는 답을 만들어.',
      '흐름은 이래: (1) tools 정의와 함께 질문 전송 → (2) 모델이 tool_use 블록으로 "이 도구를 이 인수로 실행해 줘"라고 응답(stop_reason: tool_use) → (3) 내 코드가 실제 함수를 실행 → (4) 결과를 tool_result 블록으로 되돌려줌 → (5) 모델이 최종 답변 생성.',
      '중요한 규칙: tool_use의 id와 tool_result의 tool_use_id가 정확히 연결돼야 하고, 이전 assistant 메시지 전체를 보존해서 다시 보내야 해. API가 무상태니까 이 루프의 상태 관리는 전부 내 코드 책임이야.',
    ],
    points: [
      'tool use 루프: 질문 → tool_use 응답 → 실행 → tool_result 반환 → 최종 답변',
      'stop_reason이 tool_use면 아직 끝난 게 아님 — 다음 요청 필요',
      'tool_use_id로 호출과 결과를 정확히 연결',
      '병렬 호출 결과는 한 user 턴에 함께 반환 가능',
    ],
    code: `tools = [{
    "name": "check_drug_interaction",
    "description": "두 약물의 상호작용을 로컬 DB에서 조회한다",
    "input_schema": {
        "type": "object",
        "properties": {
            "drug_a": {"type": "string"},
            "drug_b": {"type": "string"},
        },
        "required": ["drug_a", "drug_b"],
    },
}]

resp = client.messages.create(
    model="claude-opus-4-8", max_tokens=1024, tools=tools,
    messages=[{"role": "user",
               "content": "와파린과 아스피린 병용 시 주의점은?"}])

if resp.stop_reason == "tool_use":
    tool_call = next(b for b in resp.content if b.type == "tool_use")
    result = my_db_lookup(**tool_call.input)   # 실제 함수 실행
    # result를 tool_result로 되돌려주는 두 번째 요청으로 이어짐`,
    practice: {
      goal: '약물 상호작용 조회 챗봇 만들기',
      desc: '작은 상호작용 사전(JSON)을 도구로 연결해, 근거 기반으로 답하는 약리학 학습 챗봇을 만들어 보자. tool use 루프를 직접 구현하는 게 포인트.',
      prompt:
        '파이썬으로 약물 상호작용 챗봇을 만들어 줘. interactions.json(약물 쌍 → 상호작용 설명, 예시 데이터 15개 포함해서 생성)을 조회하는 check_drug_interaction 도구를 정의하고, Anthropic API tool use 루프(tool_use 응답 → 함수 실행 → tool_result 반환 → 최종 답변)를 완전하게 구현해. DB에 없는 조합이면 "데이터 없음, 반드시 공식 자료를 확인하라"고 답하게 하고, 대화형 CLI로 만들어 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/agents-and-tools/tool-use/how-tool-use-works',
  },
  {
    day: 9,
    emoji: '🌊',
    title: '스트리밍 — 실시간으로 흘러나오는 답변',
    topic: '메시지 스트리밍과 체감 속도',
    lecture: [
      '긴 해설을 생성할 때 30초 동안 빈 화면을 보여주면 사용자는 떠나. 스트리밍은 응답을 조각(이벤트) 단위로 실시간 전송받는 방식이야. ChatGPT가 타자 치듯 답하는 게 바로 이거야.',
      'API 요청에 stream: true를 넣으면 서버가 이벤트 스트림을 보내와. SDK를 쓰면 with client.messages.stream(...) 구문으로 텍스트 조각을 for 루프로 받을 수 있어서 훨씬 간단해.',
      '전체 응답이 도착해야 파싱할 수 있는 구조화 출력과 달리, 텍스트 스트리밍은 도착하는 대로 화면에 붙이면 돼. 학습용 웹앱을 만든다면 반드시 스트리밍을 쓰는 게 체감 품질을 좌우해.',
    ],
    points: [
      'stream: true 또는 SDK의 messages.stream() 사용',
      '체감 대기시간(첫 토큰까지 시간)이 크게 감소',
      '스트리밍 중에도 마지막에 stop_reason 확인 필수',
      '웹앱에서는 Server-Sent Events(SSE)로 브라우저에 중계',
    ],
    code: `with client.messages.stream(
    model="claude-opus-4-8", max_tokens=2000,
    messages=[{"role": "user",
               "content": "신부전 환자의 고칼륨혈증 응급처치를 단계별로"}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)   # 실시간 출력

final = stream.get_final_message()
print(f"\\n\\n[stop_reason: {final.stop_reason}]")`,
    practice: {
      goal: '실시간 스트리밍 Q&A 웹페이지 만들기',
      desc: '질문을 입력하면 답변이 타자 치듯 실시간으로 나타나는 나만의 학습 Q&A 웹페이지. Flask + SSE로 만들어 보자.',
      prompt:
        'Flask로 의학 학습 Q&A 웹앱을 만들어 줘. 브라우저에서 질문을 입력하면 Anthropic API 스트리밍(messages.stream)으로 답변을 받아 Server-Sent Events로 실시간 중계하고, 프론트는 답변이 타자 치듯 한 글자씩 나타나게 해. system 프롬프트는 "의대생 눈높이의 한국어 튜터, 항상 근거 수준 표시"로 하고, 단일 index.html + app.py 구조로 간단하게.',
    },
    docs: 'https://platform.claude.com/docs/ko/build-with-claude/streaming',
  },
  {
    day: 10,
    emoji: '🎒',
    title: 'Agent Skills — 반복 작업을 스킬로 묶기',
    topic: 'SKILL.md 구조와 스킬 설계',
    lecture: [
      'Agent Skill은 지침·스크립트·템플릿·참고 파일을 하나의 디렉터리로 묶어서, Claude가 필요할 때 스스로 발견하고 로드하는 기능이야. 매번 긴 프롬프트를 복붙하는 대신, "족보 정리 스킬"을 만들어 두면 "족보 정리해 줘" 한마디로 정해진 절차가 실행돼.',
      "구조는 간단해. 루트에 SKILL.md를 두고 YAML frontmatter에 name과 description을 쓴 뒤 본문에 실행 절차를 적어. 하위 폴더에 scripts, references, assets 같은 보조 파일을 둘 수 있어. description이 '언제 이 스킬을 쓸지' 판단하는 신호라서 가장 정성 들여 써야 해.",
      '로딩이 영리해. 처음엔 스킬 이름·설명(메타데이터)만 알려지고, 관련 작업이 오면 그때 SKILL.md를 읽고, 필요한 보조 파일만 추가로 열어. 그래서 컨텍스트가 절약돼. 반복 절차가 안정적인 작업(문서 생성, 정리 루틴, 채점 기준 적용)에 딱이야.',
    ],
    points: [
      'SKILL.md = YAML frontmatter(name·description) + 실행 절차',
      'description이 스킬 선택의 핵심 신호 — 대상 작업과 제외 상황 명시',
      '점진적 로딩으로 컨텍스트 절약',
      '단발성 질문엔 프롬프트가, 반복 절차엔 스킬이 적합',
    ],
    code: `# ~/.claude/skills/jokbo-organizer/SKILL.md
---
name: jokbo-organizer
description: >
  족보(기출문제) 파일을 과목·주제별로 정리하고
  오답노트 템플릿을 생성할 때 사용.
  단순 요약 요청에는 사용하지 않음.
---

# 족보 정리 절차
1. 입력 파일에서 문제·정답·해설을 분리한다
2. 과목 > 대주제 > 소주제 계층으로 분류한다
3. references/template.md 형식으로 오답노트를 만든다
4. 빈출 주제 Top 10을 세어 요약표를 붙인다`,
    practice: {
      goal: '나만의 "족보 정리" Claude Code 스킬 만들기',
      desc: 'Claude Code에서 슬래시 명령처럼 쓸 수 있는 족보 정리 스킬을 만들어 보자. 한 번 만들면 시험 기간마다 재사용할 수 있다.',
      prompt:
        '내 Claude Code용 스킬을 만들어 줘. 이름은 jokbo-organizer, 위치는 .claude/skills/jokbo-organizer/. SKILL.md에는 YAML frontmatter(name, description)와 절차(문제 텍스트 파일에서 문항 분리 → 과목·주제별 분류 → 오답노트 마크다운 생성 → 빈출 주제 통계표 작성)를 쓰고, references/oadap-template.md 오답노트 템플릿 파일도 함께 만들어 줘. description에는 이 스킬을 쓸 상황과 쓰지 않을 상황을 명확히 적어 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/agents-and-tools/agent-skills/overview',
  },
  {
    day: 11,
    emoji: '📦',
    title: '배치 처리 — 밤새 500문항 해설 만들기',
    topic: 'Message Batches API와 대량 작업',
    lecture: [
      '족보 500문항의 해설을 만든다면 하나씩 API를 호출할 필요가 없어. Message Batches API는 수천 개의 요청을 한 파일로 묶어 제출하면 비동기로 처리해 주는 방식이야. 보통 일반 호출보다 훨씬 저렴한 요금이 적용되고, 대부분 24시간 내에 완료돼.',
      '흐름: (1) 요청들을 custom_id를 붙여 배열로 만들고 (2) 배치를 제출하면 배치 ID를 받아 (3) 주기적으로 상태를 확인하다가 (4) 완료되면 결과 파일을 다운로드해 custom_id로 원래 요청과 짝을 맞춰.',
      '실시간 응답이 필요 없는 모든 대량 작업 — 기출 해설 생성, 논문 초록 일괄 분류, 플래시카드 대량 생산 — 은 배치로 돌리는 게 정답이야. 자기 전에 제출하고 아침에 결과를 받는 워크플로가 가능해.',
    ],
    points: [
      '대량 요청을 비동기로 묶어 처리 — 비용 할인 + 안정성',
      'custom_id로 요청과 결과를 매칭',
      '제출 → 상태 폴링 → 결과 다운로드의 3단계',
      '실시간성이 필요 없는 작업은 무조건 배치가 경제적',
    ],
    code: `batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"q-{i}",
            "params": {
                "model": "claude-opus-4-8",
                "max_tokens": 1500,
                "messages": [{"role": "user",
                              "content": f"다음 국시 문제의 정답과 해설: {q}"}],
            },
        }
        for i, q in enumerate(questions)
    ])
print(batch.id, batch.processing_status)
# 이후 batches.retrieve(batch.id)로 상태 확인,
# 완료되면 results를 custom_id 기준으로 병합`,
    practice: {
      goal: '기출 해설 대량 생성 파이프라인 만들기',
      desc: '문제 뱅크를 배치로 제출하고, 완료를 기다렸다가 결과를 문제별 해설 파일로 정리하는 전체 파이프라인을 만들어 보자.',
      prompt:
        '파이썬으로 국시 기출 해설 배치 파이프라인을 만들어 줘. 3개 스크립트로: (1) submit.py는 questions.json의 문항들을 custom_id를 붙여 Message Batches API로 제출하고 배치 ID를 저장, (2) check.py는 배치 상태를 확인, (3) collect.py는 완료된 결과를 다운로드해 custom_id로 매칭한 뒤 explanations/문항번호.md 파일들로 저장. 샘플 questions.json(내과 문항 5개)도 만들어 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/build-with-claude/batch-processing',
  },
  {
    day: 12,
    emoji: '🔍',
    title: '임베딩과 RAG — 내 강의록을 검색하는 AI',
    topic: '벡터 검색 기반 질의응답의 원리',
    lecture: [
      '모델의 컨텍스트에 강의록 전체를 매번 넣을 수는 없어. RAG(Retrieval-Augmented Generation)는 (1) 문서를 청크로 쪼개 임베딩(의미를 담은 숫자 벡터)으로 변환해 저장해 두고 (2) 질문이 오면 의미가 가까운 청크만 검색해서 (3) 그 청크들만 컨텍스트로 넣어 답하게 하는 구조야.',
      '임베딩은 "의미의 좌표"야. "심근경색"과 "MI"는 글자가 완전히 다르지만 임베딩 공간에서는 가까워. 그래서 키워드 검색으로 못 찾는 자료를 의미로 찾아낼 수 있어.',
      '전형적 구성: 임베딩 모델(예: Voyage AI)로 벡터화 → 벡터 DB(간단하게는 numpy 코사인 유사도)에 저장 → 검색된 상위 청크를 Claude에게 전달. "근거가 된 강의록 페이지"를 함께 표시하면 환각(hallucination)도 줄일 수 있어.',
    ],
    points: [
      'RAG = 청크 분할 → 임베딩 저장 → 유사도 검색 → 검색 결과로 답변',
      '임베딩은 의미 기반이라 동의어·약어도 찾아냄',
      '답변에 근거 청크(출처)를 함께 표시해 환각 감소',
      '소규모는 numpy 코사인 유사도로 충분 — 벡터 DB는 나중에',
    ],
    code: `import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 1) 강의록 청크들을 임베딩해 저장 (1회)
chunk_vecs = [embed(c) for c in chunks]

# 2) 질문을 임베딩해 가장 가까운 청크 3개 검색
q_vec = embed("심부전에서 BNP의 의미는?")
top3 = sorted(range(len(chunks)),
              key=lambda i: -cosine_sim(q_vec, chunk_vecs[i]))[:3]

# 3) 검색된 청크만 컨텍스트로 Claude에게 질문
context = "\\n---\\n".join(chunks[i] for i in top3)`,
    practice: {
      goal: '강의록 검색 챗봇(미니 RAG) 만들기',
      desc: '내 강의록 텍스트 파일들을 임베딩해 두고, 질문하면 관련 부분을 찾아 근거와 함께 답하는 나만의 검색 챗봇을 만들어 보자.',
      prompt:
        '파이썬으로 강의록 RAG 챗봇을 만들어 줘. lectures 폴더의 .txt 강의록들을 500자 단위 청크로 나누고 임베딩해 로컬 파일에 저장(인덱싱 스크립트), 질문하면 코사인 유사도 상위 3개 청크를 찾아 그것만 컨텍스트로 Anthropic API에 전달해 답하게 해(챗봇 스크립트). 답변 아래에 근거가 된 청크의 출처 파일명을 표시하고, "근거 청크에 없는 내용은 모른다고 답하라"는 지침을 넣어 줘. 임베딩은 voyageai 패키지를 사용해.',
    },
    docs: 'https://platform.claude.com/docs/ko/build-with-claude/embeddings',
  },
  {
    day: 13,
    emoji: '🛠️',
    title: 'Claude Code — 코딩을 몰라도 앱을 만드는 법',
    topic: 'Claude Code 활용 전략과 좋은 지시법',
    lecture: [
      '지난 12일간의 실습을 하면서 눈치챘겠지만, 너는 코드를 한 줄도 직접 쓰지 않았어. Claude Code는 터미널에서 파일 생성·수정·실행·디버깅까지 스스로 하는 에이전트라서, "무엇을 원하는지"만 정확히 말하면 "어떻게 만드는지"는 맡길 수 있어.',
      '좋은 지시의 3요소: (1) 목적과 사용자 — "국시 공부하는 본과 3학년이 쓸" (2) 입력과 출력 — "questions.json을 읽어 explanations 폴더에 저장" (3) 제약과 예외 — "응답이 잘리면 재시도, 없는 데이터면 모른다고 답하게". 이 세 가지가 있으면 결과물이 완전히 달라져.',
      '그리고 만든 걸 확인하는 습관: 실행해 보고, 에러 메시지를 그대로 붙여넣으면 Claude Code가 스스로 고쳐. "왜 이렇게 만들었어?"라고 물으면 설계를 설명해 주고, "더 간단하게"라고 하면 리팩터링도 해. 대화하면서 다듬는 게 핵심이야.',
    ],
    points: [
      '지시 3요소: 목적·사용자 / 입력·출력 / 제약·예외',
      '에러는 메시지 그대로 붙여넣기 — 스스로 디버깅함',
      'CLAUDE.md에 프로젝트 규칙을 적어두면 매번 지킴',
      '커밋을 자주 요청해 언제든 되돌릴 수 있게',
    ],
    code: `# 나쁜 지시 ❌
"공부 앱 만들어 줘"

# 좋은 지시 ✅
"본과 3학년이 쓸 암기 카드 웹앱을 만들어 줘.
 - 입력: cards.json (질문·답·과목 필드)
 - 화면: 카드를 클릭하면 뒤집혀 답이 보이고,
   '알았음/몰랐음' 버튼으로 오답만 다시 나옴
 - 제약: 프레임워크 없이 단일 HTML,
   진행 상황은 localStorage에 저장
 완성되면 로컬 서버로 실행해서 보여줘."`,
    practice: {
      goal: '나만의 암기 카드 웹앱 만들기 (첫 종합 프로젝트)',
      desc: '지금까지 배운 지시법을 총동원해, 브라우저에서 돌아가는 암기 카드 앱을 Claude Code에게 시켜 보자. 오늘의 포인트는 코드가 아니라 "지시문 품질"이다.',
      prompt:
        '본과생용 암기 카드 웹앱을 만들어 줘. cards.json(질문/답/과목, 샘플 20장 포함)을 읽어 카드 클릭 시 뒤집히는 UI, "알았음/몰랐음" 버튼, 몰랐던 카드만 다시 도는 복습 모드, 과목 필터, localStorage 진행 저장 기능을 넣어 줘. 프레임워크 없이 단일 index.html로, 모바일에서도 보기 좋게. 완성되면 로컬 서버로 실행해서 확인시켜 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/home',
  },
  {
    day: 14,
    emoji: '🤖',
    title: '자동화와 보안 — 매일 아침 논문이 도착하는 삶',
    topic: '에이전트 자동화 설계와 API 키 안전 수칙',
    lecture: [
      '마지막 날은 "내가 없어도 돌아가는 시스템"이야. 지금까지 만든 도구들을 스케줄러(Windows 작업 스케줄러, cron)와 결합하면, 매일 아침 관심 주제의 새 논문을 요약해 메일로 보내주는 봇 같은 자동화가 가능해. Claude Platform의 Managed Agents는 이런 에이전트를 클라우드에서 세션·메모리·권한 정책과 함께 운영하는 상위 버전이야.',
      '자동화에서 제일 중요한 건 안전장치야. (1) 지출 한도: 폭주해도 비용이 제한되게 (2) 권한 최소화: 봇이 접근할 수 있는 파일·API를 꼭 필요한 것만으로 (3) 로깅: 무엇을 했는지 기록을 남겨 문제를 추적할 수 있게.',
      '그리고 처음부터 강조한 API 키 보안을 다시: 키는 환경 변수나 비밀 관리자로만, 저장소 커밋 금지, 유출 시 즉시 폐기·재발급, 용도별로 키를 분리해 피해 범위를 제한. 이 수칙만 지켜도 대부분의 사고를 막을 수 있어. 14일 완주 축하해 — 이제 너는 필요한 도구를 스스로 만들 수 있는 의대생이야. 🎓',
    ],
    points: [
      '스케줄러 + API 스크립트 = 매일 자동 실행되는 나만의 봇',
      '지출 한도·권한 최소화·로깅은 자동화의 3대 안전장치',
      'API 키: 환경 변수 전용, 커밋 금지, 유출 시 즉시 폐기',
      '용도별 키 분리로 피해 범위 제한',
    ],
    code: `# morning_paper.py — 매일 아침 실행되는 논문 브리핑 봇
# (Windows 작업 스케줄러에 등록: 매일 07:00)

topics = ["heart failure treatment", "medical education AI"]

for topic in topics:
    # 1) PubMed API로 최근 24시간 신규 논문 검색
    papers = fetch_recent_papers(topic)
    # 2) 초록들을 하나의 요청으로 묶어 한국어 브리핑 생성
    brief = summarize_with_claude(papers)
    # 3) 결과를 briefs/2026-07-19_topic.md 로 저장
    save_brief(topic, brief)

# 안전장치: 실패 시 로그 기록, 월 지출 한도는 Console에서 설정`,
    practice: {
      goal: '아침 논문 브리핑 봇 만들기 (졸업 프로젝트)',
      desc: '관심 주제의 새 논문을 매일 아침 자동으로 요약해 주는 봇. 스케줄러 등록까지 하면 14일 커리큘럼 완주다.',
      prompt:
        '파이썬으로 아침 논문 브리핑 봇을 만들어 줘. topics.txt의 관심 주제마다 PubMed E-utilities API로 최근 3일 논문을 검색해 제목·초록을 가져오고, Anthropic API로 "의대생을 위한 한국어 브리핑(논문별 3줄 요약 + 오늘의 픽 1편)"을 생성해 briefs/날짜.md로 저장해. 실행 로그를 남기고 API 실패 시 3회 재시도해. 마지막으로 Windows 작업 스케줄러에 매일 아침 7시 실행으로 등록하는 방법을 setup.md에 정리해 줘.',
    },
    docs: 'https://platform.claude.com/docs/ko/managed-agents/overview',
  },
];

/* ============================================
   심화 커리큘럼 — 14일 기초 코스가 끝난 뒤(2주 경과
   또는 기초 14강 완주) 섹터별로 전부 열린다
   ============================================ */
const ADVANCED_SECTORS = [
  {
    id: 'build',
    emoji: '🧱',
    title: '구축 심화',
    desc: '긴 대화·깊은 추론·근거 표시 — 실전 서비스의 기본기',
    lectures: [
      {
        id: 'build-1',
        emoji: '🪟',
        title: '컨텍스트 윈도우와 컴팩션 — 긴 대화 관리하기',
        topic: '토큰 한계, 컨텍스트 편집, 대화 요약',
        lecture: [
          '모델이 한 번에 볼 수 있는 텍스트 양(컨텍스트 윈도우)에는 상한이 있어. 가상 환자 문진을 100턴쯤 이어가면 기록이 한계에 다가가고, 비용도 매 턴 커져. 그래서 긴 대화에는 관리 전략이 필요해.',
          '대표 전략이 두 가지야. 컨텍스트 편집은 오래된 도구 결과처럼 더 이상 필요 없는 블록을 제거하는 것이고, 컴팩션은 지난 대화를 요약본으로 압축해 교체하는 거야. 요약할 때 핵심 정보(환자 정보, 이미 확인한 소견)를 명시적으로 보존하도록 지시하는 게 포인트야. 단, 편집·압축 지점 이후의 프롬프트 캐시는 무효화될 수 있다는 것도 기억해.',
        ],
        points: [
          '컨텍스트 윈도우 = 모델이 한 번에 보는 최대 토큰 양',
          '오래된 도구 결과 제거(컨텍스트 편집) vs 대화 요약 교체(컴팩션)',
          '요약 시 보존할 핵심 정보를 명시적으로 지정',
          '편집·압축은 그 지점 이후의 캐시를 깰 수 있음',
        ],
        code: `# 대화가 30턴을 넘으면 앞 20턴을 요약으로 교체
if len(history) > 30:
    summary = client.messages.create(
        model="claude-opus-4-8", max_tokens=800,
        messages=[{"role": "user", "content":
            "다음 문진 대화를 요약하되 환자 기본정보, 확인된 증상, "
            "배제된 진단은 반드시 보존해:\\n" + render(history[:20])}])
    history = [
        {"role": "user", "content": "[지난 문진 요약] " + text_of(summary)},
        {"role": "assistant", "content": "요약을 확인했어요. 문진을 계속하죠."},
    ] + history[20:]`,
        practice: {
          goal: '장기 문진 시뮬레이터에 컴팩션 적용하기',
          desc: 'Day 2에서 만든 가상 환자 챗봇을 업그레이드해, 대화가 길어져도 비용이 폭증하지 않게 만들어 보자.',
          prompt:
            '내 가상 표준화 환자 챗봇(파이썬 CLI)에 컴팩션 기능을 추가해 줘. 대화가 30턴을 넘으면 앞 20턴을 Anthropic API로 요약해 한 개의 요약 메시지로 교체하되, "환자 기본정보·확인된 증상·배제된 진단은 반드시 보존"하도록 요약 지시를 넣어. 매 턴 입력 토큰 수를 출력해 컴팩션 전후 비용 차이를 확인할 수 있게 해 줘.',
        },
        docs: 'https://platform.claude.com/docs/ko/build-with-claude/context-windows',
      },
      {
        id: 'build-2',
        emoji: '🧠',
        title: '확장 사고 — 어려운 문제엔 생각할 시간을',
        topic: 'Extended thinking과 사고 예산',
        lecture: [
          '복잡한 임상추론 문제를 풀 때 사람도 바로 답하지 않고 감별진단을 하나씩 따져보잖아. 확장 사고(extended thinking)는 모델에게 그 "따져보는 시간"을 주는 기능이야. 응답 전에 내부 사고 과정을 거치게 해서, 다단계 추론 문제의 정답률이 올라가.',
          '사고에도 토큰이 들어. 사고 예산(budget)을 지정해 얼마나 깊이 생각할지 조절할 수 있고, 응답에는 thinking 블록이 포함될 수 있어서 모델이 어떤 근거로 결론에 도달했는지 볼 수 있어. 단순 암기형 질문에는 오히려 낭비니까, 계산·추론·판단이 필요한 문제에만 켜는 게 경제적이야.',
        ],
        points: [
          '확장 사고 = 응답 전 내부 추론 단계 부여',
          '사고 예산으로 깊이·비용 조절',
          'thinking 블록으로 추론 과정 관찰 가능',
          '단순 질문엔 끄고, 다단계 추론에만 켜기',
        ],
        code: `resp = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=8000,
    thinking={"type": "enabled", "budget_tokens": 4000},
    messages=[{"role": "user", "content":
        "45세 여성, 3주간의 발열·체중감소·야간발한. "
        "감별진단을 가능성 순으로 나열하고 "
        "각각을 지지/배제하는 소견과 다음 검사를 제시해."}])

for block in resp.content:
    if block.type == "thinking":
        print("[사고 과정]", block.thinking[:300], "...")
    elif block.type == "text":
        print(block.text)`,
        practice: {
          goal: '임상추론 연습기 만들기 (사고 과정 비교)',
          desc: '같은 증례를 확장 사고 켜고/끄고 풀게 해서 답이 어떻게 달라지는지 비교하는 도구. 모델의 추론 과정을 보며 나의 추론과 비교해 보자.',
          prompt:
            '파이썬으로 임상추론 연습기를 만들어 줘. cases.json의 증례를 하나 고르면 (1) 확장 사고 없이, (2) 확장 사고(budget 4000)로 각각 감별진단을 생성해 나란히 비교 출력하고, 확장 사고의 thinking 블록 요지도 보여줘. 마지막에 두 답변의 차이점을 모델에게 스스로 분석시키는 기능도 넣어 줘. 샘플 증례 3개 포함.',
        },
        docs: 'https://platform.claude.com/docs/ko/build-with-claude/extended-thinking',
      },
      {
        id: 'build-3',
        emoji: '📎',
        title: '인용 — "어디에 근거했는지" 표시하기',
        topic: 'Citations로 근거 있는 답변 만들기',
        lecture: [
          '의학에서 근거 없는 주장은 위험해. 인용(citations) 기능을 켜면 Claude가 답변의 각 주장 옆에 "제공된 문서의 어느 부분에 근거했는지"를 citation 블록으로 붙여 줘. 문서 블록에 citations 옵션을 활성화하면 응답 텍스트와 인용 위치가 교차로 반환돼.',
          '환각을 줄이는 가장 실용적인 장치이기도 해. 답변을 읽다가 인용을 클릭하면 원문 위치로 갈 수 있는 UI를 만들 수 있거든. 주의: 인용은 텍스트와 citation 블록을 교차 배치해야 해서 JSON 구조화 출력과는 함께 쓸 수 없어(400 오류). 근거 표시 vs 구조화 데이터, 목적에 따라 하나를 골라야 해.',
        ],
        points: [
          '문서 블록에 citations 활성화 → 주장별 근거 위치 반환',
          '원문 검증이 쉬워져 환각 위험 감소',
          '구조화된 출력(JSON)과 동시 사용 불가 — 목적별 선택',
          '중요 수치·조항은 인용 위치로 재검증하는 습관',
        ],
        code: `resp = client.messages.create(
    model="claude-opus-4-8", max_tokens=2000,
    messages=[{
        "role": "user",
        "content": [
            {"type": "document",
             "source": {"type": "base64",
                        "media_type": "application/pdf",
                        "data": pdf_b64},
             "citations": {"enabled": True}},
            {"type": "text",
             "text": "이 가이드라인에서 1차 약제 권고안을 요약해 줘."},
        ],
    }])

for block in resp.content:
    if block.type == "text":
        print(block.text)
        for c in (block.citations or []):
            print(f"   └ 근거: p.{c.start_page_number} 부근")`,
        practice: {
          goal: '근거 표시형 가이드라인 요약기 만들기',
          desc: '진료지침 PDF를 요약하되 모든 권고사항 옆에 원문 페이지 근거가 붙는 요약기. 저널 발표 때 "근거는요?" 질문이 두렵지 않아진다.',
          prompt:
            '파이썬으로 근거 표시형 가이드라인 요약기를 만들어 줘. PDF를 document 블록(citations enabled)으로 보내 핵심 권고안을 요약하게 하고, 각 문장 뒤에 근거 페이지를 [p.N] 형식으로 붙인 마크다운을 생성해 줘. citation이 없는 문장은 [근거 없음]으로 표시해서 검증이 필요한 부분이 한눈에 보이게 해 줘.',
        },
        docs: 'https://platform.claude.com/docs/ko/build-with-claude/citations',
      },
    ],
  },
  {
    id: 'agent',
    emoji: '🛠️',
    title: '에이전트 심화',
    desc: 'MCP · 메모리 · 코드 실행 — 도구를 넘어 에이전트로',
    lectures: [
      {
        id: 'agent-1',
        emoji: '🔌',
        title: 'MCP — 도구를 표준으로 연결하기',
        topic: 'Model Context Protocol과 커넥터',
        lecture: [
          'Day 8에서 도구를 직접 정의했지? MCP(Model Context Protocol)는 그 도구들을 표준 규격의 "서버"로 만들어 어떤 AI 클라이언트에서든 꽂아 쓰게 하는 프로토콜이야. USB처럼 — 한 번 만든 MCP 서버는 Claude Code, API의 MCP 커넥터, 다른 앱에서 재사용할 수 있어.',
          'API에서는 MCP 커넥터로 원격 MCP 서버를 요청에 연결하면 Claude가 그 서버의 도구들을 스스로 발견하고 호출해. 도구 루프를 직접 구현할 필요가 없어지는 거지. 노션·캘린더·GitHub 같은 기존 서비스의 MCP 서버를 붙일 수도 있고, 내 족보 검색기를 MCP 서버로 만들 수도 있어.',
        ],
        points: [
          'MCP = 도구·데이터 연결의 표준 프로토콜 (만들면 어디서든 재사용)',
          'API의 MCP 커넥터로 원격 서버 도구를 자동 발견·호출',
          'Claude Code에도 MCP 서버를 등록해 기능 확장 가능',
          '신뢰할 수 없는 MCP 서버는 코드처럼 검토 후 연결',
        ],
        code: `# Claude Code에 MCP 서버 등록 (.mcp.json)
{
  "mcpServers": {
    "jokbo-search": {
      "command": "python",
      "args": ["jokbo_mcp_server.py"]
    }
  }
}
# 이후 Claude Code가 대화 중 필요할 때
# jokbo-search 서버의 검색 도구를 스스로 호출한다`,
        practice: {
          goal: '족보 검색 MCP 서버 만들기',
          desc: '내 기출 문제 뱅크를 검색하는 MCP 서버를 만들어 Claude Code에 연결하자. 연결하면 "작년에 이 주제 나왔어?"를 대화로 물을 수 있다.',
          prompt:
            '파이썬 MCP SDK(FastMCP)로 족보 검색 MCP 서버를 만들어 줘. jokbo.json(과목·연도·주제·문제 필드, 샘플 20문항 포함)을 키워드와 과목으로 검색하는 search_jokbo 도구와 주제별 출제 횟수를 세는 count_topics 도구를 노출해. 그리고 이 서버를 Claude Code에 등록하는 .mcp.json 설정과 사용법을 README로 정리해 줘.',
        },
        docs: 'https://platform.claude.com/docs/ko/agents-and-tools/mcp-connector',
      },
      {
        id: 'agent-2',
        emoji: '🗃️',
        title: '메모리 도구 — 대화를 넘어 기억하는 에이전트',
        topic: 'Memory tool과 장기 기억 설계',
        lecture: [
          'API는 무상태라 대화가 끝나면 다 잊는다고 했지? 메모리 도구는 에이전트가 파일 형태의 장기 기억을 스스로 읽고 쓰게 해 주는 기능이야. "이 학생은 신장생리를 자주 틀린다"를 기억해 두면, 다음 세션에서 그 약점을 겨냥한 문제를 내는 튜터를 만들 수 있어.',
          '설계 요령: 무엇을 기억할지(취약 주제, 학습 이력), 언제 갱신할지(채점 직후), 어떻게 정리할지(주제별 파일)를 시스템 지침으로 명확히 해야 해. 아무거나 다 저장하면 기억이 쓰레기장이 되고, 너무 아끼면 기억하는 의미가 없어. 개인 학습 데이터니까 저장 위치와 삭제 방법도 처음부터 정해 둬.',
        ],
        points: [
          '메모리 도구 = 세션을 넘어 유지되는 파일 기반 장기 기억',
          '무엇을·언제·어떻게 기억할지 시스템 지침으로 명시',
          '취약 주제 추적 → 맞춤 출제 같은 적응형 학습에 활용',
          '개인 데이터이므로 저장 위치·삭제 정책을 함께 설계',
        ],
        code: `tools = [{"type": "memory_20250818", "name": "memory"}]

system = """너는 국시 튜터다. 메모리 규칙:
- 학생이 문제를 틀리면 /memories/weak_topics.md에
  주제와 오답 유형을 기록하라
- 세션 시작 시 weak_topics.md를 읽고
  취약 주제 위주로 출제하라
- 같은 주제를 3회 연속 맞히면 취약 목록에서 제거하라"""

# 클라이언트는 memory 도구 호출(view/create/str_replace)을
# 로컬 파일 시스템에 실행해 주는 핸들러를 구현한다`,
        practice: {
          goal: '나를 기억하는 오답노트 튜터 만들기',
          desc: '틀린 주제를 기억했다가 다음에 그 부분을 집중 출제하는 적응형 튜터. 쓸수록 나에게 맞춰진다.',
          prompt:
            '파이썬으로 메모리 도구를 사용하는 국시 튜터를 만들어 줘. Anthropic API의 memory tool을 연결하고 memories 폴더에 파일로 저장하는 핸들러를 구현해. 튜터 규칙: 오답 시 주제·오답유형을 weak_topics.md에 기록, 세션 시작 시 취약 주제를 읽어 우선 출제, 3연속 정답이면 목록에서 제거. 대화형 CLI로 만들고 "내 취약 주제 보여줘" 명령도 지원해 줘.',
        },
        docs: 'https://platform.claude.com/docs/ko/agents-and-tools/tool-use/memory-tool',
      },
      {
        id: 'agent-3',
        emoji: '⚙️',
        title: '코드 실행 도구 — 계산은 코드에게',
        topic: '서버 측 코드 실행과 데이터 분석',
        lecture: [
          '언어 모델은 통계 계산을 "감"으로 하면 틀릴 수 있어. 코드 실행 도구를 켜면 Claude가 서버 샌드박스에서 파이썬 코드를 직접 짜서 실행하고 그 결과로 답해. 평균·표준편차·검정 같은 계산이 "말"이 아니라 "실행 결과"가 되는 거야.',
          '이건 서버 도구라서 내가 도구 루프를 구현할 필요 없이 요청에 도구를 추가하기만 하면 돼. 성적 데이터 분석, 그래프 생성, 통계 검정처럼 정확한 계산이 필요한 작업에 쓰면 좋아. Files API로 CSV를 올려두면 그 파일을 코드로 분석하게 할 수도 있어.',
        ],
        points: [
          '코드 실행 = 서버 샌드박스에서 파이썬을 실제 실행',
          '서버 도구라 클라이언트 루프 구현 불필요',
          '통계·그래프·데이터 변환은 감이 아닌 실행 결과로',
          'Files API와 조합해 업로드한 데이터 분석 가능',
        ],
        code: `resp = client.messages.create(
    model="claude-opus-4-8", max_tokens=4000,
    tools=[{"type": "code_execution_20250522",
            "name": "code_execution"}],
    messages=[{"role": "user", "content":
        "블록별 성적 CSV를 분석해서 과목별 평균과 표준편차를 구하고, "
        "지난 블록 대비 유의하게 하락한 과목이 있는지 "
        "t-검정으로 확인해 줘."}])
# 응답에는 실행된 코드와 실제 실행 결과가 함께 담긴다`,
        practice: {
          goal: '성적 분석 리포트 생성기 만들기',
          desc: '블록 성적 CSV를 넣으면 코드 실행 도구로 통계 분석과 그래프를 만들어 리포트로 주는 도구. 어느 과목에 시간을 쓸지 데이터로 정하자.',
          prompt:
            '파이썬으로 성적 분석 리포트 생성기를 만들어 줘. grades.csv(과목·블록·점수, 샘플 데이터 포함)를 Anthropic API 코드 실행 도구로 분석시켜: 과목별 평균/표준편차, 블록 간 추이, 가장 하락 폭이 큰 과목 top 3, 학습 시간 배분 제안을 담은 마크다운 리포트를 생성해. 모델이 실행한 코드도 리포트 부록에 포함시켜 줘.',
        },
        docs: 'https://platform.claude.com/docs/ko/agents-and-tools/tool-use/code-execution-tool',
      },
    ],
  },
  {
    id: 'ops',
    emoji: '🤖',
    title: '자동화 운영',
    desc: 'Managed Agents — 세션·권한·멀티에이전트 운영',
    lectures: [
      {
        id: 'ops-1',
        emoji: '☁️',
        title: 'Managed Agents — 클라우드에서 사는 에이전트',
        topic: '상태 유지 세션과 샌드박스',
        lecture: [
          '지금까지의 API 호출은 무상태였지만, Managed Agents는 클라우드 샌드박스 안에서 상태를 유지하는 세션으로 에이전트를 운영하는 방식이야. 에이전트가 파일을 만들고, 작업을 이어가고, 이벤트 스트림으로 진행 상황을 보고해. 내 컴퓨터가 꺼져 있어도 에이전트는 클라우드에서 일해.',
          '구성 요소: 에이전트 정의(역할·지침), 세션(작업 단위), 샌드박스(격리된 실행 환경), 스킬과 도구, 그리고 결과 정의. "매주 일요일 밤, 이번 주 오답을 정리해 요약 리포트를 만들어라" 같은 반복 작업을 예약 배포로 맡길 수 있어.',
        ],
        points: [
          'Managed Agents = 클라우드 샌드박스에서 상태 유지 세션으로 실행',
          '에이전트 정의 + 세션 + 샌드박스 + 스킬·도구로 구성',
          '이벤트 스트림·웹훅으로 진행 상황 관찰',
          '예약 배포로 반복 작업 자동화',
        ],
        code: `# 세션 시작 (개념 예시)
session = client.agents.sessions.create(
    agent="study-planner",
    input="이번 주 학습 기록을 분석해서 "
          "다음 주 일일 학습 계획을 plan.md로 만들어 줘",
)

# 이벤트 스트림으로 진행 관찰
for event in session.events():
    print(event.type, getattr(event, "summary", ""))
# 완료 후 샌드박스의 산출 파일을 다운로드`,
        practice: {
          goal: '주간 학습 플래너 에이전트 설계하기',
          desc: '내 학습 기록을 읽고 다음 주 계획을 짜 주는 에이전트의 정의서(역할·지침·결과물)를 작성하고 로컬 프로토타입을 만들어 보자.',
          prompt:
            '주간 학습 플래너 에이전트를 설계하고 로컬 프로토타입을 만들어 줘. (1) 에이전트 정의서(agent.md): 역할, 입력(학습 기록·시험 일정), 절차, 산출물(주간 계획 마크다운) 명세. (2) 파이썬 프로토타입: study_log.json과 exams.json을 읽어 Anthropic API로 다음 주 7일 계획(일별 과목·시간·우선순위)을 생성해 plan.md 저장. 계획 원칙은 "시험 임박 과목 우선, 하루 최대 3과목, 복습 주기 반영"으로.',
        },
        docs: 'https://platform.claude.com/docs/ko/managed-agents/overview',
      },
      {
        id: 'ops-2',
        emoji: '🛡️',
        title: '권한 정책 — 에이전트에게 줄 열쇠 고르기',
        topic: '권한 최소화와 보안 모델',
        lecture: [
          '자동으로 움직이는 에이전트에게 무엇을 허락할지는 보안의 핵심이야. 권한 정책은 에이전트가 할 수 있는 일(파일 접근, 네트워크, 도구 실행)을 명시적으로 제한하는 규칙이야. 원칙은 최소 권한 — 작업에 꼭 필요한 것만 허용하고 나머지는 기본 차단.',
          '샌드박스는 에이전트를 격리된 환경에 가둬 시스템 전체 접근을 막고, 위험한 작업(외부 전송, 삭제)은 승인 게이트를 거치게 할 수 있어. 프롬프트 인젝션(문서 안에 숨은 악성 지시)에도 대비해야 해 — 에이전트가 읽는 데이터는 명령이 아니라는 원칙을 지침에 박아 두고, 권한으로 이중 방어하는 거야.',
        ],
        points: [
          '최소 권한: 필요한 것만 허용, 기본은 차단',
          '샌드박스 격리 + 위험 작업 승인 게이트',
          '프롬프트 인젝션 대비 — 읽는 데이터는 명령이 아님',
          '허용 목록은 정기 점검하고 로그로 감사',
        ],
        code: `# 에이전트 권한 정책 (개념 예시)
permissions:
  filesystem:
    read:  ["./study_data/**"]   # 학습 데이터만 읽기
    write: ["./reports/**"]      # 리포트 폴더에만 쓰기
  network:
    allow: ["api.anthropic.com", "eutils.ncbi.nlm.nih.gov"]
  tools:
    denied: ["shell.rm", "shell.sudo"]
  approval_required:
    - "send_email"               # 외부 전송은 사람이 승인`,
        practice: {
          goal: '논문 브리핑 봇에 안전장치 두르기',
          desc: 'Day 14의 아침 논문 봇을 "권한 최소화" 원칙으로 재점검하고, 안전장치를 코드로 심어 보자.',
          prompt:
            '내 논문 브리핑 봇(morning_paper.py)에 보안 안전장치를 추가해 줘. (1) 접근 가능한 폴더를 briefs/와 topics.txt로 제한하는 경로 검증 함수, (2) 허용된 도메인(anthropic, pubmed) 외 네트워크 요청을 차단하는 래퍼, (3) 일일 API 호출 상한(20회)과 초과 시 중단, (4) 모든 동작을 남기는 감사 로그(audit.log). 마지막으로 이 봇의 권한 정책 문서(SECURITY.md)도 작성해 줘.',
        },
        docs: 'https://platform.claude.com/docs/ko/managed-agents/permission-policies',
      },
      {
        id: 'ops-3',
        emoji: '👥',
        title: '멀티에이전트 — 역할을 나눠 협업시키기',
        topic: '오케스트레이터-워커 패턴',
        lecture: [
          '큰 작업은 한 에이전트에게 다 시키는 것보다 역할을 나누는 게 나을 때가 많아. 멀티에이전트 오케스트레이션의 기본 패턴은 오케스트레이터-워커야: 지휘자 에이전트가 작업을 쪼개 분배하고, 워커들이 병렬로 처리하고, 결과를 모아 최종본을 만드는 구조.',
          '족보 해설 작업이라면 — 분류 워커(과목·주제 태깅), 해설 워커(문항별 해설 생성), 검수 워커(의학적 오류·모호함 점검)로 나눌 수 있어. 검수자를 생성자와 분리하는 게 핵심이야. 자기가 쓴 글은 자기 눈에 옳아 보이니까, 다른 컨텍스트의 에이전트가 검토해야 오류를 잡아. 대신 호출 수가 늘어 비용이 커지니 단계 수는 필요한 만큼만.',
        ],
        points: [
          '오케스트레이터가 분배, 워커가 병렬 처리, 결과 통합',
          '생성자와 검수자는 분리 — 교차 검증으로 오류 감소',
          '워커별 역할·입출력 형식을 명확히 정의',
          '단계가 늘수록 비용 증가 — 필요한 만큼만 분할',
        ],
        code: `# 오케스트레이터-워커 (개념 예시)
def orchestrate(questions):
    for q in questions:
        tag  = call_worker(CLASSIFIER_SYS, q)        # 1. 분류
        expl = call_worker(EXPLAINER_SYS, q, tag)    # 2. 해설
        review = call_worker(REVIEWER_SYS, q, expl)  # 3. 검수
        if review["ok"]:
            save(tag, q, expl)
        else:  # 검수 지적을 반영해 1회 재생성
            expl = call_worker(EXPLAINER_SYS, q, tag,
                               feedback=review["issues"])
            save(tag, q, expl, flagged=True)`,
        practice: {
          goal: '족보 해설 3단 파이프라인 만들기',
          desc: '분류 → 해설 → 검수 세 에이전트가 협업하는 파이프라인. 검수 에이전트가 해설의 오류를 잡아내는 걸 직접 확인해 보자.',
          prompt:
            '파이썬으로 족보 해설 멀티에이전트 파이프라인을 만들어 줘. 세 역할의 system 프롬프트를 분리해: (1) 분류자 — 문항을 과목·주제로 태깅(구조화 출력), (2) 해설자 — 정답과 선지별 해설 생성, (3) 검수자 — 해설의 의학적 오류·근거 부족을 지적하고 통과/재작성 판정(구조화 출력). 재작성 판정이면 지적사항을 반영해 1회 재생성하고, 문항별 결과를 explanations/ 폴더에 저장해. 샘플 문항 5개 포함.',
        },
        docs: 'https://platform.claude.com/docs/ko/managed-agents/multiagent-orchestration',
      },
    ],
  },
  {
    id: 'safety',
    emoji: '🔐',
    title: '운영·안전',
    desc: '비용 · 의료 데이터 · 오류 대응 — 오래 쓰는 시스템의 조건',
    lectures: [
      {
        id: 'safety-1',
        emoji: '💰',
        title: '사용량과 비용 관리 — 지갑을 지키는 설계',
        topic: 'usage 추적, 지출 한도, 비용 최적화',
        lecture: [
          'AI 도구를 오래 쓰려면 비용이 예측 가능해야 해. 기본기는 매 응답의 usage(입력·출력·캐시 토큰)를 로그로 남기는 것. 여기에 Console의 지출 한도를 설정하면 실수로 루프가 폭주해도 피해가 제한돼. 조직 단위로는 Usage & Cost API로 사용량을 조회할 수도 있어.',
          '비용 최적화 3대 도구는 이미 배웠어 — 프롬프트 캐싱(반복 프리픽스), 배치 처리(비실시간 대량 작업), 모델 선택(간단한 작업은 가벼운 모델). 여기에 max_tokens를 작업에 맞게 조이고, 컨텍스트를 필요한 만큼만 넣는 습관을 더하면 체감 비용이 크게 달라져.',
        ],
        points: [
          '모든 응답의 usage를 로그로 — 비용은 측정에서 시작',
          'Console 지출 한도로 폭주 사고 방어',
          '캐싱·배치·모델 선택이 3대 절감 수단',
          'max_tokens와 컨텍스트 크기를 작업에 맞게 조절',
        ],
        code: `import json, datetime

def log_usage(resp, task=""):
    u = resp.usage
    rec = {
        "at": datetime.datetime.now().isoformat(),
        "task": task,
        "in": u.input_tokens, "out": u.output_tokens,
        "cache_read": getattr(u, "cache_read_input_tokens", 0),
    }
    with open("usage_log.jsonl", "a") as f:
        f.write(json.dumps(rec) + "\\n")
    return rec

# 주간 리포트: jsonl을 집계해 작업별 토큰·예상 비용 출력`,
        practice: {
          goal: '내 API 사용량 대시보드 만들기',
          desc: '지금까지 만든 도구들의 사용량을 한 파일에 모으고, 주간 비용 리포트를 뽑는 대시보드를 만들자.',
          prompt:
            '파이썬으로 API 사용량 대시보드를 만들어 줘. (1) usage_logger.py: 어떤 스크립트에서든 import해서 응답 usage를 usage_log.jsonl에 기록하는 모듈. (2) report.py: 로그를 집계해 일별·작업별 토큰 사용량, 캐시 적중률, 모델별 단가 기준 예상 비용을 표로 출력하고 주간 추이를 텍스트 그래프로 보여줘. 일일 예산(예: $1) 초과 시 경고 표시도 넣어 줘.',
        },
        docs: 'https://platform.claude.com/docs/ko/admin/usage-cost-api',
      },
      {
        id: 'safety-2',
        emoji: '🏥',
        title: '의료 데이터와 개인정보 — 의대생의 특별 주의사항',
        topic: '데이터 보존, 익명화, 규정 준수',
        lecture: [
          '의대생이 AI를 쓸 때 가장 중요한 규칙: 환자 식별정보는 API에 보내지 않는다. 이름·등록번호·생년월일·연락처는 물론, 조합하면 특정 가능한 정보(희귀질환+지역+나이)도 조심해야 해. 실습 기록으로 AI 도구를 쓰고 싶다면 먼저 익명화하는 습관을 들여.',
          '플랫폼 차원에서는 데이터 보존 정책(전송 데이터가 얼마나 보관되는지), ZDR(Zero Data Retention) 계약, 데이터 레지던시(데이터가 저장되는 지역) 같은 개념이 있어. 지금은 "학습·연습 데이터는 가상 증례나 익명화된 것만" 원칙이면 충분하지만, 나중에 병원·연구에서 쓸 때는 기관의 IRB와 규정 준수 담당의 확인이 반드시 먼저야.',
        ],
        points: [
          '환자 식별정보는 절대 API에 전송하지 않기',
          '조합 식별 위험(희귀질환+지역+나이)까지 점검',
          '연습은 가상 증례·익명화 데이터로',
          '기관 데이터 활용은 IRB·규정 확인이 선행',
        ],
        code: `import re

MASKS = [
    (r"[가-힣]{2,4}(?=\\s*(님|씨|환자))", "[이름]"),
    (r"\\d{6}-\\d{7}", "[주민번호]"),
    (r"01[0-9]-\\d{3,4}-\\d{4}", "[연락처]"),
    (r"\\d{4}[-./]\\d{1,2}[-./]\\d{1,2}", "[날짜]"),
    (r"\\d{7,8}(?=\\s*(번|호|병록))", "[등록번호]"),
]

def deidentify(text):
    for pattern, repl in MASKS:
        text = re.sub(pattern, repl, text)
    return text

# API 호출 전 반드시: prompt = deidentify(raw_note)`,
        practice: {
          goal: '실습 기록 익명화 도구 만들기',
          desc: 'API에 보내기 전 실습 기록에서 식별정보를 자동 마스킹하는 전처리 도구. 모든 의료 AI 활용의 첫 관문이다.',
          prompt:
            '파이썬으로 의료 기록 익명화 도구를 만들어 줘. 텍스트에서 이름·주민번호·전화번호·날짜·병록번호를 정규식으로 마스킹하는 1차 처리 후, Anthropic API로 "남아 있는 식별 가능 정보(직업·지역·희귀질환 조합 등)"를 찾아 [식별위험] 태그를 붙이는 2차 검토를 수행해. 원본과 익명화본을 나란히 보여주고 사용자가 확인 후 저장하는 CLI로 만들어 줘. 가상 실습 기록 샘플 3개 포함.',
        },
        docs: 'https://platform.claude.com/docs/ko/admin/api-data-retention',
      },
      {
        id: 'safety-3',
        emoji: '🚑',
        title: '오류 대응과 안정성 — 무너지지 않는 도구 만들기',
        topic: '거부·폴백·재시도 설계',
        lecture: [
          '실전 도구는 "잘 될 때"가 아니라 "안 될 때"의 처리가 품질을 결정해. 세 가지 상황에 대비하자. (1) 거부(refusal): 안전상 응답을 거부하면 stop_reason이 refusal — 구조화 출력 보장도 깨지니 먼저 검사. (2) 잘림(max_tokens): 재시도하거나 이어쓰기. (3) 일시 오류(429/500): 지수 백오프로 재시도.',
          '재시도에도 규율이 필요해 — 최대 횟수를 정하고, 실패를 로그로 남기고, 최종 실패 시엔 사용자에게 정직하게 알려. 의학 도구라면 폴백이 특히 중요해: 모델이 답하지 못한 문항은 조용히 건너뛰지 말고 "해설 생성 실패 — 직접 확인 필요" 표시를 남겨야 학습 자료에 구멍이 안 생겨.',
        ],
        points: [
          'stop_reason 3종 대비: refusal / max_tokens / 일시 오류',
          '지수 백오프 + 최대 재시도 횟수 + 실패 로그',
          '실패는 조용히 삼키지 말고 명시적으로 표시',
          '의학 콘텐츠 실패 문항은 "직접 확인 필요" 플래그',
        ],
        code: `import time

def robust_call(fn, max_retries=3):
    for attempt in range(max_retries):
        try:
            resp = fn()
            if resp.stop_reason == "refusal":
                return {"ok": False, "why": "refused"}
            if resp.stop_reason == "max_tokens":
                return {"ok": False, "why": "truncated"}
            return {"ok": True, "resp": resp}
        except anthropic.RateLimitError:
            time.sleep(2 ** attempt)   # 1, 2, 4초 백오프
        except anthropic.APIStatusError as e:
            if e.status_code >= 500 and attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                return {"ok": False, "why": f"api_{e.status_code}"}
    return {"ok": False, "why": "max_retries"}`,
        practice: {
          goal: '견고한 API 래퍼 만들기 (졸업 과제)',
          desc: '지금까지 만든 모든 도구에 끼울 수 있는 재시도·폴백 래퍼 모듈. 이걸 만들면 네 도구들이 "가끔 되는 것"에서 "믿을 수 있는 것"이 된다.',
          prompt:
            '파이썬으로 재사용 가능한 Anthropic API 래퍼 모듈(robust_claude.py)을 만들어 줘. 기능: (1) 지수 백오프 재시도(429·5xx, 최대 3회), (2) stop_reason별 결과 분류(성공/거부/잘림), (3) 잘림 시 max_tokens 2배로 1회 자동 재시도, (4) 모든 호출·실패를 jsonl 로그로 기록, (5) 실패 항목 리스트를 리포트로 출력하는 함수. 기존 스크립트에 3줄 수정으로 적용 가능한 사용 예시와 함께 만들어 줘.',
        },
        docs: 'https://platform.claude.com/docs/ko/test-and-evaluate/strengthen-guardrails/handle-streaming-refusals',
      },
    ],
  },
];

/* ---------- 강의 진행 상태 ---------- */
const LECTURE_REWARD = 15; // 강의 완료 보상 ❄️
const TOTAL_LECTURES =
  LECTURES.length + ADVANCED_SECTORS.reduce((n, s) => n + s.lectures.length, 0);

const lectureState = {
  // 처음 연 날짜를 기억해 Day 1부터 시작
  startDate: localStorage.getItem('bingle_lecture_start') || '',
  doneDays: loadJSON('bingle_lecture_done', []),
  doneAdv: loadJSON('bingle_lecture_done_adv', []),
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* 시작일로부터 경과일 + 1 (상한 없음) */
function rawDayCount() {
  if (!lectureState.startDate) return 1;
  const start = new Date(lectureState.startDate + 'T00:00:00');
  const now = new Date(todayStr() + 'T00:00:00');
  return Math.max(1, Math.floor((now - start) / 86400000) + 1);
}

/* 오늘 열려 있는 기초 코스의 최대 Day */
function unlockedDay() {
  return Math.min(LECTURES.length, rawDayCount());
}

/* 심화 커리큘럼 오픈 조건: 2주 경과 또는 기초 14강 완주 */
function advancedUnlocked() {
  return rawDayCount() > LECTURES.length
    || lectureState.doneDays.length >= LECTURES.length;
}

function saveLectureState() {
  localStorage.setItem('bingle_lecture_done', JSON.stringify(lectureState.doneDays));
  localStorage.setItem('bingle_lecture_done_adv', JSON.stringify(lectureState.doneAdv));
}

/* 얼음동굴에서 쓰는 내 학습 현황 (app.js의 personStudy가 호출) */
function myStudyStatus() {
  return {
    done: lectureState.doneDays.length,
    total: LECTURES.length,
    today: lectureState.doneDays.includes(unlockedDay()),
  };
}

/* ---------- UI 요소 ---------- */
const lectureBody = $('#lecture-body');
const lectureFab = $('#lecture-fab');
const lectureSub = $('#lecture-sub');

/* 지금 보고 있는 강의: {type:'daily', day} 또는 {type:'adv', id} */
let currentLecture = { type: 'daily', day: 1 };
/* 강의 페이지에서 뒤로 갔을 때 돌아갈 뷰 (home 또는 curriculum) */
let lectureReturnTo = 'home';

function findAdvLecture(id) {
  for (const sector of ADVANCED_SECTORS) {
    const lec = sector.lectures.find((l) => l.id === id);
    if (lec) return { lec, sector };
  }
  return null;
}

/* 현재 강의의 렌더링 정보 통합 */
function currentInfo() {
  if (currentLecture.type === 'daily') {
    const day = currentLecture.day;
    const isToday = day === unlockedDay();
    return {
      lec: LECTURES[day - 1],
      done: lectureState.doneDays.includes(day),
      sub: `Day ${day} / ${LECTURES.length} · ${isToday ? '오늘의 과제' : '복습'}`,
      intro: isToday ? '오늘의 강의야! 5분만 집중해 봐.' : `Day ${day} 복습이구나. 좋은 습관이야!`,
      doneLabel: isToday ? '오늘 강의 완료!' : `Day ${day} 강의 완료!`,
    };
  }
  const found = findAdvLecture(currentLecture.id);
  return {
    lec: found.lec,
    done: lectureState.doneAdv.includes(found.lec.id),
    sub: `심화 · ${found.sector.emoji} ${found.sector.title}`,
    intro: '심화 강의야! 기초 코스를 지나온 너라면 문제없어.',
    doneLabel: '심화 강의 완료!',
  };
}

/* ---------- 렌더링 ---------- */
function lectureBadgeText() {
  return `${lectureState.doneDays.length}/${LECTURES.length}`;
}

function renderLectureFab() {
  const badge = $('#lecture-fab-badge');
  if (badge) badge.textContent = lectureBadgeText();
  lectureFab.classList.toggle('has-new', !lectureState.doneDays.includes(unlockedDay()));
}

function renderLecture() {
  const info = currentInfo();
  const lec = info.lec;

  lectureSub.textContent = info.sub;

  lectureBody.innerHTML = `
    <div class="lec-title-row">
      <span class="lec-emoji">${lec.emoji}</span>
      <div>
        <h3 class="lec-title">${lec.title}</h3>
        <p class="lec-topic">${lec.topic}</p>
      </div>
    </div>

    <div class="ice-line lec-intro">
      <img class="sprite sm mini-ice-sprite" src="assets/binglee/working.png" alt="빙글이" draggable="false" />
      <p>${info.intro}\n다 읽고 실습까지 하면 ❄️ ${LECTURE_REWARD}개 줄게.</p>
    </div>

    <div class="lec-section">
      <p class="lec-section-title">📖 강의</p>
      ${lec.lecture.map((p) => `<p class="lec-para">${p}</p>`).join('')}
    </div>

    <div class="lec-section">
      <p class="lec-section-title">💡 핵심 포인트</p>
      <ul class="lec-points">
        ${lec.points.map((p) => `<li>${p}</li>`).join('')}
      </ul>
    </div>

    <div class="lec-section">
      <p class="lec-section-title">🧑‍💻 코드 미리보기</p>
      <pre class="lec-code"><code>${escapeHTML(lec.code)}</code></pre>
    </div>

    <div class="lec-section lec-practice">
      <p class="lec-section-title">🩺 실습 — ${lec.practice.goal}</p>
      <p class="lec-para">${lec.practice.desc}</p>
      <div class="lec-prompt-box">
        <p class="lec-prompt-label">Claude Code에 붙여넣기 👇</p>
        <p class="lec-prompt">${lec.practice.prompt}</p>
        <button class="lec-copy-btn" id="lec-copy">📋 프롬프트 복사</button>
      </div>
    </div>

    <a class="lec-doc-link" href="${lec.docs}" target="_blank" rel="noopener">📚 공식 문서에서 더 알아보기 →</a>

    <button class="lec-done-btn ${info.done ? 'done' : ''}" id="lec-done" ${info.done ? 'disabled' : ''}>
      ${info.done ? '✓ 완료한 강의야!' : `${info.doneLabel} ❄️ +${LECTURE_REWARD}`}
    </button>`;

  $('#lec-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(lec.practice.prompt)
      .then(() => showToast('📋 실습 프롬프트를 복사했어! Claude Code에 붙여넣어 봐'))
      .catch(() => showToast('복사에 실패했어. 직접 드래그해서 복사해 줘'));
  });

  $('#lec-done').addEventListener('click', () => {
    const now = currentInfo();
    if (now.done) return;
    if (currentLecture.type === 'daily') lectureState.doneDays.push(currentLecture.day);
    else lectureState.doneAdv.push(currentLecture.id);
    saveLectureState();
    addCoins(LECTURE_REWARD);
    showToast(`🎓 강의 완료! ❄️ +${LECTURE_REWARD}`);
    if (typeof reactHappy === 'function') reactHappy();
    const totalDone = lectureState.doneDays.length + lectureState.doneAdv.length;
    if (lectureState.doneDays.length === LECTURES.length && currentLecture.type === 'daily') {
      say('와… 14일 기초 코스 완주! 이제 심화 커리큘럼도 열렸어 🎓', 4500);
      popHearts(7);
    } else if (totalDone === TOTAL_LECTURES) {
      say('전체 커리큘럼 완주?! 넌 이제 AI 만드는 의대생이야!! 🏆', 4500);
      popHearts(7);
    }
    renderLecture();
    renderLectureFab();
  });
}

function escapeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* 최초 오픈 시 시작일 기록 → 그날이 Day 1 */
function ensureStartDate() {
  if (!lectureState.startDate) {
    lectureState.startDate = todayStr();
    localStorage.setItem('bingle_lecture_start', lectureState.startDate);
    say('오늘부터 매일 AI 강의 하나씩! 내가 옆에서 같이 들을게 📚', 3600);
  }
}

/* 기초 강의 페이지 열기 */
function openLectureView(day, returnTo) {
  ensureStartDate();
  currentLecture = { type: 'daily', day: Math.max(1, Math.min(unlockedDay(), day)) };
  lectureReturnTo = returnTo;
  renderLecture();
  switchView('lecture');
  lectureBody.scrollTop = 0;
}

/* 심화 강의 페이지 열기 */
function openAdvLectureView(id, returnTo) {
  currentLecture = { type: 'adv', id };
  lectureReturnTo = returnTo;
  renderLecture();
  switchView('lecture');
  lectureBody.scrollTop = 0;
}

/* ============================================
   전체 학습 페이지 — 기초 14일 + 섹터별 심화
   ============================================ */
const curriculumList = $('#curriculum-list');

function dailyItemHTML(lec, maxDay) {
  const done = lectureState.doneDays.includes(lec.day);
  const isToday = lec.day === maxDay;
  const locked = lec.day > maxDay;
  const status = done ? '<span class="cur-status done">✓ 완료</span>'
    : isToday ? '<span class="cur-status today">오늘</span>'
    : locked ? `<span class="cur-status locked">🔒 D+${lec.day - maxDay}</span>`
    : '<span class="cur-status open">미완료</span>';
  return `
    <li>
      <button class="cur-item ${done ? 'is-done' : ''} ${isToday ? 'is-today' : ''} ${locked ? 'is-locked' : ''}"
        data-day="${lec.day}" ${locked ? 'aria-disabled="true"' : ''}>
        <span class="cur-emoji">${lec.emoji}</span>
        <span class="cur-body">
          <span class="cur-day">Day ${lec.day}</span>
          <span class="cur-title">${lec.title}</span>
          <span class="cur-topic">${lec.topic}</span>
        </span>
        ${status}
      </button>
    </li>`;
}

function advItemHTML(lec, sector, open) {
  const done = lectureState.doneAdv.includes(lec.id);
  const status = !open ? '<span class="cur-status locked">🔒</span>'
    : done ? '<span class="cur-status done">✓ 완료</span>'
    : '<span class="cur-status open">미완료</span>';
  return `
    <li>
      <button class="cur-item ${done ? 'is-done' : ''} ${open ? '' : 'is-locked'}"
        data-adv="${lec.id}" ${open ? '' : 'aria-disabled="true"'}>
        <span class="cur-emoji">${lec.emoji}</span>
        <span class="cur-body">
          <span class="cur-day">${sector.emoji} ${sector.title}</span>
          <span class="cur-title">${lec.title}</span>
          <span class="cur-topic">${lec.topic}</span>
        </span>
        ${status}
      </button>
    </li>`;
}

function renderCurriculum() {
  ensureStartDate();
  const maxDay = unlockedDay();
  const advOpen = advancedUnlocked();
  const totalDone = lectureState.doneDays.length + lectureState.doneAdv.length;
  $('#curriculum-progress').textContent = `${totalDone}/${TOTAL_LECTURES}`;

  const sectorsHTML = ADVANCED_SECTORS.map((sector) => {
    const doneCnt = sector.lectures.filter((l) => lectureState.doneAdv.includes(l.id)).length;
    return `
      <div class="cur-sector ${advOpen ? '' : 'is-locked'}">
        <div class="cur-sector-head">
          <p class="cur-sector-title">${sector.emoji} ${sector.title}</p>
          <span class="cur-sector-count">${advOpen ? `${doneCnt}/${sector.lectures.length}` : '🔒'}</span>
        </div>
        <p class="cur-sector-desc">${sector.desc}</p>
        <ul class="cur-list">
          ${sector.lectures.map((l) => advItemHTML(l, sector, advOpen)).join('')}
        </ul>
      </div>`;
  }).join('');

  curriculumList.innerHTML = `
    <div class="ice-line cur-intro">
      <img class="sprite sm mini-ice-sprite" src="assets/binglee/working.png" alt="빙글이" draggable="false" />
      <p>처음 2주는 하루 하나씩 기초 코스,\n그다음엔 섹터별 심화 커리큘럼이 열려!</p>
    </div>

    <div class="cur-sector">
      <div class="cur-sector-head">
        <p class="cur-sector-title">🗓️ 14일 기초 코스</p>
        <span class="cur-sector-count">${lectureState.doneDays.length}/${LECTURES.length}</span>
      </div>
      <p class="cur-sector-desc">하루 하나 — API 첫 호출부터 자동화 봇까지</p>
      <ul class="cur-list">
        ${LECTURES.map((lec) => dailyItemHTML(lec, maxDay)).join('')}
      </ul>
    </div>

    ${advOpen ? '' : `
      <div class="cur-adv-notice">
        🔒 심화 커리큘럼은 <b>2주가 지나면</b> (또는 기초 14강을 모두 완료하면) 열려!
      </div>`}
    ${sectorsHTML}`;

  curriculumList.querySelectorAll('.cur-item[data-day]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const day = Number(btn.dataset.day);
      if (day > unlockedDay()) {
        showToast(`🔒 Day ${day}는 ${day - unlockedDay()}일 뒤에 열려! 하루에 하나씩이야`);
        return;
      }
      openLectureView(day, 'curriculum');
    });
  });

  curriculumList.querySelectorAll('.cur-item[data-adv]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!advancedUnlocked()) {
        showToast('🔒 심화는 기초 14일 코스가 끝나면 열려!');
        return;
      }
      openAdvLectureView(btn.dataset.adv, 'curriculum');
    });
  });
}

/* ---------- 이벤트 연결 ---------- */
// 우상단 📚 버튼 = 오늘의 과제 전용 (항상 오늘 강의로)
lectureFab.addEventListener('click', () => openLectureView(unlockedDay(), 'home'));
$('#lecture-back').addEventListener('click', () => switchView(lectureReturnTo));

renderLectureFab();
