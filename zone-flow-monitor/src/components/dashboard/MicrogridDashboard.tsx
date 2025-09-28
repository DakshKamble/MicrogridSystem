import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { ZoneCard } from "./ZoneCard";
import { useEnergyData } from "@/hooks/useEnergyData";

export function MicrogridDashboard() {
  const { data, aggregateStats, hasAlerts } = useEnergyData();

  // Single NodeMCU configuration
  const zoneName = "Zone 1";
  const nodeName = "NodeMCU_Node1";

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DashboardHeader
          isConnected={data.isConnected}
          lastUpdate={data.lastUpdate}
          hasAlerts={hasAlerts}
        />

        {/* Main Zone Display - NodeMCU Zone 1 */}
        <div className="grid grid-cols-1 gap-6 mb-6 max-w-3xl mx-auto">
          <ZoneCard
            key={1}
            zoneId={1}
            name={`${zoneName} (${nodeName})`}
            nodeName={nodeName}
            data={data.zones[1]}
            isOnline={data.status[1]}
          />
        </div>

        {/* Footer */}
        <DashboardFooter stats={aggregateStats} />
      </div>
    </div>
  );
}