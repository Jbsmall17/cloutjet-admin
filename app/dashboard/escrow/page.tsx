"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Check, Eye, DollarSign, Clock, AlertTriangle, AlertCircle } from "lucide-react"
import axios from "axios"
import Loader from "@/components/loader"
import { useContextValue } from "@/context/context"
import { formatDate } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"


const baseUrl = process.env.NEXT_PUBLIC_API_URL
// Mock data for escrow transactions

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "payment_received":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "dispute":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />
    case "approved":
      return <DollarSign className="h-4 w-4" />
    case "completed":
      return <Check className="h-4 w-4" />
    case "disputed":
      return <AlertTriangle className="h-4 w-4" />
    case "refunded":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return null
  }
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatId = (id: string) => {
  return `ESC-${id.substring((id.length - 4)).toUpperCase()}`
} 

const formatPrice = (num : number) =>{
  return `₦${num.toLocaleString()}`
}

export default function EscrowPage() {
  const {transactions, setTransactions, isEscrowRequested, setIsEscrowRequested} = useContextValue()
  // const [transactions, setTransactions] = useState(escrowTransactions)
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof transactions)[0] | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<"confirm_payment" | "release_funds" | "resolve_dispute" | null>(null)
  const [actionNotes, setActionNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const handleAction = (
    transaction: (typeof transactions)[0],
    action: "confirm_payment" | "release_funds" | "resolve_dispute",
  ) => {
    setSelectedTransaction(transaction)
    setActionType(action)
    setShowActionDialog(true)
  }

  const confirmAction = () => {
    if (!selectedTransaction || !actionType) return
    if(actionType == "confirm_payment"){
      setActionLoading(true)
      const endpoint = `${baseUrl}/admin/escrow-transactions/${selectedTransaction._id}/confirm`
      const token = sessionStorage.getItem("token")
      axios.post(endpoint,{},{
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(()=>{
        setIsEscrowRequested(false)
        setShowActionDialog(false)
        setSelectedTransaction(null)
        setActionType(null)
        setActionNotes("")
      })
      .catch((err)=>{
        setError(err.response ? err.response.message : `unable to ${actionType} action`)
      })
      .finally(()=>{
        setActionLoading(false)
      })
    }
   
  }

  const viewTransactionDetails = (transaction: (typeof transactions)[0]) => {
    setSelectedTransaction(transaction)
  }

  const getActionButton = (transaction: (typeof transactions)[0]) => {
    switch (transaction.status) {
      case "approved":
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700 bg-transparent hover:text-white"
            onClick={() => handleAction(transaction, "confirm_payment")}
          >
            Confirm Payment
          </Button>
        )
      case "completed":
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 bg-transparent"
            onClick={() => handleAction(transaction, "release_funds")}
          >
            Release Funds
          </Button>
        )
      case "dispute":
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-purple-600 hover:text-purple-700 bg-transparent"
            onClick={() => handleAction(transaction, "resolve_dispute")}
          >
            Resolve Dispute
          </Button>
        )
      default:
        return null
    }
  }

  const getActionTitle = () => {
    switch (actionType) {
      case "confirm_payment":
        return "Confirm Payment Received"
      case "release_funds":
        return "Release Funds to Seller"
      case "resolve_dispute":
        return "Resolve Dispute"
      default:
        return ""
    }
  }

  const getActionDescription = () => {
    switch (actionType) {
      case "confirm_payment":
        return "Mark this payment as received and notify both parties."
      case "release_funds":
        return "Release the escrowed funds to the seller and complete the transaction."
      case "resolve_dispute":
        return "Resolve the dispute and complete the transaction."
      default:
        return ""
    }
  }

  const getTransactions = (token: string) =>{
    setIsLoading(true)
    axios.get(`${baseUrl}/admin/escrow-transactions`, { 
      headers: {
      Authorization: `Bearer ${token}`
    } 
    })
    .then((response)=>{
      setTransactions([...response.data.data])
      setIsEscrowRequested(true)
      console.log(response.data.data)
    })
    .catch((error)=>{
      setTransactions([])
      console.log(error.response ? error.response.data.message : error.message)
    })
    .finally(()=>{
      setIsLoading(false)
    })
  }

  useEffect(()=>{
    const storedToken = sessionStorage.getItem("token")
    if(storedToken){
      if(!!isEscrowRequested) return
      getTransactions(storedToken)
    }
  },[isEscrowRequested])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Escrow Transactions</h2>
          <p className="text-muted-foreground">Manage escrow payments and transaction security</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.filter((t) => t.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting payment confirmation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Received</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.filter((t) => t.status === "appproved").length}
              </div>
              <p className="text-xs text-muted-foreground">Ready for fund release</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.filter((t) => t.status === "completed").length}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.filter((t) => t.status === "disputed").length}</div>
              <p className="text-xs text-muted-foreground">Requiring resolution</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Management</CardTitle>
            <CardDescription>Monitor and manage all escrow transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {
              transactions.length > 0  ?
            (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  {/* <TableHead>Account</TableHead> */}
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="font-mono text-sm">{formatId(transaction._id)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{transaction.buyer.fullName}</div>
                          <div className="text-sm text-muted-foreground">{transaction.buyer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{transaction.seller.fullName}</div>
                          <div className="text-sm text-muted-foreground">{transaction.seller.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <div>
                        <div className="font-medium">{transaction.}</div>
                        <div className="text-sm text-muted-foreground">{transaction.platform}</div>
                      </div>
                    </TableCell> */}
                    <TableCell className="font-medium">{formatPrice(transaction.amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transaction.status)}
                          {formatStatus(transaction.status)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewTransactionDetails(transaction)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {getActionButton(transaction)}
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

        {/* Action Dialog */}
        <Dialog open={showActionDialog} onOpenChange={() => {setShowActionDialog(false); setSelectedTransaction(null); setError("")}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getActionTitle()}</DialogTitle>
              <DialogDescription>{getActionDescription()}</DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Action Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this action..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {setShowActionDialog(false); setSelectedTransaction(null); setError("")}}>
                Cancel
              </Button>
              <Button onClick={confirmAction} className="bg-primary hover:bg-primary/90 min-w-[145px]">
                {
                  actionLoading
                  ? <Loader height={4} width={4} color="white" />
                  : "Confirm Action" 
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transaction Details Dialog */}
        <Dialog open={!!selectedTransaction && !showActionDialog} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>Complete information about this escrow transaction</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Transaction Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">ID:</span> {formatId(selectedTransaction._id)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span> {formatPrice(selectedTransaction.amount)}
                      </div>
                      {/* <div>
                        <span className="text-muted-foreground">Escrow Fee:</span> {selectedTransaction.escrowFee}
                      </div> */}
                      <div className="capitalize">
                        <span className="text-muted-foreground">Payment Method:</span>{" "}
                        {selectedTransaction.transactionType}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span> {formatDate(selectedTransaction.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Account Details</h4>
                    <div className="space-y-2 text-sm">
                      {/* <div>
                        <span className="text-muted-foreground">Handle:</span> {selectedTransaction.accountHandle}
                      </div> */}
                      {/* <div>
                        <span className="text-muted-foreground">Platform:</span> {selectedTransaction.platform}
                      </div> */}
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge className={getStatusColor(selectedTransaction.status)}>
                          {formatStatus(selectedTransaction.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.serviceDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Buyer</h4>
                    <div className="flex items-center gap-3">
                      {/* <Avatar>
                        <AvatarImage
                          src={selectedTransaction.buyerAvatar || "/placeholder.svg"}
                          alt={selectedTransaction.buyerName}
                        />
                        <AvatarFallback>
                          {selectedTransaction.buyerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar> */}
                      <div>
                        <div className="font-medium">{selectedTransaction.buyer.fullName}</div>
                        <div className="text-sm text-muted-foreground">{selectedTransaction.buyer.email}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Seller</h4>
                    <div className="flex items-center gap-3">
                      {/* <Avatar>
                        <AvatarImage
                          src={selectedTransaction.sellerAvatar || "/placeholder.svg"}
                          alt={selectedTransaction.sellerName}
                        />
                        <AvatarFallback>
                          {selectedTransaction.sellerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar> */}
                      <div>
                        <div className="font-medium">{selectedTransaction.seller.fullName}</div>
                        <div className="text-sm text-muted-foreground">{selectedTransaction.seller.email}</div>
                      </div>
                    </div>
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
