# HyounJongAhn.github.io

공개 공유용 정적 랜섬웨어 브리프 사이트입니다.

## 페이지
- `/` 개요/요약
- `/archive/` 전체 기사 아카이브
- `/incidents/` 피해사례 브리프
- `/trends/` 동향/신규 이슈

## 구조
- `index.html`, `archive/`, `incidents/`, `trends/`: GitHub Pages에서 바로 서비스되는 정적 페이지
- `data/*.json`: 공개용 통계/기사/동향 스냅샷
- `scripts/build-data.mjs`: 내부 운영용 `dfir-trend-radar` 데이터에서 공개용 정적 데이터 생성
- `scripts/publish.mjs`: 데이터 생성 → git commit → push 자동화

## 업데이트
```bash
cd /Users/hyounjong/.openclaw/workspace/HyounJongAhn.github.io
npm run publish:site
```

또는 동적 작업 repo에서:
```bash
cd /Users/hyounjong/.openclaw/workspace/dfir-trend-radar
npm run pages:publish
```
