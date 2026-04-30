import { getJson, renderRank, signalCard } from '/js/common.js';

const data = await getJson('/data/ransomware-trends.json');
renderRank('#emergingGroups', data.emergingGroups.map((item) => ({ label: `${item.group} · first seen ${item.firstSeen}`, value: item.allArticles })));
renderRank('#momentumGroups', data.momentumGroups.map((item) => ({ label: `${item.group} · 최근90일 ${item.last90}`, value: item.delta > 0 ? item.delta : item.last90 })));

document.querySelector('#lawSignals').innerHTML = data.recentSignalsByClass.law_enforcement.map(signalCard).join('');
document.querySelector('#noticeSignals').innerHTML = data.recentSignalsByClass.official_notice.map(signalCard).join('');
document.querySelector('#recoverySignals').innerHTML = data.recentSignalsByClass.recovery.map(signalCard).join('');
document.querySelector('#trendSignals').innerHTML = data.recentSignalsByClass.trend_signal.map(signalCard).join('');
