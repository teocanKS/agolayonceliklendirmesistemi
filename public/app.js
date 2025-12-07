import { PriorityScorer } from "./scoring-engine.js";

const state = {
    events: [],
    filters: {
        severity: 'all',
        status: 'all'
    }
};

const elements = {
    eventTableBody: document.querySelector("#event-table-body"),
    eventCount: document.querySelector("#event-count"),
    lastUpdated: document.querySelector("#last-updated"),
    refreshButton: document.querySelector("#refresh-button"),
    severityFilter: document.querySelector("#severity-filter"),
    statusFilter: document.querySelector("#status-filter"),
    kpiCritical: document.querySelector("#kpi-critical"),
    kpiHigh: document.querySelector("#kpi-high"),
    kpiTotal: document.querySelector("#kpi-total"),
    kpiAvgScore: document.querySelector("#kpi-avg-score"),
};

let charts = {};

async function initDashboard() {
    bindEventListeners();
    await refreshData();
}

function bindEventListeners() {
    elements.refreshButton?.addEventListener("click", refreshData);
    elements.severityFilter?.addEventListener("change", (e) => {
        state.filters.severity = e.target.value;
        renderEvents();
    });
    elements.statusFilter?.addEventListener("change", (e) => {
        state.filters.status = e.target.value;
        renderEvents();
    });

    // Global functions for buttons
    window.applyScenario = applyScenario;
    window.resetScenarios = resetScenarios;

    // Modal Logic
    const modal = document.getElementById("strategic-modal");
    const btn = document.getElementById("strategic-btn");
    const span = document.getElementsByClassName("close-modal")[0];

    btn.onclick = () => {
        modal.style.display = "block";
        // Analysis is now auto-updated by updateStrategicAnalysis()
    }

    span.onclick = () => {
        modal.style.display = "none";
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Simulation Mode Logic
    const simBtn = document.getElementById("sim-btn");
    const simPanel = document.getElementById("simulation-panel");

    simBtn.onclick = () => {
        if (simPanel.style.display === "none") {
            simPanel.style.display = "block";
        } else {
            simPanel.style.display = "none";
        }
    };

    // Sliders
    const sliders = ['severity', 'criticality', 'volume'];
    sliders.forEach(key => {
        const slider = document.getElementById(`range-${key}`);
        const label = document.getElementById(`val-${key}`);

        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            label.textContent = val;

            // Update Model Weights Dynamically
            PriorityScorer.weights[key] = val;

            // Re-calculate all scores
            state.events = state.events.map(event => {
                const score = PriorityScorer.calculateScore({
                    severity: event.severity,
                    flow_bytes_per_s: event.flow_bytes_per_s,
                    label: event.label,
                    timestamp: event.timestamp
                });
                return { ...event, score };
            });

            renderEvents();
        });
    });
}

// Client-side Strategic Analysis (Dynamic)
function updateStrategicAnalysis() {
    const total = state.events.length;
    if (total === 0) return;

    // 1. Calculate Dynamic Risk Index based on CURRENT scores
    const criticalCount = state.events.filter(e => e.score >= 80).length; // Score >= 80 is Critical
    const riskIndex = (criticalCount / total) * 100;

    // 2. Update Modal UI
    document.getElementById("strat-risk").textContent = "%" + riskIndex.toFixed(1);

    // Growth is historical (static for simulation context, or could be randomized)
    // We keep it as a baseline context
    const growthRate = 15;
    document.getElementById("strat-growth").textContent = "+" + growthRate + "%";

    // 3. Generate Dynamic Recommendations
    let recommendation = "";
    let alternatives = [];

    if (riskIndex > 20) {
        recommendation = "Kritik Seviye - Aksiyon Şart";
        alternatives = [
            {
                title: "Seçenek A: Yüksek Yatırım (Önerilen)",
                desc: `Mevcut modelde risk %${riskIndex.toFixed(1)} seviyesine çıktı. AI tabanlı WAF yatırımı şart.`,
                impact: "Yüksek",
                cost: "$$$"
            },
            {
                title: "Seçenek B: Kural Sıkılaştırma",
                desc: "Skorlama hassasiyeti arttı. Firewall kurallarını 'Aggressive' moda alın.",
                impact: "Orta",
                cost: "$"
            }
        ];
    } else {
        recommendation = "Stabil Seviye";
        alternatives = [
            {
                title: "Seçenek A: Mevcut Yapıyı Koru",
                desc: `Risk indeksi %${riskIndex.toFixed(1)} ile kabul edilebilir seviyede.`,
                impact: "Nötr",
                cost: "$"
            },
            {
                title: "Seçenek B: Rutin Bakım",
                desc: "Sistem stabil. Rutin log incelemelerine devam edin.",
                impact: "Düşük",
                cost: "$"
            }
        ];
    }

    document.getElementById("strat-rec-text").textContent = recommendation;

    const altContainer = document.getElementById("strat-alternatives");
    if (altContainer) {
        altContainer.innerHTML = alternatives.map(alt => `
            <div class="alt-card">
                <span class="alt-title">${alt.title}</span>
                <p style="font-size:0.9rem;">${alt.desc}</p>
                <div class="alt-meta">
                    <span>Etki: ${alt.impact}</span>
                    <span>Maliyet: ${alt.cost}</span>
                </div>
            </div>
        `).join("");
    }
}

async function refreshData() {
    setLoadingState(true);
    try {
        const response = await fetch('/api/events');
        const result = await response.json();

        if (result.success) {
            state.events = result.data.map(event => {
                // Calculate score using the engine
                const score = PriorityScorer.calculateScore({
                    severity: event.severity,
                    flow_bytes_per_s: event.flow_bytes_per_s,
                    label: event.label,
                    timestamp: event.timestamp
                });
                return { ...event, score };
            });

            renderEvents();
            updateKPIs();
            updateCharts();
            updateLastUpdated();
        }
    } catch (error) {
        console.error("Fetch error:", error);
    } finally {
        setLoadingState(false);
    }
}

function renderEvents() {
    if (!elements.eventTableBody) return;

    // Run Strategic Analysis update whenever table renders
    updateStrategicAnalysis();

    const filtered = state.events.filter(event => {
        const sevMatch = state.filters.severity === 'all' || event.severity === state.filters.severity;
        const statusMatch = state.filters.status === 'all' || event.status === state.filters.status;
        return sevMatch && statusMatch;
    }).sort((a, b) => b.score - a.score);

    elements.eventCount.textContent = filtered.length;

    if (!filtered.length) {
        elements.eventTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">Kayıt bulunamadı.</td></tr>`;
        return;
    }

    elements.eventTableBody.innerHTML = filtered.map(event => {
        const recommendation = PriorityScorer.getRecommendation(event.score);
        return `
            <tr>
                <td class="score-cell">
                    <span class="score-chip" style="color:${recommendation.color}">${event.score}</span>
                    <span class="score-meta" style="color:${recommendation.color}">${recommendation.action}</span>
                </td>
                <td class="severity-${event.severity}">${event.severity}</td>
                <td>
                    <div class="event-name">${event.title}</div>
                    <small>${event.detection_rule}</small>
                </td>
                <td>${event.source_ip}</td>
                <td>${event.dest_ip}</td>
                <td><span class="status-pill">${event.status}</span></td>
                <td><span class="tag">${event.label}</span><span class="tag">${event.ack_lane}</span></td>
                <td>${new Date(event.timestamp).toLocaleString('tr-TR')}</td>
            </tr>
        `;
    }).join("");
}

function updateKPIs() {
    elements.kpiTotal.textContent = state.events.length;
    elements.kpiCritical.textContent = state.events.filter(e => e.severity === 'Critical').length;
    elements.kpiHigh.textContent = state.events.filter(e => e.severity === 'High').length;

    const avgScore = state.events.reduce((acc, curr) => acc + curr.score, 0) / (state.events.length || 1);
    elements.kpiAvgScore.textContent = Math.round(avgScore);
}

function updateCharts() {
    // Severity Distribution Chart
    const severityCounts = {};
    state.events.forEach(e => {
        severityCounts[e.severity] = (severityCounts[e.severity] || 0) + 1;
    });

    const ctxSev = document.getElementById('severityDistChart').getContext('2d');
    if (charts.severity) charts.severity.destroy();

    charts.severity = new Chart(ctxSev, {
        type: 'doughnut',
        data: {
            labels: Object.keys(severityCounts),
            datasets: [{
                data: Object.values(severityCounts),
                backgroundColor: ['#ff557a', '#ff9f43', '#feca57', '#54a0ff', '#48dbfb']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }
        }
    });

    // Risk Trend Chart (Future Planning)
    // Simulating "Future 24h" by projecting current trends
    const ctxRisk = document.getElementById('riskTrendChart').getContext('2d');
    if (charts.risk) charts.risk.destroy();

    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const riskData = hours.map(() => Math.floor(Math.random() * 100)); // Simulated prediction

    charts.risk = new Chart(ctxRisk, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Tahmini Risk Yoğunluğu',
                data: riskData,
                borderColor: '#e94560',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(233, 69, 96, 0.2)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });
}

function applyScenario(type) {
    // Client-side simulation of scenarios for KDS interactivity
    if (type === 'ddos') {
        PriorityScorer.weights = { ...PriorityScorer.weights, volume: 0.8, severity: 0.1 };
        alert("Senaryo Aktif: DDoS (Hacim ağırlığı artırıldı)");
    } else if (type === 'night') {
        PriorityScorer.weights = { ...PriorityScorer.weights, hour: 0.8, severity: 0.1 };
        alert("Senaryo Aktif: Gece Vardiyası (Saat ağırlığı artırıldı)");
    }

    // Recalculate scores
    state.events = state.events.map(event => {
        const score = PriorityScorer.calculateScore({
            severity: event.severity,
            flow_bytes_per_s: event.flow_bytes_per_s,
            label: event.label,
            timestamp: event.timestamp
        });
        return { ...event, score };
    });
    renderEvents();
}

function resetScenarios() {
    // Reset weights to default (hardcoded from original file)
    PriorityScorer.weights = {
        severity: 0.35,
        criticality: 0.30,
        attack: 0.20,
        volume: 0.10,
        hour: 0.05,
    };
    alert("Senaryolar sıfırlandı.");
    refreshData();
}

function updateLastUpdated() {
    const now = new Date();
    if (elements.lastUpdated) elements.lastUpdated.textContent = now.toLocaleTimeString('tr-TR');
}

function setLoadingState(isLoading) {
    if (elements.refreshButton) {
        elements.refreshButton.disabled = isLoading;
        elements.refreshButton.textContent = isLoading ? "Yükleniyor..." : "Veriyi Yenile";
    }
}

initDashboard();
