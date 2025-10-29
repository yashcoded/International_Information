import React, { useState, useEffect } from 'react';
import styles from './ConversationSidebar.module.css';

interface ConversationSession {
  id: string;
  timestamp: number;
  title: string;
  messageCount: number;
  preview: string;
  messages: Array<{role: 'user' | 'assistant', content: string}>;
}

interface ConversationSidebarProps {
  currentConversation: Array<{role: 'user' | 'assistant', content: string}>;
  onLoadConversation: (messages: Array<{role: 'user' | 'assistant', content: string}>, conversationId: string) => void;
  onNewConversation: () => void;
}

export default function ConversationSidebar({ 
  currentConversation, 
  onLoadConversation,
  onNewConversation 
}: ConversationSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load conversation sessions from localStorage
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-save current conversation when it changes
  useEffect(() => {
    if (currentConversation.length > 0) {
      saveCurrentSession();
    }
  }, [currentConversation]);

  const loadSessions = () => {
    try {
      const savedSessions = localStorage.getItem('conversationSessions');
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      }
    } catch (error) {
      console.error('Error loading conversation sessions:', error);
    }
  };

  const saveCurrentSession = () => {
    try {
      const currentSessionId = localStorage.getItem('currentSessionId');
      const sessions = JSON.parse(localStorage.getItem('conversationSessions') || '[]');
      
      // Generate title from first user message
      const firstUserMessage = currentConversation.find(msg => msg.role === 'user');
      const title = firstUserMessage 
        ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : 'New Conversation';
      
      const preview = firstUserMessage 
        ? firstUserMessage.content.substring(0, 100) + (firstUserMessage.content.length > 100 ? '...' : '')
        : '';

      const sessionId = currentSessionId || `session_${Date.now()}`;
      
      // Find existing session or create new one
      const existingIndex = sessions.findIndex((s: ConversationSession) => s.id === sessionId);
      
      const session: ConversationSession = {
        id: sessionId,
        timestamp: Date.now(),
        title,
        messageCount: currentConversation.length,
        preview,
        messages: currentConversation
      };

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session); // Add to beginning
      }

      // Keep only last 20 sessions
      const limitedSessions = sessions.slice(0, 20);
      
      localStorage.setItem('conversationSessions', JSON.stringify(limitedSessions));
      localStorage.setItem('currentSessionId', sessionId);
      setActiveSessionId(sessionId);
      setSessions(limitedSessions);
    } catch (error) {
      console.error('Error saving conversation session:', error);
    }
  };

  const handleLoadSession = (session: ConversationSession) => {
    setActiveSessionId(session.id);
    localStorage.setItem('currentSessionId', session.id);
    onLoadConversation(session.messages, session.id);
    setIsOpen(false); // Close sidebar after loading
  };

  const handleNewConversation = () => {
    const newSessionId = `session_${Date.now()}`;
    setActiveSessionId(newSessionId);
    localStorage.setItem('currentSessionId', newSessionId);
    onNewConversation();
    setIsOpen(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the session
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('conversationSessions', JSON.stringify(updatedSessions));
    
    // If deleting active session, start new conversation
    if (sessionId === activeSessionId) {
      handleNewConversation();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`${styles.toggleButton} ${isOpen ? styles.toggleButtonOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close conversation history' : 'View conversation history'}
      >
        {isOpen ? (
          <span className={styles.buttonIcon}>✕</span>
        ) : (
          <div className={styles.buttonContent}>
            <span className={styles.buttonIcon}>💬</span>
            <span className={styles.buttonLabel}>History</span>
          </div>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.sidebarTitle}>💬 Conversation History</h2>
            <p className={styles.sidebarSubtitle}>{sessions.length} saved conversations</p>
          </div>
          <button 
            className={styles.newConversationBtn}
            onClick={handleNewConversation}
            title="Start new conversation"
          >
            ➕ New
          </button>
        </div>

        <div className={styles.sessionList}>
          {sessions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <p className={styles.emptyText}>No conversations yet</p>
              <p className={styles.emptySubtext}>Start a new conversation to see it here</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`${styles.sessionCard} ${session.id === activeSessionId ? styles.sessionCardActive : ''}`}
                onClick={() => handleLoadSession(session)}
              >
                <div className={styles.sessionHeader}>
                  <div className={styles.sessionTitle}>{session.title}</div>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    title="Delete conversation"
                  >
                    🗑️
                  </button>
                </div>
                <div className={styles.sessionPreview}>{session.preview}</div>
                <div className={styles.sessionFooter}>
                  <span className={styles.sessionMeta}>
                    {session.messageCount} messages
                  </span>
                  <span className={styles.sessionTime}>
                    {formatTimestamp(session.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

