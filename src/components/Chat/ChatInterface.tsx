import React, { useState, useEffect, useRef } from 'react';
import { Send, Video, Phone, Users } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  courseId?: string;
  receiverId?: string;
  title: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ courseId, receiverId, title }) => {
  const { user } = useAuthStore();
  const { messages, fetchMessages, sendMessage, subscribeToMessages } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMessages(courseId, receiverId);
      const unsubscribe = subscribeToMessages(courseId, receiverId);
      return unsubscribe;
    }
  }, [user, courseId, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await sendMessage(user.id, user.full_name, newMessage.trim(), courseId, receiverId);
    setNewMessage('');
  };

  const startVideoCall = () => {
    // In a real implementation, this would integrate with WebRTC
    alert('Video call feature would be implemented here with WebRTC');
  };

  const startAudioCall = () => {
    // In a real implementation, this would integrate with WebRTC
    alert('Audio call feature would be implemented here with WebRTC');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={startAudioCall}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            onClick={startVideoCall}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <Video className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === user?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.sender_id !== user?.id && (
                <div className="text-xs font-medium mb-1 opacity-70">
                  {message.sender_name}
                </div>
              )}
              <div>{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {format(new Date(message.created_at), 'HH:mm')}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;