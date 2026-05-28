import { useState, useEffect } from 'react';
import { dbService } from '../firebase';

export const useChat = (chatId = "emergency_general") => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = dbService.subscribeToCollection(
      "chat",
      (data) => {
        const filtered = data.filter(m => m.chatId === chatId);
        const sorted = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(sorted);
        setLoading(false);
      },
      (error) => {
        console.error("Error en la suscripción de chat:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [chatId]);

  const sendMessage = async (senderName, senderId, text) => {
    if (!text.trim()) return;
    await dbService.addDocument("chat", {
      chatId,
      senderName,
      senderId,
      text
    });
  };

  return {
    messages,
    sendMessage,
    loading
  };
};
