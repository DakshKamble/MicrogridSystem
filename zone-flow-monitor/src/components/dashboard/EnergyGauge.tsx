import { Card } from "@/components/ui/card";

interface EnergyGaugeProps {
  title: string;
  value: number;
  unit: string;
  max: number;
  icon: string;
  color: "zone-1" | "zone-2" | "zone-3";
}

export function EnergyGauge({ title, value, unit, max, icon, color }: EnergyGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    "zone-1": "text-zone-1",
    "zone-2": "text-zone-2", 
    "zone-3": "text-zone-3"
  };

  const glowMap = {
    "zone-1": "drop-shadow-[var(--glow-zone-1)]",
    "zone-2": "drop-shadow-[var(--glow-zone-2)]",
    "zone-3": "drop-shadow-[var(--glow-zone-3)]"
  };

  return (
    <Card className="p-4 bg-card/50 border-border/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span className="text-lg">{icon}</span>
      </div>
      
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="6"
            fill="none"
            opacity="0.3"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={`hsl(var(--${color}))`}
            strokeWidth="6"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${glowMap[color]}`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${colorMap[color]}`}>
            {value.toFixed(3)}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <span className="text-xs text-muted-foreground">
          Max: {max} {unit}
        </span>
      </div>
    </Card>
  );
}