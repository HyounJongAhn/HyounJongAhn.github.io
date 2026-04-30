import { getJson, renderRank, signalCard } from '/js/common.js';

const { items } = await getJson('/data/ransomware-articles.json');
const sortSelect = document.querySelector('#incidentSort');
const incidentItems = items.filter((item) => item.primaryClass === 'confirmed_incident' || item.primaryClass === 'incident_under_review');

function sortItems(list) {
  return [...list].sort((a, b) => {
    switch (sortSelect.value) {
      case 'date_asc': return a.date.localeCompare(b.date);
      case 'group': return (a.ransomwareGroup || '').localeCompare(b.ransomwareGroup || '') || b.date.localeCompare(a.date);
      case 'country': return (a.country || '').localeCompare(b.country || '') || b.date.localeCompare(a.date);
      default: return b.date.localeCompare(a.date);
    }
  });
}

function render() {
  const sorted = sortItems(incidentItems);
  const confirmed = sorted.filter((item) => item.primaryClass === 'confirmed_incident').slice(0, 80);
  const review = sorted.filter((item) => item.primaryClass === 'incident_under_review').slice(0, 80);
  const groupMap = new Map();
  for (const item of incidentItems.filter((item) => item.ransomwareGroup !== '미상')) {
    groupMap.set(item.ransomwareGroup, (groupMap.get(item.ransomwareGroup) || 0) + 1);
  }
  const groups = [...groupMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([label, value]) => ({ label, value }));
  document.querySelector('#confirmedList').innerHTML = confirmed.map(signalCard).join('');
  document.querySelector('#reviewList').innerHTML = review.map(signalCard).join('');
  renderRank('#incidentGroups', groups);
}

sortSelect.addEventListener('input', render);
render();
