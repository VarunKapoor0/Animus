import { useState, useCallback } from 'react';

export default function useGemini() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // To keep chat state since the backend is stateless
  const [chatState, setChatState] = useState(null);

  const identifyObject = useCallback(async (base64Image) => {
    setIsProcessing(true);
    setError(null);
    try {
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.split(';')[0]?.split(':')[1] || 'image/jpeg';
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vision',
          payload: {
            image: base64Data,
            mimeType: mimeType
          }
        })
      });

      if (!response.ok) {
        let errMessage = "Failed to analyze the object. Mind giving it another shot?";
        if (response.status === 429) {
          try {
            const errJson = await response.json();
            errMessage = errJson.error || "Rate limit exceeded. Signal degraded, please wait a moment.";
          } catch(e) {}
        }
        throw new Error(errMessage);
      }

      const parsed = await response.json();
      setIsProcessing(false);
      return parsed;
    } catch (err) {
      console.error("Vision Error:", err);
      setError(err.message || "Failed to analyze the object. Mind giving it another shot?");
      setIsProcessing(false);
      return null;
    }
  }, []);

  const startConversation = useCallback(async (objectType, personalitySummary) => {
    // Just initialize the state locally, backend is stateless
    setChatState({
      objectType,
      personalitySummary,
      history: []
    });
    return true;
  }, []);

  const sendMessage = useCallback(async (message) => {
    if (!chatState) return null;
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          payload: {
            objectType: chatState.objectType,
            personality: chatState.personalitySummary,
            history: chatState.history,
            message: message
          }
        })
      });

      if (!response.ok) {
        throw new Error("Signal lost. Cannot respond.");
      }

      const data = await response.json();
      
      // Update local history
      setChatState(prev => ({
        ...prev,
        history: [
          ...prev.history,
          { role: 'user', parts: [{ text: message }] },
          { role: 'model', parts: [{ text: data.text }] }
        ]
      }));

      return data.text;
    } catch (err) {
      console.error("Chat Message Error:", err);
      setError("Signal lost. Cannot respond.");
      return null;
    }
  }, [chatState]);

  return {
    isProcessing,
    error,
    identifyObject,
    startConversation,
    sendMessage,
    hasActiveChat: !!chatState
  };
}
