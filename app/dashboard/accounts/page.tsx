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
import { Check, X, Eye, Instagram, Twitter, Youtube, TicketIcon as TikTok, Linkedin, Facebook, AlertCircle } from "lucide-react"
import axios from "axios"
import { useContextValue } from "@/context/context"
import Loader from "@/components/loader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"


const baseUrl = process.env.NEXT_PUBLIC_API_URL 

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
    case "linkedin":
      return <Linkedin className="h-4 w-4" />
    case "facebook":
      return <Facebook className="h-4 w-4" />
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



export const formatFollower = (followers: number): string => {
  const noOfFollowers = followers;
  let formatFollower;
  if (noOfFollowers >= 1000000) {
    formatFollower = `${(noOfFollowers / 1000000).toFixed(1)}M`;
  } else if (noOfFollowers >= 1000 && noOfFollowers < 1000000) {
    formatFollower = `${(noOfFollowers / 1000).toFixed(1)}K`;
  } else {
    formatFollower = `${noOfFollowers}`;
  }
  return formatFollower;
};


export default function AccountsPage() {
  const {accounts, setAccounts, setIsAccountRequested, isAccountRequested} = useContextValue()
  const [selectedAccount, setSelectedAccount] = useState<(typeof accounts)[0] | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [actionsLoading, setActionsLoading] = useState(false)
  const [error, setError] = useState('')
  const total = accounts.reduce((value,account)=> value + account.preferredPrice,0)

  const getSubmittedAccount = (token: string) =>{
    const endpoint = `${baseUrl}/admin/verifications/pending`
    setIsLoading(true)
    axios.get(endpoint,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res)=>{
      console.log(res.data)
      setAccounts([...res.data.data])
      setIsAccountRequested(true)
    })
    .catch((err)=>{
      setAccounts([])
      setIsAccountRequested(false)
      console.log(err.response ? err.response.message : "unable to fetch account")
    })
    .finally(()=>{
      setIsLoading(false)
    })
  }

  const handleReview = (account: (typeof accounts)[0], action: "approve" | "reject") => {
    setSelectedAccount(account)
    setReviewAction(action)
    setShowReviewDialog(true)
  }

  const confirmReview = () => {
    if (!selectedAccount || !reviewAction) return
    const endpoint = `${baseUrl}/admin/verification/${selectedAccount._id}/${reviewAction}`
    setActionsLoading(true)
    const token = sessionStorage.getItem("token") || ""
    axios.post(endpoint, {},{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res)=>{
      setIsAccountRequested(false)
      setShowReviewDialog(false)
      setSelectedAccount(null)
      setReviewAction(null)
      setReviewNotes("")  
    })
    .catch((err)=>{
      // alert(err.response ? err.response.message : `unable to ${reviewAction} account`)
      setError(err.response ? err.response.message : `unable to ${reviewAction} account`)
    })    
    .finally(()=>{
      setActionsLoading(false)
    })
  }

  const viewAccountDetails = (account: (typeof accounts)[0]) => {
    setSelectedAccount(account)
  }

  useEffect(()=>{
    const storedToken = sessionStorage.getItem("token")
    if(storedToken){
      if(!!isAccountRequested) return  
      getSubmittedAccount(storedToken)
    }

  },[isAccountRequested])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Account Verification</h2>
          <p className="text-muted-foreground">Review and approve social media accounts submitted for sale</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.filter((a) => a.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Accounts awaiting verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Accounts approved in last 24h</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{total.toLocaleString()}
                </div>
              <p className="text-xs text-muted-foreground">Combined value of pending accounts</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Account Verifications</CardTitle>
            <CardDescription>Review account submissions and approve or reject them for listing</CardDescription>
          </CardHeader>
          <CardContent>
            {
              accounts.length > 0
              ?
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={account.profileLink || "/placeholder.svg"} alt={account.user.fullName} />
                          <AvatarFallback>
                            {account.user.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{account.user.fullName}</div>
                          <div className="text-sm text-muted-foreground">{account.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">@{account.accountUsername}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(account.platform)}
                        <span>{account.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatFollower(account.followersCount)}</TableCell>
                    <TableCell className="font-medium">₦{account.preferredPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(account.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewAccountDetails(account)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {account.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 bg-transparent"
                              onClick={() => handleReview(account, "approve")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleReview(account, "reject")}
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
            : (
              <div className="min-h-[300px] flex justify-center items-center border rounded-xl">
                {
                  !isLoading
                  ? <p className="text-xl font-medium">No Account Pending</p> 
                  : <Loader height={16} width={16} color="primary" />
                }
              </div>
            )
            }
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={() => {setShowReviewDialog(false); setSelectedAccount(null); setError("")}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{reviewAction === "approve" ? "Approve Account" : "Reject Account"}</DialogTitle>
              <DialogDescription>
                {reviewAction === "approve"
                  ? "This account will be approved for listing on the marketplace."
                  : "This account will be rejected and the seller will be notified."}
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
              <Button variant="outline" onClick={() => {setShowReviewDialog(false); setSelectedAccount(null); setError("")}}>
                Cancel
              </Button>
              <Button
                onClick={confirmReview}
                className={
                  reviewAction === "approve" ? "bg-green-600 hover:bg-green-700 min-w-[145px]" : "bg-red-600 hover:bg-red-700 min-w-[145px]"
                }
              >
                {
                  actionsLoading
                  ? <Loader height={4} width={4} color="white" />
                  : reviewAction === "approve" ? "Approve Account" : "Reject Account" 
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Account Details Dialog */}
        <Dialog open={!!selectedAccount && !showReviewDialog} onOpenChange={() => setSelectedAccount(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>Review account information and verification documents</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Seller Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span> {selectedAccount.user.fullName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span> {selectedAccount.user.email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted:</span> {formatDate(selectedAccount.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Platform:</span> {selectedAccount.platform}
                      </div>
                       <div>
                        <span className="text-muted-foreground">Niche:</span>{selectedAccount.niche}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Handle:</span> @{selectedAccount.accountUsername}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Followers:</span> {formatFollower(selectedAccount.followersCount)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price:</span> ₦{selectedAccount.preferredPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedAccount.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Verification</h4>
                  <div className="space-y-1">
                    <div className="capitalize flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {selectedAccount.twoFAMethod}  
                    </div>
                    {
                      selectedAccount.twoFAEnabled
                      &&
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        two Factor Authentication Enabled
                      </div>
                    }
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
