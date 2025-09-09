"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Battery,
  Zap,
  Sun,
  Wind,
  Home,
  Factory,
  Settings,
  Activity,
  Power,
} from "lucide-react"

export default function RenewableEnergyDashboard() {
  const [zones, setZones] = useState({
    residential: true,
    commercial: false,
    industrial: true,
    backup: false,
  })

  const toggleZone = (zone: keyof typeof zones) => {
    setZones((prev) => ({ ...prev, [zone]: !prev[zone] }))
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Energy Dashboard</h1>
            <p className="text-muted-foreground">Renewable Energy Monitoring System</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Activity className="w-3 h-3 mr-1" />
              System Online
            </Badge>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Power className="w-5 h-5 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Solar Generation</span>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-accent" />
                <span className="font-semibold">8.2 kW</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wind Generation</span>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-primary" />
                <span className="font-semibold">3.1 kW</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Output</span>
              <span className="font-bold text-lg text-primary">11.3 kW</span>
            </div>
            <div className="pt-2">
              <div className="text-sm text-muted-foreground mb-2">Efficiency</div>
              <Progress value={87} className="h-2" />
              <div className="text-right text-sm text-muted-foreground mt-1">87%</div>
            </div>
          </CardContent>
        </Card>

        {/* Battery Levels */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-primary" />
              Battery Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.73)}`}
                    className="text-primary"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">73%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">24.5 kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium text-primary">17.9 kWh</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Zones */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Distribution Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Residential Zone */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" />
                    <span className="font-medium">Residential</span>
                  </div>
                  <Switch checked={zones.residential} onCheckedChange={() => toggleZone("residential")} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Load</span>
                    <span className="font-medium">4.2 kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={zones.residential ? "default" : "secondary"} className="text-xs">
                      {zones.residential ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Commercial Zone */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-primary" />
                    <span className="font-medium">Commercial</span>
                  </div>
                  <Switch checked={zones.commercial} onCheckedChange={() => toggleZone("commercial")} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Load</span>
                    <span className="font-medium">2.8 kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={zones.commercial ? "default" : "secondary"} className="text-xs">
                      {zones.commercial ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Industrial Zone */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-medium">Industrial</span>
                  </div>
                  <Switch checked={zones.industrial} onCheckedChange={() => toggleZone("industrial")} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Load</span>
                    <span className="font-medium">6.1 kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={zones.industrial ? "default" : "secondary"} className="text-xs">
                      {zones.industrial ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Backup Zone */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-primary" />
                    <span className="font-medium">Backup</span>
                  </div>
                  <Switch checked={zones.backup} onCheckedChange={() => toggleZone("backup")} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Load</span>
                    <span className="font-medium">1.5 kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={zones.backup ? "default" : "secondary"} className="text-xs">
                      {zones.backup ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
