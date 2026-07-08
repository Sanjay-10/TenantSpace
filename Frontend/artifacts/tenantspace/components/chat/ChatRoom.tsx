import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  FlatList,
  Platform,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../constants/theme';
import { markChatAsRead } from '../../lib/readReceipts';
import { useQueryClient } from '@tanstack/react-query';

export interface ChatParticipant {
  id: string;
  name: string;
  initials: string;
  avatar_url?: string;
  color?: string;
}

interface ChatRoomProps {
  propertyId: string;
  roomId?: string; // If undefined or null, it's a property-wide group chat
  currentUserId: string;
  participants: Record<string, ChatParticipant>;
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export function ChatRoom({ propertyId, roomId, currentUserId, participants, title, subtitle, onBack }: ChatRoomProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  // Fetch initial messages
  useEffect(() => {
    let isMounted = true;
    
    const fetchMessages = async () => {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (roomId) {
        query = query.eq('room_id', roomId);
      } else {
        query = query.is('room_id', null);
      }
      
      const { data, error } = await query;
      
      if (isMounted) {
        if (!error && data) {
          setMessages(data);
        }
        setLoading(false);
      }
    };
    
    fetchMessages();
    return () => { isMounted = false; };
  }, [propertyId, roomId]);

  // Subscribe to real-time new messages
  useEffect(() => {
    const channelName = roomId ? `chat-room-${roomId}` : `chat-prop-${propertyId}`;
    
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: roomId ? `room_id=eq.${roomId}` : `property_id=eq.${propertyId}`
      }, (payload) => {
        // If it's a property chat, we also need to ensure the incoming message has room_id IS NULL
        if (!roomId && payload.new.room_id !== null) return;
        
        setMessages(prev => {
          // Check if we already have it (optimistic update)
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, roomId]);

  // Mark chat as read locally when viewing
  useEffect(() => {
    const activeChatId = roomId || propertyId;
    if (activeChatId) {
      markChatAsRead(activeChatId);
    }
  }, [messages, roomId, propertyId]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);
    
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      property_id: propertyId,
      room_id: roomId || null,
      sender_id: currentUserId,
      text: textToSend,
      created_at: new Date().toISOString(),
      isOptimistic: true,
      profiles: { full_name: participants[currentUserId]?.name || 'Me' }
    };
    
    // Optimistic UI update for current chat screen
    setMessages(prev => [optimisticMessage, ...prev]);

    // Optimistic UI update for Landlord Hub (0ms latency on back press)
    queryClient.setQueriesData({ queryKey: ['landlordChatsHub'] }, (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        recentMessages: [optimisticMessage, ...(oldData.recentMessages || [])]
      };
    });

    // Optimistic UI update for Tenant Hub (0ms latency on back press)
    queryClient.setQueriesData({ queryKey: ['tenantRoomData'] }, (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        recentMsgs: [optimisticMessage, ...(oldData.recentMsgs || [])]
      };
    });

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          property_id: propertyId,
          room_id: roomId || null,
          sender_id: currentUserId,
          text: textToSend
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Prevent duplicates if Realtime listener received it before this promise resolved
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) {
          return prev.filter(m => m.id !== tempId);
        }
        return prev.map(m => m.id === tempId ? data : m);
      });
    } catch (err) {
      console.error('Error sending message:', err);
      // Revert optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInputText(textToSend); // put text back
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const isSameDay = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const formatDateHeader = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const now = new Date();
    
    if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      return 'Today';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()) {
      return 'Yesterday';
    }
    
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.sender_id === currentUserId;
    const participant = participants[item.sender_id] || { name: 'Unknown', initials: '?' };
    
    // Check if we should show avatar/name (if previous message is from someone else, or a long time ago)
    const prevMessage = messages[index + 1]; // +1 because array is reversed (newest first)
    const showAvatar = !isMe && (!prevMessage || prevMessage.sender_id !== item.sender_id);
    
    const isNewDay = !prevMessage || !isSameDay(item.created_at, prevMessage.created_at);
    
    return (
      <View>
        {isNewDay && (
          <View style={styles.dateHeaderContainer}>
            <View style={styles.dateHeaderBadge}>
              <Text style={styles.dateHeaderText}>{formatDateHeader(item.created_at)}</Text>
            </View>
          </View>
        )}
        <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem, item.isOptimistic && { opacity: 0.7 }]}>
        {!isMe && (
          <View style={styles.avatarSpace}>
            {showAvatar && (
              <View style={[styles.avatar, { backgroundColor: participant.color || '#E2E8F0' }]}>
                <Text style={styles.avatarText}>{participant.initials}</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[styles.bubbleContainer, isMe ? styles.bubbleContainerMe : styles.bubbleContainerThem]}>
          {showAvatar && <Text style={styles.senderName}>{participant.name}</Text>}
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
              {item.text}
              {/* Invisible spacer reserves space at the end of the text so the absolute time never overlaps */}
              <Text style={{ fontSize: 11, color: isMe ? '#3B82F6' : '#fff', opacity: 0 }}>{'        00:00 PM'}</Text>
            </Text>
            
            <View style={styles.timeAbsoluteContainer}>
              <Text style={[styles.messageTimeAbsolute, isMe ? styles.messageTimeAbsoluteMe : styles.messageTimeAbsoluteThem]}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      enabled={Platform.OS === 'ios'}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          </View>
        </View>
      </View>

      {/* Chat Area */}
      <View style={styles.chatContainer}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={Theme.colors.primary} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            inverted={true} // Newest at bottom
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputRow}>
          
          {/* Plus Button Div */}
          <Pressable style={styles.plusBtn} onPress={() => setShowAttachments(!showAttachments)}>
            <Text style={styles.plusBtnText}>+</Text>
          </Pressable>
          
          {/* Text Input Div */}
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
          </View>

          {/* Send Button Div */}
          <Pressable 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Text style={styles.sendBtnIcon}>↑</Text>
          </Pressable>
          
        </View>
      </View>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachments}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAttachments(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAttachments(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.attachmentMenu, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.attachmentGrid}>
                  
                  <Pressable style={styles.attachmentItem} onPress={() => { setShowAttachments(false); alert('Photos coming soon!'); }}>
                    <View style={[styles.attachmentIconWrap, { backgroundColor: '#3B82F6' }]}>
                      <Text style={styles.attachmentIcon}>🖼️</Text>
                    </View>
                    <Text style={styles.attachmentLabel}>Photos</Text>
                  </Pressable>
                  
                  <Pressable style={styles.attachmentItem} onPress={() => { setShowAttachments(false); alert('Camera coming soon!'); }}>
                    <View style={[styles.attachmentIconWrap, { backgroundColor: '#10B981' }]}>
                      <Text style={styles.attachmentIcon}>📷</Text>
                    </View>
                    <Text style={styles.attachmentLabel}>Camera</Text>
                  </Pressable>
                  
                  <Pressable style={styles.attachmentItem} onPress={() => { setShowAttachments(false); alert('Documents coming soon!'); }}>
                    <View style={[styles.attachmentIconWrap, { backgroundColor: '#8B5CF6' }]}>
                      <Text style={styles.attachmentIcon}>📄</Text>
                    </View>
                    <Text style={styles.attachmentLabel}>Document</Text>
                  </Pressable>
                  
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  
  header: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 16, 
    paddingBottom: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: Theme.colors.border,
    zIndex: 10
  },
  backBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Theme.colors.muted, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 16, color: Theme.colors.mutedFg },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Theme.colors.fg, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: Theme.colors.mutedFg, marginTop: 1 },
  
  chatContainer: { flex: 1 },
  flatListContent: { paddingHorizontal: 16, paddingVertical: 20, gap: 4 },
  
  dateHeaderContainer: { alignItems: 'center', marginVertical: 16 },
  dateHeaderBadge: { backgroundColor: '#E2E8F0', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  dateHeaderText: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },

  messageRow: { flexDirection: 'row', width: '100%', marginVertical: 2 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start' },
  
  avatarSpace: { width: 32, marginRight: 8, justifyContent: 'flex-end', paddingBottom: 2 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  
  bubbleContainer: { maxWidth: '75%' },
  bubbleContainerMe: { alignItems: 'flex-end' },
  bubbleContainerThem: { alignItems: 'flex-start' },
  
  senderName: { fontSize: 11, color: '#64748B', marginLeft: 4, marginBottom: 4 },
  
  bubble: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 16, minWidth: 75, position: 'relative' },
  bubbleMe: { backgroundColor: '#3B82F6', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTextMe: { color: '#fff' },
  messageTextThem: { color: '#0F172A' },
  
  timeAbsoluteContainer: { position: 'absolute', right: 10, bottom: 6 },
  messageTimeAbsolute: { fontSize: 10 },
  messageTimeAbsoluteMe: { color: 'rgba(255,255,255,0.7)' },
  messageTimeAbsoluteThem: { color: '#94A3B8' },
  
  inputContainer: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 12, 
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  input: {
    minHeight: 24,
    maxHeight: 100,
    fontSize: 15,
    color: '#0F172A',
    paddingTop: 4,
    paddingBottom: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1'
  },
  sendBtnIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: -2
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 2
  },
  plusBtnText: {
    color: '#64748B',
    fontSize: 22,
    marginTop: -2,
    fontWeight: '500'
  },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  attachmentMenu: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  attachmentGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  attachmentItem: { alignItems: 'center', gap: 8 },
  attachmentIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  attachmentIcon: { fontSize: 24 },
  attachmentLabel: { fontSize: 13, fontWeight: '500', color: '#475569' }
});
