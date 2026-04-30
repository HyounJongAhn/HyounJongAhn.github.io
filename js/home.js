import { getJson, renderRank, signalCard, number, dateTime, formatInsightLine } from '/js/common.js';

const data = await getJson('/data/ransomware-summary.json');
const CLASS_COLORS = {
  confirmed_incident: '#ff6b6b',
  incident_under_review: '#ffb347',
  trend_signal: '#4587ff',
  official_notice: '#4f7cff',
  law_enforcement: '#7b61ff',
  recovery: '#39b980'
};
const CLASS_LABELS = {
  confirmed_incident: '확정 피해사례',
  incident_under_review: '확인 필요 사고',
  trend_signal: '추세·동향',
  official_notice: '공식 공지',
  law_enforcement: '법집행',
  recovery: '복구도구'
};

const kpis = [
  ['전체 기사', data.overview.totalArticles, `${number.format(data.overview.uniquePublishers)}개 매체`],
  ['그룹 식별 기사', data.overview.groupKnownArticles, '그룹명이 식별된 항목'],
  ['확정 피해사례', data.overview.confirmedIncidents, '실제 피해주체 확인'],
  ['검토 필요 사고', data.overview.reviewIncidents, '조직명은 있으나 추가 검증 필요'],
  ['추세·동향', data.overview.trendSignals, '동향/활동량 중심'],
  ['공식 공지', data.overview.officialNotices, '권고/경보/보도자료'],
  ['법집행', data.overview.lawEnforcement, '체포/압수/기소'],
  ['최근 30일 기사', data.hero.articleCount, '상단 핫 그룹/원형 차트 기준']
];

document.querySelector('#generatedAt').textContent = dateTime.format(new Date(data.site.generatedAt));
document.querySelector('#periodLabel').textContent = `${data.site.period.from.slice(0, 10)} ~ ${data.site.period.to.slice(0, 10)}`;

const hero = data.hero;
const hotLead = hero.hotGroups[0];
document.querySelector('#heroDonutTotal').textContent = number.format(hero.articleCount);
document.querySelector('#heroTopline').textContent = hotLead ? `${hotLead.label}` : '아직 데이터 없음';
document.querySelector('#heroTopmeta').textContent = hotLead ? `${hero.hotWindowLabel} 기사 ${number.format(hotLead.value)}건 · 사건 연결 ${number.format(hotLead.incidentCount)}건 · 클러스터 ${number.format(hotLead.clusterCount)}건` : `${hero.hotWindowLabel} 기준 집계 대기`;
document.querySelector('#heroHotLead').textContent = hotLead ? `${hotLead.label}` : '아직 데이터 없음';
document.querySelector('#heroHotSub').textContent = hotLead ? `${hero.hotWindowLabel} 기사 ${number.format(hotLead.value)}건 · 사건 연결 ${number.format(hotLead.incidentCount)}건` : `${hero.hotWindowLabel} 기준 집계 대기`;
document.querySelector('#heroHotGroups').innerHTML = hero.hotGroups.map((group, index) => `
  <div class="hot-group-chip ${index === 0 ? 'is-lead' : ''}">
    <span class="hot-group-name">${group.label}</span>
    <strong>${number.format(group.value)}건</strong>
  </div>
`).join('');

const donutNode = document.querySelector('#heroDonut');
const legendNode = document.querySelector('#heroLegend');
const mixEntries = Object.entries(hero.classMix).filter(([, value]) => value > 0);
const total = mixEntries.reduce((sum, [, value]) => sum + value, 0) || 1;
let offset = 0;
const radius = 42;
const circumference = 2 * Math.PI * radius;
donutNode.innerHTML = [`<circle cx="60" cy="60" r="42" fill="none" stroke="rgba(124,150,186,0.16)" stroke-width="14"></circle>`].concat(mixEntries.map(([key, value]) => {
  const length = (value / total) * circumference;
  const circle = `<circle cx="60" cy="60" r="42" fill="none" stroke="${CLASS_COLORS[key]}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)"></circle>`;
  offset += length;
  return circle;
})).join('');
legendNode.innerHTML = mixEntries.map(([key, value]) => `
  <div class="legend-row">
    <span class="legend-swatch" style="background:${CLASS_COLORS[key]}"></span>
    <span>${CLASS_LABELS[key]}</span>
    <strong>${number.format(value)}</strong>
  </div>
`).join('');

document.querySelector('#kpiGrid').innerHTML = kpis.map(([label, value, note]) => `
  <article class="card kpi-card">
    <div class="kpi-label">${label}</div>
    <div class="kpi-value">${typeof value === 'number' ? number.format(value) : value}</div>
    <div class="kpi-note">${note}</div>
  </article>
`).join('');

document.querySelector('#insightList').innerHTML = data.insights.map((line) => `<li>${formatInsightLine(line)}</li>`).join('');
document.querySelector('#timelineBody').innerHTML = data.monthlyTimeline.map((row) => `
  <tr>
    <td>${row.month}</td>
    <td>${number.format(row.confirmed_incident)}</td>
    <td>${number.format(row.incident_under_review)}</td>
    <td>${number.format(row.trend_signal)}</td>
    <td>${number.format(row.official_notice)}</td>
    <td>${number.format(row.law_enforcement)}</td>
    <td>${number.format(row.recovery)}</td>
  </tr>
`).join('');

renderRank('#groupsAll', data.topGroupsAllArticles);
renderRank('#groupsCluster', data.topGroupsByCluster);
renderRank('#groupsIncident', data.topIncidentGroups);
renderRank('#countryRank', data.topCountriesIncident);
renderRank('#industryRank', data.topIndustriesIncident);
renderRank('#publisherRank', data.topPublishers);

document.querySelector('#recentSignals').innerHTML = data.recentSignals.map(signalCard).join('');

const helpFab = document.querySelector('#helpFab');
const helpDrawer = document.querySelector('#helpDrawer');
const helpClose = document.querySelector('#helpClose');

function setHelpOpen(open) {
  helpDrawer.hidden = !open;
  helpFab.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('help-open', open);
}

helpFab?.addEventListener('click', () => setHelpOpen(helpDrawer.hidden));
helpClose?.addEventListener('click', () => setHelpOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setHelpOpen(false);
});
