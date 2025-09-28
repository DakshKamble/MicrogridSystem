import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wifi, WifiOff, Clock, AlertTriangle } from "lucide-react";

interface DashboardHeaderProps {
  isConnected: boolean;
  lastUpdate: Date;
  hasAlerts: boolean;
}

export function DashboardHeader({ isConnected, lastUpdate, hasAlerts }: DashboardHeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="p-4 mb-6 bg-card/50 border-border/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Microgrid Monitoring System
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time IoT Energy Monitoring – NodeMCU Zone 1
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {/* MQTT/Server Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-status-online" />
                <Badge variant="secondary" className="bg-status-online/20 text-status-online border-status-online/30">
                  Server Online
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-status-offline" />
                <Badge variant="destructive">
                  Server Offline
                </Badge>
              </>
            )}
          </div>

          {/* Last Update */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatTime(lastUpdate)}
            </span>
          </div>

          {/* Alert Indicator */}
          {hasAlerts && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning animate-pulse" />
              <Badge variant="secondary" className="bg-status-warning/20 text-status-warning border-status-warning/30">
                {!isConnected ? "Server Down" : "NodeMCU Disconnected"}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}