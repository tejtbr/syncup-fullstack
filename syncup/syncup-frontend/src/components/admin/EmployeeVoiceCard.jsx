import { useEffect, useState } from 'react';
import { vibeAnalysisApi } from '../../api';
import toast from 'react-hot-toast';

const periods = [
  { label: 'Today', value: 'today', dateFrom: null, dateTo: null }, // Will be set dynamically
  { label: 'Last 1 Week', value: 'last 1 week', daysBack: 7 },
  { label: 'Last 2 Weeks', value: 'last 2 weeks', daysBack: 14 },
  { label: 'Last 3 Weeks', value: 'last 3 weeks', daysBack: 21 },
  { label: 'Last 4 Weeks', value: 'last 4 weeks', daysBack: 30 },
];

export default function EmployeeVoiceCard({ dateFrom = null, dateTo = null, department = null }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last 4 weeks');

  const getDateRange = (period) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (period === 'today') {
      return { from: todayStr, to: todayStr };
    }
    
    const periodObj = periods.find(p => p.value === period);
    if (!periodObj) {
      return { from: dateFrom, to: dateTo };
    }

    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - periodObj.daysBack);
    const fromStr = fromDate.toISOString().split('T')[0];
    
    return { from: fromStr, to: todayStr };
  };

  const fetchAnalysis = async (period) => {
    setLoading(true);
    try {
      const range = dateFrom && dateTo
        ? { from: dateFrom, to: dateTo }
        : getDateRange(period);

      const result = await vibeAnalysisApi.analyzeComments(range.from, range.to, department);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze comments');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(selectedPeriod);
  }, [selectedPeriod, department, dateFrom, dateTo]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Employee Voice — AI Summary</h2>
          <p className="text-xs text-gray-500 mt-1">
            Administrator insight from {analysis?.totalCommentsAnalyzed || 0} comments
          </p>
        </div>
        <span className="text-xs font-semibold text-blue-600">Admin only</span>
      </div>

      {/* Time Period Selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all
              ${selectedPeriod === period.value 
                ? 'bg-blue-600 text-white shadow' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8">Analyzing comments with AI...</div>}

      {!loading && analysis && (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">{analysis.summaryText}</p>

          {analysis.themes?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {analysis.themes.map((theme, i) => (
                <span key={i} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                  {theme}
                </span>
              ))}
            </div>
          )}

          {analysis.sentiment && (
            <div className="grid gap-3 sm:grid-cols-3">
              {analysis.sentiment.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className="text-xs font-semibold uppercase text-slate-500">{item.label}</div>
                  <div className="text-3xl font-bold text-slate-800 mt-1">{item.percentage}%</div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="text-xs font-semibold uppercase text-blue-600 mb-2">💡 Suggested Action</div>
            <p className="text-sm text-blue-900">{analysis.suggestedAction}</p>
          </div>

          {analysis.highlights?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500 mb-3">📌 Comment Highlights</div>
              <div className="space-y-3">
                {analysis.highlights.map((quote, idx) => (
                  <div key={idx} className="italic border-l-4 border-slate-300 pl-4 text-sm text-slate-600">
                    "{quote}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}