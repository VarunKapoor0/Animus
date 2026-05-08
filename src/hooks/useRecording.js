// useRecording — microphone recording + Whisper transcription.
// Shared by ChatPanel and DebatePanel.

import { useState, useRef, useCallback } from 'react';

export default function useRecording(transcribeAudio, onTranscript) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    if (isTranscribing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        const transcript = await transcribeAudio(audioBlob);
        setIsTranscribing(false);
        if (transcript && transcript.trim()) {
          onTranscript(transcript.trim());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
    }
  }, [isTranscribing, transcribeAudio, onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return { isRecording, isTranscribing, startRecording, stopRecording };
}
