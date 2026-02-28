import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, getCurrentUser } from '../config/firebase';

export interface MediaFile {
  uri: string;
  type: 'image' | 'audio';
  name: string;
}

let recording: Audio.Recording | null = null;

export async function pickImage(): Promise<MediaFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access photos is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const fileName = `photo_${Date.now()}.jpg`;
  
  return {
    uri: asset.uri,
    type: 'image',
    name: fileName,
  };
}

export async function takePhoto(): Promise<MediaFile | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access camera is required');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const fileName = `photo_${Date.now()}.jpg`;
  
  return {
    uri: asset.uri,
    type: 'image',
    name: fileName,
  };
}

export async function startRecording(): Promise<void> {
  try {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Permission to access microphone is required');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    
    recording = newRecording;
    console.log('[Media] Recording started');
  } catch (error) {
    console.log('[Media] Failed to start recording:', error);
    throw error;
  }
}

export async function stopRecording(): Promise<MediaFile | null> {
  if (!recording) {
    return null;
  }

  try {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = recording.getURI();
    recording = null;
    
    if (!uri) {
      return null;
    }

    const fileName = `voice_${Date.now()}.m4a`;
    console.log('[Media] Recording stopped:', fileName);
    
    return {
      uri,
      type: 'audio',
      name: fileName,
    };
  } catch (error) {
    console.log('[Media] Failed to stop recording:', error);
    recording = null;
    throw error;
  }
}

export function isRecording(): boolean {
  return recording !== null;
}

export async function uploadMedia(file: MediaFile): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  console.log('[Media] Uploading:', file.name);
  
  const response = await fetch(file.uri);
  const blob = await response.blob();
  
  const storageRef = ref(storage, `users/${user.uid}/media/${file.name}`);
  await uploadBytes(storageRef, blob);
  
  const downloadURL = await getDownloadURL(storageRef);
  console.log('[Media] Upload complete:', downloadURL);
  
  return downloadURL;
}

export async function playAudio(uri: string): Promise<void> {
  const { sound } = await Audio.Sound.createAsync({ uri });
  await sound.playAsync();
}
