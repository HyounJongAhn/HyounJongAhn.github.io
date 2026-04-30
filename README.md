# HyounJongAhn.github.io

공개 공유용 정적 랜섬웨어 브리프 사이트입니다.

## 구조
- `index.html`, `styles.css`, `app.js`: GitHub Pages에서 바로 서비스되는 정적 프론트엔드
- `data/ransomware-summary.json`: 공개용 통계 스냅샷
- `scripts/build-data.mjs`: 내부 운영용 `dfir-trend-radar` 데이터에서 공개용 스냅샷 생성

## 업데이트
```bash
cd /Users/hyounjong/.openclaw/workspace/HyounJongAhn.github.io
npm run build:data
```

그 뒤 변경사항을 커밋/푸시하면 GitHub Pages에서 바로 반영됩니다.
