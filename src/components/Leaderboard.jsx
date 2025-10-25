import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc } from 'firebase/firestore';

function Leaderboard({ user, netWorth, theme = 'dark' }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update player's entry in leaderboard
  useEffect(() => {
    if (!user || !netWorth) return;

    const updateLeaderboardEntry = async () => {
      try {
        const leaderboardRef = doc(db, 'leaderboard', user.uid);
        await setDoc(leaderboardRef, {
          username: user.displayName || 'Anonymous',
          netWorth: netWorth,
          timestamp: new Date(),
          uid: user.uid
        }, { merge: true });
      } catch (error) {
        console.error('Error updating leaderboard:', error);
      }
    };

    updateLeaderboardEntry();
  }, [user, netWorth]);

  // Listen to leaderboard changes
  useEffect(() => {
    if (!user) return;

    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(leaderboardRef, orderBy('netWorth', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = [];
      snapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setLeaderboard(entries);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  const bgColor = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className={`${bgColor} rounded-2xl shadow-2xl p-4 sm:p-6 border overflow-hidden`}>
      <h2 className={`text-xl font-bold ${textColor} mb-4`}>🏆 Leaderboard</h2>
      
      {loading ? (
        <div className={`text-center py-8 ${textSecondary}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <p className={`text-center py-8 ${textSecondary}`}>No players yet. Be the first!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b-2 ${borderColor}`}>
                <th className={`text-left py-3 px-2 font-semibold ${textSecondary}`}>Rank</th>
                <th className={`text-left py-3 px-2 font-semibold ${textSecondary}`}>Player</th>
                <th className={`text-right py-3 px-2 font-semibold ${textSecondary}`}>Net Worth</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.uid === user.uid;
                const rowHover = theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100';
                const isCurrentUserBg = theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100';
                return (
                  <tr 
                    key={entry.id} 
                    className={`border-b ${borderColor} ${isCurrentUser ? `${isCurrentUserBg} font-semibold` : rowHover} transition-colors`}
                  >
                    <td className={`py-3 px-2 ${textColor}`}>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
                        {index + 1}
                      </span>
                    </td>
                    <td className={`py-3 px-2 ${isCurrentUser ? theme === 'dark' ? 'text-blue-400' : 'text-blue-700' : textColor}`}>
                      {isCurrentUser && '👤 '}{entry.username}
                    </td>
                    <td className={`py-3 px-2 text-right font-bold ${isCurrentUser 
                      ? theme === 'dark' ? 'text-blue-400' : 'text-blue-700' 
                      : theme === 'dark' ? 'text-green-400' : 'text-green-700'
                    }`}>
                      ${entry.netWorth?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
