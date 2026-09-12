import { Box, Typography, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetMyContractsQuery } from '../features/contracts/contractsApi';

const statusColor = {
  active: 'primary',
  completed: 'success',
  cancelled: 'default',
  disputed: 'error',
};

export default function ContractsListPage() {
  const user = useSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetMyContractsQuery();
  const contracts = data?.data?.contracts || [];

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" mb={3}>My Contracts</Typography>

      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>}
      {isError && <Typography color="error">Failed to load contracts.</Typography>}
      {!isLoading && !isError && contracts.length === 0 && (
        <Typography color="text.secondary">No contracts yet — buy a gig or hire a freelancer to get started.</Typography>
      )}

      <List>
        {contracts.map((c) => {
          const otherParty = c.client._id === user?._id ? c.freelancer : c.client;
          const title = c.gig?.title || c.job?.title || 'Contract';
          return (
            <ListItem key={c._id} divider button component={RouterLink} to={`/contracts/${c._id}`}
              secondaryAction={<Chip label={c.status} color={statusColor[c.status] || 'default'} size="small" />}>
              <ListItemText
                primary={title}
                secondary={`${c.source === 'gig' ? 'Gig order' : 'Job contract'} with ${otherParty?.name} · $${c.totalAmount}`}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
