import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UserFormDialog } from './UserFormDialog'
import { UserRowActions } from './UserRowActions'
import { formatDate } from '@/lib/utils'

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 animate-reveal">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">User Management</h1>
          <p className="text-[var(--color-slate-custom)] mt-1">Manage platform access, roles, and departments.</p>
        </div>
        <UserFormDialog />
      </div>

      <Card className="shadow-sm border-line">
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>A list of all users authorized to access the CRM.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-w-0 w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-[var(--color-slate-custom)]">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="text-xs font-semibold text-amber-800">
                        {user.designation || '—'}
                      </TableCell>
                      <TableCell className="text-xs">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[var(--color-paper)] text-[var(--color-ink)] border-[var(--color-line)] font-semibold text-xs">
                          {user.role === 'SUPER_ADMIN' ? 'Super Admin' :
                           user.role === 'SALES_MANAGER' ? 'Account Sales Manager' :
                           user.role === 'SALES' ? 'Executive Manager (Sales)' :
                           user.role === 'OM_MANAGER' ? 'O & M Manager' :
                           user.role === 'INSTALLATION' ? 'Installer' :
                           user.role.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={user.isActive 
                            ? "bg-[#002868] text-white border-[#002868]" 
                            : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {user.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <UserRowActions user={{
                          id: user.id,
                          fullName: user.fullName,
                          email: user.email,
                          role: user.role,
                          designation: user.designation || '',
                          isActive: user.isActive
                        }} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
