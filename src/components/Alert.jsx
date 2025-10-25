function Alert({ message, type = 'info', onClose }) {
  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700'
  }[type];

  const bgColorDark = {
    success: 'dark:bg-green-900/20 dark:border-green-500 dark:text-green-400',
    error: 'dark:bg-red-900/20 dark:border-red-500 dark:text-red-400',
    warning: 'dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-400',
    info: 'dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
  }[type];

  if (!message) return null;

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg border ${bgColor} ${bgColorDark} max-w-md animate-slide-down`}>
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-current hover:opacity-70 transition-opacity font-bold text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert;
