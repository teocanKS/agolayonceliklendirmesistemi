
const state = {
    rawEvents: [],
    rawLongTerm: null,
    strategies: new Set(), 
    totalImpact: 0,
<<<<<<< Updated upstream
    currentRiskScore: 0
=======
    currentRiskScore: 0,
    
    logPage: 1,
    logLimit: 15,
    isSidebarOpen: true
>>>>>>> Stashed changes
};


const strategiesData = [
    {
        id: 'strat-human',
        title: 'Siber Farkındalık',
        type: 'HUMAN',
        desc: 'Phishing simülasyonları ve eğitimlerle insan hatasını azaltır.',
        cost: '$',
        duration: '6 Ay',
        riskRed: 10, 
        rule: (p) => p.humanFactor * 10,
    },
    {
        id: 'strat-infra',
        title: 'Altyapı Genişletme',
        type: 'TECH',
        desc: 'Anti-DDoS ve Load Balancer yatırımı ile kapasiteyi artırır.',
        cost: '$$',
        duration: '12 Ay',
        riskRed: 25,
        rule: (p) => p.volumeWeight * 10,
    },
    {
        id: 'strat-ai',
        title: 'Yapay Zeka Defans',
        type: 'AI',
        desc: 'Anomali tespiti için AI destekli analiz motoru.',
        cost: '$$$',
        duration: '12 Ay',
        riskRed: 20,
        rule: (p) => (p.severityWeight > 0.7) ? 15 : 2,
    },
    {
        id: 'strat-redteam',
        title: 'Red Team Testi',
        type: 'OFFENSIVE',
        desc: 'Saldırgan bakış açısıyla açıkların proaktif tespiti.',
        cost: '$$$',
        duration: '6 Ay',
        riskRed: 12,
        rule: (p) => p.detectionMaturity < 0.4 ? 8 : 3,
    },
    {
        id: 'strat-zero',
        title: 'Zero Trust Mimari',
        type: 'ARCH',
        desc: 'Asla güvenme, her zaman doğrula prensibi. Yanal hareketi keser.',
        cost: '$$$$',
        duration: '24 Ay',
        riskRed: 35,
        rule: (p) => p.assetCriticality > 0.8 ? 12 : 1,
    },
    {
        id: 'strat-iso',
        title: 'ISO 27001',
        type: 'COMPLIANCE',
        desc: 'BGYS süreçlerinin standardizasyonu ve denetimi.',
        cost: '$$',
        duration: '9 Ay',
        riskRed: 8,
        rule: (p) => 4,
    },
    {
        id: 'strat-insurance',
        title: 'Siber Sigorta',
        type: 'TRANSFER',
        desc: 'Kalıntı riski finansal olarak transfer eder.',
        cost: '$$',
        duration: '1 Ay',
        riskRed: 5,
        rule: (p) => (p.severityWeight > 0.9) ? 9 : 2,
    },
    {
        id: 'strat-dlp',
        title: 'Veri Sızıntısı Önleme',
        type: 'DATA',
        desc: 'Hassas verilerin kurum dışına çıkmasını engeller (DLP).',
        cost: '$$',
        duration: '6 Ay',
        riskRed: 15,
        rule: (p) => p.assetCriticality > 0.6 ? 7 : 2,
    }
];


async function init() {
    console.log("System Initializing...");

    
    const origWarn = console.warn;
    console.warn = (...args) => {
        if (args[0] && args[0].includes && args[0].includes('cdn.tailwindcss')) return;
        origWarn.apply(console, args);
    };

    if (window.ParamsManager) {
        window.ParamsManager.renderPanel('manager-panel-container');
    }

    window.addEventListener('kds-params-changed', () => runAnalysis());
    window.applySimulation = applySimulation;

    await fetchData();
}


async function fetchData() {
    const statusEl = document.getElementById('connection-status');
    const updateEl = document.getElementById('last-update');

    try {
        const [eRes, ltRes] = await Promise.all([
<<<<<<< Updated upstream
            fetch('/api/events'),
=======
            fetch('/api/events?limit=5000'), 
>>>>>>> Stashed changes
            fetch('/api/long-term-stats')
        ]);

        if (!eRes.ok) throw new Error('API Error: ' + eRes.status);
        const eJson = await eRes.json();

        
        if (eJson.success && eJson.data && eJson.data.length > 0) {
            state.rawEvents = eJson.data;
            if (statusEl) {
                statusEl.innerHTML = '<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span> <span class="text-green-400">CANLI BAĞLANTI</span>';
                statusEl.className = "flex items-center gap-2 text-xs font-semibold bg-slate-900 border border-green-900/30 px-3 py-1.5 rounded-full";
            }
        } else {
            state.rawEvents = generateMockEvents(); 
        }

        
        let ltJson = { success: false, data: null };
        if (ltRes.ok) try { ltJson = await ltRes.json(); } catch { }
        if (ltJson.success) state.rawLongTerm = ltJson.data;

        if (updateEl) updateEl.innerText = new Date().toLocaleTimeString();
        runAnalysis();

    } catch (e) {
        console.error("Fetch Error:", e);
        state.rawEvents = generateMockEvents();
        runAnalysis();
    }
}

function generateMockEvents() {
    return Array(60).fill(0).map((_, i) => ({
        title: i % 3 == 0 ? 'DDoS Attack' : 'Malware Activity',
        severity: i % 5 == 0 ? 'Critical' : 'High',
        timestamp: new Date().toISOString()
    }));
}


function runAnalysis() {
    const params = window.ParamsManager ? window.ParamsManager.getParams() : { severityWeight: 0.5 };

    
    
    const threatScore = (params.volumeWeight + params.severityWeight + params.assetCriticality + params.humanFactor) / 4;
    
    const defenseBase = (params.detectionMaturity + params.responseCapacity) / 2;
    const defenseScore = Math.min(1.0, defenseBase);

    
    let baseRisk = threatScore * (1 - defenseScore) * 100;

    
    if (defenseBase < 0.3) {
        baseRisk = Math.max(85, baseRisk);
    }
    
    if (threatScore > 0.9 && defenseBase < 0.1) baseRisk = 100;

<<<<<<< Updated upstream
    // 2. ROI CALCULATION (Strategic Mitigation)
    // Sum selected strategies
    let roiTotal = 0;
    state.strategies.forEach(id => {
        const strat = strategiesData.find(s => s.id === id);
        if (strat) roiTotal += strat.riskRed;
    });
    state.totalImpact = Math.min(95, roiTotal); // Max 95% reduction
=======
    
    
    
    
    let roiTotal = 0;

    
    const vectorMitigation = { 'DDoS': 0, 'Malware': 0, 'Phishing': 0, 'Web': 0 };

    state.strategies.forEach(id => {
        const strat = strategiesData.find(s => s.id === id);
        if (strat) {
            roiTotal += strat.riskRed;

            
            if (strat.id === 'strat-infra') {
                vectorMitigation['DDoS'] += 50; 
            }
            else if (strat.id === 'strat-human') {
                vectorMitigation['Phishing'] += 60; 
            }
            else if (strat.id === 'strat-ai') {
                vectorMitigation['Malware'] += 40; 
                vectorMitigation['Web'] += 20;
            }
            else if (strat.id === 'strat-zero') {
                vectorMitigation['Web'] += 50;
                vectorMitigation['Malware'] += 30;
            }
            else if (strat.id === 'strat-dlp') {
                vectorMitigation['Web'] += 30;
                vectorMitigation['Phishing'] += 10;
            }
            else {
                
                Object.keys(vectorMitigation).forEach(k => vectorMitigation[k] += 10);
            }
        }
    });

    state.totalImpact = Math.min(95, roiTotal); 
    state.vectorImpacts = vectorMitigation; 
>>>>>>> Stashed changes

    
    
    
    const monthlyThreats = [];
    for (let m = 0; m < 12; m++) {
        let monthThreat = threatScore;

        
        if (params.humanFactor > 0.6 && (m === 11 || m === 0)) {
            monthThreat += 0.25; 
        }

        
        if (params.volumeWeight > 0.7 && (m === 8 || m === 9)) {
            monthThreat += 0.30; 
        }
        monthlyThreats.push(monthThreat);
    }

    
    
    
    const avgDefense = Math.max(0.2, defenseScore); 
    const rawRiskRatio = threatScore / avgDefense;
    const mitigatedRiskRatio = rawRiskRatio * (1 - state.totalImpact / 100);
    
    
    let currentFinalRisk = Math.round(Math.min(100, mitigatedRiskRatio * 50));

    
    

    state.currentRiskScore = currentFinalRisk;

    

    
    setTxt('kpi-risk', currentFinalRisk);
    setTxt('kpi-imp', '%' + state.totalImpact);
    setTxt('kpi-target', Math.round(currentFinalRisk * 0.8)); 
    setTxt('kpi-vol', state.rawEvents.length);

    
    const riskEl = document.getElementById('kpi-risk');
    if (riskEl) {
        if (currentFinalRisk > 80) riskEl.className = 'text-3xl font-bold text-red-600 animate-pulse';
        else if (currentFinalRisk < 20) riskEl.className = 'text-3xl font-bold text-green-500';
        else riskEl.className = 'text-3xl font-bold text-amber-500';
    }

    
    renderHeatmap(monthlyThreats, defenseScore, state.totalImpact);

    
    recommendStrategies(params, currentFinalRisk);

<<<<<<< Updated upstream
    // Vectors
    renderVectors(state.rawEvents, params, defenseScore);

    // Logs
    renderLogs(state.rawEvents);
=======
    
    renderVectors(state.rawEvents, params, defenseScore, state.totalImpact);

    
    
>>>>>>> Stashed changes
}



function renderHeatmap(monthlyThreats, defenseScore, mitigationPercent) {
    const container = document.getElementById('heatmap-container');
    if (!container) return;

    
    const rowMultipliers = [1.5, 1.2, 1.0, 0.7, 0.4];
    const rowNames = ['Kritik', 'Yüksek', 'Orta', 'Düşük', 'Bilgi'];

    
    
    const safeDefense = Math.max(0.2, defenseScore);

    
    let amplifiedMitigation = mitigationPercent * 1.5;
    if (amplifiedMitigation > 95) amplifiedMitigation = 95; 

    let html = '';

    
    for (let r = 0; r < 5; r++) {
        for (let m = 0; m < 12; m++) {
            const threatVal = monthlyThreats[m]; 
            const rowMult = rowMultipliers[r];   

            
            const rawRiskRatio = (threatVal * rowMult) / safeDefense;

            
            const finalRatio = rawRiskRatio * (1 - amplifiedMitigation / 100);

            
            
            let cellVal = Math.round(Math.min(100, finalRatio * 45)); 

            
            
            if (amplifiedMitigation > 30 && cellVal > 75) {
                cellVal = 75; 
            }
            
            if (amplifiedMitigation > 60 && cellVal > 40) {
                cellVal = 35; 
            }

            let color = 'bg-amber-500';
            if (cellVal >= 80) color = 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]'; 
            else if (cellVal <= 35) color = 'bg-green-500 opacity-80'; 
            else if (cellVal < 65) color = 'bg-yellow-400'; 
            else color = 'bg-orange-500'; 

            html += '<div class="' + color + ' rounded-sm opacity-90 transition-all duration-500 hover:scale-110 relative group" title="' + rowNames[r] + ' - Ay ' + (m + 1) + ': ' + cellVal + '">' +
                '</div>';
        }
    }
    container.innerHTML = html;
}



function recommendStrategies(params) {
    
    const scored = strategiesData.map(s => ({ ...s, score: s.rule(params) }))
        .sort((a, b) => b.score - a.score);

    
    const displayList = scored.slice(0, 8);

    const grid = document.getElementById('strategy-grid');
    if (grid) {
        grid.innerHTML = displayList.map((s, i) => renderStrategyCard(s, i < 3)).join(''); 
    }
}

function renderStrategyCard(s, isTopRec) {
    const isActive = state.strategies.has(s.id);
    const activeClass = isActive
        ? 'border-cyan-500 ring-2 ring-cyan-400 bg-slate-800 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600';

    
    const badgeHTML = (isTopRec && !isActive)
        ? '<div class="absolute -top-3 -right-2 z-20 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce">' +
        '<i class="fa-solid fa-star"></i> ÖNERİLEN</div>'
        : '';

    
    const dot = isActive
        ? '<div class="absolute top-4 right-4 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,1)]"><i class="fa-solid fa-circle-check text-xl"></i></div>'
        : '';

    return '<div onclick="applySimulation(\'' + s.id + '\')"' +
        ' class="strat-card relative p-5 rounded-xl border ' + activeClass + ' transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[220px] hover:-translate-y-1 select-none">' +
        badgeHTML +
        dot +
        '<div>' +
        '<div class="flex items-start justify-between mb-4">' +
        '<div class="flex items-center gap-3">' +
        '<div class="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">' +
        '<i class="fa-solid fa-shield-halved text-lg"></i>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<h4 class="text-sm font-bold text-slate-100 leading-tight mb-1">' + s.title + '</h4>' +
        '<span class="text-[10px] text-slate-500 font-mono tracking-wider uppercase block mb-3">' + s.type + '</span>' +
        '<p class="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">' + s.desc + '</p>' +
        '</div>' +
        '<div class="flex items-center justify-between pt-4 border-t border-slate-700/30 mt-auto">' +
        '<span class="text-[10px] text-slate-500 font-mono"><i class="fa-regular fa-clock"></i> ' + s.duration + '</span>' +
        '<div class="flex items-center gap-2">' +
        '<span class="text-xs font-mono text-slate-600">' + s.cost + '</span>' +
        '<span class="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Risk -%' + s.riskRed + '</span>' +
        '</div>' +
        '</div>' +
        '</div>';
}

function applySimulation(id) {
    if (state.strategies.has(id)) {
        state.strategies.delete(id);
    } else {
        state.strategies.add(id);
    }
    
    runAnalysis();
}


function setTxt(id, val) { const el = document.getElementById(id); if (el) el.innerText = val; }

function renderVectors(events, params, defenseScore) {
    const container = document.getElementById('vector-container');
    if (!container) return;
<<<<<<< Updated upstream
    const counts = { 'DDoS': 0, 'Malware': 0, 'Phishing': 0, 'Web': 0 };
    events.forEach(e => {
        let type = 'Web';
        if (e.title.includes('DDoS')) type = 'DDoS';
        else if (e.title.includes('Malware') || e.title.includes('Trojan')) type = 'Malware';
        else if (e.title.includes('Phishing') || e.title.includes('Email')) type = 'Phishing';
        counts[type] = (counts[type] || 0) + 1;
    });

    let maxVal = 0;
=======

    
    
    
    const mitigationImpact = (state.totalImpact || 0) * 2;

    
    
    
    const baseRisk = {
        'DDoS': 20 + (params.volumeWeight * 80),      
        'Malware': 20 + (params.severityWeight * 80), 
        'Phishing': 20 + (params.humanFactor * 80),   
        'Web': 20 + (params.assetCriticality * 80)          
    };

    
    
    const realCounts = { 'DDoS': 0, 'Malware': 0, 'Phishing': 0, 'Web': 0 };
    events.forEach(e => {
        const title = e.olay_basligi || e.title || ''; 
        if (title.includes('DDoS')) realCounts['DDoS']++;
        else if (title.includes('Malware') || title.includes('Trojan')) realCounts['Malware']++;
        else if (title.includes('Phishing')) realCounts['Phishing']++;
        else realCounts['Web']++; 
    });

    
>>>>>>> Stashed changes
    const finalValues = {};
    Object.keys(counts).forEach(type => {
        let val = counts[type] || 1;
        if (type === 'DDoS') val *= (1 + params.volumeWeight * 2);
        if (type === 'Malware') val *= (1 + params.severityWeight * 2);
        if (type === 'Phishing') val *= (1 + params.humanFactor * 3);

<<<<<<< Updated upstream
        // Defense Score mitigates the visual height of attacks
        let def = defenseScore || 0.1;
        val /= Math.max(0.2, def * 2);
        finalValues[type] = val;
        if (val > maxVal) maxVal = val;
=======
    Object.keys(baseRisk).forEach(type => {
        
        
        const multiplier = type === 'Web' ? 1 : 5;

        let score = (realCounts[type] * multiplier) + baseRisk[type];

        
        score = score * (1 - (defenseScore * 0.5));

        
        let specificMitigation = 0;
        if (state.vectorImpacts && state.vectorImpacts[type] !== undefined) {
            specificMitigation = state.vectorImpacts[type];
        } else {
            specificMitigation = (state.totalImpact || 0);
        }
        if (specificMitigation > 95) specificMitigation = 95;

        score = score * (1 - (specificMitigation / 100));

        finalValues[type] = score;
        totalScore += score;
>>>>>>> Stashed changes
    });

    const maxPx = 140;
    const bars = Object.keys(counts).map(k => {
        const val = finalValues[k];
<<<<<<< Updated upstream
        const hPx = Math.max(5, (val / maxVal) * maxPx);
        const pct = Math.min(100, Math.round(val));
        let color = 'bg-slate-600';
        if (k === 'DDoS') color = 'bg-orange-500';
        if (k === 'Malware') color = 'bg-red-600';
        if (k === 'Phishing') color = 'bg-purple-500';

        return '<div class="flex flex-col items-center gap-2 group w-1/4">' +
            '<div class="relative w-full flex items-end justify-center h-[150px] bg-slate-800/30 rounded-lg overflow-hidden">' +
            '<div style="height: ' + hPx + 'px" class="w-2/3 ' + color + ' opacity-80 group-hover:opacity-100 transition-all rounded-t-sm relative shadow-lg">' +
            '<span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white opacity-0 group-hover:opacity-100 font-bold">' + pct + '</span>' +
            '</div>' +
            '</div>' +
            '<span class="text-[10px] text-slate-400 font-mono tracking-wider">' + k.toUpperCase() + '</span>' +
            '</div>';
=======
        
        const relPercent = totalScore > 0 ? Math.round((val / totalScore) * 100) : 0;

        
        const maxScore = Math.max(...Object.values(finalValues));
        let heightPx = (val / maxScore) * 120;
        if (heightPx < 10) heightPx = 10;

        let color = '#3b82f6'; 
        if (k === 'DDoS') color = '#f97316'; 
        if (k === 'Malware') color = '#ef4444'; 
        if (k === 'Phishing') color = '#a855f7'; 

        return `
            <div class="flex flex-col items-center justify-end h-full w-full group relative">
                 <div class="w-full text-center text-[10px] text-slate-400 mb-1 opacity-100">
                    %${relPercent}
                </div>
                <div class="w-12 rounded-t-sm transition-all duration-500 ease-out hover:brightness-110 relative"
                     style="height: ${heightPx}px; background-color: ${color};">
                     <div class="absolute top-0 left-0 w-full h-[2px] bg-white opacity-20"></div>
                </div>
                <div class="mt-2 text-[10px] font-bold text-slate-400 tracking-wider">${k.toUpperCase()}</div>
            </div>
        `;
>>>>>>> Stashed changes
    }).join('');
    container.innerHTML = '<div class="flex justify-between items-end h-full w-full gap-2 px-2">' + bars + '</div>';
}

<<<<<<< Updated upstream
function renderLogs(events) {
    const container = document.getElementById('log-content');
    if (!container) return;
    if (events.length === 0) { container.innerHTML = '<div class="text-xs text-slate-600 p-2 text-center">henüz kayıt yok...</div>'; return; }
    container.innerHTML = events.slice(0, 50).map(e =>
        '<div class="flex items-center gap-3 py-1.5 border-b border-slate-800/50 hover:bg-slate-800/30 px-2 transition-colors group">' +
        '<span class="text-[10px] text-slate-500 font-mono w-14 shrink-0">' + new Date(e.timestamp).toLocaleTimeString('tr-TR') + '</span>' +
        '<span class="text-[10px] w-14 shrink-0 ' + (['Critical', 'High'].includes(e.severity) ? 'text-red-500 font-bold' : 'text-blue-400') + '">' + e.severity + '</span>' +
        '<span class="truncate text-slate-300 flex-1 text-xs group-hover:text-white transition-colors">' + e.title + '</span>' +
        '</div>').join('');
}

// START
init();
=======


async function fetchLogs(page = 1) {
    try {
        state.logPage = page;
        
        const res = await fetch(`/api/events?page=${page}&limit=${state.logLimit}`);
        const json = await res.json();

        if (json.success) {
            renderLogs(json.data, json.pagination);
        } else {
            console.error('Log fetch failed:', json.message);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}


function renderLogs(events, pagination) {
    const container = document.getElementById('log-content');
    if (!container) return;

    
    
    
    
    
    

    
    const displayEvents = events.filter(e => !(e.olay_basligi || '').includes('TEST_CRITICAL_ALERT'));

    if (displayEvents.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-600 p-2 text-center">Bu sayfada kayıt yok veya hepsi filtrelendi...</div>';
    } else {
        container.innerHTML = displayEvents.map(e =>
            '<div class="flex items-center gap-4 py-2 border-b border-slate-800/50 hover:bg-slate-800/30 px-3 transition-colors group">' +
            '<span class="text-xs text-slate-500 w-16 shrink-0">' + new Date(e.zaman_damgasi || e.timestamp).toLocaleTimeString('tr-TR') + '</span>' +
            '<span class="text-xs w-16 shrink-0 font-bold tracking-wide ' +
            ((e.seviye_adi || e.severity) === 'Critical' ? 'text-red-500' :
                (e.seviye_adi || e.severity) === 'High' ? 'text-orange-500' :
                    (e.seviye_adi || e.severity) === 'Medium' ? 'text-yellow-400' : 'text-blue-400') +
            '">' + (e.seviye_adi || e.severity) + '</span>' +
            '<span class="truncate text-slate-300 flex-1 text-sm font-medium group-hover:text-white transition-colors">' + (e.olay_basligi || e.title) + '</span>' +
            '</div>').join('');
    }

    
    const infoEl = document.getElementById('log-page-info');
    const prevBtn = document.getElementById('log-prev');
    const nextBtn = document.getElementById('log-next');

    
    const totalPages = pagination ? pagination.totalPages : 1;
    const currPage = pagination ? pagination.page : 1;

    if (infoEl) infoEl.innerText = `Sayfa ${currPage} / ${totalPages}`;

    if (prevBtn) {
        prevBtn.disabled = currPage <= 1;
        
        prevBtn.onclick = () => {
            if (currPage > 1) fetchLogs(currPage - 1);
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currPage >= totalPages;
        nextBtn.onclick = () => {
            if (currPage < totalPages) fetchLogs(currPage + 1);
        };
    }
}


function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('sidebar-toggle');
    state.isSidebarOpen = !state.isSidebarOpen;

    if (state.isSidebarOpen) {
        sidebar.classList.remove('w-0', '-ml-0', 'px-0', 'opacity-0');
        sidebar.classList.add('w-80');
        sidebar.querySelector('div').classList.remove('invisible'); 
    } else {
        sidebar.classList.remove('w-80');
        sidebar.classList.add('w-0', 'px-0');
        
        
    }
}


document.addEventListener('DOMContentLoaded', () => {
    init(); 
    fetchLogs(1); 

    
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
});
>>>>>>> Stashed changes
