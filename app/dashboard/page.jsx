'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Tag,
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function Dashboard() {
  const [stats, setStats] = useState({
    sellers: 0,
    categories: 0,
    events: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const [setupNeeded, setSetupNeeded] = useState(false)

  useEffect(() => {
    fetchStats()
    checkSetupStatus()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch stats')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/setup')
      if (response.ok) {
        const data = await response.json()
        if (data.message === 'Manual setup required') {
          setSetupNeeded(true)
        }
      }
    } catch (error) {
      console.error('Error checking setup:', error)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchStats()
  }

  const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{loading ? '...' : value}</p>
            {trend && (
              <div className="flex items-center mt-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard. Manage your platform from here.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Setup Alert */}
      {setupNeeded && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  Setup Required
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  The superadmin table needs to be created in Supabase. Visit{' '}
                  <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded text-xs">
                    /api/setup
                  </code>
                  {' '}for instructions.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/api/setup', '_blank')}
              >
                View Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sellers"
          value={stats.sellers}
          icon={Users}
          trend="+12% from last month"
          color="blue"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon={Tag}
          trend="+3 new this week"
          color="green"
        />
        <StatCard
          title="Global Events"
          value={stats.events}
          icon={Calendar}
          trend="2 active events"
          color="purple"
        />
        <StatCard
          title="System Status"
          value="Healthy"
          icon={Activity}
          color="emerald"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/dashboard/categories'}>
              <Tag className="h-4 w-4 mr-2" />
              Create Category
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/dashboard/events'}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/dashboard/reports'}>
              <Eye className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Database Connection
              </span>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                API Services
              </span>
              <Badge variant="success">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Authentication
              </span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                {setupNeeded ? (
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                )}
                Admin Setup
              </span>
              <Badge variant={setupNeeded ? 'warning' : 'success'}>
                {setupNeeded ? 'Pending' : 'Complete'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Welcome to your comprehensive admin dashboard! Here's what you can manage:
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Sellers
                </h4>
                <p className="text-sm text-muted-foreground">
                  Manage seller accounts, store information, and delivery settings.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Categories
                </h4>
                <p className="text-sm text-muted-foreground">
                  Organize products with categories and manage category images.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create and manage global promotional events and campaigns.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Analytics
                </h4>
                <p className="text-sm text-muted-foreground">
                  View detailed analytics and generate comprehensive reports.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}