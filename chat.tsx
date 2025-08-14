# Chat-Interface
import React, { useState, useEffect, useRef } from 'react';

// Types
interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ChatApp: React.FC = () => {
  // State
  const [currentUser] = useState<User>({ 
    id: 'alice', 
    name: 'Alice Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    status: 'online'
  });
  
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(1);

  const users: Record<string, User> = {
    bob: { 
      id: 'bob', 
      name: 'Bob Smith', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      status: 'online'
    },
    charlie: { 
      id: 'charlie', 
      name: 'Charlie Brown', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
      status: 'away'
    },
    diana: { 
      id: 'diana', 
      name: 'Diana Prince', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
      status: 'offline'
    }
  };

  // Initialize app
  useEffect(() => {
    loadDemoMessages();
    updateNotificationStatus();
    
    const welcomeTimer = setTimeout(() => {
      showNotification(
        "🚀 Welcome to Chat App!",
        "Select a user from the dropdown to start chatting. Try the demo controls below!",
        "info"
      );
    }, 1000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadDemoMessages = () => {
    const demoMessages: Message[] = [
      { 
        id: '1', 
        senderId: 'alice', 
        senderName: 'Alice Johnson', 
        content: 'Hey! How are you doing? 👋', 
        timestamp: Date.now() - 300000 
      },
      { 
        id: '2', 
        senderId: 'bob', 
        senderName: 'Bob Smith', 
        content: 'Hi Alice! I\'m doing great, thanks for asking. How about you?', 
        timestamp: Date.now() - 240000 
      },
      { 
        id: '3', 
        senderId: 'alice', 
        senderName: 'Alice Johnson', 
        content: 'I\'m good too! Working on this new chat app project with push notifications 🚀', 
        timestamp: Date.now() - 180000 
      },
      { 
        id: '4', 
        senderId: 'bob', 
        senderName: 'Bob Smith', 
        content: 'That sounds exciting! Can you show me how the notifications work?', 
        timestamp: Date.now() - 120000 
      }
    ];
    
    setMessages(demoMessages);
    messageIdCounter.current = 5;
  };

  const selectUser = (userId: string) => {
    setSelectedRecipient(users[userId]);
    setShowUserDropdown(false);
  };

  const sendMessage = async () => {
    const content = messageInput.trim();
    if (!content || !selectedRecipient || isLoading) return;

    setIsLoading(true);
    
    const message: Message = {
      id: messageIdCounter.current.toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: content,
      timestamp: Date.now()
    };

    messageIdCounter.current++;
    setMessages(prev => [...prev, message]);
    setMessageInput('');

    // Show success notification
    setTimeout(() => {
      showNotification(
        'Message Sent',
        `Message delivered to ${selectedRecipient.name}`,
        'success'
      );
      setIsLoading(false);
    }, 500);

    // Simulate auto-reply
    setTimeout(() => {
      simulateIncomingMessage(true);
    }, 2000 + Math.random() * 2000);
  };

  const simulateIncomingMessage = (isAutoReply = false) => {
    if (!selectedRecipient) return;

    setIsTyping(true);
    
    const responses = [
      "That's awesome! The Ant Design components look great 👍",
      "This chat interface is really smooth and professional!",
      "I love the real-time messaging feature 💬",
      "The push notifications work perfectly!",
      "Great job on the responsive design 📱",
      "This Ant Design integration looks amazing! 🎨",
      "The typing indicator is a nice touch ⌨️",
      "The UI is so clean and modern! ✨"
    ];

    setTimeout(() => {
      setIsTyping(false);
      
      const message: Message = {
        id: messageIdCounter.current.toString(),
        senderId: selectedRecipient.id,
        senderName: selectedRecipient.name,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now()
      };

      messageIdCounter.current++;
      setMessages(prev => [...prev, message]);

      // Show push notification
      showNotification(
        `New message from ${message.senderName}`,
        message.content,
        'info'
      );
    }, 1500);
  };

  const showNotification = (title: string, description: string, type: Notification['type'] = 'info') => {
    const notificationId = 'notification-' + Date.now();
    
    const notification: Notification = {
      id: notificationId,
      title,
      description,
      type
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    // Auto close after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, 4000);
  };

  const closeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearMessages = () => {
    setMessages([]);
    showNotification(
      'Messages Cleared',
      'All messages have been cleared',
      'info'
    );
  };

  const updateNotificationStatus = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        showNotification(
          "🎉 Notifications Enabled!",
          "You'll now receive push notifications for new messages.",
          "success"
        );
      }
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationStatusInfo = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { text: '❌ Not supported', className: 'bg-red-50 text-red-600 border-red-200', showButton: false };
    }
    
    switch (notificationPermission) {
      case 'granted':
        return { text: '✅ Enabled', className: 'bg-green-50 text-green-600 border-green-200', showButton: false };
      case 'denied':
        return { text: '❌ Blocked', className: 'bg-red-50 text-red-600 border-red-200', showButton: false };
      default:
        return { text: '⏳ Not requested', className: 'bg-yellow-50 text-yellow-600 border-yellow-200', showButton: true };
    }
  };

  const notificationStatus = getNotificationStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Notifications */}
      <div className="fixed top-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
        {notifications.map((notification) => {
          const iconMap = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: '💬'
          };
          
          const colorMap = {
            success: 'text-green-600',
            error: 'text-red-600',
            warning: 'text-yellow-600', 
            info: 'text-blue-600'
          };
          
          return (
            <div
              key={notification.id}
              className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4 animate-slide-in"
            >
              <div className="flex items-start gap-3">
                <span className={`text-base ${colorMap[notification.type]}`}>
                  {iconMap[notification.type]}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {notification.description}
                  </div>
                </div>
                <button
                  onClick={() => closeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <h1 className="text-xl font-semibold text-gray-900">Chat App</h1>
            </div>
            
            <div className="min-w-[280px]">
              <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500">
                  Logged in as <span className="font-medium">{currentUser.name}</span>
                </div>
                <div className="relative">
                  <div
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                  >
                    <span className="text-gray-700">
                      {selectedRecipient ? selectedRecipient.name : 'Select a user to chat with...'}
                    </span>
                    <span className="text-gray-400">▼</span>
                  </div>
                  
                  {showUserDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                      {Object.values(users).map((user) => {
                        const statusColors = {
                          online: 'bg-green-500',
                          away: 'bg-yellow-500',
                          offline: 'bg-gray-400'
                        };
                        
                        return (
                          <div
                            key={user.id}
                            className="p-3 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => selectUser(user.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full overflow-hidden">
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="flex-1">{user.name}</span>
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${statusColors[user.status]}`}></div>
                                <span className="text-xs text-gray-500">{user.status}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="h-96 overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-4">💬</div>
                <div className="text-gray-400">No messages yet. Start a conversation!</div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isCurrentUser = message.senderId === currentUser.id;
                  const user = users[message.senderId] || currentUser;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex mb-4 animate-message-in ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-xs md:max-w-md">
                        <div
                          className={`rounded-lg p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
                            isCurrentUser 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-full overflow-hidden">
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs font-medium text-gray-600">{message.senderName}</span>
                            </div>
                          )}
                          <div className={`mb-2 ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
                            {message.content}
                          </div>
                          <div className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping && selectedRecipient && (
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <div className="bg-gray-200 rounded-lg p-3 animate-pulse">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full overflow-hidden">
                            <img src={selectedRecipient.avatar} alt={selectedRecipient.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs text-gray-600 italic">{selectedRecipient.name} is typing...</span>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-gray-200 p-6">
            {!selectedRecipient ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-5xl mb-4">👥</div>
                <div className="text-gray-400">Please select a user to start chatting</div>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder={`Send a message to ${selectedRecipient.name}...`}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !messageInput.trim()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>📤</span>
                  )}
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notification Status */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base">🔔</span>
              <span className="font-medium">Push Notifications:</span>
              <span className={`px-3 py-1 rounded-full text-sm border ${notificationStatus.className}`}>
                {notificationStatus.text}
              </span>
            </div>
            {notificationStatus.showButton && (
              <button
                onClick={requestNotificationPermission}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-all"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>

        {/* Demo Controls */}
        <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
            🎮 Demo Controls
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => simulateIncomingMessage()}
                disabled={!selectedRecipient}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                <span>📱</span>
                Simulate Message
              </button>
              <button
                onClick={() => showNotification("🔔 Push Notification Demo", "This is how notifications appear when the app is in background!", "info")}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 flex items-center gap-2 transition-all"
              >
                <span>🔔</span>
                Test Notification
              </button>
              <button
                onClick={clearMessages}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 transition-all"
              >
                <span>🗑️</span>
                Clear Messages
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes message-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-message-in {
          animation: message-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatApp;
