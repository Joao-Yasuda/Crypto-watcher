"use client";

import { useEffect, useState } from "react";
import PriceChart from "../components/PriceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [prices, setPrices] = useState<
    { symbol: string; price: number; timestamp: string }[]
  >([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices((prev) => [...prev, data].slice(-50));
    };

    ws.onclose = () => console.log("WebSocket closed");
    ws.onerror = (error) => console.error("WebSocket error:", error);

    return () => ws.close();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Crypto Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceChart data={prices} />
        </CardContent>
      </Card>
    </div>
  );
}
