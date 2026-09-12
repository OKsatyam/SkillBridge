import { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Alert,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress,
} from '@mui/material';
import { useGetWalletQuery, useDepositFundsMutation, useWithdrawFundsMutation } from '../features/wallet/walletApi';

const TXN_LABEL = {
  deposit: 'Deposit',
  escrow_hold: 'Escrow Hold',
  escrow_release: 'Escrow Release',
  refund: 'Refund',
  withdrawal: 'Withdrawal',
};

export default function WalletPage() {
  const { data, isLoading, isError } = useGetWalletQuery();
  const [deposit, { isLoading: depositing, error: depositError }] = useDepositFundsMutation();
  const [withdraw, { isLoading: withdrawing, error: withdrawError }] = useWithdrawFundsMutation();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }
  if (isError) {
    return <Typography color="error" sx={{ p: 4 }}>Failed to load wallet.</Typography>;
  }

  const wallet = data.data.wallet;
  const transactions = data.data.transactions;

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await deposit(Number(depositAmount)).unwrap();
      setDepositAmount('');
    } catch {
      // handled by depositError
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await withdraw(Number(withdrawAmount)).unwrap();
      setWithdrawAmount('');
    } catch {
      // handled by withdrawError
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" mb={3}>Wallet</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: 'rgba(5,150,105,0.06)', borderColor: 'rgba(5,150,105,0.25)' }}>
            <CardContent>
              <Typography color="text.secondary">Available</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">${wallet.available.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: 'rgba(217,119,6,0.06)', borderColor: 'rgba(217,119,6,0.25)' }}>
            <CardContent>
              <Typography color="text.secondary">In Escrow</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">${wallet.escrow.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Add Funds (demo)</Typography>
            {depositError && <Alert severity="error" sx={{ mb: 1 }}>{depositError.data?.message || 'Failed'}</Alert>}
            <Box component="form" onSubmit={handleDeposit} sx={{ display: 'flex', gap: 1 }}>
              <TextField label="Amount ($)" type="number" size="small" value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)} required />
              <Button type="submit" variant="contained" disabled={depositing}>Add</Button>
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Withdraw</Typography>
            {withdrawError && <Alert severity="error" sx={{ mb: 1 }}>{withdrawError.data?.message || 'Failed'}</Alert>}
            <Box component="form" onSubmit={handleWithdraw} sx={{ display: 'flex', gap: 1 }}>
              <TextField label="Amount ($)" type="number" size="small" value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)} required />
              <Button type="submit" variant="outlined" disabled={withdrawing}>Withdraw</Button>
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Transaction Ledger</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="right">Balance After</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t._id}>
              <TableCell><Chip size="small" label={TXN_LABEL[t.type] || t.type} /></TableCell>
              <TableCell align="right">${t.amount.toFixed(2)}</TableCell>
              <TableCell align="right">${t.balanceAfter.toFixed(2)}</TableCell>
              <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow><TableCell colSpan={4}>No transactions yet.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
