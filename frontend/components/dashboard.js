// Fetches backend system-wide metrics asynchronously
async function fetchOverview() {
    try {
        const response = await fetch('http://localhost:8000/api/dashboard/overview');
        const data = await response.json();
        
        document.getElementById('statTotal').innerText = data.total_sessions;
        document.getElementById('statActive').innerText = data.active_sessions;
        document.getElementById('statEngage').innerText = data.avg_engagement_score.toFixed(2);
        document.getElementById('statQuiz').innerText = data.avg_quiz_score.toFixed(2);
        document.getElementById('statSuccess').innerText = (data.adaptation_success_rate * 100).toFixed(0) + '%';
    } catch (error) {
        console.error('Failed API link /dashboard/overview:', error);
    }
}
