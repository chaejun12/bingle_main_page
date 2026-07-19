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

/* ---------- 강의 진행 상태 ---------- */
const LECTURE_REWARD = 15; // 강의 완료 보상 ❄️

const lectureState = {
  // 처음 연 날짜를 기억해 Day 1부터 시작
  startDate: localStorage.getItem('bingle_lecture_start') || '',
  doneDays: loadJSON('bingle_lecture_done', []),
  viewing: 1, // 현재 보고 있는 Day
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* 오늘 열려 있는 최대 Day (시작일로부터 경과일 + 1, 커리큘럼 길이로 제한) */
function unlockedDay() {
  if (!lectureState.startDate) return 1;
  const start = new Date(lectureState.startDate + 'T00:00:00');
  const now = new Date(todayStr() + 'T00:00:00');
  const diff = Math.floor((now - start) / 86400000);
  return Math.max(1, Math.min(LECTURES.length, diff + 1));
}

function saveLectureState() {
  localStorage.setItem('bingle_lecture_done', JSON.stringify(lectureState.doneDays));
}

/* ---------- UI 요소 ---------- */
const lectureBody = $('#lecture-body');
const lectureFab = $('#lecture-fab');
const lectureSub = $('#lecture-sub');
const lectureView = $('#view-lecture');

/* 강의 페이지에서 뒤로 갔을 때 돌아갈 뷰 (home 또는 curriculum) */
let lectureReturnTo = 'home';

/* ---------- 렌더링 ---------- */
function lectureBadgeText() {
  return `${lectureState.doneDays.length}/${LECTURES.length}`;
}

function renderLectureFab() {
  const badge = $('#lecture-fab-badge');
  if (badge) badge.textContent = lectureBadgeText();
  const today = unlockedDay();
  lectureFab.classList.toggle('has-new', !lectureState.doneDays.includes(today));
}

function renderLecture() {
  const maxDay = unlockedDay();
  const lec = LECTURES[lectureState.viewing - 1];
  const isToday = lectureState.viewing === maxDay;
  const done = lectureState.doneDays.includes(lec.day);

  lectureSub.textContent = isToday
    ? `Day ${lec.day} / ${LECTURES.length} · 오늘의 과제`
    : `Day ${lec.day} / ${LECTURES.length} · 복습`;

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
      <p>${isToday ? '오늘의 강의야! 5분만 집중해 봐.' : `Day ${lec.day} 복습이구나. 좋은 습관이야!`}\n다 읽고 실습까지 하면 ❄️ ${LECTURE_REWARD}개 줄게.</p>
    </div>

    <div class="lec-section">
      <p class="lec-section-title">📖 오늘의 강의</p>
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
      <p class="lec-section-title">🩺 오늘의 실습 — ${lec.practice.goal}</p>
      <p class="lec-para">${lec.practice.desc}</p>
      <div class="lec-prompt-box">
        <p class="lec-prompt-label">Claude Code에 붙여넣기 👇</p>
        <p class="lec-prompt">${lec.practice.prompt}</p>
        <button class="lec-copy-btn" id="lec-copy">📋 프롬프트 복사</button>
      </div>
    </div>

    <a class="lec-doc-link" href="${lec.docs}" target="_blank" rel="noopener">📚 공식 문서에서 더 알아보기 →</a>

    <button class="lec-done-btn ${done ? 'done' : ''}" id="lec-done" ${done ? 'disabled' : ''}>
      ${done ? '✓ 완료한 강의야!' : `${isToday ? '오늘' : `Day ${lec.day}`} 강의 완료! ❄️ +${LECTURE_REWARD}`}
    </button>`;

  $('#lec-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(lec.practice.prompt)
      .then(() => showToast('📋 실습 프롬프트를 복사했어! Claude Code에 붙여넣어 봐'))
      .catch(() => showToast('복사에 실패했어. 직접 드래그해서 복사해 줘'));
  });

  $('#lec-done').addEventListener('click', () => {
    if (lectureState.doneDays.includes(lec.day)) return;
    lectureState.doneDays.push(lec.day);
    saveLectureState();
    addCoins(LECTURE_REWARD);
    showToast(`🎓 Day ${lec.day} 강의 완료! ❄️ +${LECTURE_REWARD}`);
    if (typeof reactHappy === 'function') reactHappy();
    if (lectureState.doneDays.length === LECTURES.length) {
      say('와… 14일 커리큘럼 전부 완주?! 넌 이제 AI 쓰는 의대생이야! 🎓', 4500);
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

/* 강의 페이지 열기 — day 강의를 보여주고, 뒤로 가면 returnTo 뷰로 복귀 */
function openLectureView(day, returnTo) {
  ensureStartDate();
  lectureState.viewing = Math.max(1, Math.min(unlockedDay(), day));
  lectureReturnTo = returnTo;
  renderLecture();
  switchView('lecture');
  lectureBody.scrollTop = 0;
}

/* ============================================
   전체 학습 페이지 — 14일 커리큘럼 목록
   ============================================ */
const curriculumList = $('#curriculum-list');

function renderCurriculum() {
  ensureStartDate();
  const maxDay = unlockedDay();
  $('#curriculum-progress').textContent = lectureBadgeText();

  curriculumList.innerHTML = `
    <div class="ice-line cur-intro">
      <img class="sprite sm mini-ice-sprite" src="assets/binglee/working.png" alt="빙글이" draggable="false" />
      <p>하루에 하나씩 열리는 14일 커리큘럼이야.\n완료한 강의는 언제든 다시 볼 수 있어!</p>
    </div>
    <ul class="cur-list">
      ${LECTURES.map((lec) => {
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
      }).join('')}
    </ul>`;

  curriculumList.querySelectorAll('.cur-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const day = Number(btn.dataset.day);
      if (day > unlockedDay()) {
        showToast(`🔒 Day ${day}는 ${day - unlockedDay()}일 뒤에 열려! 하루에 하나씩이야`);
        return;
      }
      openLectureView(day, 'curriculum');
    });
  });
}

/* ---------- 이벤트 연결 ---------- */
// 우상단 📚 버튼 = 오늘의 과제 전용 (항상 오늘 강의로)
lectureFab.addEventListener('click', () => openLectureView(unlockedDay(), 'home'));
$('#lecture-back').addEventListener('click', () => switchView(lectureReturnTo));

renderLectureFab();
