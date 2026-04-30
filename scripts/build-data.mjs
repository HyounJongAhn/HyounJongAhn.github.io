import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const SOURCE_PATH = path.join(ROOT, '..', 'dfir-trend-radar', 'data', 'ransomware-watch.json');
const OUT_DIR = path.join(ROOT, 'data');

const COUNTRY_PATTERNS = [
  ['한국', /(korea|korean|대한민국|한국|국내)/i],
  ['일본', /(japan|japanese|일본|日本)/i],
  ['중국', /(china|chinese|중국|中国)/i],
  ['대만', /(taiwan|대만|台湾)/i],
  ['홍콩', /(hong kong|홍콩|香港)/i],
  ['싱가포르', /(singapore|싱가포르)/i],
  ['인도', /(india|indian|인도)/i],
  ['독일', /(germany|german|독일|deutsch)/i],
  ['프랑스', /(france|french|프랑스)/i],
  ['영국', /(united kingdom|uk\b|britain|british|england|영국)/i],
  ['미국', /(united states|u\.s\.|usa\b|american|미국|texas|florida|california|nevada|maryland|virginia)/i],
  ['캐나다', /(canada|canadian|캐나다)/i],
  ['호주', /(australia|australian|호주)/i],
  ['뉴질랜드', /(new zealand|뉴질랜드)/i],
  ['이탈리아', /(italy|italian|이탈리아)/i],
  ['스페인', /(spain|spanish|스페인)/i],
  ['브라질', /(brazil|brazilian|브라질)/i],
  ['멕시코', /(mexico|mexican|멕시코)/i],
  ['러시아', /(russia|russian|러시아)/i],
  ['우크라이나', /(ukraine|ukrainian|우크라이나)/i],
  ['유럽', /(europol|europe|european|유럽|swiss|switzerland)/i]
];

const INDUSTRY_PATTERNS = [
  ['의료', /(hospital|healthcare|medical|clinic|nhs|병원|의료|헬스케어)/i],
  ['공공', /(government|city|county|municipal|agency|ministry|public sector|지자체|정부|공공기관|행정|lawmakers)/i],
  ['교육', /(school|college|university|education|교육|대학|학교)/i],
  ['제조', /(manufacturing|factory|plant|industrial|제조|공장)/i],
  ['금융', /(bank|banking|financial|insurance|fintech|금융|보험|증권)/i],
  ['통신/IT', /(telecom|software|it company|tech|technology|cloud|데이터센터|통신|소프트웨어|it기업|msp|oracle|apple|cisco|sonicwall)/i],
  ['유통/서비스', /(retail|restaurant|hospitality|service provider|유통|서비스|쇼핑)/i],
  ['에너지/인프라', /(energy|utility|pipeline|water|power|critical infrastructure|전력|수자원|인프라|utilities)/i],
  ['물류/운송', /(transport|logistics|port|shipping|airline|rail|물류|운송|항만)/i],
  ['법집행/사법', /(police|fbi|doj|europol|law enforcement|수사기관|경찰|검찰)/i]
];

const GROUP_PATTERNS = [
  ['LockBit', /lockbit/i],
  ['Akira', /akira/i],
  ['Black Basta', /black\s*basta|blackbasta/i],
  ['BlackCat/ALPHV', /alphv|blackcat/i],
  ['Cl0p', /cl0p/i],
  ['Rhysida', /rhysida/i],
  ['Phobos', /phobos/i],
  ['8Base', /8base/i],
  ['BianLian', /bianlian/i],
  ['FunkSec', /funksec/i],
  ['RansomHub', /ransom\s*hub|ransomhub/i],
  ['Qilin', /qilin/i],
  ['Medusa', /medusa/i],
  ['Play', /\bplay\b(?=.*(?:ransomware|group|leak|victim|attack|gang))|play crypt/i],
  ['Hunters International', /hunters international/i],
  ['INC Ransom', /inc ransom|inc\s*ransomware/i],
  ['DragonForce', /dragonforce/i],
  ['Fog', /\bfog\b(?=.*ransomware)|fog ransomware/i],
  ['Lynx', /\blynx\b(?=.*ransomware)|lynx ransomware/i],
  ['SafePay', /safepay/i],
  ['Interlock', /interlock/i],
  ['KillSec', /killsec/i],
  ['Sarcoma', /sarcoma/i],
  ['Cicada3301', /cicada\s*3301|cicada3301/i],
  ['Everest', /\beverest\b(?=.*ransomware)|everest ransomware/i],
  ['Babuk', /babuk/i],
  ['Anubis', /anubis/i],
  ['The Gentlemen', /the gentlemen/i]
];

const TYPE_LABELS = {
  confirmed_incident: '확정 피해사례',
  incident_under_review: '확인 필요 사고',
  trend_signal: '추세/동향',
  official_notice: '공식공지',
  law_enforcement: '법집행',
  recovery: '복구도구',
  other: '기타'
};

const TREND_SIGNAL_RE = /(trend|analysis|report|forecast|outlook|statistics|survey|predicted|predictions?|rise[s]?|surge[s]?|emerging|new variant|group profile|closer look|동향|추세|전망|통계|급증|확산|등장|주의|증가|활동량|생태계|전술 변화|기법|post-quantum|양자내성)/i;
const AGGREGATE_RE = /(victims?\b.*\b(over|more than|at least|top|global)|\b\d{2,}\+?\s+victims?\b|전세계|세계|글로벌|전 산업|피해 급증|top list|most active)/i;
const OFFICIAL_DISCLOSURE_RE = /(official|statement|press release|sec filing|8-k|company confirms|company said|provides update|discloses|notifies affected|officially confirmed|보도자료|공식 발표|공식 확인|공시|신고|공지했다|확인했다)/i;
const DISRUPTION_RE = /(operations disrupted|outage|shutdown|restoring systems|service disruption|data stolen|data exfiltration|encrypted|system outage|운영 중단|서비스 장애|유출|암호화|복구 중|갈취|무단 이전)/i;
const LAW_ENFORCEMENT_RE = /(arrest|arrested|charged|indicted|pleads? guilty|sentenced|prison|seized|seizure|takedown|sanction|fbi|doj|europol|nca|police|law enforcement|기소|체포|압수|제재|실형)/i;
const PRODUCT_REVIEW_RE = /(\[리뷰\]|\breview\b|product review|솔루션 리뷰|제품 소개|백업 환경|backup environment|powerprotect|cyber recovery|sponsored|buyers guide|구매 가이드|demo)/i;
const HOWTO_RE = /(how to|remove ransomware|mitigation strategies|대책|제거)/i;
const ENTITY_FRAGMENT = `[A-Z][A-Za-z0-9&'().,\-/ ]{1,90}`;
const VICTIM_PATTERNS = [
  new RegExp(`^(${ENTITY_FRAGMENT}?)\\s+(?:hit by|hit|hits|suffers?|faces?|confirms?|reports?|investigates?|discloses?|restores?|recovers?)(?:\\s+an?|\\s+the)?\\s+ransomware\\b`, 'i'),
  new RegExp(`^(${ENTITY_FRAGMENT}?)\\s+(?:victim of|falls victim to)\\s+(?:an?\\s+)?ransomware\\b`, 'i'),
  new RegExp(`(?:attack on|attacked|breach at|breach of|incident at|claims attack on|target(?:ed|ing)?|cripples?|crippled)\\s+(${ENTITY_FRAGMENT}?)(?=(?:\\s+(?:after|amid|as|with|over|under|from|in|by)\\b|[;:,.]|$))`, 'i'),
  new RegExp(`^(${ENTITY_FRAGMENT}?)\\s+(?:랜섬웨어|被害|攻撃|勒索软件)`, 'i')
];
const VICTIM_STOPWORDS = new Set([
  'ransomware', 'cyber attack', 'data breach', 'breaking news', 'cybersecurity insiders', 'the hipaa journal',
  'insurance journal', 'dark reading', 'securityweek', 'industrial cyber', 'the hacker news'
]);

function inferFromPatterns(text, patterns, fallback = '미상') {
  for (const [label, regex] of patterns) {
    if (regex.test(text)) return label;
  }
  return fallback;
}

function normalizeVictim(value) {
  return value
    .replace(/^the\s+/i, '')
    .replace(/\s+(reopens clinics|confirms?|reports?|investigates?|discloses?|restores?)$/i, '')
    .replace(/[;:,.]+$/g, '')
    .trim();
}

function extractVictimOrg(item) {
  const text = `${item.titleOriginal || item.title} ${item.description || ''}`;
  for (const pattern of VICTIM_PATTERNS) {
    const match = text.match(pattern);
    const candidate = normalizeVictim(match?.[1] || '');
    if (!candidate) continue;
    if (candidate.length < 3 || candidate.length > 100) continue;
    if (VICTIM_STOPWORDS.has(candidate.toLowerCase())) continue;
    if (/ransomware group|threat actor|gang$/i.test(candidate)) continue;
    return candidate;
  }
  return '미상';
}

function classifyPrimaryClass(item, victimOrg, ransomwareGroup) {
  const text = `${item.title} ${item.description} ${item.publisher} ${item.titleKo || ''}`;
  if (PRODUCT_REVIEW_RE.test(text) || HOWTO_RE.test(text)) return 'other';
  if (item.articleType === 'recovery') return 'recovery';
  if (item.articleType === 'law_enforcement' || LAW_ENFORCEMENT_RE.test(text)) return 'law_enforcement';
  if (item.articleType === 'official_notice') return 'official_notice';
  if (item.articleType === 'trend' || TREND_SIGNAL_RE.test(text) || AGGREGATE_RE.test(text)) return 'trend_signal';
  if (victimOrg !== '미상' && (OFFICIAL_DISCLOSURE_RE.test(text) || DISRUPTION_RE.test(text))) return 'confirmed_incident';
  if (victimOrg !== '미상') return 'incident_under_review';
  if (ransomwareGroup !== '미상') return 'trend_signal';
  return 'other';
}

function buildClusterKey(item, victimOrg, ransomwareGroup) {
  if (victimOrg !== '미상') return `victim:${victimOrg.toLowerCase()}`;
  if (ransomwareGroup !== '미상') return `group:${ransomwareGroup}:${String(item.publishedAt).slice(0, 7)}`;
  return `title:${(item.titleOriginal || item.title).toLowerCase().replace(/[^a-z0-9가-힣]+/gi, ' ').trim().slice(0, 64)}`;
}

function topCounts(values, limit) {
  const map = new Map();
  for (const value of values) map.set(value, (map.get(value) || 0) + 1);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function monthKey(value) {
  return String(value).slice(0, 7);
}

function titleFor(item) {
  return item.titleKo || item.titleOriginal || item.title;
}

function isoDate(value) {
  return String(value).slice(0, 10);
}

function writeJson(name, value) {
  fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(value, null, 2));
}

const raw = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
const enriched = raw.items.map((item) => {
  const text = `${item.title} ${item.description} ${item.publisher} ${item.titleKo || ''} ${item.titleOriginal || ''}`;
  const ransomwareGroup = inferFromPatterns(text, GROUP_PATTERNS, '미상');
  const victimOrg = extractVictimOrg(item);
  const country = inferFromPatterns(text, COUNTRY_PATTERNS, '미상');
  const industry = inferFromPatterns(text, INDUSTRY_PATTERNS, '미상');
  const primaryClass = classifyPrimaryClass(item, victimOrg, ransomwareGroup);
  return {
    ...item,
    ransomwareGroup,
    victimOrg,
    country,
    industry,
    primaryClass,
    primaryLabel: TYPE_LABELS[primaryClass],
    clusterId: buildClusterKey(item, victimOrg, ransomwareGroup)
  };
}).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const byPrimaryClass = Object.fromEntries(
  topCounts(enriched.map((item) => item.primaryClass), 20).map(({ label, value }) => [label, value])
);
const groupKnownItems = enriched.filter((item) => item.ransomwareGroup !== '미상');
const incidentItems = enriched.filter((item) => item.primaryClass === 'confirmed_incident' || item.primaryClass === 'incident_under_review');
const confirmedItems = enriched.filter((item) => item.primaryClass === 'confirmed_incident');
const dedupedGroupItems = [...new Map(groupKnownItems.map((item) => [item.clusterId, item])).values()];

const monthlyMap = new Map();
for (const item of enriched) {
  const key = monthKey(item.publishedAt);
  const row = monthlyMap.get(key) || {
    month: key,
    confirmed_incident: 0,
    incident_under_review: 0,
    trend_signal: 0,
    official_notice: 0,
    law_enforcement: 0,
    recovery: 0,
    other: 0
  };
  row[item.primaryClass] += 1;
  monthlyMap.set(key, row);
}

const groupProfiles = [...new Set(groupKnownItems.map((item) => item.ransomwareGroup))].map((group) => {
  const items = groupKnownItems.filter((item) => item.ransomwareGroup === group);
  const clusterCount = new Set(items.map((item) => item.clusterId)).size;
  const incidentCount = items.filter((item) => item.primaryClass === 'confirmed_incident' || item.primaryClass === 'incident_under_review').length;
  const last90 = items.filter((item) => new Date(item.publishedAt).getTime() >= Date.now() - 90 * 86400000).length;
  const previous180 = items.filter((item) => {
    const ts = new Date(item.publishedAt).getTime();
    return ts < Date.now() - 90 * 86400000 && ts >= Date.now() - 270 * 86400000;
  }).length;
  return {
    group,
    allArticles: items.length,
    clusterCount,
    incidentCount,
    firstSeen: isoDate(items[items.length - 1].publishedAt),
    lastSeen: isoDate(items[0].publishedAt),
    last90,
    previous180,
    delta: last90 - previous180,
    sampleTitle: titleFor(items[0])
  };
}).sort((a, b) => b.allArticles - a.allArticles || a.group.localeCompare(b.group));

const emergingGroups = groupProfiles
  .filter((profile) => profile.allArticles >= 2)
  .filter((profile) => new Date(profile.firstSeen).getTime() >= Date.now() - 365 * 86400000)
  .sort((a, b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime() || b.allArticles - a.allArticles)
  .slice(0, 12);

const momentumGroups = groupProfiles
  .filter((profile) => profile.last90 > 0)
  .sort((a, b) => b.delta - a.delta || b.last90 - a.last90)
  .slice(0, 12);

const recentSignals = enriched
  .filter((item) => item.ransomwareGroup !== '미상' || item.primaryClass === 'confirmed_incident' || item.primaryClass === 'law_enforcement')
  .slice(0, 24)
  .map((item) => ({
    id: item.id,
    date: isoDate(item.publishedAt),
    title: titleFor(item),
    publisher: item.publisher,
    primaryClass: item.primaryClass,
    primaryLabel: item.primaryLabel,
    ransomwareGroup: item.ransomwareGroup,
    country: item.country,
    industry: item.industry,
    victimOrg: item.victimOrg,
    url: item.url
  }));

const insightLines = [
  `전체 기사 ${raw.stats.totalItems}건 중 그룹명이 식별된 기사는 ${groupKnownItems.length}건입니다.`,
  `확정 피해사례는 ${confirmedItems.length}건, 검토 필요 사고는 ${incidentItems.length - confirmedItems.length}건으로 분리했습니다.`,
  `공개판에서는 그룹 통계를 기사 언급량, 사건 기준 클러스터, 피해사례 직접 연결 그룹으로 따로 보여줍니다.`
];

const summary = {
  site: {
    title: 'Ransomware Trend Brief',
    subtitle: '공개 공유용 정적 랜섬웨어 브리프',
    generatedAt: raw.generatedAt,
    period: raw.period,
    sourceRepoNote: 'Source data snapshot generated from local dfir-trend-radar workspace.'
  },
  overview: {
    totalArticles: raw.stats.totalItems,
    uniquePublishers: raw.stats.uniquePublishers,
    groupKnownArticles: groupKnownItems.length,
    confirmedIncidents: confirmedItems.length,
    reviewIncidents: incidentItems.length - confirmedItems.length,
    trendSignals: byPrimaryClass.trend_signal || 0,
    officialNotices: byPrimaryClass.official_notice || 0,
    lawEnforcement: byPrimaryClass.law_enforcement || 0
  },
  articleTypeCounts: raw.stats.byType,
  primaryClassCounts: byPrimaryClass,
  topGroupsAllArticles: topCounts(groupKnownItems.map((item) => item.ransomwareGroup), 12),
  topGroupsByCluster: topCounts(dedupedGroupItems.map((item) => item.ransomwareGroup), 12),
  topIncidentGroups: topCounts(incidentItems.filter((item) => item.ransomwareGroup !== '미상').map((item) => item.ransomwareGroup), 12),
  topCountriesIncident: topCounts(incidentItems.filter((item) => item.country !== '미상').map((item) => item.country), 10),
  topIndustriesIncident: topCounts(incidentItems.filter((item) => item.industry !== '미상').map((item) => item.industry), 10),
  topPublishers: topCounts(enriched.map((item) => item.publisher), 12),
  monthlyTimeline: [...monthlyMap.values()].sort((a, b) => a.month.localeCompare(b.month)),
  recentSignals,
  methodology: raw.methodology,
  insights: insightLines
};

const archive = {
  generatedAt: raw.generatedAt,
  total: enriched.length,
  items: enriched.map((item) => ({
    id: item.id,
    date: isoDate(item.publishedAt),
    title: titleFor(item),
    titleOriginal: item.titleOriginal || item.title,
    publisher: item.publisher,
    primaryClass: item.primaryClass,
    primaryLabel: item.primaryLabel,
    ransomwareGroup: item.ransomwareGroup,
    country: item.country,
    industry: item.industry,
    victimOrg: item.victimOrg,
    clusterId: item.clusterId,
    articleType: item.articleType,
    languageHint: item.languageHint,
    url: item.url,
    sourceUrl: item.sourceUrl,
    description: item.description
  }))
};

const trends = {
  generatedAt: raw.generatedAt,
  groupProfiles: groupProfiles.slice(0, 20),
  emergingGroups,
  momentumGroups,
  recentSignalsByClass: {
    trend_signal: recentSignals.filter((item) => item.primaryClass === 'trend_signal').slice(0, 10),
    official_notice: recentSignals.filter((item) => item.primaryClass === 'official_notice').slice(0, 10),
    law_enforcement: recentSignals.filter((item) => item.primaryClass === 'law_enforcement').slice(0, 10),
    recovery: recentSignals.filter((item) => item.primaryClass === 'recovery').slice(0, 10)
  }
};

fs.mkdirSync(OUT_DIR, { recursive: true });
writeJson('ransomware-summary.json', summary);
writeJson('ransomware-articles.json', archive);
writeJson('ransomware-trends.json', trends);
console.log(`Wrote ${path.join(OUT_DIR, 'ransomware-summary.json')}`);
console.log(`Wrote ${path.join(OUT_DIR, 'ransomware-articles.json')}`);
console.log(`Wrote ${path.join(OUT_DIR, 'ransomware-trends.json')}`);
