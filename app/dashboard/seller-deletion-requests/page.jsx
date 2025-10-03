'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  UserMinus
} from 'lucide-react'
import { toast } from 'sonner'

export default function SellerDeletionRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/seller-deletion-requests', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        toast.error('Failed to fetch deletion requests')
      }
    } catch (error) {
      toast.error('Error loading deletion requests')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessRequest = async (requestId, status, adminNotes = '') => {
    try {
      setProcessing(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`/api/seller-deletion-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes
        })
      })

      if (response.ok) {
        toast.success(`Request ${status} successfully`)
        setIsProcessDialogOpen(false)
        setSelectedRequest(null)
        fetchRequests()
      } else {
        toast.error(`Failed to ${status} request`)
      }
    } catch (error) {
      toast.error('Error processing request')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { 
          variant: 'warning', 
          icon: <Clock className="h-3 w-3" />,
          label: 'Pending'
        }
      case 'approved':
        return { 
          variant: 'success', 
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Approved'
        }
      case 'rejected':
        return { 
          variant: 'destructive', 
          icon: <XCircle className="h-3 w-3" />,
          label: 'Rejected'
        }
      default:
        return { 
          variant: 'secondary', 
          icon: <AlertTriangle className="h-3 w-3" />,
          label: status
        }
    }
  }

  const RequestDetailsView = ({ request }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium">Seller Information</Label>
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <p className="font-medium">{request?.sellers?.name}</p>
            <p className="text-sm text-muted-foreground">{request?.sellers?.email}</p>
            <p className="text-sm text-muted-foreground">Store: {request?.sellers?.store_name}</p>
            <p className="text-sm text-muted-foreground">Business: {request?.sellers?.business_name}</p>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium">Deletion Reason</Label>
          <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">
            {request?.reason || 'No reason provided'}
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-1">
            {(() => {
              const statusInfo = getStatusBadge(request?.status)
              return (
                <Badge variant={statusInfo.variant} className="flex items-center w-fit">
                  {statusInfo.icon}
                  <span className="ml-1">{statusInfo.label}</span>
                </Badge>
              )
            })()}
          </div>
        </div>

        {request?.admin_notes && (
          <div>
            <Label className="text-sm font-medium">Admin Notes</Label>
            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-lg">
              {request.admin_notes}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Requested</Label>
            <p className="text-sm text-muted-foreground">
              {request?.created_at ? new Date(request.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium">Last Updated</Label>
            <p className="text-sm text-muted-foreground">
              {request?.updated_at ? new Date(request.updated_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const ProcessRequestForm = ({ request, onSubmit, onClose }) => {
    const [status, setStatus] = useState('')
    const [adminNotes, setAdminNotes] = useState('')

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!status) {
        toast.error('Please select a status')
        return
      }
      onSubmit(request.id, status, adminNotes)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Decision</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select decision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Approve Deletion</SelectItem>
              <SelectItem value="rejected">Reject Request</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
          <Textarea
            id="admin_notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about your decision..."
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={processing}>
            {processing ? 'Processing...' : 'Submit Decision'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seller Deletion Requests</h1>
          <p className="text-muted-foreground">
            Manage seller account deletion requests
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserMinus className="h-5 w-5 mr-2" />
            Deletion Requests ({requests.length})
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
                  <TableHead>Store</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const statusInfo = getStatusBadge(request.status)
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.sellers?.name}</p>
                          <p className="text-sm text-muted-foreground">{request.sellers?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.sellers?.store_name}</p>
                          <p className="text-sm text-muted-foreground">{request.sellers?.business_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {request.reason || 'No reason provided'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="flex items-center w-fit">
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === 'pending' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
                                setIsProcessDialogOpen(true)
                              }}
                            >
                              Process
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {!loading && requests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No deletion requests found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deletion Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && <RequestDetailsView request={selectedRequest} />}
        </DialogContent>
      </Dialog>

      {/* Process Request Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Deletion Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <ProcessRequestForm
              request={selectedRequest}
              onSubmit={handleProcessRequest}
              onClose={() => setIsProcessDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}