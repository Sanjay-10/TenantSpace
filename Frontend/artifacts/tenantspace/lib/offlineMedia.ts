import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { supabase } from './supabase';
import { Platform } from 'react-native';

const ALBUM_NAME = 'TenantSpace';

/**
 * Downloads a media file to the permanent local documents directory, 
 * and optionally syncs it to the public Gallery.
 */
export async function downloadAndSyncMedia(
  fileName: string, 
  storagePath: string, 
  saveToGallery: boolean = true
): Promise<string | null> {
  try {
    // 1. Check if the file already exists in our private permanent storage
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const localUri = `${FileSystem.documentDirectory}${cleanFileName}`;
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    
    if (fileInfo.exists) {
      // It's already fully downloaded and cached locally!
      return localUri;
    }
    
    // 2. Fetch signed URL
    const { data, error } = await supabase.storage.from('chat-media').createSignedUrl(storagePath, 60 * 60);
    if (error || !data) {
      console.error('Error creating signed url:', error);
      return null;
    }
    
    // 3. Download to the permanent document directory
    const downloadResult = await FileSystem.downloadAsync(data.signedUrl, localUri);
    
    // 4. Save to public Gallery if requested (and if we have permissions)
    if (saveToGallery && Platform.OS !== 'web') {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          try {
            const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
          const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
          if (album) {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          } else {
            await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
          }
        } catch (mediaErr) {
          console.error('Error saving to gallery:', mediaErr);
        }
      }
    } catch (permErr) {
      console.warn('Could not request media permissions in this environment:', permErr);
    }
    }
    
    return downloadResult.uri;
  } catch (err) {
    console.error('Offline media sync error:', err);
    return null;
  }
}
