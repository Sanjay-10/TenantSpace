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
  KeyboardAvoidingView,
  Alert,
  LogBox
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { downloadAndSyncMedia } from '../../lib/offlineMedia';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../constants/theme';
import { markChatAsRead } from '../../lib/readReceipts';
import * as MediaLibrary from 'expo-media-library';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ImageView from 'react-native-image-viewing';
import { LinearGradient } from 'expo-linear-gradient';
import { pickImageOrVideo, pickDocument, uploadFileToSupabase, getAuthenticatedMediaUrl, PickedMedia } from '../../lib/storage';
import { getTenantColor, getTenantTextColor, getInitials } from '../ui/AvatarCluster';

export interface ChatParticipant {
  id: string;
  name: string;
  initials: string;
  avatar_url?: string;
  color?: string;
}

const getDocumentIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch(ext) {
    case 'pdf': return { name: 'file-pdf-box', color: '#EF4444' };
    case 'doc':
    case 'docx': return { name: 'file-word-box', color: '#3B82F6' };
    case 'xls':
    case 'xlsx':
    case 'csv': return { name: 'microsoft-excel', color: '#10B981' };
    case 'ppt':
    case 'pptx': return { name: 'microsoft-powerpoint', color: '#F97316' };
    case 'zip':
    case 'rar':
    case '7z': return { name: 'folder-zip', color: '#EAB308' };
    case 'txt': return { name: 'file-document-outline', color: '#64748B' };
    default: return { name: 'file-document', color: '#64748B' };
  }
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getMimeTypeAndExtension = (filename: string, mediaType: string) => {
  if (mediaType === 'image') return { ext: '.jpg', mime: 'image/jpeg', uti: 'public.jpeg' };
  if (mediaType === 'video') return { ext: '.mp4', mime: 'video/mp4', uti: 'public.mpeg-4' };
  
  const ext = filename.split('.').pop()?.toLowerCase();
  switch(ext) {
    case 'doc': return { ext: '.doc', mime: 'application/msword', uti: 'com.microsoft.word.doc' };
    case 'docx': return { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uti: 'org.openxmlformats.wordprocessingml.document' };
    case 'xls': return { ext: '.xls', mime: 'application/vnd.ms-excel', uti: 'com.microsoft.excel.xls' };
    case 'xlsx': return { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uti: 'org.openxmlformats.spreadsheetml.sheet' };
    case 'csv': return { ext: '.csv', mime: 'text/csv', uti: 'public.comma-separated-values-text' };
    case 'ppt': return { ext: '.ppt', mime: 'application/vnd.ms-powerpoint', uti: 'com.microsoft.powerpoint.ppt' };
    case 'pptx': return { ext: '.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', uti: 'org.openxmlformats.presentationml.presentation' };
    case 'zip': return { ext: '.zip', mime: 'application/zip', uti: 'public.zip-archive' };
    case 'txt': return { ext: '.txt', mime: 'text/plain', uti: 'public.plain-text' };
    case 'pdf':
    default: return { ext: '.pdf', mime: 'application/pdf', uti: 'com.adobe.pdf' };
  }
};

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
  const [refreshing, setRefreshing] = useState(false);
  const [previewImageVisible, setPreviewImageVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loadingMediaId, setLoadingMediaId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();
  const [authToken, setAuthToken] = useState('');

  // Get Auth Token for media downloads
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthToken(data.session?.access_token || ''));
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => setAuthToken(session?.access_token || ''));
    return () => authListener.subscription.unsubscribe();
  }, []);

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

  // Auto-download and sync photos to gallery in the background
  useEffect(() => {
    let isMounted = true;
    const syncPhotos = async () => {
      let hasGalleryPerms = false;
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        hasGalleryPerms = status === 'granted';
      } catch (err) {
        console.warn('Could not get gallery permissions (expected in Expo Go):', err);
      }

      if (!isMounted) return;

      const photos = messages.filter(m => !m.isOptimistic && m.media_type === 'image' && m.media_url);
      
      for (const photo of photos) {
        if (!isMounted) break;
        let rawName = photo.text || `media_${photo.id.substring(0,6)}`;
        const { ext } = getMimeTypeAndExtension(rawName, photo.media_type);
        if (!rawName.toLowerCase().endsWith(ext)) rawName += ext;
        
        // If we don't have gallery perms, pass false so it still caches locally for offline use!
        await downloadAndSyncMedia(rawName, photo.media_url, hasGalleryPerms);
      }
    };

    if (messages.length > 0) {
      syncPhotos();
    }
    
    return () => { isMounted = false; };
  }, [messages]);

  // Subscribe to real-time new messages
  useEffect(() => {
    const channelName = roomId ? `chat-room-${roomId}-${Date.now()}` : `chat-prop-${propertyId}-${Date.now()}`;
    
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

  const handlePickMedia = async (type: 'photo' | 'document') => {
    setShowAttachments(false);
    
    const file = type === 'document' ? await pickDocument() : await pickImageOrVideo();
    if (!file) return;

    await handleSendFile(file);
  };

  const handleMediaPress = async (mediaUrl: string, type: 'image' | 'video', item: any) => {
    if (item.isOptimistic) return;
    setLoadingMediaId(item.id);
    
    if (type === 'image') {
      try {
        const { data, error } = await supabase.storage.from('chat-media').createSignedUrl(mediaUrl, 60 * 60);
        if (data?.signedUrl && !error) {
          setPreviewImageUrl(data.signedUrl);
          setPreviewImageVisible(true);
        } else {
          Alert.alert('Error', 'Could not load high-res image.');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMediaId(null);
      }
    } else {
      // For videos, fall back to the native viewer
      setLoadingMediaId(null);
      handleMediaAction(item, 'open');
    }
  };

  const handleMediaAction = async (item: any, action: 'open' | 'share' | 'download') => {
    if (item.isOptimistic) return;
    setLoadingMediaId(item.id);
    try {
      // 1. Resolve true extension and mime type
      let rawName = item.text || `media_${item.id.substring(0,6)}`;
      const { ext: extension, mime: mimeType, uti } = getMimeTypeAndExtension(rawName, item.media_type);
      
      // Ensure file has an extension for Android intent matching
      if (!rawName.toLowerCase().endsWith(extension)) {
        rawName += extension;
      }
      
      const isMedia = item.media_type === 'image' || item.media_type === 'video';

      // 3. Execute requested action
      if (action === 'share') {
        const localUri = await downloadAndSyncMedia(rawName, item.media_url, isMedia);
        if (!localUri) throw new Error('Could not download media for sharing');
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localUri, { mimeType, UTI: uti });
        } else {
          Alert.alert('Unavailable', 'Sharing is not available on this device');
        }
      } else if (action === 'download') {
        if (isMedia) {
          const localUri = await downloadAndSyncMedia(rawName, item.media_url, true);
          if (localUri) Alert.alert('Saved', 'Media saved to your Gallery!');
        } else {
          // For documents, best cross-platform way to download is via browser
          const { data } = await supabase.storage.from('chat-media').createSignedUrl(item.media_url, 60 * 60);
          if (data?.signedUrl) {
            Linking.openURL(data.signedUrl);
          } else {
            Alert.alert('Error', 'Could not generate download link.');
          }
        }
      } else {
        // action === 'open'
        const { data } = await supabase.storage.from('chat-media').createSignedUrl(item.media_url, 60 * 60);
        if (data?.signedUrl) {
          Linking.openURL(data.signedUrl);
        } else {
          Alert.alert('Error', 'Could not open media.');
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not process media.');
    } finally {
      setLoadingMediaId(null);
    }
  };

  const handleSendFile = async (file: PickedMedia) => {
    setSending(true);
    
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      property_id: propertyId,
      room_id: roomId || null,
      sender_id: currentUserId,
      text: file.type === 'document' ? file.name : '', 
      media_url: file.uri, // locally stored for optimistic render
      media_type: file.type,
      thumbnail_url: file.thumbnailUri, // locally stored thumbnail for optimistic render
      media_duration: file.duration,
      created_at: new Date().toISOString(),
      isOptimistic: true,
      profiles: { full_name: participants[currentUserId]?.name || 'Me' }
    };
    
    setMessages(prev => [optimisticMessage, ...prev]);

    try {
      const { url, thumbnailUrl, error: uploadError } = await uploadFileToSupabase('chat-media', propertyId, file);
      if (uploadError || !url) throw new Error('Upload failed');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          property_id: propertyId,
          room_id: roomId || null,
          sender_id: currentUserId,
          text: file.type === 'document' ? file.name : '',
          media_url: url,
          media_type: file.type,
          thumbnail_url: thumbnailUrl || null,
          media_duration: file.duration || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev.filter(m => m.id !== tempId);
        return prev.map(m => m.id === tempId ? data : m);
      });
    } catch (err) {
      console.error('Error sending media:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('Failed to send attachment');
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
    
    const bgColor = !isMe ? '#DBEAFE' : undefined;
    const nameColor = !isMe ? getTenantTextColor(item.sender_id) : undefined;
    const avatarBgColor = !isMe ? getTenantColor(item.sender_id) : undefined;
    const avatarTextColor = !isMe ? getTenantTextColor(item.sender_id) : undefined;
    
    // Check if we should show avatar/name (if previous message is from someone else, or a long time ago)
    const prevMessage = messages[index + 1]; // +1 because array is reversed (newest first)
    const showAvatar = !isMe && (!prevMessage || prevMessage.sender_id !== item.sender_id);
    
    const isNewDay = !prevMessage || !isSameDay(item.created_at, prevMessage.created_at);
    
    return (
      <View style={{
        zIndex: openMenuId === item.id ? 9999 : 1,
        elevation: openMenuId === item.id ? 9999 : 1
      }}>
        {isNewDay && (
          <View style={styles.dateHeaderContainer}>
            <View style={styles.dateHeaderBadge}>
              <Text style={styles.dateHeaderText}>{formatDateHeader(item.created_at)}</Text>
            </View>
          </View>
        )}
        <View style={[
          styles.messageRow, 
          isMe ? styles.messageRowMe : styles.messageRowThem, 
          item.isOptimistic && { opacity: 0.7 }
        ]}>
        {!isMe && (
          <View style={styles.avatarSpace}>
            {showAvatar && (
              <View style={[styles.avatar, { backgroundColor: avatarBgColor || '#E2E8F0' }]}>
                <Text style={[styles.avatarText, { color: avatarTextColor }]}>{participant.initials}</Text>
              </View>
            )}
          </View>
        )}
        
          <View style={[styles.bubbleContainer, isMe ? styles.bubbleContainerMe : styles.bubbleContainerThem]}>
            <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'center' }}>
              
              {/* Main Chat Bubble */}
              <View style={[
                styles.bubble, 
                isMe ? styles.bubbleMe : styles.bubbleThem,
                !isMe && { backgroundColor: bgColor, borderColor: bgColor },
                item.media_url && { paddingHorizontal: 3, paddingTop: 3 },
                !item.text && (item.media_type === 'image' || item.media_type === 'video') && { paddingBottom: 3 }
              ]}>
                {!isMe && showAvatar && (
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '700',
                    marginBottom: 4,
                    marginLeft: item.media_url ? 5 : 0,
                    marginTop: item.media_url ? 3 : 0,
                    color: nameColor 
                  }}>
                    {participant.name}
                  </Text>
                )}
                {item.media_url && item.media_type === 'image' && (
                  <Pressable 
                    onPress={() => handleMediaPress(item.media_url, 'image', item)}
                    onLongPress={() => setOpenMenuId(item.id)}
                    delayLongPress={300}
                  >
                    <View style={[
                      styles.mediaImage, 
                      { marginTop: 0, marginBottom: item.text ? 4 : 0 },
                      !item.text && (isMe ? { borderBottomRightRadius: 1 } : { borderBottomLeftRadius: 1 })
                    ]}>
                      {!item.isOptimistic && (
                        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                          <ActivityIndicator size="small" color="#94A3B8" />
                        </View>
                      )}
                      <Image 
                        source={{ 
                          uri: getAuthenticatedMediaUrl('chat-media', item.media_url),
                          headers: { Authorization: `Bearer ${authToken}` }
                        }} 
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                      {/* Render UI Overlay replacing `isOptimistic` with `isOptimistic || loadingMediaId === item.id` */}
                      {(item.isOptimistic || loadingMediaId === item.id) && (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', zIndex: 50 }]}>
                          <ActivityIndicator size="large" color="#fff" />
                        </View>
                      )}
                      {!item.text && (
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.5)']}
                          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 }}
                        />
                      )}
                    </View>
                  </Pressable>
                )}
                {item.media_url && item.media_type === 'video' && (
                  <Pressable 
                    onPress={() => handleMediaPress(item.media_url, 'video', item)}
                    onLongPress={() => setOpenMenuId(item.id)}
                    delayLongPress={300}
                  >
                    <View style={[
                      styles.mediaImage, 
                      { marginTop: 0, marginBottom: item.text ? 4 : 0 },
                      !item.text && (isMe ? { borderBottomRightRadius: 1 } : { borderBottomLeftRadius: 1 })
                    ]}>
                      {!item.isOptimistic && (
                        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                          <ActivityIndicator size="small" color="#94A3B8" />
                        </View>
                      )}
                      {item.thumbnail_url ? (
                        <Image 
                          source={{ 
                            uri: item.isOptimistic ? item.thumbnail_url : getAuthenticatedMediaUrl('chat-media', item.thumbnail_url),
                            ...(item.isOptimistic ? {} : { headers: { Authorization: `Bearer ${authToken}` } })
                          }} 
                          style={[StyleSheet.absoluteFill, { borderRadius: 12, opacity: 0.8 }]}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                        />
                      ) : null}
                      {(item.isOptimistic || loadingMediaId === item.id) && (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', zIndex: 50 }]}>
                          <ActivityIndicator size="large" color="#fff" />
                        </View>
                      )}
                      {!item.text && (
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.5)']}
                          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 }}
                        />
                      )}
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                        <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                      </View>
                      {item.media_duration != null ? (
                        <View style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 20 }}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
                            {formatDuration(item.media_duration)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                )}
                {item.media_url && item.media_type === 'document' && (
                  <Pressable 
                    style={[
                      styles.mediaDocument, 
                      isMe ? styles.mediaDocumentMe : styles.mediaDocumentThem, 
                      { marginBottom: item.text ? 4 : 0 },
                      !item.text && (isMe ? { borderBottomRightRadius: 2 } : { borderBottomLeftRadius: 2 })
                    ]} 
                    onPress={() => handleMediaAction(item, 'open')}
                    onLongPress={() => setOpenMenuId(item.id)}
                    delayLongPress={300}
                  >
                      {(item.isOptimistic || loadingMediaId === item.id) ? (
                        <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                          <ActivityIndicator size="small" color={isMe ? "#fff" : "#1E293B"} />
                        </View>
                      ) : (
                        <MaterialCommunityIcons 
                          name={getDocumentIcon(item.text || '').name as any} 
                          size={28} 
                          color={getDocumentIcon(item.text || '').color} 
                          style={{ backgroundColor: '#fff', borderRadius: 4, overflow: 'hidden' }}
                        />
                      )}
                      <Text style={[styles.mediaDocumentText, isMe ? styles.mediaDocumentTextMe : styles.mediaDocumentTextThem]} numberOfLines={1} ellipsizeMode="middle">
                      {item.text || 'Document'}
                    </Text>
                  </Pressable>
                )}
                {item.text && item.media_type !== 'document' ? (
                  <Text style={[
                    styles.messageText, 
                    isMe ? styles.messageTextMe : styles.messageTextThem,
                    (item.media_type === 'image' || item.media_type === 'video') && { paddingHorizontal: 6, paddingTop: 2 }
                  ]}>
                    {item.text}
                    <Text style={{ fontSize: 11, color: isMe ? '#3B82F6' : bgColor }}>{'        00:00 PM'}</Text>
                  </Text>
                ) : item.media_type === 'document' ? (
                   <View style={{ height: 14 }} />
                ) : null}
                
                {(() => {
                  const isOverlayTime = (item.media_type === 'image' || item.media_type === 'video') && !item.text;
                  return (
                    <View style={[styles.timeAbsoluteContainer, { flexDirection: 'row', alignItems: 'center' }, isOverlayTime && { bottom: 6, right: 8 }]}>
                      <Text style={[
                        styles.messageTimeAbsolute, 
                        isMe ? styles.messageTimeAbsoluteMe : styles.messageTimeAbsoluteThem,
                        isOverlayTime && { color: 'rgba(255,255,255,0.9)', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }
                      ]}>
                        {formatTime(item.created_at)}
                      </Text>
                    </View>
                  );
                })()}
              </View>

              {/* Floating Action Menu (Triggered by Long Press) */}
              {!item.isOptimistic && item.media_url && (
                <View style={{ position: 'relative', marginLeft: isMe ? 0 : 8, marginRight: isMe ? 8 : 0 }}>
                  {openMenuId === item.id && (
                    <View style={{ 
                      position: 'absolute', 
                      top: -15, 
                      right: isMe ? 'auto' : 0, // open inward 
                      left: isMe ? 0 : 'auto',  // open inward
                      backgroundColor: '#262626', 
                      borderRadius: 14, 
                      paddingVertical: 4,
                      minWidth: 160,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 10,
                      zIndex: 9999
                    }}>
                      <Pressable 
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 }} 
                        onPress={() => { setOpenMenuId(null); handleMediaAction(item, 'share'); }}
                      >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>Share</Text>
                        <Ionicons name="share-outline" size={22} color="#fff" />
                      </Pressable>
                      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                      <Pressable 
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 }} 
                        onPress={() => { setOpenMenuId(null); handleMediaAction(item, 'download'); }} 
                      >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>Download</Text>
                        <Ionicons name="download-outline" size={22} color="#fff" />
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

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
      {/* Invisible overlay to dismiss popup menu */}
      {openMenuId && (
        <Pressable 
          style={[StyleSheet.absoluteFill, { zIndex: 9998, elevation: 9998 }]} 
          onPress={() => setOpenMenuId(null)} 
        />
      )}
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="chevron-back-outline" size={24} color={Theme.colors.mutedFg} />
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
            <Ionicons name="add-outline" size={24} color="#64748B" />
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
            <Ionicons name="arrow-up-outline" size={20} color={!inputText.trim() ? '#94A3B8' : '#fff'} />
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
                  
                  <Pressable style={styles.attachmentItem} onPress={() => handlePickMedia('photo')}>
                    <View style={[styles.attachmentIconWrap, { backgroundColor: '#3B82F6' }]}>
                      <Text style={styles.attachmentIcon}>🖼️</Text>
                    </View>
                    <Text style={styles.attachmentLabel}>Photos & Video</Text>
                  </Pressable>
                  
                  <Pressable style={styles.attachmentItem} onPress={() => handlePickMedia('document')}>
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

      {/* Zoomable Full-Screen Image Viewer */}
      <ImageView
        images={[{ uri: previewImageUrl }]}
        imageIndex={0}
        visible={previewImageVisible}
        onRequestClose={() => setPreviewImageVisible(false)}
        animationType="fade"
      />

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
  
  avatarSpace: { width: 32, marginRight: 8, justifyContent: 'flex-start', paddingTop: 4 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  
  bubbleContainer: { maxWidth: '75%' },
  bubbleContainerMe: { alignItems: 'flex-end' },
  bubbleContainerThem: { alignItems: 'flex-start' },
  
  senderName: { fontSize: 11, color: '#64748B', marginLeft: 4, marginBottom: 4 },
  
  bubble: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 16, minWidth: 75, position: 'relative' },
  bubbleMe: { backgroundColor: '#3B82F6', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  
  mediaImage: { width: 220, height: 220, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden' },
  mediaDocument: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 13, gap: 8, maxWidth: 200, overflow: 'hidden' },
  mediaDocumentMe: { backgroundColor: 'rgba(255,255,255,0.2)' },
  mediaDocumentThem: { backgroundColor: 'rgba(0,0,0,0.05)' },
  mediaDocumentIconMe: { fontSize: 24, opacity: 0.9 },
  mediaDocumentIconThem: { fontSize: 24, opacity: 0.8 },
  mediaDocumentText: { fontWeight: '600', textDecorationLine: 'underline', flexShrink: 1 },
  mediaDocumentTextMe: { color: '#fff' },
  mediaDocumentTextThem: { color: '#1E293B' },

  messageText: { fontSize: 15, lineHeight: 20 },
  messageTextMe: { color: '#fff' },
  messageTextThem: { color: '#0F172A' },
  
  timeAbsoluteContainer: { position: 'absolute', right: 10, bottom: 6 },
  messageTimeAbsolute: { fontSize: 11 },
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
