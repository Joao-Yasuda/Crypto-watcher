"use client";

import { useEffect, useState } from "react";
import PriceChart from "../components/PriceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function Home() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Connecting...");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received data:", data);

        // Validate the data structure
        if (
          data &&
          (data.Symbol || data.symbol) &&
          (data.Price !== undefined || data.price !== undefined)
        ) {
          setPrices((prev) => {
            const newPrices = [...prev, data].slice(-50);
            console.log("Updated prices array:", newPrices);
            return newPrices;
          });
        } else {
          console.warn("Invalid data structure received:", data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setConnectionStatus("Disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("Error");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Real-Time Crypto Prices
            <span
              className={`text-sm px-2 py-1 rounded ${
                connectionStatus === "Connected"
                  ? "bg-green-100 text-green-800"
                  : connectionStatus === "Connecting..."
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {connectionStatus}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-gray-600">
            Total data points received: {prices.length}
          </div>
          <PriceChart data={prices} />
        </CardContent>
      </Card>
    </div>
  );
}
