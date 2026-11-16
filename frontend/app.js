let currentSessionId = null;
let pollInterval = null;

// Async HTTP Handler connecting DB to UI
async function fetchSessionDashboard(sessionId) {
    try {
        const response = await fetch(`http://localhost:8000/api/session/${sessionId}/dashboard`);
        if (!response.ok) throw new Error("Backend query failed");
        
        const data = await response.json();
        
        document.getElementById('currentSessionId').innerText = data.session_id;
        document.getElementById('currentSessionId').style.color = '#1565c0';
        document.getElementById('currentEngage').innerText = data.engagement_score.toFixed(2);
        document.getElementById('currentQuiz').innerText = data.quiz_score.toFixed(2);
        document.getElementById('currentAdapts').innerText = data.number_of_adaptations;
        
        renderTimeline(data.adaptations);
        parseSessionDataToChart(data);
        
    } catch (error) {
        console.warn('Session API hook error:', error);
    }
}

// Global Poll execution loop
function startPolling() {
    fetchOverview();
    if (currentSessionId) fetchSessionDashboard(currentSessionId);
    
    // Constant ping sequence every 3 seconds structurally
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(() => {
        fetchOverview();
        if (currentSessionId) fetchSessionDashboard(currentSessionId);
    }, 3000); // Polling bound matching Step 6 requirements
}

// Init Event Listeners
document.getElementById('loadSessionBtn').addEventListener('click', () => {
    const inputId = document.getElementById('sessionInput').value;
    if (inputId) {
        currentSessionId = inputId;
        resetChart();
        fetchSessionDashboard(currentSessionId);
    }
});

startPolling();
