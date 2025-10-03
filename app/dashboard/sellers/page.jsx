'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  Store,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export default function SellersPage() {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/sellers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSellers(data)
      } else {
        toast.error('Failed to fetch sellers')
      }
    } catch (error) {
      toast.error('Error loading sellers')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSeller = async (sellerId) => {
    if (!confirm('Are you sure you want to delete this seller?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Seller deleted successfully')
        fetchSellers()
      } else {
        toast.error('Failed to delete seller')
      }
    } catch (error) {
      toast.error('Error deleting seller')
    }
  }

  const handleUpdateSeller = async (formData) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/sellers/${selectedSeller.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Seller updated successfully')
        setIsEditDialogOpen(false)
        setSelectedSeller(null)
        fetchSellers()
      } else {
        toast.error('Failed to update seller')
      }
    } catch (error) {
      toast.error('Error updating seller')
    }
  }

  const filteredSellers = sellers.filter(seller =>
    seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const EditSellerForm = ({ seller, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      name: seller?.name || '',
      email: seller?.email || '',
      phone: seller?.phone || '',
      store_name: seller?.store_name || '',
      store_address: seller?.store_address || '',
      business_name: seller?.business_name || '',
      is_delivery_available: seller?.is_delivery_available || false,
      delivery_fee: seller?.delivery_fee || '',
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seller Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({...formData, business_name: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="store_name">Store Name</Label>
          <Input
            id="store_name"
            value={formData.store_name}
            onChange={(e) => setFormData({...formData, store_name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="store_address">Store Address</Label>
          <Textarea
            id="store_address"
            value={formData.store_address}
            onChange={(e) => setFormData({...formData, store_address: e.target.value})}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="delivery"
            checked={formData.is_delivery_available}
            onCheckedChange={(checked) => setFormData({...formData, is_delivery_available: checked})}
          />
          <Label htmlFor="delivery">Delivery Available</Label>
        </div>

        {formData.is_delivery_available && (
          <div className="space-y-2">
            <Label htmlFor="delivery_fee">Delivery Fee</Label>
            <Input
              id="delivery_fee"
              type="number"
              value={formData.delivery_fee}
              onChange={(e) => setFormData({...formData, delivery_fee: e.target.value})}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Update Seller
          </Button>
        </div>
      </form>
    )
  }

  const SellerDetailsView = ({ seller }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Name</Label>
          <p className="text-sm text-muted-foreground">{seller?.name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Email</Label>
          <p className="text-sm text-muted-foreground">{seller?.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Phone</Label>
          <p className="text-sm text-muted-foreground">{seller?.phone}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Business Name</Label>
          <p className="text-sm text-muted-foreground">{seller?.business_name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Store Name</Label>
          <p className="text-sm text-muted-foreground">{seller?.store_name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Delivery Available</Label>
          <p className="text-sm text-muted-foreground">
            {seller?.is_delivery_available ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium">Store Address</Label>
        <p className="text-sm text-muted-foreground mt-1">{seller?.store_address}</p>
      </div>

      {seller?.is_delivery_available && (
        <div>
          <Label className="text-sm font-medium">Delivery Fee</Label>
          <p className="text-sm text-muted-foreground">Rp {seller?.delivery_fee}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Province</Label>
          <p className="text-sm text-muted-foreground">{seller?.provinsi}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">City</Label>
          <p className="text-sm text-muted-foreground">{seller?.kabupaten}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Created</Label>
          <p className="text-sm text-muted-foreground">
            {seller?.created_at ? new Date(seller.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium">Updated</Label>
          <p className="text-sm text-muted-foreground">
            {seller?.updated_at ? new Date(seller.updated_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sellers Management</h1>
          <p className="text-muted-foreground">
            Manage seller accounts and store information
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchSellers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sellers by name, email, or store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sellers ({filteredSellers.length})</CardTitle>
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
                  <TableHead>Seller Info</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-muted-foreground">{seller.business_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                        {seller.store_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {seller.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {seller.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {seller.kabupaten}, {seller.provinsi}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={seller.is_delivery_available ? 'success' : 'secondary'}>
                        {seller.is_delivery_available ? 'Available' : 'Not Available'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSeller(seller)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSeller(seller)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSeller(seller.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredSellers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sellers found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Seller Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
          </DialogHeader>
          {selectedSeller && <SellerDetailsView seller={selectedSeller} />}
        </DialogContent>
      </Dialog>

      {/* Edit Seller Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Seller</DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <EditSellerForm
              seller={selectedSeller}
              onSubmit={handleUpdateSeller}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}