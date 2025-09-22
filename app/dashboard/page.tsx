"use client"

import { AdminLayout } from "@/components/admin-layout"
import Loader from "@/components/loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContextValue } from "@/context/context"
import { formatDate } from "@/lib/utils"
import axios from "axios"
import { Users, CreditCard, Star, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


const baseUrl = process.env.NEXT_PUBLIC_API_URL

const timeAgo =(timeStamp: string) =>{
  const now = new Date()
  const past = new Date(timeStamp)
  const secondsPast = (now.getTime() - past.getTime())

  const seconds = Math.floor(secondsPast / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "just now";
  if (minutes < 2) return "a minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 2) return "an hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "yesterday";
  if (days <= 7) return `${days} days ago`;

  return formatDate(timeStamp)
}


export default function DashboardPage() {
  const {adminStats, setAdminStats, isAdminStatsRequested, setIsAdminStatsRequested} = useContextValue()
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
2
  const stats = [
  {
    name: "Pending Accounts",
    value: adminStats.pendingAccountsCount,
    description: "Accounts awaiting verification",
    icon: Users,
    color: "text-blue-600",
  },
  {
    name: "Active Transactions",
    value: adminStats.activeTransactionsCount,
    description: "Escrow transactions in progress",
    icon: CreditCard,
    color: "text-green-600",
  },
  {
    name: "Influencer Applications",
    value: adminStats.pendingInfluencersCount,
    description: "New influencer applications",
    icon: Star,
    color: "text-yellow-600",
  },
  {
    name: "Unassigned Orders",
    value: adminStats.unassignedOrdersCount,
    description: "Orders waiting for assignment",
    icon: ShoppingCart,
    color: "text-purple-600",
  },
]

  const getAdminStats = (token: string) => {
    setLoading(true)
    const endpoint = `${baseUrl}/admin/adminDashboard`
    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res)=>{
      setIsAdminStatsRequested(true)
      console.log({...res.data.data})
      setAdminStats((prev)=>{
        return {
          ...prev,
          ...res.data.data
        }
      })
    })
    .catch(()=>{
      setAdminStats({
        pendingAccountsCount: 0,
        activeTransactionsCount: 0,
        pendingInfluencersCount: 0,
        unassignedOrdersCount: 0,
        recentNotifications: []  
      })
    })
    .finally(()=>{
      setLoading(false)
    })

  }


  useEffect(()=>{
    const storedToken = sessionStorage.getItem('token')
    if(storedToken){
      setToken(storedToken)
    }else{
      router.push("/")
    }
  },[token])
  
  useEffect(()=>{
    const storedToken = sessionStorage.getItem("token")
    if(storedToken){
      if(!!isAdminStatsRequested) return
      getAdminStats(storedToken)
    }
  }, [isAdminStatsRequested])

  if(!token){
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome to the Clout Jet admin dashboard. Here's what needs your attention.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="py-4 gap-4">
              <CardHeader className="px-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="px-4">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {
                adminStats.recentNotifications.length > 0
                ? (
                  <div className="space-y-4 h-[150px] overflow-y-auto">
                  {adminStats.recentNotifications.map((note, index)=>(
                    <div key={index} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{note.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {note.message}
                        </p>
                      </div>
                      <div className="ml-auto font-medium text-sm text-muted-foreground">{timeAgo(note.createdAt)}</div>
                    </div>     
                    ))}
                  </div>
                )
                : (
                   <div className="ml-4 flex justify-center items-center min-h-[175px] rounded-xl border">
                    {
                      loading
                      ? <Loader height={8} width={8} color="primary" />
                      : <p className="text-sm">No recent activity</p>
                    }
                  </div>
                )
              }
              {/* <div className="space-y-4">
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">New account verification request</p>
                    <p className="text-sm text-muted-foreground">
                      @socialinfluencer submitted Instagram account for verification
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-muted-foreground">2 min ago</div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Escrow payment confirmed</p>
                    <p className="text-sm text-muted-foreground">$2,500 payment confirmed for order #1234</p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-muted-foreground">5 min ago</div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">New influencer application</p>
                    <p className="text-sm text-muted-foreground">@tiktokcreator applied to join the platform</p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-muted-foreground">10 min ago</div>
                </div>
              </div> */}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  <Link href="/dashboard/accounts">
                    Review pending accounts
                  </Link>
                </p>
                <p className="text-sm font-medium">
                  <Link href="/dashboard/transactions">
                    Process escrow transactions
                  </Link>
                </p>
                <p className="text-sm font-medium">
                  <Link href="/dashboard/influencers">
                    Approve influencer applications
                  </Link>
                </p>
                <p className="text-sm font-medium">
                  <Link href="/dashboard/orders">
                    Assign orders to influencers
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
