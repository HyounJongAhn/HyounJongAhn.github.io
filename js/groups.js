import { fillSelect, getJson, renderRank, signalCard, number } from '/js/common.js';

const data = await getJson('/data/ransomware-groups.json');
let profiles = [...data.profiles];
const select = document.querySelector('#groupSelect');
const sortSelect = document.querySelector('#groupSort');

function refillGroups(current) {
  fillSelect(select, profiles.map((profile) => profile.group), '그룹 선택');
  select.value = current && profiles.some((profile) => profile.group === current) ? current : (profiles[0]?.group || '');
}

function sortProfiles() {
  profiles.sort((a, b) => {
    switch (sortSelect.value) {
      case 'incidents_desc': return b.incidentCount - a.incidentCount || b.allArticles - a.allArticles;
      case 'recent_desc': return b.last90 - a.last90 || b.allArticles - a.allArticles;
      case 'name': return a.group.localeCompare(b.group);
      default: return b.allArticles - a.allArticles || a.group.localeCompare(b.group);
    }
  });
}

sortProfiles();
refillGroups();

function renderKpis(profile) {
  document.querySelector('#groupKpis').innerHTML = [
    ['전체 기사', profile.allArticles, '이 그룹이 언급된 전체 기사 수'],
    ['사건 클러스터', profile.clusterCount, '중복 정리 후 사건 기준'],
    ['사건 직접 연결', profile.incidentCount, '피해사례/검토중 사고 연결 수'],
    ['최근 90일', profile.last90, '최근 90일 기사 수']
  ].map(([label, value, note]) => `
    <article class="card kpi-card">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${number.format(value)}</div>
      <div class="kpi-note">${note}</div>
    </article>
  `).join('');
}

function renderProfile(profile) {
  document.querySelector('#groupTitle').textContent = profile.group;
  document.querySelector('#groupPeriod').textContent = `first seen ${profile.firstSeen} · last seen ${profile.lastSeen}`;
  renderKpis(profile);
  renderRank('#groupCountries', profile.topCountries);
  renderRank('#groupIndustries', profile.topIndustries);
  document.querySelector('#groupRecentArticles').innerHTML = profile.recentArticles.map(signalCard).join('');
  document.querySelector('#groupIncidents').innerHTML = profile.relatedIncidents.length
    ? profile.relatedIncidents.map(signalCard).join('')
    : '<div class="empty-state">직접 연결된 피해사례가 아직 많지 않습니다.</div>';
}

select.addEventListener('input', () => {
  const profile = profiles.find((entry) => entry.group === select.value);
  if (profile) renderProfile(profile);
});

sortSelect.addEventListener('input', () => {
  const current = select.value;
  sortProfiles();
  refillGroups(current);
  const profile = profiles.find((entry) => entry.group === select.value);
  if (profile) renderProfile(profile);
});

if (profiles[0]) renderProfile(profiles[0]);
