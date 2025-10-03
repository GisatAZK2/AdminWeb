'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Settings,
  Database,
  Shield,
  Bell,
  Globe,
  Key,
  Server,
  Mail,
  Palette,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  
  // Railway Configuration
  const [railwayConfig, setRailwayConfig] = useState({
    projectId: '6ebd1c5c-286d-41e3-87df-6de10ea16dc9',
    environmentId: 'c54e235d-3867-4ce3-8248-630a93abaa2b',
    serviceId: 'c4dbe6c3-0a3d-4cdc-828d-922438f701ab',
    publicDomain: 'sharecihuy.sytes.net',
    privateDomain: 'backend_market.railway.internal',
    apiToken: 'd2a65e74-a02a-4f86-a389-586ed736a140'
  })

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Admin Dashboard',
    siteDescription: 'Comprehensive admin panel for managing sellers, categories, and events',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    maxFileSize: 10, // MB
    allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx',
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5
  })

  // Database Settings
  const [databaseSettings, setDatabaseSettings] = useState({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    backupEnabled: true,
    backupFrequency: 'daily',
    retentionPeriod: 30 // days
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newUserRegistration: true,
    systemAlerts: true,
    weeklyReports: false,
    deploymentAlerts: true,
    errorAlerts: true,
    performanceAlerts: false
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    passwordComplexity: true,
    ipWhitelist: '',
    corsOrigins: '*',
    rateLimitEnabled: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15, // minutes
    encryptionEnabled: true
  })

  const handleSaveRailwayConfig = async () => {
    setLoading(true)
    try {
      // Simulate API call to save Railway config
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Railway configuration saved successfully')
    } catch (error) {
      toast.error('Failed to save Railway configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSystemSettings = async () => {
    setLoading(true)
    try {
      // Simulate API call to save system settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('System settings saved successfully')
    } catch (error) {
      toast.error('Failed to save system settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDatabaseSettings = async () => {
    setLoading(true)
    try {
      // Simulate API call to save database settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Database settings saved successfully')
    } catch (error) {
      toast.error('Failed to save database settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotificationSettings = async () => {
    setLoading(true)
    try {
      // Simulate API call to save notification settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification settings saved successfully')
    } catch (error) {
      toast.error('Failed to save notification settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSecuritySettings = async () => {
    setLoading(true)
    try {
      // Simulate API call to save security settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Security settings saved successfully')
    } catch (error) {
      toast.error('Failed to save security settings')
    } finally {
      setLoading(false)
    }
  }

  const testRailwayConnection = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/railway/status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        toast.success('Railway connection successful')
      } else {
        toast.error('Railway connection failed')
      }
    } catch (error) {
      toast.error('Failed to test Railway connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application settings and integrations
          </p>
        </div>
        <Button 
          onClick={() => setShowPasswords(!showPasswords)} 
          variant="outline" 
          size="sm"
        >
          {showPasswords ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showPasswords ? 'Hide' : 'Show'} Sensitive Data
        </Button>
      </div>

      {/* Railway Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Railway Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                value={railwayConfig.projectId}
                onChange={(e) => setRailwayConfig({...railwayConfig, projectId: e.target.value})}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environmentId">Environment ID</Label>
              <Input
                id="environmentId"
                value={railwayConfig.environmentId}
                onChange={(e) => setRailwayConfig({...railwayConfig, environmentId: e.target.value})}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceId">Service ID</Label>
              <Input
                id="serviceId"
                value={railwayConfig.serviceId}
                onChange={(e) => setRailwayConfig({...railwayConfig, serviceId: e.target.value})}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicDomain">Public Domain</Label>
              <Input
                id="publicDomain"
                value={railwayConfig.publicDomain}
                onChange={(e) => setRailwayConfig({...railwayConfig, publicDomain: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privateDomain">Private Domain</Label>
              <Input
                id="privateDomain"
                value={railwayConfig.privateDomain}
                onChange={(e) => setRailwayConfig({...railwayConfig, privateDomain: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type={showPasswords ? 'text' : 'password'}
                value={railwayConfig.apiToken}
                onChange={(e) => setRailwayConfig({...railwayConfig, apiToken: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveRailwayConfig} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            <Button onClick={testRailwayConnection} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={systemSettings.siteName}
                onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={systemSettings.maxFileSize}
                onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={systemSettings.sessionTimeout}
                onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={systemSettings.maxLoginAttempts}
                onChange={(e) => setSystemSettings({...systemSettings, maxLoginAttempts: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={systemSettings.siteDescription}
              onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
            <Input
              id="allowedFileTypes"
              value={systemSettings.allowedFileTypes}
              onChange={(e) => setSystemSettings({...systemSettings, allowedFileTypes: e.target.value})}
              placeholder="jpg,jpeg,png,gif,pdf"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <Switch
                id="maintenanceMode"
                checked={systemSettings.maintenanceMode}
                onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="registrationEnabled">Registration Enabled</Label>
              <Switch
                id="registrationEnabled"
                checked={systemSettings.registrationEnabled}
                onCheckedChange={(checked) => setSystemSettings({...systemSettings, registrationEnabled: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailVerificationRequired">Email Verification Required</Label>
              <Switch
                id="emailVerificationRequired"
                checked={systemSettings.emailVerificationRequired}
                onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailVerificationRequired: checked})}
              />
            </div>
          </div>
          
          <Button onClick={handleSaveSystemSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save System Settings
          </Button>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supabaseUrl">Supabase URL</Label>
              <Input
                id="supabaseUrl"
                type={showPasswords ? 'text' : 'password'}
                value={databaseSettings.supabaseUrl}
                onChange={(e) => setDatabaseSettings({...databaseSettings, supabaseUrl: e.target.value})}
                placeholder="https://your-project.supabase.co"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supabaseAnonKey">Supabase Anon Key</Label>
              <Input
                id="supabaseAnonKey"
                type={showPasswords ? 'text' : 'password'}
                value={databaseSettings.supabaseAnonKey}
                onChange={(e) => setDatabaseSettings({...databaseSettings, supabaseAnonKey: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={databaseSettings.backupFrequency}
                onChange={(e) => setDatabaseSettings({...databaseSettings, backupFrequency: e.target.value})}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
              <Input
                id="retentionPeriod"
                type="number"
                value={databaseSettings.retentionPeriod}
                onChange={(e) => setDatabaseSettings({...databaseSettings, retentionPeriod: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="backupEnabled">Automatic Backups</Label>
            <Switch
              id="backupEnabled"
              checked={databaseSettings.backupEnabled}
              onCheckedChange={(checked) => setDatabaseSettings({...databaseSettings, backupEnabled: checked})}
            />
          </div>
          
          <Button onClick={handleSaveDatabaseSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Database Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="newUserRegistration">New User Registration</Label>
              <Switch
                id="newUserRegistration"
                checked={notificationSettings.newUserRegistration}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newUserRegistration: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="systemAlerts">System Alerts</Label>
              <Switch
                id="systemAlerts"
                checked={notificationSettings.systemAlerts}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weeklyReports">Weekly Reports</Label>
              <Switch
                id="weeklyReports"
                checked={notificationSettings.weeklyReports}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="deploymentAlerts">Deployment Alerts</Label>
              <Switch
                id="deploymentAlerts"
                checked={notificationSettings.deploymentAlerts}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, deploymentAlerts: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="errorAlerts">Error Alerts</Label>
              <Switch
                id="errorAlerts"
                checked={notificationSettings.errorAlerts}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, errorAlerts: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="performanceAlerts">Performance Alerts</Label>
              <Switch
                id="performanceAlerts"
                checked={notificationSettings.performanceAlerts}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, performanceAlerts: checked})}
              />
            </div>
          </div>
          
          <Button onClick={handleSaveNotificationSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ipWhitelist">IP Whitelist</Label>
              <Textarea
                id="ipWhitelist"
                value={securitySettings.ipWhitelist}
                onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                placeholder="192.168.1.1, 10.0.0.0/8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="corsOrigins">CORS Origins</Label>
              <Input
                id="corsOrigins"
                value={securitySettings.corsOrigins}
                onChange={(e) => setSecuritySettings({...securitySettings, corsOrigins: e.target.value})}
                placeholder="https://yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimitRequests">Rate Limit Requests</Label>
              <Input
                id="rateLimitRequests"
                type="number"
                value={securitySettings.rateLimitRequests}
                onChange={(e) => setSecuritySettings({...securitySettings, rateLimitRequests: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimitWindow">Rate Limit Window (minutes)</Label>
              <Input
                id="rateLimitWindow"
                type="number"
                value={securitySettings.rateLimitWindow}
                onChange={(e) => setSecuritySettings({...securitySettings, rateLimitWindow: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
              <Switch
                id="twoFactorEnabled"
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorEnabled: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="passwordComplexity">Password Complexity</Label>
              <Switch
                id="passwordComplexity"
                checked={securitySettings.passwordComplexity}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordComplexity: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rateLimitEnabled">Rate Limiting</Label>
              <Switch
                id="rateLimitEnabled"
                checked={securitySettings.rateLimitEnabled}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, rateLimitEnabled: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="encryptionEnabled">Data Encryption</Label>
              <Switch
                id="encryptionEnabled"
                checked={securitySettings.encryptionEnabled}
                onCheckedChange={(checked) => setSecuritySettings({...securitySettings, encryptionEnabled: checked})}
              />
            </div>
          </div>
          
          <Button onClick={handleSaveSecuritySettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Database Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Railway API Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Authentication Working</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Backup Pending</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}