import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Chip, CircularProgress, TextField, Card, CardContent, Grid, Alert,
} from '@mui/material';
import {
  useGetUsersQuery, useBanUserMutation, useUnbanUserMutation,
  useCreateCategoryMutation, useDeleteCategoryMutation, useGetAnalyticsQuery,
} from '../features/admin/adminApi';
import { useGetCategoriesQuery } from '../features/categories/categoriesApi';
import { useGetOpenDisputesQuery, useResolveDisputeMutation } from '../features/disputes/disputesApi';

function UsersTab() {
  const { data, isLoading } = useGetUsersQuery();
  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();

  if (isLoading) return <CircularProgress size={24} />;
  const users = data?.data?.users || [];

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Roles</TableCell>
          <TableCell>Status</TableCell><TableCell>Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u._id}>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.roles?.join(', ')}</TableCell>
            <TableCell>
              <Chip size="small" label={u.isBanned ? 'Banned' : 'Active'} color={u.isBanned ? 'error' : 'success'} />
            </TableCell>
            <TableCell>
              {u.isBanned ? (
                <Button size="small" onClick={() => unbanUser(u._id)}>Unban</Button>
              ) : (
                <Button size="small" color="error" onClick={() => banUser(u._id)}>Ban</Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CategoriesTab() {
  const { data, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [name, setName] = useState('');

  if (isLoading) return <CircularProgress size={24} />;
  const categories = data?.data?.categories || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createCategory({ name });
    setName('');
  };

  return (
    <Box>
      <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField size="small" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" variant="contained" disabled={creating}>Add</Button>
      </Box>
      <Table size="small">
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Slug</TableCell><TableCell></TableCell></TableRow></TableHead>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.slug}</TableCell>
              <TableCell>
                <Button size="small" color="error" onClick={() => deleteCategory(c._id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function DisputesTab() {
  const { data, isLoading } = useGetOpenDisputesQuery();
  const [resolveDispute, { isLoading: resolving, error }] = useResolveDisputeMutation();

  if (isLoading) return <CircularProgress size={24} />;
  const disputes = data?.data?.disputes || [];

  if (disputes.length === 0) return <Typography color="text.secondary">No open disputes.</Typography>;

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.data?.message}</Alert>}
      {disputes.map((d) => (
        <Card key={d._id} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography fontWeight={600}>Contract: {d.contract?._id}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Raised by {d.raisedBy?.name} ({d.raisedBy?.email})
            </Typography>
            <Typography sx={{ mb: 2 }}>{d.reason}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small" variant="contained" disabled={resolving}
                onClick={() => resolveDispute({ disputeId: d._id, outcome: 'refund_client', resolution: 'Refunded to client' })}
              >
                Refund Client
              </Button>
              <Button
                size="small" variant="contained" color="success" disabled={resolving}
                onClick={() => resolveDispute({ disputeId: d._id, outcome: 'release_freelancer', resolution: 'Released to freelancer' })}
              >
                Release to Freelancer
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

function AnalyticsTab() {
  const { data, isLoading } = useGetAnalyticsQuery();
  if (isLoading) return <CircularProgress size={24} />;
  const a = data?.data?.analytics;
  if (!a) return null;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined"><CardContent>
          <Typography color="text.secondary">Total Users</Typography>
          <Typography variant="h4">{a.userCount}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined"><CardContent>
          <Typography color="text.secondary">Active Gigs</Typography>
          <Typography variant="h4">{a.activeGigCount}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined"><CardContent>
          <Typography color="text.secondary">Open Jobs</Typography>
          <Typography variant="h4">{a.openJobCount}</Typography>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card variant="outlined"><CardContent>
          <Typography color="text.secondary" gutterBottom>Contracts by Status</Typography>
          {a.contractsByStatus.map((c) => (
            <Typography key={c._id} variant="body2">{c._id}: {c.count}</Typography>
          ))}
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card variant="outlined"><CardContent>
          <Typography color="text.secondary" gutterBottom>Transaction Volume</Typography>
          {a.transactionVolumeByType.map((t) => (
            <Typography key={t._id} variant="body2">{t._id}: ${t.total}</Typography>
          ))}
        </CardContent></Card>
      </Grid>
    </Grid>
  );
}

const TABS = ['Users', 'Categories', 'Disputes', 'Analytics'];

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const user = useSelector((state) => state.auth.user);

  if (!user?.roles?.includes('admin')) {
    return <Alert severity="error" sx={{ m: 4 }}>Forbidden: admin access only.</Alert>;
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Admin</Typography>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => <Tab key={t} label={t} />)}
      </Tabs>
      {tab === 0 && <UsersTab />}
      {tab === 1 && <CategoriesTab />}
      {tab === 2 && <DisputesTab />}
      {tab === 3 && <AnalyticsTab />}
    </Box>
  );
}
