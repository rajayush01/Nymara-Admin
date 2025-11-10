import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";

// ✅ Mock fallback summary
const mockSummary = {
  visitors: 1200,
  cartAdds: 450,
  purchases: 200,
  conversionRate: "44.44",
  avgOrderValue: "2299.50",
  topProducts: [
    { _id: "Ring", count: 120 },
    { _id: "Necklace", count: 90 },
    { _id: "Bracelet", count: 60 },
    { _id: "Earring", count: 55 },
    { _id: "Pendant", count: 30 },
  ],
  // ✅ 12-month sample data
  dailyStats: [
    { date: "2025-01", visits: 120, purchases: 35 },
    { date: "2025-02", visits: 135, purchases: 45 },
    { date: "2025-03", visits: 150, purchases: 55 },
    { date: "2025-04", visits: 180, purchases: 70 },
    { date: "2025-05", visits: 220, purchases: 90 },
    { date: "2025-06", visits: 260, purchases: 110 },
    { date: "2025-07", visits: 280, purchases: 130 },
    { date: "2025-08", visits: 310, purchases: 150 },
    { date: "2025-09", visits: 350, purchases: 170 },
    { date: "2025-10", visits: 400, purchases: 190 },
    { date: "2025-11", visits: 450, purchases: 210 },
    { date: "2025-12", visits: 480, purchases: 240 },
  ],
  countryStats: [
    { country: "India", visits: 750 },
    { country: "USA", visits: 200 },
    { country: "UK", visits: 100 },
    { country: "Canada", visits: 80 },
    { country: "Germany", visits: 70 },
  ],
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // ✅ Decide chart mode based on range
    const mode = range === "365" ? "monthly" : "daily";

    axios
      .get(`http://localhost:5000/api/analytics/summary?range=${range}&mode=${mode}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        const summary = res.data?.summary;

        if (summary) {
          setData({
            ...summary,
            // ✅ Defensive defaults
            dailyStats: Array.isArray(summary.dailyStats) && summary.dailyStats.length > 0
              ? summary.dailyStats
              : mockSummary.dailyStats,
            countryStats: Array.isArray(summary.countryStats) && summary.countryStats.length > 0
              ? summary.countryStats
              : mockSummary.countryStats,
            topProducts: Array.isArray(summary.topProducts) && summary.topProducts.length > 0
              ? summary.topProducts.sort((a, b) => b.count - a.count).slice(0, 5)
              : mockSummary.topProducts,
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

      {/* ✅ Time Filter */}
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
          <option value="365">Last 12 Months</option> {/* ✅ Added */}
        </select>
      </div>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Unique Visitors", value: data.visitors },
          { label: "Cart Adds", value: data.cartAdds },
          { label: "Purchases", value: data.purchases },
          { label: "Conversion Rate", value: `${data.conversionRate}%` },
          { label: "Avg Order Value", value: `₹${data.avgOrderValue}` },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ✅ Line Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">
          {range === "365" ? "📈 Monthly" : "📈 Daily"} Visits vs Purchases
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailyStats}>
            <XAxis
              dataKey="date"
              tickFormatter={(val) =>
                range === "365"
                  ? new Date(val + "-01").toLocaleString("default", { month: "short" })
                  : val.slice(5)
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(val) =>
                range === "365"
                  ? new Date(val + "-01").toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })
                  : val
              }
            />
            <Legend />
            <Line type="monotone" dataKey="visits" stroke="#3b82f6" name="Visits" />
            <Line type="monotone" dataKey="purchases" stroke="#10b981" name="Purchases" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ Optional Month-Wise Table (only for 12 months view) */}
      {range === "365" && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">📅 Month-Wise Summary</h3>
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Month</th>
                <th className="py-2 px-4 text-left">Visits</th>
                <th className="py-2 px-4 text-left">Purchases</th>
                <th className="py-2 px-4 text-left">Conversion Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.dailyStats.map((item) => {
  // ✅ Normalize date string safely
  const [year, month] = item.date.split("-");
  const safeDate = `${year}-${month.padStart(2, "0")}-01`;

  const monthLabel = new Date(safeDate).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const conversion =
    item.visits > 0 ? ((item.purchases / item.visits) * 100).toFixed(2) : "0.00";

  return (
    <tr key={item.date} className="border-t border-gray-200">
      <td className="py-2 px-4">{monthLabel}</td>
      <td className="py-2 px-4">{item.visits}</td>
      <td className="py-2 px-4">{item.purchases}</td>
      <td className="py-2 px-4">{conversion}</td>
    </tr>
  );
})}

            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Top 5 Products */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🛍️ Top 5 Products (Added to Cart)</h3>
        {data.topProducts && data.topProducts.length > 0 ? (
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

      {/* ✅ Visitors by Country */}
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
