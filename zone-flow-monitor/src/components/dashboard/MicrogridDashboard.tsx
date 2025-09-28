import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { ZoneCard } from "./ZoneCard";
import { useEnergyData } from "@/hooks/useEnergyData";

export function MicrogridDashboard() {
  const { data, aggregateStats, hasAlerts } = useEnergyData();

  const zoneNames = {
    1: "Zone 1",
    2: "Zone 2", 
    3: "Zone 3"
  };

  const nodeNames = {
    1: "NodeMCU_Node1",
    2: "NodeMCU_Node2",
    3: "NodeMCU_Node3"
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

        {/* Main Zone Grid - Only showing Zone 1 (node1/zone1) */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6 max-w-2xl mx-auto">
          <ZoneCard
            key={1}
            zoneId={1}
            name="Zone 1 (NodeMCU Node1)"
            nodeName="NodeMCU_Node1"
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