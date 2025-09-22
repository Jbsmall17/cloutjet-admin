"use client"
import { useRouter } from "next/navigation";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

type seller = {
    _id: string,
    fullName: string,
    email: string
}
type buyer = {
    _id: string,
    fullName: string,
    email: string
}
export type account =  {
    _id: string,
    user: seller,
    platform: string,
    niche: string,
    accountUsername: string,
    followersCount: number,
    profileLink: string,
    twoFAEnabled: boolean,
    preferredPrice: number,
    description: string,
    status: "pending" | "rejected" | "approved",
    twoFAMethod: string,
    createdAt: string,
    updatedAt: string,
}

type transaction = {
    _id: string,
    buyer: buyer,
    seller: seller,
    amount: number,
    serviceDescription: string,
    status: string,
    transactionType: string,
    createdAt: string,
}

type notification = {
    _id: string,
    user: string,
    title: string,
    message: string,
    type: string,
    status: string,
    createdAt: string,
}

type adminStats = {
    pendingAccountsCount: number,
    activeTransactionsCount: number,
    pendingInfluencersCount: number,
    unassignedOrdersCount : number,
    recentNotifications: notification[]
} 

type contextType = {
    accounts: account[]
    setAccounts: Dispatch<SetStateAction<account[]>>,
    isAccountRequested: boolean,
    setIsAccountRequested: Dispatch<SetStateAction<boolean>>,
    transactions: transaction[],
    setTransactions: Dispatch<SetStateAction<transaction[]>>,
    isEscrowRequested: boolean,
    setIsEscrowRequested: Dispatch<SetStateAction<boolean>>,
    influencers: any[],
    setInfluencers: Dispatch<SetStateAction<any[]>>,
    isInfluencerRequested: boolean,
    setIsInfluencerRequested: Dispatch<SetStateAction<boolean>>,
    orderList: any[],
    setOrderList: Dispatch<SetStateAction<any[]>>,
    isOrderRequested: boolean,
    setIsOrderRequested: Dispatch<SetStateAction<boolean>>,
    adminStats: adminStats,
    setAdminStats: Dispatch<SetStateAction<adminStats>>,
    isAdminStatsRequested: boolean,
    setIsAdminStatsRequested: Dispatch<SetStateAction<boolean>>
}

const myContext = createContext< contextType|undefined>(undefined)


export default function ContextComp({children}:{children: ReactNode}){
    const router = useRouter()
    const [accounts, setAccounts] = useState<account[]>([])
    const [isAccountRequested, setIsAccountRequested] = useState(false)
    const [transactions, setTransactions] = useState<transaction[]>([])
    const [isEscrowRequested, setIsEscrowRequested] = useState(false)
    const [influencers, setInfluencers] = useState<any[]>([])
    const [isInfluencerRequested, setIsInfluencerRequested] = useState(false)
    const [orderList, setOrderList] = useState<any[]>([])
    const [isOrderRequested, setIsOrderRequested] = useState(false)
    const [adminStats, setAdminStats] = useState<adminStats>({
        pendingAccountsCount: 0,
        activeTransactionsCount: 0,
        pendingInfluencersCount: 0,
        unassignedOrdersCount: 0,
        recentNotifications: []
    })
    const [isAdminStatsRequested, setIsAdminStatsRequested] = useState(false)
    return (
        <myContext.Provider value={{accounts, setAccounts, isAccountRequested, setIsAccountRequested, transactions, setTransactions, isEscrowRequested, setIsEscrowRequested, influencers, setInfluencers, isInfluencerRequested, setIsInfluencerRequested, orderList, setOrderList, isOrderRequested, setIsOrderRequested, adminStats, setAdminStats, isAdminStatsRequested, setIsAdminStatsRequested}}>
            {children}
        </myContext.Provider>
    )
}


export function useContextValue(){
    const contextValue = useContext(myContext)
    if(!contextValue){
        throw new Error("context throws an error")
    }
    return contextValue
}