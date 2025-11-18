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
const CategoryDrillDown = ({ cacheType, category, timeRange, onClose }) => {
    const [details, setDetails] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const fetchDetails = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                setLoading(true);
                const response = yield axios_1.default.get(`/api/cache-stats/category-details/${cacheType}/${category}`, { params: { timeRange } });
                setDetails(response.data);
            }
            catch (error) {
                console.error('Failed to fetch category details:', error);
            }
            finally {
                setLoading(false);
            }
        });
        fetchDetails();
        const interval = setInterval(fetchDetails, 5000);
        return () => clearInterval(interval);
    }, [cacheType, category, timeRange]);
    if (loading || !details) {
        return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <p>Loading category details...</p>
        </div>
      </div>);
    }
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-6xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {category} Category Analysis ({cacheType})
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
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
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.AreaChart data={details.historical}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}/>
                <recharts_1.YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}/>
                <recharts_1.Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} labelFormatter={(ts) => new Date(ts).toLocaleString()}/>
                <recharts_1.Area type="monotone" dataKey="hitRate" stroke="#0088FE" fill="#0088FE" fillOpacity={0.2}/>
              </recharts_1.AreaChart>
            </recharts_1.ResponsiveContainer>
          </div>

          {/* Operations Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Operations Over Time</h3>
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.LineChart data={details.historical}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}/>
                <recharts_1.YAxis />
                <recharts_1.Tooltip labelFormatter={(ts) => new Date(ts).toLocaleString()}/>
                <recharts_1.Legend />
                <recharts_1.Line type="monotone" dataKey="hits" stroke="#0088FE" name="Hits"/>
                <recharts_1.Line type="monotone" dataKey="misses" stroke="#FF8042" name="Misses"/>
                <recharts_1.Line type="monotone" dataKey="sets" stroke="#00C49F" name="Sets"/>
              </recharts_1.LineChart>
            </recharts_1.ResponsiveContainer>
          </div>

          {/* Latency Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Latency Over Time</h3>
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.LineChart data={details.historical}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}/>
                <recharts_1.YAxis />
                <recharts_1.Tooltip formatter={(value) => `${value.toFixed(2)}ms`} labelFormatter={(ts) => new Date(ts).toLocaleString()}/>
                <recharts_1.Line type="monotone" dataKey="avgLatency" stroke="#8884d8" name="Avg Latency"/>
              </recharts_1.LineChart>
            </recharts_1.ResponsiveContainer>
          </div>

          {/* Memory Usage Over Time */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Memory Usage Over Time</h3>
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.AreaChart data={details.historical}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}/>
                <recharts_1.YAxis />
                <recharts_1.Tooltip formatter={(value) => `${value.toFixed(2)}MB`} labelFormatter={(ts) => new Date(ts).toLocaleString()}/>
                <recharts_1.Area type="monotone" dataKey="memoryUsageMB" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} name="Memory Usage"/>
              </recharts_1.AreaChart>
            </recharts_1.ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = CategoryDrillDown;
