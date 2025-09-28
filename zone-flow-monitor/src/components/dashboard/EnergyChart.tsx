import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartDataPoint {
  timestamp: Date;
  current: number;
  voltage: number;
  power: number;
}

interface EnergyChartProps {
  data: ChartDataPoint[];
  zoneColor: "zone-1" | "zone-2" | "zone-3";
}

export function EnergyChart({ data, zoneColor }: EnergyChartProps) {
  const colorMap = {
    "zone-1": "hsl(var(--zone-1))",
    "zone-2": "hsl(var(--zone-2))",
    "zone-3": "hsl(var(--zone-3))"
  };

  // Format data for chart
  const chartData = data.map(point => ({
    time: point.timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    current: point.current,
    voltage: point.voltage,
    power: point.power
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)} ${
                entry.name === 'Current' ? 'mA' : 
                entry.name === 'Voltage' ? 'V' : 'mW'
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--chart-grid))" 
            opacity={0.3}
          />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '10px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="power"
            stroke={colorMap[zoneColor]}
            strokeWidth={2}
            dot={{ fill: colorMap[zoneColor], strokeWidth: 0, r: 3 }}
            activeDot={{ r: 4, stroke: colorMap[zoneColor], strokeWidth: 2 }}
            name="Power"
          />
          <Line
            type="monotone"
            dataKey="voltage"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="5 5"
            name="Voltage"
          />
          <Line
            type="monotone"
            dataKey="current"
            stroke="hsl(var(--accent))"
            strokeWidth={1.5}
            dot={false}
            strokeOpacity={0.7}
            name="Current"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}