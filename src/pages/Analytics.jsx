import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";

// Mock fallback summary
const mockSummary = {
  visitors: 120,
  cartAdds: 45,
  purchases: 20,
  conversionRate: "44.44",
  avgOrderValue: "2299.50",
  topProducts: [
    { _id: "Ring", count: 12 },
    { _id: "Necklace", count: 9 },
    { _id: "Bracelet", count: 6 },
    { _id: "Earring", count: 5 },
    { _id: "Pendant", count: 3 },
  ],
  dailyStats: [
    { date: "2025-09-01", visits: 20, purchases: 5 },
    { date: "2025-09-02", visits: 25, purchases: 7 },
    { date: "2025-09-03", visits: 30, purchases: 10 },
    { date: "2025-09-04", visits: 18, purchases: 4 },
    { date: "2025-09-05", visits: 40, purchases: 12 },
    { date: "2025-09-06", visits: 35, purchases: 9 },
    { date: "2025-09-07", visits: 50, purchases: 15 },
  ],

  countryStats: [
    { country: "India", visits: 75 },
    { country: "USA", visits: 20 },
    { country: "UK", visits: 10 },
    { country: "Canada", visits: 8 },
    { country: "Germany", visits: 7 },
  ],
};

const API_URL = import.meta.env.VITE_API_URL;


export default function Analytics() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/analytics/summary?range=${range}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        if (res.data?.summary) {
           setData({
  ...res.data.summary,
  dailyStats: res.data.summary.dailyStats?.length
    ? res.data.summary.dailyStats
    : mockSummary.dailyStats,
  countryStats: res.data.summary.countryStats?.length
    ? res.data.summary.countryStats
    : mockSummary.countryStats,
});

        } else {
          setData(mockSummary);
        }
      })
      .catch((err) => {
        console.error("❌ Analytics error:", err);
        setData(mockSummary);
      })
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <p className="text-gray-500">Loading analytics...</p>;
  if (!data) return <p className="text-red-500">Failed to load analytics.</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">📊 Website Analytics</h2>

      {/* Time Filter */}
      <div className="mb-6">
        <label className="mr-2 font-medium">Time Range:</label>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Unique Visitors</p>
          <p className="text-xl font-bold">{data.visitors}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Cart Adds</p>
          <p className="text-xl font-bold">{data.cartAdds}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Purchases</p>
          <p className="text-xl font-bold">{data.purchases}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Conversion Rate</p>
          <p className="text-xl font-bold">{data.conversionRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-xl font-bold">₹{data.avgOrderValue}</p>
        </div>
      </div>

      {/* Line Chart - Daily Visits vs Purchases */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">📈 Daily Visits vs Purchases</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailyStats}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="visits" stroke="#3b82f6" name="Visits" />
            <Line type="monotone" dataKey="purchases" stroke="#10b981" name="Purchases" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🛍️ Top Products (Added to Cart)</h3>
        {data.topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topProducts}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No product data yet</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
  <h3 className="text-lg font-semibold mb-4">🌍 Visitors by Country</h3>
  {data.countryStats && data.countryStats.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.countryStats}>
        <XAxis dataKey="country" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="visits" fill="#60a5fa" name="Visits" />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <p className="text-gray-500">No location data yet</p>
  )}
</div>

    </div>
  );
}
