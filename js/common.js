export const number = new Intl.NumberFormat('ko-KR');
export const dateTime = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });

export async function getJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

export function renderRank(target, items, valueKey = 'value', labelKey = 'label') {
  const node = document.querySelector(target);
  if (!node) return;
  if (!items.length) {
    node.innerHTML = '<div class="empty-state">표시할 항목이 아직 없습니다.</div>';
    return;
  }
  const max = Math.max(...items.map((item) => item[valueKey] || 0), 1);
  node.innerHTML = items.map((item) => `
    <div class="rank-row">
      <div class="rank-head"><span>${item[labelKey]}</span><strong>${number.format(item[valueKey])}</strong></div>
      <div class="track"><div class="bar" style="width:${((item[valueKey] || 0) / max) * 100}%"></div></div>
    </div>
  `).join('');
}

export function signalCard(item) {
  return `
    <article class="signal-item">
      <div class="signal-meta">
        <span class="pill">${item.date}</span>
        <span class="pill">${item.primaryLabel || item.primaryClass}</span>
        ${item.ransomwareGroup ? `<span class="pill">${item.ransomwareGroup}</span>` : ''}
        ${item.country ? `<span class="pill">${item.country}</span>` : ''}
        ${item.industry ? `<span class="pill">${item.industry}</span>` : ''}
        ${item.publisher ? `<span class="pill">${item.publisher}</span>` : ''}
      </div>
      <a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>
      ${item.description ? `<p class="signal-desc">${item.description}</p>` : ''}
      ${item.victimOrg && item.victimOrg !== '미상' ? `<div class="signal-foot">피해주체: ${item.victimOrg}</div>` : ''}
    </article>
  `;
}

export function fillSelect(select, values, firstLabel) {
  select.innerHTML = [`<option value="">${firstLabel}</option>`, ...values.map((value) => `<option value="${value}">${value}</option>`)].join('');
}
