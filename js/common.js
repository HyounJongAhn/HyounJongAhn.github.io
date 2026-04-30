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
  const paymentBits = [];
  if (item.ransomPaymentStatus === 'paid') paymentBits.push('랜섬머니 지급 확인');
  if (item.ransomPaymentStatus === 'not_paid') paymentBits.push('랜섬머니 미지급 확인');
  if (item.ransomAmount) paymentBits.push(`지불/요구 금액: ${item.ransomAmount}`);
  return `
    <article class="signal-item">
      <div class="signal-meta">
        <span class="pill">${item.date}</span>
        <span class="pill">${item.primaryLabel || item.primaryClass}</span>
        ${item.ransomwareGroup ? `<span class="pill">${item.ransomwareGroup}</span>` : ''}
        ${item.country ? `<span class="pill">${item.country}</span>` : ''}
        ${item.industry ? `<span class="pill">${item.industry}</span>` : ''}
      </div>
      <a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>
      ${item.description ? `<p class="signal-desc">${item.description}</p>` : ''}
      ${item.victimOrg && item.victimOrg !== '미상' ? `<div class="signal-victim"><span class="signal-victim-label">피해주체</span> · ${item.victimOrg}</div>` : ''}
      ${item.publisher ? `<div class="signal-source"><span class="signal-source-label">보도매체</span><span>${item.publisher}</span></div>` : ''}
      ${paymentBits.length ? `<div class="signal-foot">${paymentBits.join(' · ')}</div>` : ''}
    </article>
  `;
}

export function formatInsightLine(line) {
  return line
    .replace(/(확정 피해사례|검토 필요 사고|확인 필요 사고|추세\/동향|추세 신호|공식 공지|공식공지|법집행|복구도구|그룹 식별 기사|전체 기사)/g, '<span class="term-emphasis">$1</span>')
    .replace(/(\d[\d,]*건)/g, '<strong class="number-emphasis">$1</strong>');
}

export function fillSelect(select, values, firstLabel) {
  select.innerHTML = [`<option value="">${firstLabel}</option>`, ...values.map((value) => `<option value="${value}">${value}</option>`)].join('');
}
