'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Users,
  Tag,
  Calendar,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  RefreshCw,
  CreditCard,
  ArrowUpDown,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({})
  const [transactions, setTransactions] = useState([])
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      
      const [analyticsRes, transactionsRes, balancesRes] = await Promise.all([
        fetch('/api/analytics', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/seller-balance-transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/seller-balances', { headers: { Authorization: `Bearer ${token}` } })
      ])

      if (analyticsRes.ok && transactionsRes.ok && balancesRes.ok) {
        const analyticsData = await analyticsRes.json()
        const transactionsData = await transactionsRes.json()
        const balancesData = await balancesRes.json()
        
        setAnalytics(analyticsData)
        setTransactions(transactionsData)
        setBalances(balancesData)
      } else {
        toast.error('Failed to fetch analytics data')
      }
    } catch (error) {
      toast.error('Error loading analytics')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatTransactionType = (type) => {
    switch (type) {
      case 'credit':
        return { label: 'Credit', variant: 'success' }
      case 'debit':
        return { label: 'Debit', variant: 'destructive' }
      case 'withdrawal':
        return { label: 'Withdrawal', variant: 'warning' }
      case 'move_to_withdrawable':
        return { label: 'Available', variant: 'default' }
      default:
        return { label: type, variant: 'secondary' }
    }
  }

  const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', format = 'number' }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {loading ? '...' : format === 'currency' ? formatCurrency(value) : value?.toLocaleString()}
            </p>
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
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Platform statistics and financial overview
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sellers"
          value={analytics.sellers}
          icon={Users}
          trend="+5% this month"
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={analytics.users}
          icon={Activity}
          trend="+12% this month"
          color="green"
        />
        <StatCard
          title="Total Products"
          value={analytics.products}
          icon={Package}
          trend="+8% this month"
          color="purple"
        />
        <StatCard
          title="Product Variants"
          value={analytics.variants}
          icon={Tag}
          color="orange"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={analytics.orders}
          icon={ShoppingCart}
          trend="+15% this month"
          color="indigo"
        />
        <StatCard
          title="Total Revenue"
          value={analytics.revenue}
          icon={DollarSign}
          trend="+22% this month"
          color="emerald"
          format="currency"
        />
        <StatCard
          title="Categories"
          value={analytics.categories}
          icon={Tag}
          color="pink"
        />
        <StatCard
          title="Active Events"
          value={analytics.events}
          icon={Calendar}
          color="yellow"
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="balances">Seller Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Recent Seller Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction) => {
                      const typeInfo = formatTransactionType(transaction.type)
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{transaction.sellers?.name}</p>
                              <p className="text-sm text-muted-foreground">{transaction.sellers?.store_name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(Math.abs(transaction.amount))}
                            </span>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleTimeString()}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground">
                              {transaction.metadata ? 
                                JSON.parse(transaction.metadata)?.source || 'Unknown' : 
                                'Manual'
                              }
                            </p>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}

              {!loading && transactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpDown className="h-5 w-5 mr-2" />
                Seller Balances Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Total Balance</TableHead>
                      <TableHead>Withdrawable</TableHead>
                      <TableHead>Bank Info</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.map((balance) => (
                      <TableRow key={balance.seller_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{balance.sellers?.name}</p>
                            <p className="text-sm text-muted-foreground">{balance.sellers?.store_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">{balance.sellers?.email}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{formatCurrency(balance.balance)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-green-600">
                            {formatCurrency(balance.withdrawable_balance)}
                          </p>
                        </TableCell>
                        <TableCell>
                          {balance.bank_code ? (
                            <div>
                              <p className="text-sm font-medium">{balance.bank_code}</p>
                              <p className="text-xs text-muted-foreground">{balance.account_holder_name}</p>
                            </div>
                          ) : (
                            <Badge variant="secondary">Not Set</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">
                            {new Date(balance.updated_at).toLocaleDateString()}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading && balances.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No seller balances found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}