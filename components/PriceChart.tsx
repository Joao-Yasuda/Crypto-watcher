"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceData {
  ID?: number;
  Symbol: string;
  Price: number;
  Timestamp: string;
  // Also support the original format for backwards compatibility
  symbol?: string;
  price?: number;
  timestamp?: string;
}

interface PriceChartProps {
  data: PriceData[];
}

export default function PriceChart({ data }: PriceChartProps) {
  console.log("Chart data received:", data);

  // Normalize the data to handle both formats
  const normalizedData = data.map((item) => {
    const rawPrice = item.Price ?? item.price;
    let price = 0;

    if (typeof rawPrice === "string") {
      price = parseFloat(rawPrice);
    } else if (typeof rawPrice === "number") {
      price = rawPrice;
    }

    return {
      symbol: item.Symbol || item.symbol || "",
      price: isNaN(price) ? 0 : price,
      timestamp: item.Timestamp || item.timestamp || "",
    };
  });

  console.log("Normalized data:", normalizedData);

  // Separate data by symbol
  const btcData = normalizedData
    .filter((d) => d.symbol === "BTCUSDT" && d.price > 0)
    .slice(-20); // Keep last 20 points for better performance

  const ethData = normalizedData
    .filter((d) => d.symbol === "ETHUSDT" && d.price > 0)
    .slice(-20); // Keep last 20 points for better performance

  console.log("BTC data:", btcData);
  console.log("ETH data:", ethData);

  // If no valid data, show loading state
  if (btcData.length === 0 && ethData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Waiting for price data...</p>
          <p className="text-sm mt-2">
            Received {data.length} data points, filtered: BTC({btcData.length}),
            ETH({ethData.length})
          </p>
        </div>
      </div>
    );
  }

  // Create labels from all timestamps, sorted chronologically
  const allTimestamps = [
    ...new Set([
      ...btcData.map((d) => d.timestamp),
      ...ethData.map((d) => d.timestamp),
    ]),
  ].sort();

  const labels = allTimestamps.map((timestamp) => {
    // Handle different timestamp formats
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      // If timestamp is not a valid date, try parsing as ISO string or return as-is
      return timestamp.slice(-8) || timestamp; // Get last 8 characters (likely time)
    }
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });

  // Create data arrays that align with labels
  const btcPrices = allTimestamps.map((timestamp) => {
    const dataPoint = btcData.find((d) => d.timestamp === timestamp);
    return dataPoint ? dataPoint.price : null;
  });

  const ethPrices = allTimestamps.map((timestamp) => {
    const dataPoint = ethData.find((d) => d.timestamp === timestamp);
    return dataPoint ? dataPoint.price : null;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "BTC/USDT",
        data: btcPrices,
        borderColor: "rgb(247, 147, 26)", // Bitcoin orange
        backgroundColor: "rgba(247, 147, 26, 0.1)",
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        spanGaps: true, // Connect points even if some data is missing
      },
      {
        label: "ETH/USDT",
        data: ethPrices,
        borderColor: "rgb(98, 126, 234)", // Ethereum blue
        backgroundColor: "rgba(98, 126, 234, 0.1)",
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        spanGaps: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Real-Time Cryptocurrency Prices",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            return `${
              context.dataset.label
            }: $${context.parsed.y?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Time",
        },
        ticks: {
          maxTicksLimit: 10, // Limit number of time labels to avoid crowding
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Price (USD)",
        },
        ticks: {
          callback: function (value) {
            return (
              "$" +
              Number(value).toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            );
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.1,
      },
    },
  };

  return (
    <div className="h-96 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
