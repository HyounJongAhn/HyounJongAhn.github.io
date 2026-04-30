import { getJson, renderRank, signalCard, number } from '/js/common.js';

const summary = await getJson('/data/ransomware-summary.json');
const archive = await getJson('/data/ransomware-articles.json');
const trends = await getJson('/data/ransomware-trends.json');

const latest = summary.monthlyTimeline.at(-1);
const month = latest.month;
const monthItems = archive.items.filter((item) => item.date.startsWith(month));
const knownGroups = monthItems.filter((item) => item.ransomwareGroup !== '미상');
const groupMap = new Map();
for (const item of knownGroups) groupMap.set(item.ransomwareGroup, (groupMap.get(item.ransomwareGroup) || 0) + 1);
const topMonthGroups = [...groupMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
const insights = [
  `${month} 기준 기사 ${number.format(monthItems.length)}건이 집계되었습니다.`,
  `확정 피해사례 ${number.format(latest.confirmed_incident)}건, 확인 필요 사고 ${number.format(latest.incident_under_review)}건입니다.`,
  `추세/동향 ${number.format(latest.trend_signal)}건, 법집행 ${number.format(latest.law_enforcement)}건, 공식공지 ${number.format(latest.official_notice)}건입니다.`
];

document.querySelector('#briefMonth').textContent = `${month} 월간 브리프`;
document.querySelector('#briefInsights').innerHTML = insights.map((line) => `<li>${line}</li>`).join('');
document.querySelector('#briefKpis').innerHTML = [
  ['이번 달 기사', monthItems.length, '최신 월 기준'],
  ['확정 피해', latest.confirmed_incident, 'confirmed incident'],
  ['확인 필요', latest.incident_under_review, 'under review'],
  ['그룹 식별 기사', knownGroups.length, '이번 달 그룹명이 잡힌 기사']
].map(([label, value, note]) => `
  <article class="card kpi-card">
    <div class="kpi-label">${label}</div>
    <div class="kpi-value">${number.format(value)}</div>
    <div class="kpi-note">${note}</div>
  </article>
`).join('');

renderRank('#briefGroups', topMonthGroups);
renderRank('#briefClassRows', [
  { label: '확정 피해사례', value: latest.confirmed_incident },
  { label: '확인 필요 사고', value: latest.incident_under_review },
  { label: '추세/동향', value: latest.trend_signal },
  { label: '공식공지', value: latest.official_notice },
  { label: '법집행', value: latest.law_enforcement },
  { label: '복구도구', value: latest.recovery }
]);

document.querySelector('#briefSignals').innerHTML = monthItems.slice(0, 18).map(signalCard).join('');
