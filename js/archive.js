import { fillSelect, getJson, signalCard, number } from '/js/common.js';

const { items, total } = await getJson('/data/ransomware-articles.json');
const controls = {
  q: document.querySelector('#filterQ'),
  primaryClass: document.querySelector('#filterClass'),
  ransomwareGroup: document.querySelector('#filterGroup'),
  country: document.querySelector('#filterCountry'),
  industry: document.querySelector('#filterIndustry')
};

fillSelect(controls.primaryClass, [...new Set(items.map((item) => item.primaryLabel))].filter(Boolean).sort(), '전체 분류');
fillSelect(controls.ransomwareGroup, [...new Set(items.map((item) => item.ransomwareGroup).filter((x) => x && x !== '미상'))].sort(), '전체 그룹');
fillSelect(controls.country, [...new Set(items.map((item) => item.country).filter((x) => x && x !== '미상'))].sort(), '전체 국가');
fillSelect(controls.industry, [...new Set(items.map((item) => item.industry).filter((x) => x && x !== '미상'))].sort(), '전체 산업');

function render() {
  const q = controls.q.value.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (q && !`${item.title} ${item.publisher} ${item.ransomwareGroup} ${item.victimOrg}`.toLowerCase().includes(q)) return false;
    if (controls.primaryClass.value && item.primaryLabel !== controls.primaryClass.value) return false;
    if (controls.ransomwareGroup.value && item.ransomwareGroup !== controls.ransomwareGroup.value) return false;
    if (controls.country.value && item.country !== controls.country.value) return false;
    if (controls.industry.value && item.industry !== controls.industry.value) return false;
    return true;
  });
  document.querySelector('#archiveCount').textContent = `${number.format(filtered.length)} / ${number.format(total)}`;
  document.querySelector('#archiveList').innerHTML = filtered.slice(0, 300).map((item) => signalCard(item)).join('');
}

Object.values(controls).forEach((node) => node.addEventListener('input', render));
render();
