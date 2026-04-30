import { getJson, renderRank } from '/js/common.js';

const data = await getJson('/data/ransomware-map.json');
const map = document.querySelector('#incidentMap');
const tooltip = document.querySelector('#mapTooltip');
const max = Math.max(...data.points.map((point) => point.count), 1);

for (const point of data.points) {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.className = 'map-point';
  dot.style.left = `${point.x}%`;
  dot.style.top = `${point.y}%`;
  dot.style.width = `${14 + (point.count / max) * 20}px`;
  dot.style.height = `${14 + (point.count / max) * 20}px`;
  dot.setAttribute('aria-label', `${point.country} 피해사례 ${point.count}건`);
  dot.addEventListener('mouseenter', () => {
    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${point.country}</strong><div>피해사례 ${point.count}건</div>${point.sampleVictims.slice(0, 2).map((item) => `<div class="map-tooltip-item">${item.date} · ${item.victimOrg !== '미상' ? item.victimOrg : item.title}</div>`).join('')}`;
  });
  dot.addEventListener('mousemove', (event) => {
    tooltip.style.left = `${event.pageX + 14}px`;
    tooltip.style.top = `${event.pageY + 14}px`;
  });
  dot.addEventListener('mouseleave', () => {
    tooltip.hidden = true;
  });
  map.appendChild(dot);
}

renderRank('#mapCountryRank', data.points.map((point) => ({ label: point.country, value: point.count })), 'value', 'label');
