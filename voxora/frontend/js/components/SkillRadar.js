/**
 * Component to render a Radar Chart using Chart.js
 * @param {string} elementId 
 * @param {Object} data {labels: [], datasets: [{label, data, color}]}
 */
export const renderRadarChart = (elementId, data) => {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;

    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: data.labels,
            datasets: data.datasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: ds.color.replace(')', ', 0.2)').replace('rgb', 'rgba'),
                borderColor: ds.color,
                borderWidth: 2,
                pointBackgroundColor: ds.color
            }))
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
};
