import React from 'react';

export default function EvaluationPanel({ data }) {
  if (!data) {
    return <div style={styles.panel}><p>No evaluation data yet</p></div>;
  }

  const { adaptation_success_rate, avg_reward, completion_rate } = data;

  const getColor = (val, max = 100) => {
    const percent = (val / max) * 100;
    if (percent > 80) return 'green';
    if (percent >= 50) return '#e6b800'; // Darker yellow for text visibility
    return 'red';
  };

  const metrics = [
    { label: 'Adaptation Success', val: adaptation_success_rate, max: 100, unit: '%' },
    { label: 'Avg Reward', val: avg_reward, max: 1.0, unit: '' },
    { label: 'Completion Rate', val: completion_rate, max: 100, unit: '%' }
  ];

  return (
    <div style={styles.panel}>
      <h2 style={styles.title}>📊 System Effectiveness</h2>
      <p style={styles.desc}>This panel evaluates how effectively the system adapts learning content.</p>
      
      <div style={styles.list}>
        {metrics.map((m, i) => (
          <div key={i} style={styles.item}>
            <div style={styles.row}>
              <span>{m.label}</span>
              <span>{m.val}{m.unit}</span>
            </div>
            <div style={styles.barBg}>
              <div style={{...styles.bar, width: `${(m.val / m.max) * 100}%`, backgroundColor: getColor(m.val, m.max)}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  panel: { padding: '16px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '350px', fontFamily: 'sans-serif' },
  title: { fontSize: '18px', margin: '0 0 8px 0' },
  desc: { fontSize: '14px', color: '#555', marginBottom: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: { display: 'flex', flexDirection: 'column', gap: '4px' },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' },
  barBg: { width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }
};
