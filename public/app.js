import { PriorityScorer } from "./scoring-engine.js";

const state = {
    events: [],
    filters: {
        severity: 'all',
        status: 'all'
    },
    strategicData: null
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
        refreshStrategicAnalysis(); // Fetch fresh analysis when modal opens
    }

    span.onclick = () => {
        modal.style.display = "none";
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Simulation Panel Logic
    const simBtn = document.getElementById("sim-btn");
    const simPanel = document.getElementById("simulation-panel");

    simBtn.onclick = () => {
        simPanel.style.display = simPanel.style.display === "none" ? "block" : "none";
    };

    // Sliders for Sensitivity Analysis
    const sliders = ['severity', 'criticality', 'volume'];
    sliders.forEach(key => {
        const slider = document.getElementById(`range-${key}`);
        const label = document.getElementById(`val-${key}`);

        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (label) label.textContent = val;

                // Update Model Weights Dynamically
                PriorityScorer.weights[key] = val;

                // Re-calculate scores locally
                recalculateScores();
                renderEvents();
            });
        }
    });

    // Chart.js Default Font Color for Dark Mode
    Chart.defaults.color = '#fff';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
}

async function refreshData() {
    setLoadingState(true);
    try {
        // Parallel Fetch: Events + Long Term Stats
        const [eventsRes, longTermRes] = await Promise.all([
            fetch('/api/events'),
            fetch('/api/long-term-stats')
        ]);

        const eventsResult = await eventsRes.json();
        const longTermResult = await longTermRes.json();

        if (eventsResult.success) {
            state.events = eventsResult.data.map(event => ({
                ...event,
                score: 0 // Will be calculated immediately
            }));
            recalculateScores(); // Calculate scores based on current weights

            renderEvents();
            updateKPIs();
            updateLastUpdated();
        }

        if (longTermResult.success) {
            updateCharts(longTermResult.data);
        }

    } catch (error) {
        console.error("Fetch error:", error);
    } finally {
        setLoadingState(false);
    }
}

async function refreshStrategicAnalysis() {
    try {
        const response = await fetch('/api/strategic-insights');
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            document.getElementById("strat-risk").textContent = "%" + data.riskIndex;
            document.getElementById("strat-growth").textContent = "%" + data.projectedGrowth; // Actually growth rate
            document.getElementById("strat-rec-text").textContent = data.recommendation;

            const altContainer = document.getElementById("strat-alternatives");
            if (altContainer) {
                altContainer.innerHTML = data.alternatives.map(alt => `
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
    } catch (error) {
        console.error("Strategic analysis error:", error);
        document.getElementById("strat-rec-text").textContent = "Analiz verisi alınamadı.";
    }
}

function recalculateScores() {
    state.events = state.events.map(event => {
        const score = PriorityScorer.calculateScore({
            severity: event.severity,
            flow_bytes_per_s: event.flow_bytes_per_s || 0,
            label: event.label,
            timestamp: event.timestamp
        });
        return { ...event, score };
    });
}

function renderEvents() {
    if (!elements.eventTableBody) return;

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

function updateCharts(longTermData) {
    // 1. Severity Distribution (Doughnut) - Based on LOADED events (Operational view)
    const severityCounts = {};
    state.events.forEach(e => {
        severityCounts[e.severity] = (severityCounts[e.severity] || 0) + 1;
    });

    const ctxSev = document.getElementById('severityDistChart');
    if (ctxSev) {
        if (charts.severity) charts.severity.destroy();
        charts.severity = new Chart(ctxSev.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(severityCounts),
                datasets: [{
                    data: Object.values(severityCounts),
                    backgroundColor: ['#ff557a', '#ff9f43', '#feca57', '#54a0ff', '#48dbfb'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });
    }

    // 2. Risk/Volume Trend (Line Chart) - Based on LONG TERM BACKEND events (Strategic view)
    const ctxRisk = document.getElementById('riskTrendChart');
    if (ctxRisk && longTermData) {
        if (charts.risk) charts.risk.destroy();

        // Prepare datasets for the Line Chart
        // longTermData = { labels: [...], datasets: { 'Critical': [...], ... } }

        const datasets = [];
        const colors = { 'Critical': '#ff557a', 'High': '#ff9f43', 'Medium': '#feca57', 'Low': '#54a0ff', 'Info': '#48dbfb' };

        Object.keys(longTermData.datasets).forEach(severity => {
            if (colors[severity]) { // Filter mostly by relevant ones if needed
                datasets.push({
                    label: severity,
                    data: longTermData.datasets[severity],
                    borderColor: colors[severity],
                    backgroundColor: colors[severity],
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 2
                });
            }
        });

        charts.risk = new Chart(ctxRisk.getContext('2d'), {
            type: 'line',
            data: {
                labels: longTermData.labels, // Months
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Son 12 Ay - Saldırı Türü Dağılımı' },
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

function applyScenario(type) {
    if (type === 'ddos') {
        // High Volume becomes critical
        PriorityScorer.weights = { ...PriorityScorer.weights, volume: 0.8, severity: 0.1 };
        alert("Senaryo Aktif: DDoS (Hacim Ağırlıklı)");
    } else if (type === 'night') {
        // Late hours become critical
        PriorityScorer.weights = { ...PriorityScorer.weights, hour: 0.8, severity: 0.1 };
        alert("Senaryo Aktif: Gece Vardiyası (Saat Ağırlıklı)");
    }

    recalculateScores();
    renderEvents();
}

function resetScenarios() {
    PriorityScorer.weights = {
        severity: 0.35,
        criticality: 0.30,
        attack: 0.20,
        volume: 0.10,
        hour: 0.05,
    };
    alert("Senaryolar sıfırlandı.");
    recalculateScores();
    renderEvents();
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
