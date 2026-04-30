import { getJson, renderRank } from '/js/common.js';

const data = await getJson('/data/ransomware-map.json');
const map = document.querySelector('#incidentMap');
const tooltip = document.querySelector('#mapTooltip');
const max = Math.max(...data.points.map((point) => point.count), 1);

for (const point of data.points) {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', String(point.x));
  circle.setAttribute('cy', String(point.y));
  circle.setAttribute('r', String(2 + (point.count / max) * 5));
  circle.setAttribute('class', 'map-point');
  circle.dataset.country = point.country;
  circle.dataset.count = String(point.count);
  circle.addEventListener('mouseenter', () => {
    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${point.country}</strong><div>피해사례 ${point.count}건</div>${point.sampleVictims.slice(0, 2).map((item) => `<div class="map-tooltip-item">${item.date} · ${item.victimOrg !== '미상' ? item.victimOrg : item.title}</div>`).join('')}`;
  });
  circle.addEventListener('mousemove', (event) => {
    tooltip.style.left = `${event.pageX + 14}px`;
    tooltip.style.top = `${event.pageY + 14}px`;
  });
  circle.addEventListener('mouseleave', () => {
    tooltip.hidden = true;
  });
  map.appendChild(circle);
}

renderRank('#mapCountryRank', data.points.map((point) => ({ label: point.country, value: point.count })), 'value', 'label');
