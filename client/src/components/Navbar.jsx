import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, Divider, Box, Container } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../features/auth/authApi';
import { clearAuth } from '../features/auth/authSlice';
import NotificationBell from './NotificationBell';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Button
      component={RouterLink}
      to={to}
      sx={{
        color: isActive ? 'primary.main' : 'text.secondary',
        fontWeight: isActive ? 700 : 600,
        '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' },
      }}
    >
      {children}
    </Button>
  );
}

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(clearAuth());
      navigate('/login');
    }
  };

  const closeMenu = () => setAnchorEl(null);

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ top: 0, zIndex: (t) => t.zIndex.appBar }}>
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ gap: 1, px: { xs: 2, md: 0 } }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              mr: 2,
            }}
          >
            SkillBridge
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
            <NavLink to="/gigs">Gigs</NavLink>
            <NavLink to="/jobs">Jobs</NavLink>
          </Box>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button component={RouterLink} to="/gigs/new" variant="outlined" size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                Post a Gig
              </Button>
              <Button component={RouterLink} to="/jobs/new" variant="outlined" size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                Post a Job
              </Button>
              <NotificationBell />
              <Avatar
                sx={{
                  cursor: 'pointer',
                  width: 34,
                  height: 34,
                  bgcolor: 'primary.main',
                  fontSize: 15,
                  fontWeight: 700,
                }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={closeMenu}
                slotProps={{ paper: { sx: { mt: 1, minWidth: 180, borderRadius: 2 } } }}
              >
                <MenuItem component={RouterLink} to="/gigs/new" onClick={closeMenu} sx={{ display: { md: 'none' } }}>
                  Post a Gig
                </MenuItem>
                <MenuItem component={RouterLink} to="/jobs/new" onClick={closeMenu} sx={{ display: { md: 'none' } }}>
                  Post a Job
                </MenuItem>
                <MenuItem component={RouterLink} to="/contracts" onClick={closeMenu}>My Contracts</MenuItem>
                <MenuItem component={RouterLink} to="/wallet" onClick={closeMenu}>Wallet</MenuItem>
                {user.roles?.includes('admin') && (
                  <MenuItem component={RouterLink} to="/admin" onClick={closeMenu}>Admin</MenuItem>
                )}
                <Divider />
                <MenuItem onClick={() => { closeMenu(); handleLogout(); }} sx={{ color: 'error.main' }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={RouterLink} to="/login" color="inherit">Log In</Button>
              <Button component={RouterLink} to="/register" variant="contained">Register</Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
