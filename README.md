# 📈 Business Trading Game

A real-time stock trading simulation game built with React, Vite, Tailwind CSS, and Firebase. Trade stocks, track your portfolio, compete on the leaderboard, and watch your net worth grow!

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

## 🌟 Features

### 🎮 Game Features
- **Real-time Stock Trading**: Trade stocks from 5 fictional companies with live price updates
- **Live Price Charts**: Interactive Chart.js visualizations showing price trends
- **Smart Trading System**: Buy and sell stocks with real-time portfolio tracking
- **News Events**: Random news events that impact stock prices every 10 seconds
- **30-Day Challenge**: Complete a 30-day trading challenge to test your skills
- **Portfolio Management**: Track your holdings, cash, and total net worth

### 🔐 Authentication & Data
- **Google Sign-In**: Secure authentication with Firebase Auth
- **Real-time Sync**: Game state synced with Firestore in real-time
- **Leaderboard**: Compete with other players on a global leaderboard
- **Persistent Progress**: Your game state is saved automatically

### 🎨 UI/UX
- **Dark/Light Theme**: Toggle between themes to suit your preference
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **Custom Alerts**: Modern alert system for game feedback
- **Live Updates**: Real-time price updates every 5 seconds

### 📊 Data & Analytics
- **Alpha Vantage API**: Real stock prices from major companies (with fallback)
- **Price History**: Track last 10 price points for each stock
- **Portfolio Analytics**: View your total assets and profit/loss

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for authentication and database)
- Alpha Vantage API key (optional, for real stock prices)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/stock-broker.git
cd "Stock Broker"
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Alpha Vantage API Key
VITE_ALPHA_KEY=RKAPWY3I27CZI1UM

# Firebase Configuration (Optional - fallback values are provided)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=stock-broker-a8511.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=stock-broker-a8511
VITE_FIREBASE_STORAGE_BUCKET=stock-broker-a8511.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=118891476575
VITE_FIREBASE_APP_ID=1:118891476575:web:46b93557b65da607924dea
VITE_FIREBASE_MEASUREMENT_ID=G-0X8SK2E66H
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:5173](http://localhost:5173)

## 🔧 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project (or use existing: `stock-broker-a8511`)
4. Follow the setup wizard

### 2. Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Click on **Google**
3. Toggle **Enable**
4. Enter your support email
5. Save

### 3. Add Authorized Domains

1. Go to **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Add: `localhost`, `127.0.0.1`, and your production domains

### 4. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose a location
5. Enable

### 5. Deploy Security Rules

```bash
firebase login
firebase deploy --only firestore:rules
```

Or manually copy `firestore.rules` content to Firebase Console → Firestore → Rules

## 📦 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy
```

Your app will be live at:
- `https://stock-broker-a8511.web.app`
- `https://stock-broker-a8511.firebaseapp.com`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🎮 How to Play

1. **Sign In**: Click "Sign in with Google" to start playing
2. **View Market**: Check the live stock prices and charts
3. **Buy Stocks**: Click "Buy" to purchase stocks (you start with $10,000)
4. **Sell Stocks**: Click "Sell" to sell shares you own
5. **Track Portfolio**: Monitor your holdings in the Portfolio section
6. **Watch News**: Keep an eye on news events that affect prices
7. **Compete**: Check the leaderboard to see how you rank
8. **Finish**: Complete 30 days to see your final score

## 🛠️ Tech Stack

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization

### Backend & Services
- **Firebase Authentication**: User authentication
- **Cloud Firestore**: Real-time database
- **Firebase Hosting**: Static hosting

### APIs
- **Alpha Vantage API**: Real-time stock prices

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── Alert.jsx       # Alert component
│   │   ├── Leaderboard.jsx # Leaderboard display
│   │   ├── MarketBoard.jsx # Stock market display
│   │   ├── NewsBanner.jsx  # News event banner
│   │   └── PriceChart.jsx  # Price visualization
│   ├── services/           # API services
│   │   └── stockApi.js     # Alpha Vantage integration
│   ├── firebase.js         # Firebase configuration
│   ├── App.jsx             # Main application
│   └── index.css           # Global styles
├── public/                 # Static assets
├── firestore.rules         # Firestore security rules
├── firebase.json           # Firebase configuration
├── .firebaserc             # Firebase project settings
└── package.json            # Dependencies
```

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_ALPHA_KEY` | Alpha Vantage API key | Optional (fallback to random prices) |
| `VITE_FIREBASE_API_KEY` | Firebase API key | No (fallback provided) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | No (fallback provided) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | No (fallback provided) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | No (fallback provided) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging ID | No (fallback provided) |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | No (fallback provided) |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase analytics ID | No (fallback provided) |

## 🐛 Troubleshooting

### Google Sign-In Not Working
See [TROUBLESHOOTING_AUTH.md](TROUBLESHOOTING_AUTH.md) for detailed authentication troubleshooting.

### Common Issues

**Port already in use**
```bash
lsof -ti:5173 | xargs kill -9
```

**Module not found errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Firebase not initialized**
```bash
firebase login
firebase init
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service platform
- [Chart.js](https://www.chartjs.org/) - Simple yet flexible charting library
- [Alpha Vantage](https://www.alphavantage.co/) - Stock market API

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/your-username/stock-broker?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/stock-broker?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/stock-broker)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-username/stock-broker)

---

⭐ If you found this project helpful, please give it a star!
