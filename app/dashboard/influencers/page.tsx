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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, Eye, Star, Users, TrendingUp, Instagram, Twitter, Youtube, TicketIcon as TikTok } from "lucide-react"
import axios from "axios"
import Loader from "@/components/loader"


const baseUrl = process.env.NEXT_PUBLIC_API_URL

// Mock data for influencer applications
const influencerApplications = [
  {
    id: "INF-001",
    name: "Maya Rodriguez",
    email: "maya@example.com",
    platforms: [
      { name: "Instagram", handle: "@mayarodriguez", followers: "85K", engagement: "4.2%" },
      { name: "TikTok", handle: "@mayar_official", followers: "120K", engagement: "6.8%" },
    ],
    niche: "Fashion & Lifestyle",
    experience: "3 years",
    status: "pending",
    appliedAt: "2024-01-15",
    avatar: "/placeholder.svg?key=inf1",
    bio: "Fashion enthusiast and lifestyle content creator with a passion for sustainable fashion and beauty tips.",
    portfolio: ["Campaign with Nike", "Collaboration with Sephora", "Brand partnership with Zara"],
    rates: {
      post: "$500",
      story: "$200",
      reel: "$800",
    },
  },
  {
    id: "INF-002",
    name: "James Wilson",
    email: "james@example.com",
    platforms: [
      { name: "YouTube", handle: "@jameswilsontech", followers: "45K", engagement: "5.1%" },
      { name: "Twitter", handle: "@jameswtech", followers: "28K", engagement: "3.4%" },
    ],
    niche: "Technology",
    experience: "2 years",
    status: "pending",
    appliedAt: "2024-01-14",
    avatar: "/placeholder.svg?key=inf2",
    bio: "Tech reviewer and gadget enthusiast creating content about the latest technology trends and reviews.",
    portfolio: ["Samsung Galaxy review series", "Apple product unboxings", "Tech startup interviews"],
    rates: {
      video: "$1200",
      tweet: "$150",
      thread: "$300",
    },
  },
  {
    id: "INF-003",
    name: "Sofia Chen",
    email: "sofia@example.com",
    platforms: [
      { name: "Instagram", handle: "@sofiachen_fitness", followers: "95K", engagement: "3.8%" },
      { name: "YouTube", handle: "@SofiaChenFit", followers: "32K", engagement: "4.5%" },
    ],
    niche: "Fitness & Health",
    experience: "4 years",
    status: "approved",
    appliedAt: "2024-01-13",
    avatar: "/placeholder.svg?key=inf3",
    bio: "Certified personal trainer and nutrition coach helping people achieve their fitness goals.",
    portfolio: ["Protein powder brand partnerships", "Gym equipment collaborations", "Fitness app promotions"],
    rates: {
      post: "$600",
      video: "$1000",
      story: "$250",
    },
  },
  {
    id: "INF-004",
    name: "Marcus Johnson",
    email: "marcus@example.com",
    platforms: [
      { name: "TikTok", handle: "@marcusjcomedy", followers: "150K", engagement: "7.2%" },
      { name: "Instagram", handle: "@marcusjohnson", followers: "68K", engagement: "4.1%" },
    ],
    niche: "Comedy & Entertainment",
    experience: "1 year",
    status: "rejected",
    appliedAt: "2024-01-12",
    avatar: "/placeholder.svg?key=inf4",
    bio: "Stand-up comedian and content creator making people laugh with relatable comedy skits.",
    portfolio: ["Comedy club performances", "Brand humor campaigns", "Viral comedy videos"],
    rates: {
      post: "$400",
      reel: "$700",
      story: "$180",
    },
  },
]

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4" />
    case "twitter":
      return <Twitter className="h-4 w-4" />
    case "youtube":
      return <Youtube className="h-4 w-4" />
    case "tiktok":
      return <TikTok className="h-4 w-4" />
    default:
      return null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}


export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState(influencerApplications)
  const [selectedInfluencer, setSelectedInfluencer] = useState<(typeof influencerApplications)[0] | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const handleReview = (influencer: (typeof influencerApplications)[0], action: "approve" | "reject") => {
    setSelectedInfluencer(influencer)
    setReviewAction(action)
    setShowReviewDialog(true)
  }

  const confirmReview = () => {
    if (!selectedInfluencer || !reviewAction) return

    setInfluencers((prev) =>
      prev.map((influencer) =>
        influencer.id === selectedInfluencer.id
          ? { ...influencer, status: reviewAction === "approve" ? "approved" : "rejected" }
          : influencer,
      ),
    )

    setShowReviewDialog(false)
    setSelectedInfluencer(null)
    setReviewAction(null)
    setReviewNotes("")
  }

  const viewInfluencerDetails = (influencer: (typeof influencerApplications)[0]) => {
    setSelectedInfluencer(influencer)
  }

  const getTotalFollowers = (platforms: any[]) => {
    return platforms.reduce((total, platform) => {
      const followers = platform.followers.replace("K", "000").replace("M", "000000")
      return total + Number.parseInt(followers.replace(/[^0-9]/g, ""))
    }, 0)
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`
    }
    return count.toString()
  }

  const getInfluencers = (token : string) => {
    const endpoint = `${baseUrl}/admin/influencers`
    setIsLoading(true)
    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res)=>{
      console.log(res.data.data)
    })
    .catch((error)=>{
      console.log(error.response ? error.response.data.message : error.message)
    })
    .finally(()=>{
      setIsLoading(false)
    })
  }

  useEffect(()=>{
    const storedToken = sessionStorage.getItem("token")
    if(storedToken){
      getInfluencers(storedToken)
    }
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Influencer Management</h2>
          <p className="text-muted-foreground">Review and approve influencer applications for the platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{influencers.filter((i) => i.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{influencers.filter((i) => i.status === "approved").length}</div>
              <p className="text-xs text-muted-foreground">Active influencers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatFollowers(
                  influencers
                    .filter((i) => i.status === "approved")
                    .reduce((total, i) => total + getTotalFollowers(i.platforms), 0),
                )}
              </div>
              <p className="text-xs text-muted-foreground">Combined followers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8%</div>
              <p className="text-xs text-muted-foreground">Across all platforms</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Influencer Applications</CardTitle>
            <CardDescription>Review and manage influencer applications</CardDescription>
          </CardHeader>
          <CardContent>
            {
              influencers.length > 0
              ?
              (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Platforms</TableHead>
                  <TableHead>Niche</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Total Reach</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {influencers.map((influencer) => (
                  <TableRow key={influencer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={influencer.avatar || "/placeholder.svg"} alt={influencer.name} />
                          <AvatarFallback>
                            {influencer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{influencer.name}</div>
                          <div className="text-sm text-muted-foreground">{influencer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {influencer.platforms.map((platform, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {getPlatformIcon(platform.name)}
                            <span>{platform.name}</span>
                            <span className="text-muted-foreground">({platform.followers})</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{influencer.niche}</TableCell>
                    <TableCell>{influencer.experience}</TableCell>
                    <TableCell className="font-medium">
                      {formatFollowers(getTotalFollowers(influencer.platforms))}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(influencer.status)}>{influencer.status}</Badge>
                    </TableCell>
                    <TableCell>{influencer.appliedAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewInfluencerDetails(influencer)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {influencer.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 bg-transparent"
                              onClick={() => handleReview(influencer, "approve")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleReview(influencer, "reject")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
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
                  ? <p className="text-xl font-medium">No Transactions</p> 
                  : <Loader height={16} width={16} color="primary" />
                }
              </div>
             )
             }
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{reviewAction === "approve" ? "Approve Influencer" : "Reject Application"}</DialogTitle>
              <DialogDescription>
                {reviewAction === "approve"
                  ? "This influencer will be approved and can start receiving orders."
                  : "This application will be rejected and the influencer will be notified."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Review Notes</Label>
                <Textarea
                  id="notes"
                  placeholder={
                    reviewAction === "approve"
                      ? "Optional notes for approval..."
                      : "Please provide a reason for rejection..."
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmReview}
                className={
                  reviewAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }
              >
                {reviewAction === "approve" ? "Approve Influencer" : "Reject Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Influencer Details Dialog */}
        <Dialog open={!!selectedInfluencer && !showReviewDialog} onOpenChange={() => setSelectedInfluencer(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Influencer Profile</DialogTitle>
              <DialogDescription>Complete profile and application details</DialogDescription>
            </DialogHeader>
            {selectedInfluencer && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedInfluencer.avatar || "/placeholder.svg"} alt={selectedInfluencer.name} />
                    <AvatarFallback className="text-lg">
                      {selectedInfluencer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedInfluencer.name}</h3>
                    <p className="text-muted-foreground">{selectedInfluencer.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className={getStatusColor(selectedInfluencer.status)}>{selectedInfluencer.status}</Badge>
                      <span className="text-sm text-muted-foreground">Applied {selectedInfluencer.appliedAt}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-sm text-muted-foreground">{selectedInfluencer.bio}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Niche:</span> {selectedInfluencer.niche}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Experience:</span> {selectedInfluencer.experience}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Reach:</span>{" "}
                        {formatFollowers(getTotalFollowers(selectedInfluencer.platforms))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Rates</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedInfluencer.rates).map(([type, rate]) => (
                        <div key={type}>
                          <span className="text-muted-foreground capitalize">{type}:</span> {rate}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Platform Details</h4>
                  <div className="grid gap-3">
                    {selectedInfluencer.platforms.map((platform, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(platform.name)}
                          <div>
                            <div className="font-medium">{platform.name}</div>
                            <div className="text-sm text-muted-foreground">{platform.handle}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{platform.followers}</div>
                          <div className="text-sm text-muted-foreground">{platform.engagement} engagement</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Portfolio</h4>
                  <div className="space-y-2">
                    {selectedInfluencer.portfolio.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
