function renderTimeline(adaptations) {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = ''; // Wipe DOM buffer
    
    if (!adaptations || adaptations.length === 0) {
        container.innerHTML = '<p style="color: grey;">Telemetry log empty. No deterministic adaptations recorded yet.</p>';
        return;
    }

    // Isolate by timestamp hierarchy safely.
    const sorted = [...adaptations].reverse();

    sorted.forEach(item => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
            <strong style="color: #d32f2f;">Transformation Target:</strong> ${item.decision.toUpperCase()}<br/>
            <span><strong>Executing Agent:</strong> ${item.agent.toUpperCase()} | <strong>System Confidence:</strong> ${(item.confidence * 100).toFixed(1)}%</span><br/>
            <span><strong>Timestamp:</strong> ${new Date(item.timestamp).toLocaleString()}</span>
        `;
        container.appendChild(div);
    });
}
