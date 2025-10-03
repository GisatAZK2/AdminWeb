'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Tag,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Sellers',
    href: '/dashboard/sellers',
    icon: Users
  },
  {
    title: 'Categories',
    href: '/dashboard/categories',
    icon: Tag
  },
  {
    title: 'Global Events',
    href: '/dashboard/events',
    icon: Calendar
  },
  {
    title: 'Admin Users',
    href: '/dashboard/admins',
    icon: Shield
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3
  },
  {
    title: 'Deletion Requests',
    href: '/dashboard/seller-deletion-requests',
    icon: UserMinus
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: FileText
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    window.location.href = '/'
  }

  return (
    <div className={cn(
      'flex flex-col h-screen bg-card border-r border-border transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                'flex items-center px-3 py-2 rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary text-primary-foreground',
                collapsed && 'justify-center'
              )}>
                <Icon className={cn('h-4 w-4', !collapsed && 'mr-3')} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <div className={cn('flex', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && <span className="text-sm text-muted-foreground">Theme:</span>}
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          size={collapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut className={cn('h-4 w-4', !collapsed && 'mr-2')} />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </div>
  )
}