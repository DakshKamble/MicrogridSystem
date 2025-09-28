import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnergyGauge } from "./EnergyGauge";
import { EnergyChart } from "./EnergyChart";

interface ZoneData {
  current: number;
  voltage: number;
  power: number;
  history: {
    timestamp: Date;
    current: number;
    voltage: number;
    power: number;
  }[];
}

interface ZoneCardProps {
  zoneId: number;
  name: string;
  nodeName: string;
  data: ZoneData;
  isOnline: boolean;
}

export function ZoneCard({ zoneId, name, nodeName, data, isOnline }: ZoneCardProps) {
  const zoneColor = `zone-${zoneId}` as "zone-1" | "zone-2" | "zone-3";
  
  const gradientMap = {
    1: "bg-[var(--gradient-zone-1)]",
    2: "bg-[var(--gradient-zone-2)]", 
    3: "bg-[var(--gradient-zone-3)]"
  };

  // Apply opacity and different styling when offline
  const cardStyle = isOnline 
    ? `p-6 border-border/50 backdrop-blur-sm ${gradientMap[zoneId]}`
    : `p-6 border-destructive/30 backdrop-blur-sm bg-destructive/5 opacity-75`;

  return (
    <Card className={`${cardStyle} relative`}>
      {/* Zone Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{name}</h2>
          <p className="text-sm text-muted-foreground">{nodeName}</p>
        </div>
        <Badge 
          variant={isOnline ? "secondary" : "destructive"}
          className={isOnline ? "bg-status-online/20 text-status-online border-status-online/30" : ""}
        >
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      {/* Offline Overlay */}
      {!isOnline && (
        <div className="absolute inset-0 bg-destructive/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-4xl mb-2">📶</div>
            <div className="text-destructive font-semibold">ESP32 Disconnected</div>
            <div className="text-sm text-muted-foreground mt-1">No data received for 15+ seconds</div>
            <div className="text-xs text-muted-foreground mt-2">Showing last known values</div>
          </div>
        </div>
      )}

      {/* Energy Gauges */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <EnergyGauge
          title="Current"
          value={data.current}
          unit="mA"
          max={3000}
          icon="🔋"
          color={zoneColor}
        />
        <EnergyGauge
          title="Voltage"
          value={data.voltage}
          unit="V"
          max={12}
          icon="🔌"
          color={zoneColor}
        />
        <EnergyGauge
          title="Power"
          value={data.power}
          unit="mW"
          max={15000}
          icon="⚡"
          color={zoneColor}
        />
      </div>

      {/* Historical Chart */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Last 15 Minutes
        </h3>
        <EnergyChart data={data.history} zoneColor={zoneColor} />
      </div>
    </Card>
  );
}