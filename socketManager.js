export const socketManager = (io) => {
    io.on('connection', (socket) => {
      console.log('✅ Socket connected:', socket.id);
  
      // Join conversation room
      socket.on('joinRoom', (conversationId) => {
        socket.join(conversationId);
        console.log(`📥 Socket ${socket.id} joined room: ${conversationId}`);
      });
  
      // Leave room (optional)
      socket.on('leaveRoom', (conversationId) => {
        socket.leave(conversationId);
        console.log(`📤 Socket ${socket.id} left room: ${conversationId}`);
      });
  
      // Disconnect
      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected:', socket.id);
      });
    });
  };
  