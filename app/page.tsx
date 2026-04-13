"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://127.0.0.1:8002")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Failed to connect to backend"));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">LuckyBingo Frontend</h1>
      <p className="mt-4">{message}</p>
    </main>
  );
}