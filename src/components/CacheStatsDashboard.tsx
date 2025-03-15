import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';
import CategoryDrillDown from './CategoryDrillDown';

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  errors: number;
  avgLatency: number;
  bytesStored: number;
  keyCount: number;
}

interface CategoryStats extends CacheStats {
  category: string;
}

interface HitRateStats {
  cacheType: string;
  overall: number;
  categories: Array<{
    category: string;
    hitRate: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CacheStatsDashboard: React.FC = () => {
  const [currentStats, setCurrentStats] = useState<any[]>([]);
  const [historicalStats, setHistoricalStats] = useState<any[]>([]);
  const [hitRates, setHitRates] = useState<HitRateStats[]>([]);
  const [selectedCacheType, setSelectedCacheType] = useState<string>('memory');
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch current stats
        const currentResponse = await axios.get('/api/cache-stats/current');
        setCurrentStats(currentResponse.data);

        // Fetch hit rates
        const hitRatesResponse = await axios.get('/api/cache-stats/hit-rates');
        setHitRates(hitRatesResponse.data);

        // Fetch historical stats
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - getTimeRangeMs(timeRange));
        const historicalResponse = await axios.get('/api/cache-stats/historical', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            cacheType: selectedCacheType
          }
        });
        setHistoricalStats(historicalResponse.data);
      } catch (error) {
        console.error('Failed to fetch cache statistics:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [selectedCacheType, timeRange]);

  const getTimeRangeMs = (range: string): number => {
    switch (range) {
      case '1h': return 3600000;
      case '24h': return 86400000;
      case '7d': return 604800000;
      default: return 3600000;
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - getTimeRangeMs(timeRange));
      
      const response = await axios.get('/api/cache-stats/export', {
        params: {
          format,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          cacheType: selectedCacheType
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cache-stats-${selectedCacheType}-${new Date().toISOString()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export statistics:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cache Statistics Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('json')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex gap-4">
        <select
          value={selectedCacheType}
          onChange={(e) => setSelectedCacheType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="memory">Memory Cache</option>
          <option value="redis">Redis Cache</option>
          <option value="hybrid">Hybrid Cache</option>
        </select>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hit Rate Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Hit Rates by Category</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={hitRates.find(hr => hr.cacheType === selectedCacheType)?.categories || []}
              dataKey="hitRate"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
              onClick={(data) => setSelectedCategory(data.category)}
              className="cursor-pointer"
            >
              {hitRates.find(hr => hr.cacheType === selectedCacheType)?.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend onClick={(entry) => setSelectedCategory(entry.value)} />
          </PieChart>
        </div>

        {/* Operations Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cache Operations</h2>
          <BarChart
            width={400}
            height={300}
            data={currentStats.filter(stat => stat.cacheType === selectedCacheType)}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hits" fill="#0088FE" name="Hits" />
            <Bar dataKey="misses" fill="#FF8042" name="Misses" />
            <Bar dataKey="sets" fill="#00C49F" name="Sets" />
          </BarChart>
        </div>

        {/* Latency Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Average Latency Over Time</h2>
          <LineChart
            width={400}
            height={300}
            data={historicalStats}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="stats.overall.avgLatency"
              stroke="#8884d8"
              name="Avg Latency"
            />
          </LineChart>
        </div>

        {/* Memory Usage Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Memory Usage Over Time</h2>
          <LineChart
            width={400}
            height={300}
            data={historicalStats}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="stats.overall.bytesStored"
              stroke="#82ca9d"
              name="Bytes Stored"
            />
          </LineChart>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentStats
            .filter(stat => stat.cacheType === selectedCacheType)
            .map(stat => stat.overall)
            .map((overall, index) => (
              <div key={index} className="text-center">
                <p className="text-gray-600">Total Operations</p>
                <p className="text-2xl font-bold">
                  {overall.hits + overall.misses + overall.sets}
                </p>
                <p className="text-gray-600">Hit Rate</p>
                <p className="text-2xl font-bold">
                  {((overall.hits / (overall.hits + overall.misses)) * 100).toFixed(1)}%
                </p>
                <p className="text-gray-600">Avg Latency</p>
                <p className="text-2xl font-bold">
                  {overall.avgLatency.toFixed(2)}ms
                </p>
                <p className="text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold">
                  {(overall.bytesStored / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
            ))}
        </div>
      </div>

      {selectedCategory && (
        <CategoryDrillDown
          cacheType={selectedCacheType}
          category={selectedCategory}
          timeRange={timeRange}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

export default CacheStatsDashboard; 