import { useEffect, useRef, useState } from 'react';
import { Box, TextField, IconButton, Typography, Paper, Avatar, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useSelector } from 'react-redux';
import { useGetMessagesQuery } from '../features/conversations/conversationsApi';
import { getSocket } from '../lib/socket';

export default function ChatBox({ conversationId }) {
  const user = useSelector((state) => state.auth.user);
  const { data, isLoading } = useGetMessagesQuery(conversationId, { skip: !conversationId });
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (data?.data?.messages) setMessages(data.data.messages);
  }, [data]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;

    socket.emit('conversation:join', conversationId);
    socket.emit('message:read', { conversationId });

    const onNew = (msg) => {
      if (msg.conversation === conversationId) setMessages((prev) => [...prev, msg]);
    };
    const onTypingStart = ({ userId }) => {
      if (userId !== user?._id) setTypingUser(userId);
    };
    const onTypingStop = () => setTypingUser(null);

    socket.on('message:new', onNew);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.off('message:new', onNew);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [conversationId, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const socket = getSocket();
    socket?.emit('message:send', { conversationId, text });
    setText('');
    socket?.emit('typing:stop', { conversationId });
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    socket?.emit('typing:start', { conversationId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket?.emit('typing:stop', { conversationId }), 1500);
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>;
  }

  return (
    <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: 400 }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((m) => (
          <Box
            key={m._id}
            sx={{ display: 'flex', gap: 1, mb: 1, flexDirection: m.sender._id === user?._id ? 'row-reverse' : 'row' }}
          >
            <Avatar sx={{ width: 24, height: 24 }}>{m.sender.name?.[0]?.toUpperCase()}</Avatar>
            <Box
              sx={{
                bgcolor: m.sender._id === user?._id ? 'primary.main' : 'grey.200',
                color: m.sender._id === user?._id ? 'white' : 'text.primary',
                px: 1.5, py: 0.5, borderRadius: 2, maxWidth: '70%',
              }}
            >
              <Typography variant="body2">{m.text}</Typography>
            </Box>
          </Box>
        ))}
        {typingUser && <Typography variant="caption" color="text.secondary">Typing...</Typography>}
        <div ref={bottomRef} />
      </Box>
      <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1, p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <TextField size="small" fullWidth placeholder="Type a message..." value={text} onChange={handleTyping} />
        <IconButton type="submit" color="primary"><SendIcon /></IconButton>
      </Box>
    </Paper>
  );
}
