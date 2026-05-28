import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import styles from './Index.module.scss';
import { Send, MessageSquare, ShieldAlert } from 'lucide-react';

export const Chat = () => {
  const { currentUser } = useAuth();
  
  // Connect to the shared general emergency/medical chat channel
  const [chatId] = useState("emergency_general");

  const { messages, sendMessage, loading } = useChat(chatId);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    try {
      await sendMessage(currentUser.name, currentUser.uid, inputText);
      setInputText('');
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
        <div className={styles.header}>
          <MessageSquare className={styles.headerIcon} />
          <div>
            <h3>Canal de Soporte Médico y Emergencias</h3>
            <p>
              Conectado como paciente. Envía tu consulta y el personal médico podrá responderla.
            </p>
          </div>
        </div>

        <div className={styles.chatArea}>
          {loading ? (
            <div className={styles.loading}>Cargando mensajes en tiempo real...</div>
          ) : messages.length === 0 ? (
            <div className={styles.noMessages}>
              <ShieldAlert size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p>No hay mensajes en este chat. ¡Envía un mensaje para comenzar la conversación!</p>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.uid;
                return (
                  <div key={msg.id} className={`${styles.messageWrapper} ${isMe ? styles.me : styles.other}`}>
                    <div className={styles.bubble}>
                      <div className={styles.sender}>{msg.senderName}</div>
                      <div className={styles.text}>{msg.text}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className={styles.inputArea}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Escribe tu mensaje aquí..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} disabled={loading}>
            <Send size={16} />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
