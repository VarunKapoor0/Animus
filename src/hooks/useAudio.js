// useAudio — TTS logic shared by ChatPanel and DebatePanel.
// Handles Orpheus TTS with Web Speech fallback.
// isMounted ref prevents ghost audio after component unmount.

import { useRef, useCallback } from 'react';

const LANG_TO_BCP47 = {
  'hindi': 'hi-IN', 'spanish': 'es-ES', 'french': 'fr-FR',
  'german': 'de-DE', 'italian': 'it-IT', 'portuguese': 'pt-BR',
  'japanese': 'ja-JP', 'korean': 'ko-KR', 'chinese': 'zh-CN',
  'arabic': 'ar-SA', 'russian': 'ru-RU', 'dutch': 'nl-NL',
  'polish': 'pl-PL', 'turkish': 'tr-TR', 'swedish': 'sv-SE',
};

function toBCP47(language) {
  if (!language) return null;
  return LANG_TO_BCP47[language.toLowerCase()] || language;
}

export default function useAudio(isMounted) {
  const currentAudioRef = useRef(null);

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const speakReply = useCallback(async (text, language = 'english', voice = 'diana', vocalDirection = null) => {
    stopAudio();
    const isEnglish = !language || language === 'english' || language === 'en';

    if (isEnglish) {
      try {
        const response = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice, vocal_direction: vocalDirection })
        });
        if (!isMounted.current) return;
        if (response.ok) {
          const audioBlob = await response.blob();
          if (!isMounted.current) return;
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;
          audio.onended = () => URL.revokeObjectURL(audioUrl);
          audio.play();
          return;
        }
      } catch (err) {
        console.warn('Groq TTS failed, falling back to Web Speech:', err);
      }
    }

    if (!isMounted.current) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      const langTag = isEnglish ? 'en-US' : toBCP47(language);
      if (langTag) utterance.lang = langTag;
      window.speechSynthesis.speak(utterance);
    }
  }, [stopAudio, isMounted]);

  return { speakReply, stopAudio };
}
