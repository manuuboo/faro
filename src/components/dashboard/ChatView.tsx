import { useState, useRef, useEffect, useCallback } from 'react';

import type { ChatMessage, Attachment } from '../../types/business';

import { categorySuggestions } from '../../data/categorySuggestions';

import { askGemini } from '../../ai/gemini';

import { getBusinessId } from "../../services/storage";

import './ChatView.css';

import './SectionView.css';

interface Props {
  userData: any;
}

type FaroStatus = 'idle' | 'listening' | 'processing';

export default function ChatView({ userData }: Props) {
  const [status, setStatus] = useState<FaroStatus>('idle');

  const [inputText, setInputText] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'faro',
      text: `Hola, ${userData.name}. Soy Faro, tu asistente administrativo inteligente. Puedo ayudarte con ${userData.businessName}. ¿En qué te ayudo hoy?`,
      date: new Date().toISOString(),
    },
  ]);

  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  const [isRecording, setIsRecording] = useState(false);

  const [recordingTime, setRecordingTime] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioChunksRef = useRef<Blob[]>([]);

  const suggestions =
    categorySuggestions[userData.category] ||
    categorySuggestions['Other'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // ── Bubble state class ──────────────────────────────────────────────────

  const getBubbleClass = () => {
    switch (status) {
      case 'listening':
        return 'faro-bubble faro-bubble--orange faro-bubble--pulse';

      case 'processing':
        return 'faro-bubble faro-bubble--green faro-bubble--spin';

      default:
        return 'faro-bubble faro-bubble--violet';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'listening':
        return 'Escuchando...';

      case 'processing':
        return 'Procesando...';

      default:
        return 'Listo';
    }
  };

  // ── Send message ────────────────────────────────────────────────────────

  const handleSend = useCallback(
    async (
      textToSend = inputText,
      extraAttachments: Attachment[] = []
    ) => {
      const allAttachments = [
        ...pendingAttachments,
        ...extraAttachments,
      ];

      if (!textToSend.trim() && allAttachments.length === 0) {
        return;
      }

      if (status === 'processing') {
        return;
      }

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'user',
        text: textToSend,
        attachments:
          allAttachments.length > 0
            ? allAttachments
            : undefined,
        date: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMsg]);

      setInputText('');

      setPendingAttachments([]);

      setStatus('processing');

      try {
        // Obtener el negocio actual
        const businessId = getBusinessId();

        if (!businessId) {
          throw new Error('No se encontró el negocio actual');
        }

        // Enviar mensaje + businessId a Faro AI
        const response = await askGemini(
          textToSend || '[Archivo adjunto]',
          businessId
        );

        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'faro',
            text: response,
            date: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error('Faro AI error:', error);

        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'faro',
            text:
              error instanceof Error &&
                error.message === 'No se encontró el negocio actual'
                ? 'No pude identificar tu negocio actual. Volvé a ingresar al dashboard e intentá nuevamente.'
                : 'Tuve un problema al conectarme. Verificá que el servidor esté activo e intentá de nuevo.',
            date: new Date().toISOString(),
          },
        ]);
      } finally {
        setStatus('idle');
      }
    },
    [inputText, pendingAttachments, status]
  );

  // ── Audio recording ─────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      setStatus('listening');

      setIsRecording(true);

      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(
          audioChunksRef.current,
          {
            type: 'audio/webm',
          }
        );

        const url = URL.createObjectURL(blob);

        const attachment: Attachment = {
          id: crypto.randomUUID(),
          type: 'audio',
          name: `Audio_${new Date().toLocaleTimeString()}.webm`,
          size: blob.size,
          url,
          mimeType: 'audio/webm',
          duration: recordingTime,
        };

        handleSend('', [attachment]);

        stream.getTracks().forEach(t => t.stop());

        setStatus('idle');

        setIsRecording(false);

        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      mediaRecorder.start();
    } catch {
      alert(
        'No se pudo acceder al micrófono. Verificá los permisos del navegador.'
      );

      setStatus('idle');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ── File / Image attach ─────────────────────────────────────────────────

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'file' | 'image'
  ) => {
    const files = Array.from(e.target.files || []);

    const newAttachments: Attachment[] = files.map(file => ({
      id: crypto.randomUUID(),
      type: type === 'image' ? 'image' : 'file',
      name: file.name,
      size: file.size,
      url:
        type === 'image'
          ? URL.createObjectURL(file)
          : undefined,
      mimeType: file.type,
    }));

    setPendingAttachments(prev => [
      ...prev,
      ...newAttachments,
    ]);

    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments(prev =>
      prev.filter(a => a.id !== id)
    );
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);

    const s = sec % 60;

    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="chat-view">
      <div className="chat-card">

        {/* Header */}

        <div className="section-header chat-header">

          <div className="faro-status-indicator">

            <div
              className={getBubbleClass()}
              aria-label={`Faro: ${getStatusLabel()}`}
            />

            <div>

              <h2 className="section-title">
                Faro AI
              </h2>

              <p className="faro-status-text">
                {getStatusLabel()}
              </p>

            </div>

          </div>

          <p
            className="section-description"
            style={{
              marginLeft: 'auto',
              textAlign: 'right',
            }}
          >
            Tu asistente inteligente de negocios
          </p>

        </div>

        <div className="chat-preview">

          {/* Messages */}

          <div
            className="chat-messages"
            role="log"
            aria-live="polite"
          >

            {messages.map(msg => (

              <div
                key={msg.id}
                className={`chat-message chat-message--${msg.sender === 'faro'
                  ? 'bot'
                  : 'user'
                  }`}
              >

                {msg.sender === 'faro' && (

                  <div
                    className="chat-avatar"
                    aria-hidden="true"
                  >

                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>

                  </div>

                )}

                <div className="chat-bubble-content">

                  {msg.text && (
                    <p>{msg.text}</p>
                  )}

                  {msg.attachments?.map(att => (

                    <div
                      key={att.id}
                      className="chat-attachment"
                    >

                      {att.type === 'image' &&
                        att.url && (

                          <img
                            src={att.url}
                            alt={att.name}
                            className="chat-attachment-image"
                          />

                        )}

                      {att.type === 'audio' &&
                        att.url && (

                          <div className="chat-attachment-audio">

                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            </svg>

                            <audio
                              src={att.url}
                              controls
                              style={{
                                height: '28px',
                                flex: 1,
                              }}
                            />

                            <span>
                              {att.duration
                                ? formatDuration(
                                  att.duration
                                )
                                : ''}
                            </span>

                          </div>

                        )}

                      {att.type === 'file' && (

                        <div className="chat-attachment-file">

                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>

                          <span className="att-name">
                            {att.name}
                          </span>

                          <span className="att-size">
                            {formatFileSize(att.size)}
                          </span>

                        </div>

                      )}

                    </div>

                  ))}

                </div>

              </div>

            ))}

            {status === 'processing' && (

              <div className="chat-message chat-message--bot">

                <div
                  className="chat-avatar"
                  aria-hidden="true"
                >

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>

                </div>

                <div className="chat-bubble-content chat-typing-indicator">

                  <span className="dot" />

                  <span className="dot" />

                  <span className="dot" />

                </div>

              </div>

            )}

            {messages.length === 1 && (

              <div className="chat-suggestions-container">

                <p className="chat-suggestions-title">
                  Sugerencias para tu negocio:
                </p>

                <div className="chat-suggestions">

                  {suggestions.map((sug, idx) => (

                    <button
                      key={idx}
                      className="chat-suggestion-btn"
                      onClick={() => handleSend(sug)}
                    >
                      {sug}
                    </button>

                  ))}

                </div>

              </div>

            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Pending attachments */}

          {pendingAttachments.length > 0 && (

            <div className="pending-attachments">

              {pendingAttachments.map(att => (

                <div
                  key={att.id}
                  className="pending-attachment"
                >

                  {att.type === 'image' &&
                    att.url ? (

                    <img
                      src={att.url}
                      alt={att.name}
                      className="pending-thumb"
                    />

                  ) : (

                    <div className="pending-file-icon">

                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>

                    </div>

                  )}

                  <span className="pending-att-name">
                    {att.name}
                  </span>

                  <button
                    className="pending-att-remove"
                    onClick={() =>
                      removeAttachment(att.id)
                    }
                    aria-label="Quitar adjunto"
                  >

                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line
                        x1="18"
                        y1="6"
                        x2="6"
                        y2="18"
                      />
                      <line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                      />
                    </svg>

                  </button>

                </div>

              ))}

            </div>

          )}

          {/* Input shell */}

          <div className="chat-input-shell">

            {/* Attach tools */}

            <div className="chat-input-tools">

              <button
                type="button"
                className={`chat-tool-btn${isRecording
                  ? ' chat-tool-btn--recording'
                  : ''
                  }`}
                onClick={handleMicClick}
                aria-label={
                  isRecording
                    ? 'Detener grabación'
                    : 'Grabar audio'
                }
                title={
                  isRecording
                    ? `${formatDuration(
                      recordingTime
                    )} — Clic para detener`
                    : 'Grabar audio'
                }
              >

                {isRecording ? (

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect
                      x="6"
                      y="6"
                      width="12"
                      height="12"
                      rx="2"
                    />
                  </svg>

                ) : (

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line
                      x1="12"
                      y1="19"
                      x2="12"
                      y2="23"
                    />
                    <line
                      x1="8"
                      y1="23"
                      x2="16"
                      y2="23"
                    />
                  </svg>

                )}

              </button>

              <button
                type="button"
                className="chat-tool-btn"
                onClick={() =>
                  imageInputRef.current?.click()
                }
                aria-label="Adjuntar imagen"
                title="Adjuntar imagen"
              >

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                  />
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                  />
                  <polyline points="21 15 16 10 5 21" />
                </svg>

              </button>

              <button
                type="button"
                className="chat-tool-btn"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                aria-label="Adjuntar archivo"
                title="Adjuntar archivo"
              >

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>

              </button>

            </div>

            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder={
                isRecording
                  ? `Grabando... ${formatDuration(
                    recordingTime
                  )}`
                  : 'Escribe un mensaje...'
              }
              value={inputText}
              onChange={e =>
                setInputText(e.target.value)
              }
              onKeyDown={e => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey
                ) {
                  handleSend();
                }
              }}
              disabled={isRecording}
              autoFocus
              aria-label="Mensaje para Faro"
            />

            <button
              type="button"
              className={`chat-send-btn${inputText.length > 0 ||
                pendingAttachments.length > 0
                ? ' chat-send-btn--active'
                : ''
                }`}
              onClick={() => handleSend()}
              disabled={
                isRecording ||
                status === 'processing'
              }
              aria-label="Enviar mensaje"
            >

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line
                  x1="22"
                  y1="2"
                  x2="11"
                  y2="13"
                />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>

            </button>

          </div>

        </div>

      </div>

      {/* Hidden file inputs */}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e =>
          handleFileChange(e, 'image')
        }
        aria-label="Seleccionar imagen"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv,.xlsx,.docx,.txt,.jpg,.png"
        multiple
        style={{ display: 'none' }}
        onChange={e =>
          handleFileChange(e, 'file')
        }
        aria-label="Seleccionar archivo"
      />

    </div>
  );
}