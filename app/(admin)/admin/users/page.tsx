"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Users,
    Plus,
    Shield,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    X,
    Edit,
    Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdminAuth } from "@/lib/admin-auth"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserItem {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
}

export default function AdminUsersPage() {
    const { isAuthenticated, user, token, authenticatedFetch } = useAdminAuth()
    const router = useRouter()
    const [users, setUsers] = useState<UserItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [editingUserId, setEditingUserId] = useState<string | null>(null)
    const [formName, setFormName] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [formPassword, setFormPassword] = useState("")
    const [formRole, setFormRole] = useState<"admin" | "user">("admin")
    const [showPassword, setShowPassword] = useState(false)
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState("")
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "admin") {
            router.push("/admin")
        }
    }, [isAuthenticated, user, router])

    const fetchUsers = useCallback(async () => {
        if (!isAuthenticated) return
        try {
            const res = await authenticatedFetch("/api/admin/users")
            const data = await res.json()
            if (data.success) {
                setUsers(data.users)
            }
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setLoading(false)
        }
    }, [isAuthenticated, authenticatedFetch])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")
        setFormLoading(true)

        const url = editingUserId ? `/api/admin/users/${editingUserId}` : "/api/admin/users"
        const method = editingUserId ? "PUT" : "POST"

        try {
            const res = await authenticatedFetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formName,
                    email: formEmail,
                    password: formPassword || undefined,
                    role: formRole,
                }),
            })

            const data = await res.json()
            if (data.success) {
                toast.success(data.message)
                setShowForm(false)
                resetForm()
                fetchUsers()
            } else {
                setFormError(data.message)
            }
        } catch {
            setFormError(`Failed to ${editingUserId ? "update" : "create"} user. Please try again.`)
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteUser = async (id: string) => {
        try {
            const res = await authenticatedFetch(`/api/admin/users/${id}`, {
                method: "DELETE"
            })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message)
                fetchUsers()
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error("Failed to delete user.")
        } finally {
            setDeleteUserId(null)
        }
    }

    const resetForm = () => {
        setEditingUserId(null)
        setFormName("")
        setFormEmail("")
        setFormPassword("")
        setFormRole("admin")
        setFormError("")
        setShowPassword(false)
    }

    if (!isAuthenticated || user?.role !== "admin") return null

    const admins = users.filter((u) => u.role === "admin")
    const regularUsers = users.filter((u) => u.role === "user")

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage admin and user accounts
                    </p>
                </div>
                <Button className="gap-2" onClick={() => { setShowForm(true); resetForm() }}>
                    <Plus className="h-4 w-4" />
                    Create Account
                </Button>
            </div>

            {/* Create / Edit User Form */}
            {showForm && (
                <Card className="mb-8 border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="font-serif text-lg">{editingUserId ? "Edit Account" : "Create New Account"}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveUser} className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={formEmail}
                                        onChange={(e) => setFormEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={formLoading}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder={editingUserId ? "Leave blank to keep unchanged" : "Min. 6 characters"}
                                        value={formPassword}
                                        onChange={(e) => setFormPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required={!editingUserId}
                                        minLength={6}
                                        disabled={formLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Role</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={formRole === "admin" ? "default" : "outline"}
                                        size="sm"
                                        className="flex-1 gap-2"
                                        onClick={() => setFormRole("admin")}
                                    >
                                        <Shield className="h-4 w-4" />
                                        Admin
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={formRole === "user" ? "default" : "outline"}
                                        size="sm"
                                        className="flex-1 gap-2"
                                        onClick={() => setFormRole("user")}
                                    >
                                        <User className="h-4 w-4" />
                                        User
                                    </Button>
                                </div>
                            </div>
                            {formError && (
                                <p className="text-sm text-destructive sm:col-span-2">{formError}</p>
                            )}
                            <div className="sm:col-span-2">
                                <Button type="submit" className="w-full gap-2" disabled={formLoading}>
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {editingUserId ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            {editingUserId ? "Update" : "Create"} {formRole === "admin" ? "Admin" : "User"} Account
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <Card className="border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{users.length}</p>
                            <p className="text-sm text-muted-foreground">Total Accounts</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <Shield className="h-6 w-6 text-amber-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{admins.length}</p>
                            <p className="text-sm text-muted-foreground">Admins</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
                            <User className="h-6 w-6 text-sky-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{regularUsers.length}</p>
                            <p className="text-sm text-muted-foreground">Users</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Administrators Table */}
            <div className="mb-8">
                <div className="mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <h2 className="font-serif text-xl font-semibold text-foreground">Administrators</h2>
                    <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">System Management</Badge>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Card className="border-border overflow-hidden ring-1 ring-amber-100">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-amber-50/50">
                                            <th className="px-6 py-4 text-left font-medium text-muted-foreground">Admin Name</th>
                                            <th className="px-6 py-4 text-left font-medium text-muted-foreground">Email Address</th>
                                            <th className="px-6 py-4 text-left font-medium text-muted-foreground">Created</th>
                                            <th className="px-6 py-4 text-right font-medium text-muted-foreground">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map((u) => (
                                            <tr key={u.id} className="border-b border-border last:border-0 hover:bg-amber-50/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-foreground">{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs uppercase tracking-tighter">
                                                    {new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-9 w-9 text-muted-foreground hover:text-amber-600 hover:bg-amber-100/50"
                                                            title="Edit Admin"
                                                            onClick={() => {
                                                                setEditingUserId(u.id)
                                                                setFormName(u.name)
                                                                setFormEmail(u.email)
                                                                setFormRole(u.role as "admin" | "user")
                                                                setFormPassword("")
                                                                setShowForm(true)
                                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {u.id !== user?.id && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-red-50"
                                                                title="Delete Admin"
                                                                onClick={() => setDeleteUserId(u.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {admins.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                    No administrators found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Platform Users Table */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-sky-600" />
                    <h2 className="font-serif text-xl font-semibold text-foreground">Platform Users</h2>
                    <Badge variant="outline" className="ml-2 bg-sky-50 text-sky-700 border-sky-200">Customer Accounts</Badge>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Card className="border-border">
                        <CardHeader className="bg-muted/30 py-4">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Shield className="h-3 w-3" />
                                Protected Status: Platform users cannot be edited or deleted by staff administrators.
                            </p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/20">
                                            <th className="px-6 py-3 text-left font-medium text-muted-foreground">User Name</th>
                                            <th className="px-6 py-4 text-left font-medium text-muted-foreground">Email Address</th>
                                            <th className="px-6 py-3 text-left font-medium text-muted-foreground">Joined At</th>
                                            <th className="px-6 py-3 text-right font-medium text-muted-foreground italic opacity-50">Actions Restricted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {regularUsers.map((u) => (
                                            <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4 font-medium text-foreground">{u.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold text-muted-foreground/60 border-none px-2 py-0.5">
                                                        Read Only
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {regularUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                    No platform users found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete User Confirmation */}
            <AlertDialog open={!!deleteUserId} onOpenChange={(open) => { if (!open) setDeleteUserId(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
