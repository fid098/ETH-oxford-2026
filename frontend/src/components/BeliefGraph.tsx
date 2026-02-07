import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { Position } from "../api";
import "./BeliefGraph.css";

interface Props {
  positions: Position[];
  height?: number;
  mini?: boolean;
}

interface DataPoint {
  time: string;
  timestamp: number;
  yes: number;
  no: number;
}

function buildTimeline(positions: Position[]): DataPoint[] {
  if (positions.length === 0) {
    return [
      { time: "Start", timestamp: 0, yes: 50, no: 50 },
    ];
  }

  const sorted = [...positions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const points: DataPoint[] = [
    {
      time: "Start",
      timestamp: new Date(sorted[0].created_at).getTime() - 1,
      yes: 50,
      no: 50,
    },
  ];

  const cumulative: Position[] = [];

  for (const pos of sorted) {
    cumulative.push(pos);

    const yesWeight = cumulative
      .filter((p) => p.side === "yes")
      .reduce((s, p) => s + p.stake * p.confidence, 0);
    const noWeight = cumulative
      .filter((p) => p.side === "no")
      .reduce((s, p) => s + p.stake * p.confidence, 0);
    const total = yesWeight + noWeight;

    const yesPct = total > 0 ? Math.round((yesWeight / total) * 1000) / 10 : 50;
    const noPct = total > 0 ? Math.round((noWeight / total) * 1000) / 10 : 50;

    const d = new Date(pos.created_at);
    points.push({
      time: `${d.getMonth() + 1}/${d.getDate()}`,
      timestamp: d.getTime(),
      yes: yesPct,
      no: noPct,
    });
  }

  return points;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="belief-tooltip">
      <p className="belief-tooltip-label">{label}</p>
      <p className="belief-tooltip-yes">True: {payload[0]?.value}%</p>
      <p className="belief-tooltip-no">False: {payload[1]?.value}%</p>
    </div>
  );
};

export default function BeliefGraph({ positions, height = 280, mini = false }: Props) {
  const data = buildTimeline(positions);

  if (mini) {
    return (
      <div className="belief-graph-mini">
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id="miniGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="yes"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#miniGreen)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="belief-graph">
      <div className="belief-graph-header">
        <h3 className="belief-graph-title">Belief Graph</h3>
        <div className="belief-graph-legend">
          <span className="legend-item legend-yes">True</span>
          <span className="legend-item legend-no">False</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradYes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradNo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2740" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#1e2740" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <ReferenceLine y={50} stroke="#2a3352" strokeDasharray="6 4" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="yes"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#gradYes)"
            dot={{ r: 4, fill: "#22c55e", stroke: "#0a0e1a", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#22c55e", stroke: "#0a0e1a", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="no"
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#gradNo)"
            dot={{ r: 4, fill: "#ef4444", stroke: "#0a0e1a", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#ef4444", stroke: "#0a0e1a", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
