function NewsBanner({ newsItem, onClose }) {
  if (!newsItem) return null;

  const isPositive = newsItem.impact > 0;
  const icon = isPositive ? '📈' : '📉';

  return (
    <div className={`${
      isPositive ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'
    } border-l-4 rounded-xl p-4 mb-4 animate-slide-down border-gray-700`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-semibold text-white">{newsItem.company} {newsItem.title}</p>
            <p className="text-sm text-gray-400">Impact: {isPositive ? '+' : ''}{newsItem.impact}%</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default NewsBanner;
