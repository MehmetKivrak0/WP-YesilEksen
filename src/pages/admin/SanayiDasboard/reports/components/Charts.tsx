import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Genel Rapor için grafikler

type TrendData = {
  month: string;
  applications: number;
  approved: number;
  rejected: number;
};

type SectorData = {
  sector: string;
  applications: number;
  approved: number;
  pending: number;
  rejected: number;
};

type StatusData = {
  label: string;
  value: number;
  percentage: number;
  color: string;
};

// Trend Line Chart
export function TrendLineChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis
          dataKey="month"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis className="text-xs text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(229, 231, 235)',
            borderRadius: '8px',
            color: 'rgb(17, 24, 39)',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="applications"
          stroke="#2E7D32"
          strokeWidth={2}
          name="Toplam Başvuru"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="approved"
          stroke="#4CAF50"
          strokeWidth={2}
          name="Onaylanan"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="rejected"
          stroke="#F44336"
          strokeWidth={2}
          name="Reddedilen"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Sector Bar Chart - Stacked Bar Chart
export function SectorBarChart({ data }: { data: SectorData[] }) {
  const chartData = data.map((item) => ({
    name: item.sector,
    Onaylanan: item.approved,
    Bekleyen: item.pending,
    Reddedilen: item.rejected,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis type="number" className="text-xs text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(229, 231, 235)',
            borderRadius: '8px',
            color: 'rgb(17, 24, 39)',
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="square"
        />
        <Bar dataKey="Onaylanan" stackId="a" fill="#4CAF50" radius={[0, 4, 4, 0]} />
        <Bar dataKey="Bekleyen" stackId="a" fill="#FFC107" />
        <Bar dataKey="Reddedilen" stackId="a" fill="#F44336" radius={[4, 0, 0, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Status Pie Chart
export function StatusPieChart({ data }: { data: StatusData[] }) {
  const COLORS = ['#4CAF50', '#FFC107', '#F44336'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(1) : 0}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(229, 231, 235)',
            borderRadius: '8px',
            color: 'rgb(17, 24, 39)',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Approval Rate Area Chart
export function ApprovalRateAreaChart({ data }: { data: TrendData[] }) {
  const chartData = data.map((item) => ({
    month: item.month,
    'Onay Oranı': Number(((item.approved / item.applications) * 100).toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorApproval" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis
          dataKey="month"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis className="text-xs text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(229, 231, 235)',
            borderRadius: '8px',
            color: 'rgb(17, 24, 39)',
          }}
          formatter={(value: number) => [`${value}%`, 'Onay Oranı']}
        />
        <Area
          type="monotone"
          dataKey="Onay Oranı"
          stroke="#4CAF50"
          fillOpacity={1}
          fill="url(#colorApproval)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// SDG Rapor için grafikler

type SDGData = {
  id: number;
  title: string;
  score: number;
};

// SDG Radar Chart
export function SDGRadarChart({ data }: { data: SDGData[] }) {
  const chartData = data.map((item) => ({
    subject: `SDG ${item.id}`,
    score: item.score,
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <PolarGrid className="stroke-gray-300 dark:stroke-gray-700" />
        <PolarAngleAxis
          dataKey="subject"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 10]} className="text-xs text-gray-600 dark:text-gray-400" />
        <Radar
          name="SDG Skoru"
          dataKey="score"
          stroke="#2E7D32"
          fill="#2E7D32"
          fillOpacity={0.6}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(229, 231, 235)',
            borderRadius: '8px',
            color: 'rgb(17, 24, 39)',
          }}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// SDG Bar Chart
export function SDGBarChart({ data }: { data: SDGData[] }) {
  const chartData = data.map((item) => ({
    name: `SDG ${item.id}`,
    score: item.score,
    target: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis
          dataKey="name"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          domain={[0, 10]}
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(229, 231, 235)',
            borderRadius: '8px',
            color: 'rgb(17, 24, 39)',
          }}
        />
        <Legend />
        <Bar dataKey="score" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Mevcut Skor" />
        <Bar dataKey="target" fill="#E0E0E0" radius={[4, 4, 0, 0]} name="Hedef" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// SDG Trend Line Chart
export function SDGTrendChart({ data }: { data: SDGData[] }) {
  const chartData = data.map((item) => ({
    name: `SDG ${item.id}`,
    Skor: item.score,
    target: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis
          dataKey="name"
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          domain={[0, 10]}
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgb(255, 255, 255)',
            border: '1px solid rgb(229, 231, 235)',
            borderRadius: '8px',
            color: 'rgb(17, 24, 39)',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Skor"
          stroke="#2E7D32"
          strokeWidth={3}
          dot={{ r: 6, fill: '#2E7D32' }}
          name="SDG Skoru"
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="#9E9E9E"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Hedef (10)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

