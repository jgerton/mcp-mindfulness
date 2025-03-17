import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';

interface CategoryDrillDownProps {
  cacheType: string;
  category: string;
  timeRange: string;
  onClose: () => void;
}

interface CategoryDetails {
  current: {
    hits: number;
    misses: number;
    sets: number;
    invalidations: number;
    errors: number;
    avgLatency: number;
    bytesStored: number;
    keyCount: number;
  };
  historical: Array<{
    timestamp: string;
    hits: number;
    misses: number;
    sets: number;
    hitRate: number;
    avgLatency: number;
    memoryUsageMB: number;
  }>;
  summary: {
    avgHitRate: number;
    avgLatency: number;
    peakMemoryUsage: number;
    totalOperations: number;
    errorRate: number;
  };
}

const CategoryDrillDown: React.FC<CategoryDrillDownProps> = ({
  cacheType,
  category,
  timeRange,
  onClose
}) => {
  const [details, setDetails] = useState<CategoryDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/cache-stats/category-details/${cacheType}/${category}`,
          { params: { timeRange } }
        );
        setDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch category details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    const interval = setInterval(fetchDetails, 5000);
    return () => clearInterval(interval);
  }, [cacheType, category, timeRange]);

  if (loading || !details) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <p>Loading category details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-6xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {category} Category Analysis ({cacheType})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm text-blue-800">Hit Rate</h3>
            <p className="text-2xl font-bold text-blue-600">
              {(details.summary.avgHitRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm text-green-800">Avg Latency</h3>
            <p className="text-2xl font-bold text-green-600">
              {details.summary.avgLatency.toFixed(2)}ms
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm text-purple-800">Peak Memory</h3>
            <p className="text-2xl font-bold text-purple-600">
              {details.summary.peakMemoryUsage.toFixed(2)}MB
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm text-yellow-800">Total Operations</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {details.summary.totalOperations.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm text-red-800">Error Rate</h3>
            <p className="text-2xl font-bold text-red-600">
              {(details.summary.errorRate * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hit Rate Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Hit Rate Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={details.historical}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                />
                <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                <Tooltip
                  formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  labelFormatter={(ts) => new Date(ts).toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey="hitRate"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Operations Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Operations Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={details.historical}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip labelFormatter={(ts) => new Date(ts).toLocaleString()} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hits"
                  stroke="#0088FE"
                  name="Hits"
                />
                <Line
                  type="monotone"
                  dataKey="misses"
                  stroke="#FF8042"
                  name="Misses"
                />
                <Line
                  type="monotone"
                  dataKey="sets"
                  stroke="#00C49F"
                  name="Sets"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Latency Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Latency Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={details.historical}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(2)}ms`}
                  labelFormatter={(ts) => new Date(ts).toLocaleString()}
                />
                <Line
                  type="monotone"
                  dataKey="avgLatency"
                  stroke="#8884d8"
                  name="Avg Latency"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Memory Usage Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Memory Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={details.historical}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(2)}MB`}
                  labelFormatter={(ts) => new Date(ts).toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey="memoryUsageMB"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.2}
                  name="Memory Usage"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDrillDown; 