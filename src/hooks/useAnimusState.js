// useAnimusState — owns all domain state and handlers for the Animus app.
// Extracted from App.jsx to keep App.jsx as a lean layout/routing shell.

import { useState, useRef, useCallback } from 'react';
import useGemini from './useGemini';
import useWebXR from './useWebXR';

const MAX_HISTORY = 5;
const MAX_MARKERS = 8;
const centerPos = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

export default function useAnimusState() {
  const [visionData, setVisionData] = useState(null);
  const [chatActive, setChatActive] = useState(false);
  const [debateActive, setDebateActive] = useState(false);
  const [debatePartner, setDebatePartner] = useState(null);
  const [tapPos, setTapPos] = useState(null);
  const [tapWorldPos, setTapWorldPos] = useState(null);
  const [rippleTrigger, setRippleTrigger] = useState(0);
  const [ripplePos, setRipplePos] = useState({ x: null, y: null });
  const [scanHistory, setScanHistory] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [resumedMessages, setResumedMessages] = useState(null);
  const [showDebatePrompt, setShowDebatePrompt] = useState(false);
  const tapFromScreen = useRef(false);

  const { isProcessing, error, identifyObject, startConversation, sendMessage, transcribeAudio } = useGemini();
  const {
    containerRef,
    arSupported,
    isARActive,
    markerScreenPositions,
    startAR,
    captureHitPosition,
    addARMarker,
  } = useWebXR();

  const resetToIdle = useCallback(() => {
    setVisionData(null);
    setChatActive(false);
    setDebateActive(false);
    setDebatePartner(null);
    setTapPos(null);
    setTapWorldPos(null);
    setResumedMessages(null);
    setShowDebatePrompt(false);
    tapFromScreen.current = false;
  }, []);

  const handleScan = useCallback(async (imageSrc) => {
    setChatActive(false);
    setDebateActive(false);
    setDebatePartner(null);
    setResumedMessages(null);
    setShowDebatePrompt(false);
    if (!imageSrc) return;

    if (arSupported && !isARActive) startAR();
    const worldPos = isARActive ? captureHitPosition() : null;
    setTapWorldPos(worldPos);

    const result = await identifyObject(imageSrc);
    if (result) {
      setVisionData(result);
      if (scanHistory.length > 0) setShowDebatePrompt(true);
    }
  }, [arSupported, isARActive, startAR, captureHitPosition, identifyObject, scanHistory.length]);

  const handleScreenTap = useCallback((e) => {
    if (isProcessing || visionData || chatActive || debateActive) return;
    const pos = { x: e.clientX, y: e.clientY };
    tapFromScreen.current = true;
    setTapPos(pos);
    setRipplePos(pos);
    setRippleTrigger(k => k + 1);
    if (window.captureFrame) handleScan(window.captureFrame());
  }, [isProcessing, visionData, chatActive, debateActive, handleScan]);

  const handleScanButton = useCallback((img) => {
    tapFromScreen.current = false;
    const pos = centerPos();
    setTapPos(pos);
    setRipplePos(pos);
    setRippleTrigger(k => k + 1);
    handleScan(img);
  }, [handleScan]);

  const handleTalkAlone = useCallback(async () => {
    setShowDebatePrompt(false);
    setChatActive(true);
    setResumedMessages(null);
    await startConversation(visionData.object_type, visionData.personality_summary, visionData.voice, visionData.vocal_direction);
  }, [visionData, startConversation]);

  const handleStartDebate = useCallback((partner) => {
    setShowDebatePrompt(false);
    setDebatePartner(partner);
    setDebateActive(true);
  }, []);

  const handleStartChat = useCallback(async () => {
    if (!visionData) return;
    setChatActive(true);
    setResumedMessages(null);
    await startConversation(visionData.object_type, visionData.personality_summary, visionData.voice, visionData.vocal_direction);
  }, [visionData, startConversation]);

  const handleCloseChat = useCallback((savedMessages) => {
    if (visionData) {
      const entry = {
        object_type: visionData.object_type,
        personality_summary: visionData.personality_summary,
        opening_line: visionData.opening_line,
        voice: visionData.voice,
        vocal_direction: visionData.vocal_direction,
        messages: savedMessages || [],
        worldPos: tapWorldPos || null,
      };
      setScanHistory(prev => {
        const filtered = prev.filter(h => h.object_type !== entry.object_type);
        return [entry, ...filtered].slice(0, MAX_HISTORY);
      });
      if (tapFromScreen.current && tapPos) {
        setMarkers(prev => {
          const filtered = prev.filter(m => m.object_type !== entry.object_type);
          return [{ ...entry, x: tapPos.x, y: tapPos.y }, ...filtered].slice(0, MAX_MARKERS);
        });
      }
      if (isARActive && tapWorldPos) addARMarker(visionData.object_type, tapWorldPos);
    }
    setChatActive(false);
    setVisionData(null);
    setTapPos(null);
    setTapWorldPos(null);
    setResumedMessages(null);
    tapFromScreen.current = false;
  }, [visionData, tapPos, tapWorldPos, isARActive, addARMarker]);

  const handleCloseDebate = useCallback((debateEntry) => {
    if (debateEntry) setScanHistory(prev => [debateEntry, ...prev].slice(0, MAX_HISTORY));
    setDebateActive(false);
    setDebatePartner(null);
    setVisionData(null);
    setTapPos(null);
    setTapWorldPos(null);
    tapFromScreen.current = false;
  }, []);

  const handleMarkerTap = useCallback(async (marker) => {
    if (chatActive || debateActive || isProcessing) return;
    if (marker.worldPos && isARActive) setTapWorldPos(marker.worldPos);
    setTapPos({ x: marker.x, y: marker.y });
    tapFromScreen.current = true;
    setVisionData({
      object_type: marker.object_type,
      personality_summary: marker.personality_summary,
      opening_line: marker.opening_line,
      voice: marker.voice,
      vocal_direction: marker.vocal_direction,
    });
    setResumedMessages(marker.messages);
    setChatActive(true);
    await startConversation(marker.object_type, marker.personality_summary, marker.voice, marker.vocal_direction);
  }, [chatActive, debateActive, isProcessing, isARActive, startConversation]);

  const handleResume = useCallback(async (historyItem) => {
    if (historyItem.isDebate) return;
    tapFromScreen.current = false;
    setVisionData({
      object_type: historyItem.object_type,
      personality_summary: historyItem.personality_summary,
      opening_line: historyItem.opening_line,
      voice: historyItem.voice,
      vocal_direction: historyItem.vocal_direction,
    });
    setResumedMessages(historyItem.messages);
    setChatActive(true);
    setTapPos(null);
    setTapWorldPos(null);
    await startConversation(historyItem.object_type, historyItem.personality_summary, historyItem.voice, historyItem.vocal_direction);
  }, [startConversation]);

  const isIdle = !isProcessing && !visionData && !chatActive && !debateActive;

  return {
    // State
    visionData, setVisionData,
    chatActive,
    debateActive,
    debatePartner,
    tapPos, setTapPos,
    rippleTrigger,
    ripplePos,
    scanHistory,
    markers,
    resumedMessages,
    showDebatePrompt,
    isIdle,
    // Gemini
    isProcessing, error,
    sendMessage, transcribeAudio,
    // WebXR
    containerRef, isARActive, markerScreenPositions,
    // Handlers
    resetToIdle,
    handleScan,
    handleScreenTap,
    handleScanButton,
    handleTalkAlone,
    handleStartDebate,
    handleStartChat,
    handleCloseChat,
    handleCloseDebate,
    handleMarkerTap,
    handleResume,
  };
}
