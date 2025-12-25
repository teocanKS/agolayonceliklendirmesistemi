

const DEFAULT_PARAMS = {
    severityWeight: 0.5,
    volumeWeight: 0.5,
    assetCriticality: 0.8,
    humanFactor: 0.5,
    detectionMaturity: 0.5,
    responseCapacity: 0.5
};

const ParamsManager = {
    getParams() {
        try {
            const s = localStorage.getItem('kds_params_v7');
            return s ? JSON.parse(s) : DEFAULT_PARAMS;
        } catch { return DEFAULT_PARAMS; }
    },

    setParams(p) {
        localStorage.setItem('kds_params_v7', JSON.stringify(p));
        window.dispatchEvent(new Event('kds-params-changed'));
    },

    reset() {
        this.setParams(DEFAULT_PARAMS);
        this.renderPanel('params-container');
    },

    renderPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const p = this.getParams();

        container.innerHTML = `
            ${this.slider('Olay Şiddeti', p.severityWeight, 'severityWeight')}
            ${this.slider('Olay Hacmi', p.volumeWeight, 'volumeWeight')}
            ${this.slider('Varlık Kritikliği', p.assetCriticality, 'assetCriticality')}
            ${this.slider('İnsan Faktörü', p.humanFactor, 'humanFactor')}
            
            <div class="h-px bg-slate-800 my-4"></div>
            
            ${this.slider('Tespit Olgunluğu', p.detectionMaturity, 'detectionMaturity', 'text-blue-400')}
            ${this.slider('Müdahale Kapasitesi', p.responseCapacity, 'responseCapacity', 'text-blue-400')}
        `;

        
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                const key = e.target.dataset.key;
                const val = parseFloat(e.target.value);
                e.target.parentElement.querySelector('.val-display').innerText = val.toFixed(1);

                const cur = this.getParams();
                cur[key] = val;
                this.setParams(cur);
            });
        });
    },

    slider(label, value, key, colorClass = 'text-slate-300') {
        return `
            <div class="mb-4">
                <div class="flex justify-between mb-2 text-xs font-semibold">
                    <span class="${colorClass}">${label}</span>
                    <span class="val-display text-slate-400" id="val-${key}">${value}</span>
                </div>
                <input type="range" 
                       min="0" max="1" step="0.1" value="${value}" data-key="${key}" id="p-${key}"
                       class="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer">
            </div>
        `;
    },

    
    updateSliders(newParams) {
        const currentParams = this.getParams();
        let paramsChanged = false;

        Object.keys(newParams).forEach(key => {
            if (currentParams.hasOwnProperty(key) && currentParams[key] !== newParams[key]) {
                currentParams[key] = newParams[key];
                paramsChanged = true;

                
                const input = document.getElementById(`p-${key}`);
                const valDisplay = document.getElementById(`val-${key}`);

                if (input) input.value = newParams[key];
                if (valDisplay) valDisplay.innerText = newParams[key].toFixed(1);
            }
        });

        
        if (paramsChanged) {
            this.setParams(currentParams);
        }
    }
};

window.ParamsManager = ParamsManager;
