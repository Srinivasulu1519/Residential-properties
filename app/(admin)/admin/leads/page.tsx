"use client"

import { useEffect, useState } from "react"
import { 
    Users, 
    Mail, 
    Phone, 
    Building2, 
    Calendar, 
    ExternalLink,
    Search,
    Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

import { useAdminAuth } from "@/lib/admin-auth"

export default function AdminLeadsPage() {
    const { token, authenticatedFetch } = useAdminAuth()
    const [leads, setLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        try {
            const res = await authenticatedFetch("/api/admin/leads")
            const data = await res.json()
            if (data.success) {
                setLeads(data.leads)
            }
        } catch (err) {
            console.error("Error fetching leads:", err)
        } finally {
            setLoading(false)
        }
    }

    const filteredLeads = leads.filter(l => 
        l.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.property.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Interest & Leads</h1>
                    <p className="text-muted-foreground mt-1">Track which users are interested in which properties.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        placeholder="Search leads..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6">
                {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                        <Card key={lead.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="flex flex-col lg:flex-row">
                                    {/* User Side */}
                                    <div className="p-6 flex-1 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/30">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Avatar className="h-14 w-14 border-2 border-white shadow-sm font-bold">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.user.name}`} />
                                                <AvatarFallback>{lead.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{lead.user.name}</h3>
                                                <Badge variant="secondary" className="mt-1">Potential Lead</Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-xs text-slate-900 font-bold gap-2 bg-primary/5 px-2 py-1 rounded-full border border-primary/10 w-fit">
                                                <Phone className="h-3.5 w-3.5 text-primary" />
                                                <span>{lead.user.phone}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600 gap-3">
                                                <Mail className="h-4 w-4 text-primary" />
                                                <span>{lead.user.email}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-400 gap-3">
                                                <Calendar className="h-4 w-4" />
                                                <span>Interacted on {format(new Date(lead.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Side */}
                                    <div className="p-6 flex-[1.5] bg-white">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Interested In</p>
                                                <h4 className="text-xl font-serif font-bold text-slate-900 line-clamp-1">{lead.property.title}</h4>
                                            </div>
                                            <Badge className="bg-primary/5 text-primary hover:bg-primary/10 border-none px-3 py-1">
                                                High Interest
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Property Owner</p>
                                                <p className="font-semibold text-slate-900">{lead.property.ownerName || "Staff Admin"}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <a 
                                                href={`/properties/${lead.property.id}#as=${token}`} 
                                                target="_blank" 
                                                className="text-primary text-sm font-semibold flex items-center gap-1.5 hover:underline"
                                            >
                                                View Listing <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                        <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No leads found</h3>
                        <p className="text-slate-500 mt-1">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
