"""
빙글이 냉장고 꾸미기 — 바닥/벽 타일 생성 스크립트
캐릭터(파스텔 얼음 큐브)와 어울리는 팔레트로 6개 테마의
isometric 바닥 타일 + 매칭 벽 타일을 SVG로 생성한다.
"""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FLOOR_DIR = os.path.join(BASE_DIR, "assets", "decor", "floors")
WALL_DIR = os.path.join(BASE_DIR, "assets", "decor", "walls")

# 테마별 팔레트: light(상단 하이라이트) / base(기본) / shadow(그림자) / outline(테두리)
THEMES = {
    "ice":    dict(light="#eaf8ff", base="#b9e5f8", shadow="#7ec8ea", outline="#5fb4dd", label="얼음"),
    "snow":   dict(light="#ffffff", base="#eef6fb", shadow="#cfe6f2", outline="#a9cfe2", label="포근한 눈"),
    "mint":   dict(light="#e6faf0", base="#bdf0d9", shadow="#8bd9b8", outline="#5fc797", label="민트 힐링"),
    "berry":  dict(light="#f4e9ff", base="#e3d2f5", shadow="#c7a6ea", outline="#a679d9", label="베리 라벤더"),
    "wood":   dict(light="#fbeed0", base="#f0dcb0", shadow="#d9bd80", outline="#c2a05c", label="코지 우드"),
    "slate":  dict(light="#e9eef2", base="#c7d0da", shadow="#9aa8b5", outline="#798a99", label="동굴 슬레이트"),
}


def floor_svg(p):
    """isometric 다이아몬드 바닥 타일 (48x48, 4분할 음영으로 입체감)"""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges">
  <polygon points="24,2 46,24 24,24 24,24" fill="{p['light']}"/>
  <polygon points="24,2 46,24 24,24" fill="{p['light']}"/>
  <polygon points="46,24 24,46 24,24" fill="{p['base']}"/>
  <polygon points="24,46 2,24 24,24" fill="{p['shadow']}"/>
  <polygon points="2,24 24,2 24,24" fill="{p['base']}"/>
  <polygon points="24,2 46,24 24,46 2,24" fill="none" stroke="{p['outline']}" stroke-width="2" stroke-linejoin="round"/>
</svg>'''


def wall_svg(p):
    """정면 얼음 블록 벽 타일 (48x48, 베벨 + 반짝임 포인트)"""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges">
  <rect x="1" y="1" width="46" height="46" rx="6" fill="{p['base']}" stroke="{p['outline']}" stroke-width="2"/>
  <path d="M7 9 Q7 7 9 7 L30 7 L11 26 Q9 26 9 24 Z" fill="{p['light']}" opacity="0.65"/>
  <path d="M41 39 Q41 41 39 41 L18 41 L37 22 Q39 22 39 24 Z" fill="{p['shadow']}" opacity="0.55"/>
  <path d="M35 10 L37 15 L42 17 L37 19 L35 24 L33 19 L28 17 L33 15 Z" fill="#ffffff" opacity="0.85"/>
  <rect x="1" y="1" width="46" height="46" rx="6" fill="none" stroke="{p['outline']}" stroke-width="2"/>
</svg>'''


os.makedirs(FLOOR_DIR, exist_ok=True)
os.makedirs(WALL_DIR, exist_ok=True)

for key, palette in THEMES.items():
    with open(os.path.join(FLOOR_DIR, f"{key}.svg"), "w", encoding="utf-8") as f:
        f.write(floor_svg(palette))
    with open(os.path.join(WALL_DIR, f"{key}.svg"), "w", encoding="utf-8") as f:
        f.write(wall_svg(palette))

print(f"generated {len(THEMES)} floor + {len(THEMES)} wall tiles")
for k, v in THEMES.items():
    print(f"  {k}: {v['label']}")
