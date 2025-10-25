import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function PriceChart({ priceHistory }) {
  const chartRef = useRef(null);

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-gray-400 text-xs">
        No data yet
      </div>
    );
  }

  const labels = priceHistory.map((_, index) => '');
  const prices = priceHistory.map(p => p);

  // Calculate min and max for better visualization
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1 || 1;

  const data = {
    labels,
    datasets: [
      {
        data: prices,
        borderColor: prices[prices.length - 1] >= prices[0] ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return '$' + context.parsed.y.toFixed(2);
          }
        }
      }
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        min: minPrice - padding,
        max: maxPrice + padding,
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 300,
      easing: 'easeInOutQuart'
    },
  };

  return (
    <div className="h-20 w-full">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}

export default PriceChart;
