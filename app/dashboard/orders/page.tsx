"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, UserPlus, Clock, CheckCircle, AlertCircle, Package } from "lucide-react"
import axios from "axios"
import Loader from "@/components/loader"



const baseUrl = process.env.NEXT_PUBLIC_API_URL
// Mock data for orders
const orders = [
  {
    id: "ORD-001",
    clientName: "TechCorp Inc.",
    clientEmail: "marketing@techcorp.com",
    campaign: "Product Launch Campaign",
    description: "Promote our new smartphone with unboxing videos and reviews",
    budget: "$5,000",
    deadline: "2024-02-01",
    status: "unassigned",
    createdAt: "2024-01-15",
    requirements: {
      platform: "YouTube",
      contentType: "Video Review",
      minFollowers: "50K",
      niche: "Technology",
    },
    deliverables: ["1 unboxing video", "1 detailed review", "3 social media posts"],
    assignedInfluencer: null,
  },
  {
    id: "ORD-002",
    clientName: "Fashion Forward",
    clientEmail: "campaigns@fashionforward.com",
    campaign: "Summer Collection 2024",
    description: "Showcase our new summer fashion line with lifestyle content",
    budget: "$3,500",
    deadline: "2024-01-28",
    status: "assigned",
    createdAt: "2024-01-14",
    requirements: {
      platform: "Instagram",
      contentType: "Posts & Stories",
      minFollowers: "80K",
      niche: "Fashion & Lifestyle",
    },
    deliverables: ["5 Instagram posts", "10 Instagram stories", "1 reel"],
    assignedInfluencer: {
      id: "INF-001",
      name: "Maya Rodriguez",
      avatar: "/placeholder.svg?key=maya",
    },
  },
  {
    id: "ORD-003",
    clientName: "FitLife Supplements",
    clientEmail: "partnerships@fitlife.com",
    campaign: "Protein Powder Promotion",
    description: "Create workout content featuring our new protein powder",
    budget: "$2,800",
    deadline: "2024-01-25",
    status: "in_progress",
    createdAt: "2024-01-13",
    requirements: {
      platform: "Instagram",
      contentType: "Workout Videos",
      minFollowers: "60K",
      niche: "Fitness & Health",
    },
    deliverables: ["3 workout videos", "5 Instagram posts", "Daily stories for 1 week"],
    assignedInfluencer: {
      id: "INF-003",
      name: "Sofia Chen",
      avatar: "/placeholder.svg?key=sofia",
    },
  },
  {
    id: "ORD-004",
    clientName: "GameZone",
    clientEmail: "marketing@gamezone.com",
    campaign: "New Game Launch",
    description: "Create gaming content and reviews for our latest game release",
    budget: "$4,200",
    deadline: "2024-02-05",
    status: "completed",
    createdAt: "2024-01-10",
    requirements: {
      platform: "TikTok",
      contentType: "Gaming Videos",
      minFollowers: "100K",
      niche: "Gaming",
    },
    deliverables: ["5 gameplay videos", "1 review video", "10 TikTok posts"],
    assignedInfluencer: {
      id: "INF-004",
      name: "Marcus Johnson",
      avatar: "/placeholder.svg?key=marcus",
    },
  },
]

// Mock data for available influencers
const availableInfluencers = [
  {
    id: "INF-001",
    name: "Maya Rodriguez",
    avatar: "/placeholder.svg?key=maya",
    niche: "Fashion & Lifestyle",
    platforms: ["Instagram", "TikTok"],
    followers: "205K",
    engagement: "4.2%",
  },
  {
    id: "INF-002",
    name: "James Wilson",
    avatar: "/placeholder.svg?key=james",
    niche: "Technology",
    platforms: ["YouTube", "Twitter"],
    followers: "73K",
    engagement: "5.1%",
  },
  {
    id: "INF-003",
    name: "Sofia Chen",
    avatar: "/placeholder.svg?key=sofia",
    niche: "Fitness & Health",
    platforms: ["Instagram", "YouTube"],
    followers: "127K",
    engagement: "3.8%",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "unassigned":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "assigned":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    case "in_progress":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "unassigned":
      return <AlertCircle className="h-4 w-4" />
    case "assigned":
      return <UserPlus className="h-4 w-4" />
    case "in_progress":
      return <Clock className="h-4 w-4" />
    case "completed":
      return <CheckCircle className="h-4 w-4" />
    default:
      return null
  }
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function OrdersPage() {
  const [ordersList, setOrdersList] = useState(orders)
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[0] | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState("")
  const [assignmentNotes, setAssignmentNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAssignOrder = (order: (typeof orders)[0]) => {
    setSelectedOrder(order)
    setShowAssignDialog(true)
  }

  const confirmAssignment = () => {
    if (!selectedOrder || !selectedInfluencer) return

    const influencer = availableInfluencers.find((inf) => inf.id === selectedInfluencer)
    if (!influencer) return

    setOrdersList((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              status: "assigned",
              assignedInfluencer: {
                id: influencer.id,
                name: influencer.name,
                avatar: influencer.avatar,
              },
            }
          : order,
      ),
    )

    setShowAssignDialog(false)
    setSelectedOrder(null)
    setSelectedInfluencer("")
    setAssignmentNotes("")
  }

  const viewOrderDetails = (order: (typeof orders)[0]) => {
    setSelectedOrder(order)
  }

  const getOrders = (token: string) => {
    setIsLoading(true)
    axios.get(`${baseUrl}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        // setOrdersList(response.data)
        console.log(response.data.data)
      })
      .catch((error) => {
        console.error("Error fetching orders:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      getOrders(storedToken)
    }
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders Management</h2>
          <p className="text-muted-foreground">Manage campaign orders and assign them to influencers</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unassigned Orders</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersList.filter((o) => o.status === "unassigned").length}</div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ordersList.filter((o) => o.status === "assigned" || o.status === "in_progress").length}
              </div>
              <p className="text-xs text-muted-foreground">Active campaigns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersList.filter((o) => o.status === "completed").length}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {ordersList
                  .reduce((total, order) => total + Number.parseInt(order.budget.replace(/[^0-9]/g, "")), 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Combined order value</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Orders</CardTitle>
            <CardDescription>Manage and assign campaign orders to influencers</CardDescription>
          </CardHeader>
          <CardContent>
            {
              ordersList.length > 0
              ?
            (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersList.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.clientName}</div>
                        <div className="text-sm text-muted-foreground">{order.clientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate">{order.campaign}</div>
                        <div className="text-sm text-muted-foreground truncate">{order.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.budget}</TableCell>
                    <TableCell>{order.deadline}</TableCell>
                    <TableCell>
                      {order.assignedInfluencer ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={order.assignedInfluencer.avatar || "/placeholder.svg"}
                              alt={order.assignedInfluencer.name}
                            />
                            <AvatarFallback className="text-xs">
                              {order.assignedInfluencer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{order.assignedInfluencer.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {formatStatus(order.status)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "unassigned" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 bg-transparent"
                            onClick={() => handleAssignOrder(order)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )
            : (
              <div className="min-h-[300px] flex justify-center items-center border rounded-xl">
                {
                  !isLoading
                  ? <p className="text-xl font-medium">No Orders</p> 
                  : <Loader height={16} width={16} color="primary" />
                }
              </div>
            )
          }
          </CardContent>
        </Card>

        {/* Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Order to Influencer</DialogTitle>
              <DialogDescription>Select an influencer to assign this campaign order to</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="influencer">Select Influencer</Label>
                <Select value={selectedInfluencer} onValueChange={setSelectedInfluencer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an influencer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInfluencers.map((influencer) => (
                      <SelectItem key={influencer.id} value={influencer.id}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={influencer.avatar || "/placeholder.svg"} alt={influencer.name} />
                            <AvatarFallback className="text-xs">
                              {influencer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{influencer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {influencer.niche} • {influencer.followers} • {influencer.engagement} engagement
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInfluencer && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  {(() => {
                    const influencer = availableInfluencers.find((inf) => inf.id === selectedInfluencer)
                    return influencer ? (
                      <div className="space-y-2">
                        <h4 className="font-medium">Selected Influencer Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Niche:</span> {influencer.niche}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Followers:</span> {influencer.followers}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Platforms:</span> {influencer.platforms.join(", ")}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Engagement:</span> {influencer.engagement}
                          </div>
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              <div>
                <Label htmlFor="notes">Assignment Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions or notes for the influencer..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAssignment} disabled={!selectedInfluencer}>
                Assign Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder && !showAssignDialog} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Complete information about this campaign order</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Order ID:</span> {selectedOrder.id}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Budget:</span> {selectedOrder.budget}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deadline:</span> {selectedOrder.deadline}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span> {selectedOrder.createdAt}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {formatStatus(selectedOrder.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Client Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Company:</span> {selectedOrder.clientName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span> {selectedOrder.clientEmail}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Campaign Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">{selectedOrder.campaign}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedOrder.description}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Platform:</span> {selectedOrder.requirements.platform}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Content Type:</span>{" "}
                      {selectedOrder.requirements.contentType}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min Followers:</span>{" "}
                      {selectedOrder.requirements.minFollowers}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Niche:</span> {selectedOrder.requirements.niche}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Deliverables</h4>
                  <div className="space-y-1">
                    {selectedOrder.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {deliverable}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.assignedInfluencer && (
                  <div>
                    <h4 className="font-medium mb-2">Assigned Influencer</h4>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage
                          src={selectedOrder.assignedInfluencer.avatar || "/placeholder.svg"}
                          alt={selectedOrder.assignedInfluencer.name}
                        />
                        <AvatarFallback>
                          {selectedOrder.assignedInfluencer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedOrder.assignedInfluencer.name}</div>
                        <div className="text-sm text-muted-foreground">Assigned to this campaign</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
