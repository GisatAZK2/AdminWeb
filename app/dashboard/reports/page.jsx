'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Server,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  FileText,
  TrendingUp,
  Cpu,
  HardDrive,
  Zap,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

export default function ReportsPage() {
  const [railwayStatus, setRailwayStatus] = useState(null)
  const [railwayMetrics, setRailwayMetrics] = useState(null)
  const [railwayLogs, setRailwayLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Mock performance data for demonstration
  const [performanceData, setPerformanceData] = useState({
    cpu: { usage: 45, trend: '+2%' },
    memory: { usage: 78, trend: '+5%' },
    storage: { usage: 32, trend: '-1%' },
    uptime: '99.9%',
    responseTime: '120ms',
    totalDeployments: 24,
    successfulDeployments: 22,
    lastDeployment: '2 hours ago'
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchRailwayStatus(),
      fetchRailwayMetrics(), 
      fetchRailwayLogs()
    ])
    setLoading(false)
  }

  const fetchRailwayStatus = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/railway/status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRailwayStatus(data)
      } else {
        console.error('Failed to fetch Railway status')
      }
    } catch (error) {
      console.error('Error fetching Railway status:', error)
    }
  }

  const fetchRailwayMetrics = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/railway/metrics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRailwayMetrics(data)
      } else {
        console.error('Failed to fetch Railway metrics')
      }
    } catch (error) {
      console.error('Error fetching Railway metrics:', error)
    }
  }

  const fetchRailwayLogs = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/railway/logs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRailwayLogs(data?.data?.logs?.edges || [])
      } else {
        console.error('Failed to fetch Railway logs')
      }
    } catch (error) {
      console.error('Error fetching Railway logs:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
    toast.success('Data refreshed successfully')
  }

  const PerformanceCard = ({ title, value, trend, icon: Icon, color = 'blue' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className="flex items-center mt-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const LogEntry = ({ log, index }) => (
    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
      <div className="flex-shrink-0">
        {log.node?.severity === 'ERROR' ? (
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">
          {log.node?.message || 'No message'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {log.node?.timestamp ? new Date(log.node.timestamp).toLocaleString() : 'No timestamp'}
        </p>
      </div>
      <Badge variant={log.node?.severity === 'ERROR' ? 'destructive' : 'secondary'}>
        {log.node?.severity || 'INFO'}
      </Badge>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your Railway deployment performance and view detailed logs
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Railway Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Railway Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Service Name</p>
              <p className="font-semibold">BackEnd_Market</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Environment</p>
              <Badge variant="success">Production</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Domain</p>
              <p className="font-mono text-sm">sharecihuy.sytes.net</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Badge variant="success">Online</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PerformanceCard
          title="CPU Usage"
          value={`${performanceData.cpu.usage}%`}
          trend={performanceData.cpu.trend}
          icon={Cpu}
          color="blue"
        />
        <PerformanceCard
          title="Memory Usage" 
          value={`${performanceData.memory.usage}%`}
          trend={performanceData.memory.trend}
          icon={Activity}
          color="green"
        />
        <PerformanceCard
          title="Storage"
          value={`${performanceData.storage.usage}%`}
          trend={performanceData.storage.trend}
          icon={HardDrive}
          color="purple"
        />
        <PerformanceCard
          title="Uptime"
          value={performanceData.uptime}
          icon={Zap}
          color="orange"
        />
      </div>

      {/* Deployment Statistics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Deployment Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Deployments</span>
              <Badge variant="secondary">{performanceData.totalDeployments}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Successful Deployments</span>
              <Badge variant="success">{performanceData.successfulDeployments}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Success Rate</span>
              <Badge variant="success">
                {Math.round((performanceData.successfulDeployments / performanceData.totalDeployments) * 100)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Deployment</span>
              <span className="text-sm text-muted-foreground">{performanceData.lastDeployment}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Average Response Time</span>
              <Badge variant="secondary">{performanceData.responseTime}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Live Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{performanceData.cpu.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${performanceData.cpu.usage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>{performanceData.memory.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${performanceData.memory.usage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage Usage</span>
                  <span>{performanceData.storage.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${performanceData.storage.usage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Railway Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Railway Deployment Logs
            </div>
            <Badge variant="secondary">
              {railwayLogs.length} entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading logs...</span>
            </div>
          ) : railwayLogs.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {railwayLogs.slice(0, 10).map((log, index) => (
                <LogEntry key={index} log={log} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No logs available at the moment</p>
              <p className="text-sm">Try refreshing to load latest logs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}