'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Upload,
  RefreshCw,
  Calendar,
  Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/events', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        toast.error('Failed to fetch events')
      }
    } catch (error) {
      toast.error('Error loading events')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadImageToSupabase = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'event-banners')
    formData.append('folder', 'events')

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

  const handleCreateEvent = async (formData) => {
    try {
      setUploading(true)
      let bannerUrl = null
      
      if (formData.banner) {
        bannerUrl = await uploadImageToSupabase(formData.banner)
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        banner_url: bannerUrl,
        start_time: formData.start_time,
        end_time: formData.end_time,
        categories: formData.categories || '[]',
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : null,
        min_discount: formData.min_discount ? parseFloat(formData.min_discount) : null
      }

      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        toast.success('Event created successfully')
        setIsCreateDialogOpen(false)
        fetchEvents()
      } else {
        toast.error('Failed to create event')
      }
    } catch (error) {
      toast.error('Error creating event')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateEvent = async (formData) => {
    try {
      setUploading(true)
      let bannerUrl = selectedEvent.banner_url
      
      if (formData.banner) {
        bannerUrl = await uploadImageToSupabase(formData.banner)
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        banner_url: bannerUrl,
        start_time: formData.start_time,
        end_time: formData.end_time,
        categories: formData.categories || '[]',
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : null,
        min_discount: formData.min_discount ? parseFloat(formData.min_discount) : null
      }

      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        toast.success('Event updated successfully')
        setIsEditDialogOpen(false)
        setSelectedEvent(null)
        fetchEvents()
      } else {
        toast.error('Failed to update event')
      }
    } catch (error) {
      toast.error('Error updating event')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Event deleted successfully')
        fetchEvents()
      } else {
        toast.error('Failed to delete event')
      }
    } catch (error) {
      toast.error('Error deleting event')
    }
  }

  const getEventStatus = (event) => {
    const now = new Date()
    const startTime = new Date(event.start_time)
    const endTime = new Date(event.end_time)
    
    if (now < startTime) return { label: 'Upcoming', variant: 'secondary' }
    if (now >= startTime && now <= endTime) return { label: 'Active', variant: 'success' }
    return { label: 'Ended', variant: 'destructive' }
  }

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const EventForm = ({ event, onSubmit, onClose, isEdit = false }) => {
    const [formData, setFormData] = useState({
      title: event?.title || '',
      description: event?.description || '',
      start_time: event?.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '',
      end_time: event?.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
      min_stock: event?.min_stock || '',
      min_discount: event?.min_discount || '',
      categories: event?.categories || '[]',
      banner: null
    })
    const [imagePreview, setImagePreview] = useState(event?.banner_url || null)

    const handleImageChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setFormData({ ...formData, banner: file })
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
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter event title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter event description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_stock">Minimum Stock</Label>
            <Input
              id="min_stock"
              type="number"
              value={formData.min_stock}
              onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_discount">Minimum Discount (%)</Label>
            <Input
              id="min_discount"
              type="number"
              step="0.01"
              value={formData.min_discount}
              onChange={(e) => setFormData({ ...formData, min_discount: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner">Event Banner</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="banner"
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
                className="w-48 h-24 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : isEdit ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    )
  }

  const EventDetailsView = ({ event }) => {
    const status = getEventStatus(event)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="text-sm font-medium">Title</Label>
            <p className="text-sm text-muted-foreground">{event?.title}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="text-sm text-muted-foreground">{event?.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Start Time</Label>
              <p className="text-sm text-muted-foreground">
                {event?.start_time ? new Date(event.start_time).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">End Time</Label>
              <p className="text-sm text-muted-foreground">
                {event?.end_time ? new Date(event.end_time).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Min Stock</Label>
              <p className="text-sm text-muted-foreground">{event?.min_stock || 'No minimum'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Min Discount</Label>
              <p className="text-sm text-muted-foreground">{event?.min_discount ? `${event.min_discount}%` : 'No minimum'}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <div className="mt-1">
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </div>
          {event?.banner_url && (
            <div>
              <Label className="text-sm font-medium">Event Banner</Label>
              <div className="mt-2">
                <img
                  src={event.banner_url}
                  alt={event.title}
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Global Events</h1>
          <p className="text-muted-foreground">
            Manage promotional events and campaigns
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchEvents} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <EventForm
                onSubmit={handleCreateEvent}
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
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events ({filteredEvents.length})</CardTitle>
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
                  <TableHead>Banner</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const status = getEventStatus(event)
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        {event.banner_url ? (
                          <img
                            src={event.banner_url}
                            alt={event.title}
                            className="w-16 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {event.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {event.start_time ? new Date(event.start_time).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-muted-foreground">
                            to {event.end_time ? new Date(event.end_time).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {event.created_at ? new Date(event.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No events found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && <EventDetailsView event={selectedEvent} />}
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm
              event={selectedEvent}
              onSubmit={handleUpdateEvent}
              onClose={() => setIsEditDialogOpen(false)}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}