'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Shield,
  Crown,
  User
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminsPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admins', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      } else {
        toast.error('Failed to fetch admins')
      }
    } catch (error) {
      toast.error('Error loading admins')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (formData) => {
    try {
      const adminData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      }

      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminData)
      })

      if (response.ok) {
        toast.success('Admin created successfully')
        setIsCreateDialogOpen(false)
        fetchAdmins()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create admin')
      }
    } catch (error) {
      toast.error('Error creating admin')
    }
  }

  const handleUpdateAdmin = async (formData) => {
    try {
      const adminData = {
        username: formData.username,
        email: formData.email,
        role: formData.role
      }

      // Only include password if provided
      if (formData.password) {
        adminData.password = formData.password
      }

      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admins/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminData)
      })

      if (response.ok) {
        toast.success('Admin updated successfully')
        setIsEditDialogOpen(false)
        setSelectedAdmin(null)
        fetchAdmins()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update admin')
      }
    } catch (error) {
      toast.error('Error updating admin')
    }
  }

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Admin deleted successfully')
        fetchAdmins()
      } else {
        toast.error('Failed to delete admin')
      }
    } catch (error) {
      toast.error('Error deleting admin')
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-4 w-4" />
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'visitor':
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleVariant = (role) => {
    switch (role) {
      case 'superadmin':
        return 'destructive'
      case 'admin':
        return 'default'
      case 'visitor':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const filteredAdmins = admins.filter(admin =>
    admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const AdminForm = ({ admin, onSubmit, onClose, isEdit = false }) => {
    const [formData, setFormData] = useState({
      username: admin?.username || '',
      email: admin?.email || '',
      password: '',
      role: admin?.role || 'admin'
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!isEdit && !formData.password) {
        toast.error('Password is required for new admin')
        return
      }
      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Password {isEdit && '(leave blank to keep current)'}
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={isEdit ? 'Enter new password (optional)' : 'Enter password'}
            required={!isEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="superadmin">Superadmin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="visitor">Visitor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? 'Update Admin' : 'Create Admin'}
          </Button>
        </div>
      </form>
    )
  }

  const AdminDetailsView = ({ admin }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium">Username</Label>
          <p className="text-sm text-muted-foreground">{admin?.username}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Email</Label>
          <p className="text-sm text-muted-foreground">{admin?.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Role</Label>
          <div className="mt-1">
            <Badge variant={getRoleVariant(admin?.role)} className="flex items-center w-fit">
              {getRoleIcon(admin?.role)}
              <span className="ml-1 capitalize">{admin?.role}</span>
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Created</Label>
            <p className="text-sm text-muted-foreground">
              {admin?.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium">Updated</Label>
            <p className="text-sm text-muted-foreground">
              {admin?.updated_at ? new Date(admin.updated_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Users</h1>
          <p className="text-muted-foreground">
            Manage admin accounts and permissions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchAdmins} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
              </DialogHeader>
              <AdminForm
                onSubmit={handleCreateAdmin}
                onClose={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users ({filteredAdmins.length})</CardTitle>
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
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <p className="font-medium">{admin.username}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(admin.role)} className="flex items-center w-fit">
                        {getRoleIcon(admin.role)}
                        <span className="ml-1 capitalize">{admin.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
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

          {!loading && filteredAdmins.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No admins found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Admin Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
          </DialogHeader>
          {selectedAdmin && <AdminDetailsView admin={selectedAdmin} />}
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <AdminForm
              admin={selectedAdmin}
              onSubmit={handleUpdateAdmin}
              onClose={() => setIsEditDialogOpen(false)}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}