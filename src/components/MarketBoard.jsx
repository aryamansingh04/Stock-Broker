import { useState, useEffect } from 'react';
import PriceChart from './PriceChart';
import { fetchAllStockPrices } from '../services/stockApi';

export const initialCompaniesData = [
  { id: 1, name: 'Techify', price: 100 + Math.random() * 400 },
  { id: 2, name: 'GreenCorp', price: 100 + Math.random() * 400 },
  { id: 3, name: 'SpaceNet', price: 100 + Math.random() * 400 },
  { id: 4, name: 'Medico', price: 100 + Math.random() * 400 },
  { id: 5, name: 'FoodZone', price: 100 + Math.random() * 400 },
];

function MarketBoard({ portfolio, onBuy, onSell, onCompaniesChange, isGameActive, allCompanies, theme }) {
  const [companies, setCompanies] = useState(initialCompaniesData);
  const [prevPrices, setPrevPrices] = useState(initialCompaniesData);
  const [priceHistory, setPriceHistory] = useState(() => {
    const initialHistory = {};
    companies.forEach(company => {
      initialHistory[company.id] = [company.price];
    });
    return initialHistory;
  });

  useEffect(() => {
    // Notify parent of initial companies
    if (onCompaniesChange) {
      onCompaniesChange(companies);
    }
  }, []);

  // Update companies when allCompanies changes (from news events)
  useEffect(() => {
    if (allCompanies && allCompanies.length > 0) {
      setCompanies(allCompanies);
      onCompaniesChange(allCompanies);
      
      // Update price history for news events
      setPriceHistory(prev => {
        const newHistory = { ...prev };
        allCompanies.forEach(company => {
          if (!newHistory[company.id]) {
            newHistory[company.id] = [company.price];
          } else {
            const updated = [...newHistory[company.id], company.price];
            // Keep only last 10 prices
            newHistory[company.id] = updated.slice(-10);
          }
        });
        return newHistory;
      });
    }
  }, [allCompanies]);

  useEffect(() => {
    if (!isGameActive) return;

    const interval = setInterval(async () => {
      // Try to fetch real stock prices from API
      try {
        const apiPrices = await fetchAllStockPrices(companies);
        
        if (apiPrices) {
          // Use API prices
          setCompanies(prevCompanies => {
            const updated = prevCompanies.map(company => ({
              ...company,
              price: apiPrices[company.id] || company.price
            }));
            setPrevPrices(prevCompanies);
            
            // Update price history
            setPriceHistory(prev => {
              const newHistory = { ...prev };
              updated.forEach(company => {
                if (!newHistory[company.id]) {
                  newHistory[company.id] = [company.price];
                } else {
                  const updated = [...newHistory[company.id], company.price];
                  newHistory[company.id] = updated.slice(-10);
                }
              });
              return newHistory;
            });
            
            // Notify parent of updated prices
            if (onCompaniesChange) {
              onCompaniesChange(updated);
            }
            
            return updated;
          });
        } else {
          // Fall back to random price updates
          setCompanies(prevCompanies => {
            const updated = prevCompanies.map(company => {
              const changePercent = (Math.random() - 0.5) * 10; // -5% to +5%
              const newPrice = company.price * (1 + changePercent / 100);
              return { ...company, price: Math.round(newPrice * 100) / 100 };
            });
            setPrevPrices(prevCompanies);
            
            // Update price history
            setPriceHistory(prev => {
              const newHistory = { ...prev };
              updated.forEach(company => {
                if (!newHistory[company.id]) {
                  newHistory[company.id] = [company.price];
                } else {
                  const updated = [...newHistory[company.id], company.price];
                  newHistory[company.id] = updated.slice(-10);
                }
              });
              return newHistory;
            });
            
            // Notify parent of updated prices
            if (onCompaniesChange) {
              onCompaniesChange(updated);
            }
            
            return updated;
          });
        }
      } catch (error) {
        console.error('Error updating prices:', error);
        // Fall back to random updates on error
        setCompanies(prevCompanies => {
          const updated = prevCompanies.map(company => {
            const changePercent = (Math.random() - 0.5) * 10;
            const newPrice = company.price * (1 + changePercent / 100);
            return { ...company, price: Math.round(newPrice * 100) / 100 };
          });
          setPrevPrices(prevCompanies);
          
          // Update price history
          setPriceHistory(prev => {
            const newHistory = { ...prev };
            updated.forEach(company => {
              if (!newHistory[company.id]) {
                newHistory[company.id] = [company.price];
              } else {
                const updated = [...newHistory[company.id], company.price];
                newHistory[company.id] = updated.slice(-10);
              }
            });
            return newHistory;
          });
          
          if (onCompaniesChange) {
            onCompaniesChange(updated);
          }
          
          return updated;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [onCompaniesChange, isGameActive, companies]);

  const calculateChange = (currentPrice, prevPrice) => {
    if (!prevPrice) return 0;
    const change = currentPrice - prevPrice;
    const percentChange = (change / prevPrice) * 100;
    return Math.round(percentChange * 100) / 100;
  };

  const handleBuy = (companyId, price) => {
    if (onBuy && isGameActive) {
      onBuy(companyId, price);
    }
  };

  const handleSell = (companyId, price) => {
    if (onSell && isGameActive) {
      onSell(companyId, price);
    }
  };

  const cardBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const rowHover = theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';

  return (
    <div className={`${cardBg} rounded-2xl shadow-2xl p-4 sm:p-6 border overflow-x-auto`}>
      <h2 className={`text-xl font-bold ${textColor} mb-4`}>Live Market Board</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className={`border-b-2 ${borderColor}`}>
              <th className={`text-left py-3 px-4 font-semibold ${textSecondary}`}>Company</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondary}`}>Current Price</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondary}`}>Change</th>
              <th className={`text-center py-3 px-4 font-semibold ${textSecondary}`}>Chart</th>
              <th className={`text-right py-3 px-4 font-semibold ${textSecondary}`}>Owned</th>
              <th className={`text-center py-3 px-4 font-semibold ${textSecondary}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => {
              const change = calculateChange(company.price, prevPrices[index]?.price);
              const isPositive = change >= 0;
              const owned = portfolio[company.id] || 0;
              
              return (
                <tr key={company.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${rowHover} transition-colors`}>
                  <td className="py-4 px-4">
                    <span className={`font-semibold ${textColor}`}>{company.name}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-semibold ${textColor}`}>${company.price.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`font-semibold ${
                        isPositive 
                          ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2 px-4 w-32">
                    <PriceChart priceHistory={priceHistory[company.id] || []} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-semibold ${textColor}`}>{owned}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleBuy(company.id, company.price)}
                        disabled={!isGameActive}
                        className={`font-semibold py-1 px-3 rounded-lg text-sm transition-all duration-200 ${
                          isGameActive
                            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => handleSell(company.id, company.price)}
                        disabled={owned === 0 || !isGameActive}
                        className={`font-semibold py-1 px-3 rounded-lg text-sm transition-all duration-200 ${
                          owned > 0 && isGameActive
                            ? 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`text-sm ${textSecondary} mt-4 text-center`}>
        {isGameActive ? 'Prices update every 5 seconds' : 'Game Complete - Trading Disabled'}
      </p>
    </div>
  );
}

export default MarketBoard;
