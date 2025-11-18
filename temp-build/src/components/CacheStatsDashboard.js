"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const recharts_1 = require("recharts");
const axios_1 = __importDefault(require("axios"));
const CategoryDrillDown_1 = __importDefault(require("./CategoryDrillDown"));
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const CacheStatsDashboard = () => {
    var _a, _b;
    const [currentStats, setCurrentStats] = (0, react_1.useState)([]);
    const [historicalStats, setHistoricalStats] = (0, react_1.useState)([]);
    const [hitRates, setHitRates] = (0, react_1.useState)([]);
    const [selectedCacheType, setSelectedCacheType] = (0, react_1.useState)('memory');
    const [timeRange, setTimeRange] = (0, react_1.useState)('1h');
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchStats = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Fetch current stats
                const currentResponse = yield axios_1.default.get('/api/cache-stats/current');
                setCurrentStats(currentResponse.data);
                // Fetch hit rates
                const hitRatesResponse = yield axios_1.default.get('/api/cache-stats/hit-rates');
                setHitRates(hitRatesResponse.data);
                // Fetch historical stats
                const endDate = new Date();
                const startDate = new Date(endDate.getTime() - getTimeRangeMs(timeRange));
                const historicalResponse = yield axios_1.default.get('/api/cache-stats/historical', {
                    params: {
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        cacheType: selectedCacheType
                    }
                });
                setHistoricalStats(historicalResponse.data);
            }
            catch (error) {
                console.error('Failed to fetch cache statistics:', error);
            }
        });
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [selectedCacheType, timeRange]);
    const getTimeRangeMs = (range) => {
        switch (range) {
            case '1h': return 3600000;
            case '24h': return 86400000;
            case '7d': return 604800000;
            default: return 3600000;
        }
    };
    const handleExport = (format) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - getTimeRangeMs(timeRange));
            const response = yield axios_1.default.get('/api/cache-stats/export', {
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
        }
        catch (error) {
            console.error('Failed to export statistics:', error);
        }
    });
    return (<div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cache Statistics Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('json')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Export JSON
          </button>
          <button onClick={() => handleExport('csv')} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex gap-4">
        <select value={selectedCacheType} onChange={(e) => setSelectedCacheType(e.target.value)} className="p-2 border rounded">
          <option value="memory">Memory Cache</option>
          <option value="redis">Redis Cache</option>
          <option value="hybrid">Hybrid Cache</option>
        </select>

        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="p-2 border rounded">
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hit Rate Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Hit Rates by Category</h2>
          <recharts_1.PieChart width={400} height={300}>
            <recharts_1.Pie data={((_a = hitRates.find(hr => hr.cacheType === selectedCacheType)) === null || _a === void 0 ? void 0 : _a.categories) || []} dataKey="hitRate" nameKey="category" cx="50%" cy="50%" outerRadius={100} label onClick={(data) => setSelectedCategory(data.category)} className="cursor-pointer">
              {(_b = hitRates.find(hr => hr.cacheType === selectedCacheType)) === null || _b === void 0 ? void 0 : _b.categories.map((entry, index) => (<recharts_1.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
            </recharts_1.Pie>
            <recharts_1.Tooltip />
            <recharts_1.Legend onClick={(entry) => setSelectedCategory(entry.value)}/>
          </recharts_1.PieChart>
        </div>

        {/* Operations Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cache Operations</h2>
          <recharts_1.BarChart width={400} height={300} data={currentStats.filter(stat => stat.cacheType === selectedCacheType)}>
            <recharts_1.CartesianGrid strokeDasharray="3 3"/>
            <recharts_1.XAxis dataKey="category"/>
            <recharts_1.YAxis />
            <recharts_1.Tooltip />
            <recharts_1.Legend />
            <recharts_1.Bar dataKey="hits" fill="#0088FE" name="Hits"/>
            <recharts_1.Bar dataKey="misses" fill="#FF8042" name="Misses"/>
            <recharts_1.Bar dataKey="sets" fill="#00C49F" name="Sets"/>
          </recharts_1.BarChart>
        </div>

        {/* Latency Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Average Latency Over Time</h2>
          <recharts_1.LineChart width={400} height={300} data={historicalStats}>
            <recharts_1.CartesianGrid strokeDasharray="3 3"/>
            <recharts_1.XAxis dataKey="timestamp" tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}/>
            <recharts_1.YAxis />
            <recharts_1.Tooltip labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}/>
            <recharts_1.Legend />
            <recharts_1.Line type="monotone" dataKey="stats.overall.avgLatency" stroke="#8884d8" name="Avg Latency"/>
          </recharts_1.LineChart>
        </div>

        {/* Memory Usage Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Memory Usage Over Time</h2>
          <recharts_1.LineChart width={400} height={300} data={historicalStats}>
            <recharts_1.CartesianGrid strokeDasharray="3 3"/>
            <recharts_1.XAxis dataKey="timestamp" tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}/>
            <recharts_1.YAxis />
            <recharts_1.Tooltip labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}/>
            <recharts_1.Legend />
            <recharts_1.Line type="monotone" dataKey="stats.overall.bytesStored" stroke="#82ca9d" name="Bytes Stored"/>
          </recharts_1.LineChart>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentStats
            .filter(stat => stat.cacheType === selectedCacheType)
            .map(stat => stat.overall)
            .map((overall, index) => (<div key={index} className="text-center">
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
              </div>))}
        </div>
      </div>

      {selectedCategory && (<CategoryDrillDown_1.default cacheType={selectedCacheType} category={selectedCategory} timeRange={timeRange} onClose={() => setSelectedCategory(null)}/>)}
    </div>);
};
exports.default = CacheStatsDashboard;
