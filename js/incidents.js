import { getJson, renderRank, signalCard } from '/js/common.js';

const { items } = await getJson('/data/ransomware-articles.json');
const confirmed = items.filter((item) => item.primaryClass === 'confirmed_incident').slice(0, 80);
const review = items.filter((item) => item.primaryClass === 'incident_under_review').slice(0, 80);
const groupMap = new Map();
for (const item of items.filter((item) => (item.primaryClass === 'confirmed_incident' || item.primaryClass === 'incident_under_review') && item.ransomwareGroup !== '미상')) {
  groupMap.set(item.ransomwareGroup, (groupMap.get(item.ransomwareGroup) || 0) + 1);
}
const groups = [...groupMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([label, value]) => ({ label, value }));

document.querySelector('#confirmedList').innerHTML = confirmed.map(signalCard).join('');
document.querySelector('#reviewList').innerHTML = review.map(signalCard).join('');
renderRank('#incidentGroups', groups);
