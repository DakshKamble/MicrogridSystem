import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, Image, Settings, Plus, ToggleLeft } from "lucide-react";

interface AggregateStats {
  totalPower: number;
  averageVoltage: number;
  highestLoadZone: number;
}

interface DashboardFooterProps {
  stats: AggregateStats;
}

export function DashboardFooter({ stats }: DashboardFooterProps) {
  const handleExportCSV = () => {
    // CSV export logic would go here
    console.log("Exporting CSV...");
  };

  const handleExportPNG = () => {
    // PNG export logic would go here
    console.log("Exporting PNG...");
  };

  return (
    <Card className="p-4 mt-6 bg-card/50 border-border/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Aggregate Statistics */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">
              {stats.totalPower.toFixed(3)} W
            </div>
            <div className="text-xs text-muted-foreground">Total Power</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">
              {stats.averageVoltage.toFixed(2)} V
            </div>
            <div className="text-xs text-muted-foreground">Avg Voltage</div>
          </div>
          
          <div className="text-center">
            <Badge 
              variant="secondary" 
              className={`
                ${stats.highestLoadZone === 1 ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' : ''}
                ${stats.highestLoadZone === 2 ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}
                ${stats.highestLoadZone === 3 ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' : ''}
              `}
            >
              Zone {stats.highestLoadZone}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">Highest Load</div>
          </div>
        </div>

        {/* Export and Control Buttons */}
        <div className="flex items-center gap-3">
          {/* Export Buttons */}
          <div className="flex items-center gap-2 border-r border-border pr-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs hover:bg-muted/50"
            >
              <FileSpreadsheet className="w-3 h-3 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPNG}
              className="text-xs hover:bg-muted/50"
            >
              <Image className="w-3 h-3 mr-1" />
              PNG
            </Button>
          </div>

          {/* Future Admin Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50">
              <Plus className="w-3 h-3 mr-1" />
              Add Node
            </Button>
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50">
              <ToggleLeft className="w-3 h-3 mr-1" />
              Relay
            </Button>
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50">
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}