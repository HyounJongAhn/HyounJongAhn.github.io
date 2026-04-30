import { getJson, renderRank, signalCard, number, dateTime, formatInsightLine } from '/js/common.js';

const data = await getJson('/data/ransomware-summary.json');

const kpis = [
  ['전체 기사', data.overview.totalArticles, `${number.format(data.overview.uniquePublishers)}개 매체`],
  ['그룹 식별 기사', data.overview.groupKnownArticles, '그룹명이 식별된 항목'],
  ['확정 피해사례', data.overview.confirmedIncidents, '실제 피해주체 확인'],
  ['검토 필요 사고', data.overview.reviewIncidents, '조직명은 있으나 추가 검증 필요'],
  ['추세·동향', data.overview.trendSignals, '동향/활동량 중심'],
  ['공식 공지', data.overview.officialNotices, '권고/경보/보도자료'],
  ['법집행', data.overview.lawEnforcement, '체포/압수/기소'],
  ['공개 기준', '정적 공유판', '동적 내부 사이트와 분리']
];

document.querySelector('#generatedAt').textContent = dateTime.format(new Date(data.site.generatedAt));
document.querySelector('#periodLabel').textContent = `${data.site.period.from.slice(0, 10)} ~ ${data.site.period.to.slice(0, 10)}`;
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
