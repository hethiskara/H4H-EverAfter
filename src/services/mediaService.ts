import { Audio } from 'expo-av';

let recording: Audio.Recording | null = null;

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

export async function stopRecording(): Promise<string | null> {
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

    console.log('[Media] Recording stopped, converting to text...');
    
    const transcribedText = await transcribeAudio(uri);
    return transcribedText;
  } catch (error) {
    console.log('[Media] Failed to stop recording:', error);
    recording = null;
    throw error;
  }
}

export function isRecording(): boolean {
  return recording !== null;
}

async function transcribeAudio(audioUri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('[Media] No API key, using placeholder');
    return '[Voice recording - transcription unavailable]';
  }

  try {
    const response = await fetch(audioUri);
    const blob = await response.blob();
    
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    const data = await transcribeResponse.json();
    
    if (data.error) {
      console.log('[Media] Transcription error:', data.error.message);
      return '[Voice recording - transcription failed]';
    }

    console.log('[Media] Transcription complete');
    return data.text || '[Voice recording - empty]';
  } catch (error) {
    console.log('[Media] Transcription error:', error);
    return '[Voice recording - transcription failed]';
  }
}
