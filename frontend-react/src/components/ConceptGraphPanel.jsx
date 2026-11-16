import React from 'react';

const ConceptGraphPanel = ({ conceptData }) => {
  if (!conceptData || !conceptData.original) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🧠</span>
          <h2 className="text-lg font-bold text-slate-900">Concept Analysis</h2>
        </div>
        <div className="flex items-center justify-center py-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
          <p className="text-sm text-slate-400 italic">No concept analysis available</p>
        </div>
      </section>
    );
  }

  const formatName = (name) => {
    if (!name) return '';
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const { original, root_gap, path } = conceptData;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <h2 className="text-lg font-bold text-slate-900">Concept Analysis</h2>
      </div>

      <div className="space-y-4 text-sm text-slate-700">
        <div>
          <span className="font-semibold text-slate-500 uppercase text-xs tracking-wider">1. Weak Concept</span>
          <p className="mt-1 font-medium">{formatName(original)}</p>
        </div>

        <div>
          <span className="font-semibold text-slate-500 uppercase text-xs tracking-wider">2. Root Gap</span>
          <p className="mt-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit border border-emerald-100">
            {formatName(root_gap)}
          </p>
        </div>

        <div>
          <span className="font-semibold text-slate-500 uppercase text-xs tracking-wider">3. Dependency Path</span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {path && path.length > 0 ? (
              path.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${idx === path.length - 1 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {formatName(step)}
                  </span>
                  {idx < path.length - 1 && <span className="text-slate-300">→</span>}
                </React.Fragment>
              ))
            ) : (
              <span className="text-slate-400 italic">No path found</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConceptGraphPanel;
