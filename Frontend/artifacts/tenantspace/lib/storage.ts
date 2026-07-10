import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { supabase, supabaseUrl } from './supabase';
import { Alert } from 'react-native';

export type BucketName = 'chat-media' | 'property-docs' | 'maintenance-photos';

export interface PickedMedia {
  uri: string;
  type: 'image' | 'video' | 'document';
  name: string;
  mimeType?: string;
  size?: number;
  thumbnailUri?: string;
  duration?: number;
}

export async function pickImageOrVideo(): Promise<PickedMedia | null> {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
    alert("You've refused to allow this app to access your photos!");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'], // Plural format required by new Expo API
    allowsEditing: true, // crop UI
    quality: 0.7, // 70% compression (great size savings, zero visual loss)
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const type = asset.type === 'video' ? 'video' : 'image';
  
  // Expo Image Picker sometimes doesn't provide a fileName
  const name = asset.fileName || `${type}_${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`;

  let thumbnailUri: string | undefined = undefined;
  if (type === 'video') {
    try {
      const thumb = await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 0 });
      thumbnailUri = thumb.uri;
    } catch (e: any) {
      alert(`Thumbnail Generation Error: ${e.message}`);
      console.warn("Could not generate video thumbnail", e);
    }
  }

  return {
    uri: asset.uri,
    type,
    name,
    mimeType: asset.mimeType,
    size: asset.fileSize,
    thumbnailUri,
    duration: asset.duration,
  };
}

export async function pickDocument(): Promise<PickedMedia | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets[0]) return null;
  
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    type: 'document',
    name: asset.name,
    mimeType: asset.mimeType,
    size: asset.size,
  };
}

export async function uploadFileToSupabase(
  bucket: BucketName,
  propertyId: string,
  file: PickedMedia
): Promise<{ url: string | null; thumbnailUrl: string | null; error: Error | null }> {
  try {
    // Generate a unique file name to avoid collisions
    const ext = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Construct the path required by our strict RLS policies: property_id/filename
    const filePath = `${propertyId}/${uniqueFileName}`;

    // React Native's networking stack requires FormData for Supabase uploads
    // Attempting to upload a pure Blob directly causes "Network request failed"
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: uniqueFileName,
      type: file.mimeType || 'application/octet-stream'
    } as any);

    // Upload the FormData directly to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, formData, {
        upsert: false,
      });

    if (error) throw error;

    let uploadedThumbnailUrl = null;
    if (file.thumbnailUri) {
      const thumbFileName = `${uniqueFileName}_thumb.jpg`;
      const thumbPath = `${propertyId}/${thumbFileName}`;
      const thumbData = new FormData();
      thumbData.append('file', {
        uri: file.thumbnailUri,
        name: thumbFileName,
        type: 'image/jpeg'
      } as any);

      const { error: tError } = await supabase.storage
        .from(bucket)
        .upload(thumbPath, thumbData, { upsert: false });

      if (!tError) {
        uploadedThumbnailUrl = thumbPath;
      } else {
        alert(`Thumbnail Upload Error: ${tError.message}`);
        console.warn('Thumbnail upload error', tError);
      }
    }

    // Return the relative path stored in the database
    return { url: filePath, thumbnailUrl: uploadedThumbnailUrl, error: null };
  } catch (error: any) {
    console.error('Upload Error:', error);
    return { url: null, thumbnailUrl: null, error };
  }
}

/**
 * Helper to construct the authenticated URL for the React Native <Image> component
 * Example usage: 
 * <Image 
 *   source={{ 
 *     uri: getAuthenticatedMediaUrl('chat-media', message.media_url),
 *     headers: { Authorization: `Bearer ${session?.access_token}` } 
 *   }} 
 * />
 */
export function getAuthenticatedMediaUrl(bucket: BucketName, path: string): string {
  return `${supabaseUrl}/storage/v1/object/authenticated/${bucket}/${path}`;
}
