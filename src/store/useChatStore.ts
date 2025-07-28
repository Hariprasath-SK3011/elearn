import { create } from 'zustand';
import { supabase, type Message } from '../lib/supabase';

interface ChatState {
  messages: Message[];
  loading: boolean;
  fetchMessages: (courseId?: string, receiverId?: string) => Promise<void>;
  sendMessage: (senderId: string, senderName: string, content: string, courseId?: string, receiverId?: string) => Promise<void>;
  subscribeToMessages: (courseId?: string, receiverId?: string) => () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,

  fetchMessages: async (courseId?: string, receiverId?: string) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (courseId) {
        query = query.eq('course_id', courseId);
      } else if (receiverId) {
        query = query.eq('receiver_id', receiverId);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ messages: data || [] });
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (senderId: string, senderName: string, content: string, courseId?: string, receiverId?: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: senderId,
          sender_name: senderName,
          content,
          course_id: courseId,
          receiver_id: receiverId,
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },

  subscribeToMessages: (courseId?: string, receiverId?: string) => {
    let channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: courseId ? `course_id=eq.${courseId}` : receiverId ? `receiver_id=eq.${receiverId}` : undefined,
      }, () => {
        get().fetchMessages(courseId, receiverId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));