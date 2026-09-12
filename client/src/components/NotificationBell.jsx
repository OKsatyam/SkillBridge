import { useEffect, useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  notificationsApi,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from '../features/notifications/notificationsApi';
import { getSocket } from '../lib/socket';

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { data } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => {
      dispatch(notificationsApi.util.invalidateTags(['Notification']));
    };
    socket.on('notify:new', handler);
    return () => socket.off('notify:new', handler);
  }, [dispatch]);

  const notifications = data?.data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = async (n) => {
    if (!n.read) await markRead(n._id);
    setAnchorEl(null);
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} slotProps={{ paper: { sx: { width: 320 } } }}>
        {notifications.length === 0 && <MenuItem disabled>No notifications</MenuItem>}
        {notifications.slice(0, 10).map((n) => (
          <MenuItem key={n._id} onClick={() => handleClick(n)} sx={{ opacity: n.read ? 0.6 : 1, whiteSpace: 'normal' }}>
            <Box>
              <Typography variant="body2">{n.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(n.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
