const API_KEY = import.meta.env.VITE_ALPHA_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Real stock symbols for our companies
const STOCK_SYMBOLS = {
  'Techify': 'AAPL',  // Apple
  'GreenCorp': 'NVDA', // NVIDIA (green energy/tech)
  'SpaceNet': 'NOC',   // Northrop Grumman (space/defense)
  'Medico': 'JNJ',     // Johnson & Johnson (healthcare)
  'FoodZone': 'MCD',   // McDonald's (food)
};

// Cache to track API call limits
let apiCallCount = 0;
const MAX_API_CALLS = 5; // Alpha Vantage free tier allows 5 calls per minute

export async function fetchStockPrice(symbol) {
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    
    // Check for API limit message
    if (data['Note'] || data['Information']) {
      throw new Error('API limit reached');
    }
    
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error('Invalid API response');
    }
    
    const price = parseFloat(quote['05. price']);
    apiCallCount++;
    
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error.message);
    throw error;
  }
}

export async function fetchAllStockPrices(companies) {
  const prices = {};
  
  // Check if we've hit the API limit
  if (apiCallCount >= MAX_API_CALLS) {
    console.log('API limit reached, falling back to random prices');
    return null;
  }
  
  try {
    // Fetch prices for all companies
    const promises = companies.map(async (company) => {
      const symbol = STOCK_SYMBOLS[company.name];
      if (!symbol) {
        return { id: company.id, price: company.price };
      }
      
      try {
        const price = await fetchStockPrice(symbol);
        return { id: company.id, price };
      } catch (error) {
        // Fall back to current price if API fails
        return { id: company.id, price: company.price };
      }
    });
    
    const results = await Promise.all(promises);
    results.forEach(result => {
      prices[result.id] = result.price;
    });
    
    return prices;
  } catch (error) {
    console.error('Error fetching stock prices:', error);
    return null;
  }
}

// Reset API call counter every minute
setInterval(() => {
  apiCallCount = 0;
}, 60000);

export { STOCK_SYMBOLS };
