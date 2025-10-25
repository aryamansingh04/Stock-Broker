import { useState, useEffect } from 'react'
import MarketBoard from './components/MarketBoard'
import NewsBanner from './components/NewsBanner'
import Alert from './components/Alert'
import Leaderboard from './components/Leaderboard'
import { auth, provider, db } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'

// News event definitions
const NEWS_EVENTS = [
  { title: 'releases new product', company: 'Techify', impact: 10 },
  { title: 'announces breakthrough treatment', company: 'Medico', impact: 8 },
  { title: 'wins major contract', company: 'SpaceNet', impact: 12 },
  { title: 'expands operations', company: 'GreenCorp', impact: 7 },
  { title: 'launches new service', company: 'FoodZone', impact: 6 },
  { title: 'reports earnings miss', company: 'Techify', impact: -8 },
  { title: 'regulatory concerns raised', company: 'Medico', impact: -6 },
  { title: 'contract cancellation', company: 'SpaceNet', impact: -10 },
  { title: 'environmental controversy', company: 'GreenCorp', impact: -7 },
  { title: 'supply chain issues', company: 'FoodZone', impact: -5 },
  { title: 'market downturn affects all sectors', company: 'Market', impact: -5 },
  { title: 'market rally boosts all stocks', company: 'Market', impact: 5 },
];

// Company name to ID mapping
const COMPANY_IDS = {
  'Techify': 1,
  'GreenCorp': 2,
  'SpaceNet': 3,
  'Medico': 4,
  'FoodZone': 5,
};

function App() {
  const STARTING_CASH = 10000;

  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // User authentication state
  const [user, setUser] = useState(null);

  // Monitor authentication state and sync with Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore listener for user data
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        // Update local state with Firestore data
        setCash(userData.cash || STARTING_CASH);
        setPortfolio(userData.portfolio || {});
        setDay(userData.day || 1);
        setGameComplete(userData.gameComplete || false);
        setIsGameActive(userData.isGameActive !== undefined ? userData.isGameActive : true);
      } else {
        // Document doesn't exist, create it with initial values
        syncToFirestore({
          cash: STARTING_CASH,
          portfolio: {},
          day: 1,
          gameComplete: false,
          isGameActive: true
        });
      }
    }, (error) => {
      console.error('Error listening to Firestore:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    try {
      console.log('Attempting Google sign-in...');
      console.log('Auth instance:', auth);
      console.log('Provider:', provider);
      
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful:', result);
      
      const userInfo = {
        name: result.user.displayName,
        email: result.user.email,
        uid: result.user.uid
      };
      console.log('User info:', userInfo);
      
      setUser(result.user);
      showAlert(`Welcome, ${userInfo.name}!`, 'success');
    } catch (error) {
      console.error('Error signing in:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please check Firebase settings.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site.';
      }
      
      showAlert(errorMessage, 'error');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      showAlert('Signed out successfully', 'info');
    } catch (error) {
      console.error('Error signing out:', error);
      showAlert('Failed to sign out. Please try again.', 'error');
    }
  };

  // Load saved game state from localStorage
  const loadGameState = () => {
    try {
      const savedState = localStorage.getItem('gameState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          cash: parsed.cash ?? STARTING_CASH,
          portfolio: parsed.portfolio ?? {},
          day: parsed.day ?? 1,
          gameComplete: parsed.gameComplete ?? false,
          isGameActive: parsed.isGameActive ?? true,
          companyPrices: parsed.companyPrices ?? {},
        };
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
    return {
      cash: STARTING_CASH,
      portfolio: {},
      day: 1,
      gameComplete: false,
      isGameActive: true,
      companyPrices: {},
    };
  };

  const initialState = loadGameState();

  const [cash, setCash] = useState(initialState.cash);
  const [portfolio, setPortfolio] = useState(initialState.portfolio);
  const [companyPrices, setCompanyPrices] = useState(initialState.companyPrices);
  const [day, setDay] = useState(initialState.day);
  const [gameComplete, setGameComplete] = useState(initialState.gameComplete);
  const [isGameActive, setIsGameActive] = useState(initialState.isGameActive);
  const [currentNews, setCurrentNews] = useState(null);
  const [allCompanies, setAllCompanies] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    const gameState = {
      cash,
      portfolio,
      day,
      gameComplete,
      isGameActive,
      companyPrices,
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [cash, portfolio, day, gameComplete, isGameActive, companyPrices]);

  // Auto-save to Firestore whenever game state changes
  useEffect(() => {
    if (!user) return;
    
    const gameState = {
      cash,
      portfolio,
      day,
      gameComplete,
      isGameActive
    };
    
    syncToFirestore(gameState);
  }, [cash, portfolio, day, gameComplete, isGameActive, user]);

  useEffect(() => {
    if (!isGameActive) return;

    // 2 hours (7,200,000 ms) per day = 60 days total (2 hours × 30 days)
    const DAY_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    const dayInterval = setInterval(async () => {
      const newDay = day + 1;
      if (newDay > 30) {
        setGameComplete(true);
        setIsGameActive(false);
        await syncToFirestore({ cash, portfolio, day: 30, gameComplete: true, isGameActive: false });
      } else {
        setDay(newDay);
        await syncToFirestore({ cash, portfolio, day: newDay, gameComplete, isGameActive });
      }
    }, DAY_DURATION_MS);

    return () => clearInterval(dayInterval);
  }, [isGameActive, day, cash, portfolio]);

  // News event system
  useEffect(() => {
    if (!isGameActive) return;

    const newsInterval = setInterval(() => {
      const randomEvent = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)];
      setCurrentNews(randomEvent);

      // Apply news impact to prices
      if (randomEvent.company === 'Market') {
        // Market-wide impact
        setAllCompanies(prev => prev.map(company => {
          const newPrice = company.price * (1 + randomEvent.impact / 100);
          return { ...company, price: Math.round(newPrice * 100) / 100 };
        }));
      } else {
        // Company-specific impact
        const companyId = COMPANY_IDS[randomEvent.company];
        setAllCompanies(prev => prev.map(company => {
          if (company.id === companyId) {
            const newPrice = company.price * (1 + randomEvent.impact / 100);
            return { ...company, price: Math.round(newPrice * 100) / 100 };
          }
          return company;
        }));
      }

      // Auto-hide news after 3 seconds
      setTimeout(() => setCurrentNews(null), 3000);
    }, 10000);

    return () => clearInterval(newsInterval);
  }, [isGameActive]);

  const showAlert = (message, type = 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  // Calculate portfolio value helper
  const calculatePortfolioValueHelper = (portfolioData) => {
    let total = 0;
    Object.keys(portfolioData || {}).forEach(companyId => {
      const shares = portfolioData[companyId];
      const price = companyPrices[companyId] || 0;
      total += shares * price;
    });
    return total;
  };

  // Firestore sync functions
  const syncToFirestore = async (gameState) => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const netWorth = gameState.cash + calculatePortfolioValueHelper(gameState.portfolio);

    try {
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          uid: user.uid,
          username: user.displayName || 'Anonymous',
          cash: gameState.cash,
          portfolio: gameState.portfolio,
          day: gameState.day,
          netWorth: netWorth,
          gameComplete: gameState.gameComplete,
          isGameActive: gameState.isGameActive
        });
      } else {
        // Update existing document
        await updateDoc(userDocRef, {
          cash: gameState.cash,
          portfolio: gameState.portfolio,
          day: gameState.day,
          netWorth: netWorth,
          gameComplete: gameState.gameComplete,
          isGameActive: gameState.isGameActive
        });
      }
    } catch (error) {
      console.error('Error syncing to Firestore:', error);
    }
  };

  const buyStock = async (companyId, price) => {
    if (!isGameActive) return;
    if (cash >= price) {
      const newCash = cash - price;
      const newPortfolio = {
        ...portfolio,
        [companyId]: (portfolio[companyId] || 0) + 1
      };
      
      setCash(newCash);
      setPortfolio(newPortfolio);
      
      // Sync to Firestore
      await syncToFirestore({ cash: newCash, portfolio: newPortfolio, day, gameComplete, isGameActive });
      
      showAlert('Stock purchased successfully!', 'success');
    } else {
      showAlert('Insufficient funds!', 'error');
    }
  };

  const sellStock = async (companyId, price) => {
    if (!isGameActive) return;
    if (portfolio[companyId] && portfolio[companyId] > 0) {
      const newCash = cash + price;
      const newPortfolio = {
        ...portfolio,
        [companyId]: portfolio[companyId] - 1
      };
      
      setCash(newCash);
      setPortfolio(newPortfolio);
      
      // Sync to Firestore
      await syncToFirestore({ cash: newCash, portfolio: newPortfolio, day, gameComplete, isGameActive });
      
      showAlert('Stock sold successfully!', 'success');
    } else {
      showAlert('You don\'t have any shares to sell!', 'error');
    }
  };

  const resetGame = async () => {
    // Clear localStorage
    localStorage.removeItem('gameState');
    
    // Reset all state
    const resetState = {
      cash: STARTING_CASH,
      portfolio: {},
      day: 1,
      gameComplete: false,
      isGameActive: true
    };
    
    setCash(resetState.cash);
    setPortfolio(resetState.portfolio);
    setDay(resetState.day);
    setGameComplete(resetState.gameComplete);
    setIsGameActive(resetState.isGameActive);
    setCurrentNews(null);
    setCompanyPrices({});
    
    // Sync to Firestore
    await syncToFirestore(resetState);
    
    // Show confirmation
    showAlert('Game reset! All progress has been cleared.', 'info');
  };

  const handleCompaniesChange = (companies) => {
    const priceMap = {};
    companies.forEach(company => {
      priceMap[company.id] = company.price;
    });
    setCompanyPrices(priceMap);
    setAllCompanies(companies);
  };

  const calculatePortfolioValue = () => {
    let total = 0;
    Object.keys(portfolio).forEach(companyId => {
      const shares = portfolio[companyId];
      const price = companyPrices[companyId] || 0;
      total += shares * price;
    });
    return total;
  };

  // Show login screen if user is not logged in
  if (!user) {
    const bgGradient = theme === 'dark' 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
    const cardBg = theme === 'dark' ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full border backdrop-blur-sm`}>
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="text-6xl">📈</div>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-2`}>Trading Game</h1>
            <p className={`text-base sm:text-lg ${textColor} opacity-70 mb-8`}>
              Build your stock portfolio and compete on the leaderboard!
            </p>
            
            <div className="space-y-4 mb-8">
              <div className={`flex items-center justify-center gap-2 ${textSecondary}`}>
                <span>✨</span>
                <span className="text-sm">Real-time stock prices</span>
              </div>
              <div className={`flex items-center justify-center gap-2 ${textSecondary}`}>
                <span>🏆</span>
                <span className="text-sm">Compete on leaderboard</span>
              </div>
              <div className={`flex items-center justify-center gap-2 ${textSecondary}`}>
                <span>📊</span>
                <span className="text-sm">Track your portfolio</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-3 border-2 border-gray-200"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show summary screen if game is complete
  if (gameComplete) {
    const finalCash = cash;
    const finalPortfolioValue = calculatePortfolioValue();
    const totalAssets = finalCash + finalPortfolioValue;
    const profitLoss = totalAssets - STARTING_CASH;
    const isProfit = profitLoss >= 0;

    const bgGradient = theme === 'dark' 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-2xl w-full border`}>
          <h1 className={`text-4xl font-bold ${textColor} mb-8 text-center`}>Game Over</h1>
          
          <div className="space-y-6">
            <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-purple-900/50 to-indigo-900/50 border-purple-700/30' : 'from-purple-100 to-indigo-100 border-purple-300'} rounded-xl p-6 border`}>
              <h2 className={`text-2xl font-bold ${textColor} mb-4 text-center`}>Final Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className={`${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-300'} rounded-xl p-4 border hover:scale-105 transition-transform`}>
                  <p className={`text-sm ${textSecondary} mb-1`}>Final Cash</p>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>${finalCash.toLocaleString()}</p>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-300'} rounded-xl p-4 border hover:scale-105 transition-transform`}>
                  <p className={`text-sm ${textSecondary} mb-1`}>Portfolio Value</p>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>${finalPortfolioValue.toFixed(2)}</p>
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-300'} rounded-xl p-4 border hover:scale-105 transition-transform`}>
                <p className={`text-sm ${textSecondary} mb-1`}>Total Assets</p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>${totalAssets.toFixed(2)}</p>
              </div>
            </div>

            <div className={`rounded-xl p-6 border ${isProfit 
              ? theme === 'dark' ? 'bg-green-900/30 border-green-600' : 'bg-green-100 border-green-300'
              : theme === 'dark' ? 'bg-red-900/30 border-red-600' : 'bg-red-100 border-red-300'
            }`}>
              <p className={`text-sm ${textSecondary} mb-2`}>Profit / Loss</p>
              <p className={`text-4xl font-bold ${isProfit 
                ? theme === 'dark' ? 'text-green-400' : 'text-green-700' 
                : theme === 'dark' ? 'text-red-400' : 'text-red-700'
              }`}>
                {isProfit ? '+' : ''}${profitLoss.toFixed(2)}
              </p>
              <p className={`text-lg mt-2 ${isProfit 
                ? theme === 'dark' ? 'text-green-400' : 'text-green-600' 
                : theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                {isProfit ? 'Profit' : 'Loss'}
              </p>
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-xl hover:scale-105 active:scale-95 shadow-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bgGradient = theme === 'dark' 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
  
  const navBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgGradient}`}>
      {/* Navbar */}
      <nav className={`${navBg} shadow-2xl border-b sticky top-0 z-40 backdrop-blur-sm ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor} bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text`}>
                📈 Trading Game
              </h1>
              {user && (
                <span className={`text-xs sm:text-sm ${textSecondary} hidden md:block px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  👤 {user.displayName?.split(' ')[0]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleTheme}
                className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'} text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md`}
                title="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <div className={`${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} rounded-lg px-3 sm:px-4 py-2 shadow-md hidden sm:flex items-center gap-2`}>
                <span className="text-sm sm:text-base font-bold text-white">📅 Day: {day} / 30</span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md text-sm sm:text-base"
              >
                🚪 Out
              </button>
              <button
                onClick={resetGame}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md text-sm sm:text-base"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Alert Box */}
        <Alert 
          message={alertMessage} 
          type={alertType} 
          onClose={() => setAlertMessage(null)}
        />

        {/* News Banner */}
        {currentNews && (
          <NewsBanner newsItem={currentNews} />
        )}

        {/* Two Column Layout: Main Content + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Content (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dashboard */}
            <div className={`${cardBg} rounded-2xl shadow-2xl p-4 sm:p-6 border hover:shadow-3xl transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${textColor}`}>📊 Dashboard</h2>
                {user && (
                  <span className={`text-sm ${textSecondary} hidden sm:block`}>
                    {user.displayName}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`bg-gradient-to-br ${theme === 'dark' ? 'from-green-600/20 to-green-700/20 border-green-500/30' : 'from-green-100 to-green-200 border-green-300'} rounded-xl p-4 border hover:scale-105 transition-transform shadow-lg`}>
                  <p className={`text-sm ${textSecondary} mb-1`}>💰 Cash Balance</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>${cash.toLocaleString()}</p>
                </div>
                <div className={`bg-gradient-to-br ${theme === 'dark' ? 'from-blue-600/20 to-blue-700/20 border-blue-500/30' : 'from-blue-100 to-blue-200 border-blue-300'} rounded-xl p-4 border hover:scale-105 transition-transform shadow-lg`}>
                  <p className={`text-sm ${textSecondary} mb-1`}>📈 Portfolio Value</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>${calculatePortfolioValue().toFixed(2)}</p>
                </div>
                <div className={`bg-gradient-to-br ${theme === 'dark' ? 'from-purple-600/20 to-purple-700/20 border-purple-500/30' : 'from-purple-100 to-purple-200 border-purple-300'} rounded-xl p-4 border hover:scale-105 transition-transform shadow-lg`}>
                  <p className={`text-sm ${textSecondary} mb-1`}>💎 Total Assets</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>${(cash + calculatePortfolioValue()).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Market Board with Trading */}
            <div>
              <MarketBoard 
                portfolio={portfolio} 
                onBuy={buyStock} 
                onSell={sellStock}
                onCompaniesChange={handleCompaniesChange}
                isGameActive={isGameActive}
                allCompanies={allCompanies}
                theme={theme}
              />
            </div>

            {/* Portfolio Section */}
            <Portfolio portfolio={portfolio} companyPrices={companyPrices} theme={theme} />
          </div>

          {/* Leaderboard Sidebar (1 column) */}
          <div className="lg:col-span-1">
            <Leaderboard user={user} netWorth={cash + calculatePortfolioValue()} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Portfolio Component
function Portfolio({ portfolio, companyPrices, theme }) {
  const companies = [
    { id: 1, name: 'Techify' },
    { id: 2, name: 'GreenCorp' },
    { id: 3, name: 'SpaceNet' },
    { id: 4, name: 'Medico' },
    { id: 5, name: 'FoodZone' },
  ];

  const portfolioItems = companies.filter(company => portfolio[company.id] > 0);
  
  const totalPortfolioValue = portfolioItems.reduce((total, company) => {
    const shares = portfolio[company.id];
    const price = companyPrices[company.id] || 0;
    return total + (shares * price);
  }, 0);

  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const rowHover = theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
  const bgSecondary = theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100';

  if (portfolioItems.length === 0) {
    return (
      <div className={`${cardBg} rounded-2xl shadow-2xl p-4 sm:p-6 border overflow-x-auto`}>
        <h2 className={`text-xl font-bold ${textColor} mb-4`}>Portfolio</h2>
        <p className={`${textSecondary} text-center py-8`}>No holdings. Start trading to build your portfolio!</p>
      </div>
    );
  }

  return (
    <div className={`${cardBg} rounded-2xl shadow-2xl p-4 sm:p-6 border overflow-x-auto`}>
      <h2 className={`text-xl font-bold ${textColor} mb-4`}>Portfolio</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className={`border-b-2 ${borderColor}`}>
              <th className={`text-left py-3 px-4 font-semibold ${textSecondary}`}>Company</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondary}`}>Shares</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondary}`}>Current Price</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondary}`}>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {portfolioItems.map(company => {
              const shares = portfolio[company.id];
              const price = companyPrices[company.id] || 0;
              const totalValue = shares * price;
              
              return (
                <tr key={company.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${rowHover} transition-colors`}>
                  <td className="py-4 px-4">
                    <span className={`font-semibold ${textColor}`}>{company.name}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-semibold ${textColor}`}>{shares}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-semibold ${textColor}`}>${price.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>${totalValue.toFixed(2)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className={`border-t-2 ${borderColor} ${bgSecondary}`}>
              <td colSpan="3" className={`py-4 px-4 text-right font-bold ${textColor}`}>
                Total Portfolio Value:
              </td>
              <td className={`py-4 px-4 text-right font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-lg`}>
                ${totalPortfolioValue.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default App
