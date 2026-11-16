let interactionChart = null;
let historicalData = [];

function parseSessionDataToChart(sessionData) {
    // Generate real-time live progression curve capturing incoming engagement pings
    const ctx = document.getElementById('engagementChart').getContext('2d');
    
    // Append the exact timestamp formatting directly mapped to polling instance
    const now = new Date().toLocaleTimeString();
    
    // FIFO Queue maintaining exact 15 bounds strictly
    if (historicalData.length > 15) historicalData.shift();
    
    historicalData.push({
        time: now,
        score: sessionData.engagement_score
    });

    const labels = historicalData.map(d => d.time);
    const data = historicalData.map(d => d.score);

    if (interactionChart) {
        interactionChart.data.labels = labels;
        interactionChart.data.datasets[0].data = data;
        interactionChart.update();
    } else {
        interactionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Live Engagement Algorithm Threshold',
                    data: data,
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#0d47a1',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { 
                        min: 0, 
                        max: 1,
                        title: { display: true, text: 'Score' }
                    },
                    x: {
                        title: { display: true, text: 'Time window' }
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }
}

function resetChart() {
    historicalData = [];
    if (interactionChart) {
        interactionChart.destroy();
        interactionChart = null;
    }
}
