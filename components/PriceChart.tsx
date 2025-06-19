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

interface PriceChartProps {
  data: { symbol: string; price: number; timestamp: string }[];
}

export default function PriceChart({ data }: PriceChartProps) {
  const chartData = {
    labels: data.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "BTC/USDT",
        data: data.filter((d) => d.symbol === "BTCUSDT").map((d) => d.price),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "ETH/USDT",
        data: data.filter((d) => d.symbol === "ETHUSDT").map((d) => d.price),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} />;
}
