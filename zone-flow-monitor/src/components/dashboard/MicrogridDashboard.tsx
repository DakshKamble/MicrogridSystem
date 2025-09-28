import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { ZoneCard } from "./ZoneCard";
import { useEnergyData } from "@/hooks/useEnergyData";

export function MicrogridDashboard() {
  const { data, aggregateStats, hasAlerts } = useEnergyData();

  // Zone configuration for 3-zone system
  const zoneConfig = {
    1: { name: "Zone 1", nodeName: "NodeMCU_Node1", color: "blue" },
    2: { name: "Zone 2", nodeName: "NodeMCU_Node2", color: "green" },
    3: { name: "Zone 3", nodeName: "NodeMCU_Node3", color: "orange" }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DashboardHeader
          isConnected={data.isConnected}
          lastUpdate={data.lastUpdate}
          hasAlerts={hasAlerts}
        />

        {/* Main Zone Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((zoneId) => (
            <ZoneCard
              key={zoneId}
              zoneId={zoneId}
              name={`${zoneConfig[zoneId as keyof typeof zoneConfig].name} – ${zoneConfig[zoneId as keyof typeof zoneConfig].nodeName}`}
              nodeName={zoneConfig[zoneId as keyof typeof zoneConfig].nodeName}
              data={data.zones[zoneId]}
              isOnline={data.status[zoneId]}
            />
          ))}
        </div>

        {/* Footer */}
        <DashboardFooter stats={aggregateStats} />
      </div>
    </div>
  );
}