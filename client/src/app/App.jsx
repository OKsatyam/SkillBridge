import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import Navbar from '../components/Navbar';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRefreshMutation, useLazyGetMeQuery } from '../features/auth/authApi';
import { setCredentials, setAccessToken, clearAuth } from '../features/auth/authSlice';
import LandingPage from '../pages/LandingPage';
import GigsListPage from '../pages/GigsListPage';
import GigDetailPage from '../pages/GigDetailPage';
import CreateGigPage from '../pages/CreateGigPage';
import JobsListPage from '../pages/JobsListPage';
import JobDetailPage from '../pages/JobDetailPage';
import CreateJobPage from '../pages/CreateJobPage';
import ContractsListPage from '../pages/ContractsListPage';
import ContractDetailPage from '../pages/ContractDetailPage';
import WalletPage from '../pages/WalletPage';
import AdminPage from '../pages/AdminPage';
import './App.css';

function App() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const dispatch = useDispatch();
  const [refresh] = useRefreshMutation();
  const [triggerGetMe] = useLazyGetMeQuery();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const pageSx = { minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' };

  // Keep exactly one live socket connection in sync with login state — connect once on login,
  // disconnect on logout. Token rotations on silent refresh don't need a reconnect: the socket
  // session stays valid regardless of REST access-token expiry.
  useEffect(() => {
    if (accessToken && !getSocket()) {
      connectSocket(accessToken);
    } else if (!accessToken) {
      disconnectSocket();
    }
  }, [accessToken]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const refreshResult = await refresh().unwrap();
        dispatch(setAccessToken(refreshResult.data.accessToken));
        const meResult = await triggerGetMe().unwrap();
        dispatch(setCredentials({ user: meResult.data.user, accessToken: refreshResult.data.accessToken }));
      } catch {
        dispatch(clearAuth());
      } finally {
        setCheckingAuth(false);
      }
    };
    bootstrap();
  }, []);

  if (checkingAuth) {
    return (
      <Box sx={{ ...pageSx, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={pageSx}>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/gigs" element={<GigsListPage />} />
        <Route path="/gigs/:id" element={<GigDetailPage />} />
        <Route path="/jobs" element={<JobsListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/gigs/new" element={<CreateGigPage />} />
          <Route path="/jobs/new" element={<CreateJobPage />} />
          <Route path="/contracts" element={<ContractsListPage />} />
          <Route path="/contracts/:id" element={<ContractDetailPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
