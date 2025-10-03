'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Upload,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      toast.error('Error loading categories')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadImageToSupabase = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'category-images')
    formData.append('folder', 'categories')

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const handleCreateCategory = async (formData) => {
    try {
      setUploading(true)
      let imageUrl = null
      
      if (formData.image) {
        imageUrl = await uploadImageToSupabase(formData.image)
      }

      const categoryData = {
        name: formData.name,
        description: formData.description,
        image_url: imageUrl
      }

      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      })

      if (response.ok) {
        toast.success('Category created successfully')
        setIsCreateDialogOpen(false)
        fetchCategories()
      } else {
        toast.error('Failed to create category')
      }
    } catch (error) {
      toast.error('Error creating category')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateCategory = async (formData) => {
    try {
      setUploading(true)
      let imageUrl = selectedCategory.image_url
      
      if (formData.image) {
        imageUrl = await uploadImageToSupabase(formData.image)
      }

      const categoryData = {
        name: formData.name,
        description: formData.description,
        image_url: imageUrl
      }

      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      })

      if (response.ok) {
        toast.success('Category updated successfully')
        setIsEditDialogOpen(false)
        setSelectedCategory(null)
        fetchCategories()
      } else {
        toast.error('Failed to update category')
      }
    } catch (error) {
      toast.error('Error updating category')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Category deleted successfully')
        fetchCategories()
      } else {
        toast.error('Failed to delete category')
      }
    } catch (error) {
      toast.error('Error deleting category')
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const CategoryForm = ({ category, onSubmit, onClose, isEdit = false }) => {
    const [formData, setFormData] = useState({
      name: category?.name || '',
      description: category?.description || '',
      image: null
    })
    const [imagePreview, setImagePreview] = useState(category?.image_url || null)

    const handleImageChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setFormData({ ...formData, image: file })
        const reader = new FileReader()
        reader.onload = (e) => setImagePreview(e.target.result)
        reader.readAsDataURL(file)
      }
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter category description"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Category Image</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1"
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : isEdit ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    )
  }

  const CategoryDetailsView = ({ category }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium">Name</Label>
          <p className="text-sm text-muted-foreground">{category?.name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Description</Label>
          <p className="text-sm text-muted-foreground">{category?.description}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Created</Label>
          <p className="text-sm text-muted-foreground">
            {category?.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        {category?.image_url && (
          <div>
            <Label className="text-sm font-medium">Category Image</Label>
            <div className="mt-2">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-48 h-32 object-cover rounded-lg border"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories Management</h1>
          <p className="text-muted-foreground">
            Manage product categories with images
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchCategories} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <CategoryForm
                onSubmit={handleCreateCategory}
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
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({filteredCategories.length})</CardTitle>
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
                  <TableHead>Image</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{category.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-xs truncate">
                        {category.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
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

          {!loading && filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No categories found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          {selectedCategory && <CategoryDetailsView category={selectedCategory} />}
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              category={selectedCategory}
              onSubmit={handleUpdateCategory}
              onClose={() => setIsEditDialogOpen(false)}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}