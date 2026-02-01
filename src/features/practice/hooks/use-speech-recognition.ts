import * as React from "react";

type UseSpeechRecognitionOptions = {
  lang?: string;
  onFinal: (text: string) => void;
  onInterim?: (text: string) => void;
};

type UseSpeechRecognitionResult = {
  supported: boolean;
  listening: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
};

export const useSpeechRecognition = ({
  lang = "ja-JP",
  onFinal,
  onInterim,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionResult => {
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const onFinalRef = React.useRef(onFinal);
  const onInterimRef = React.useRef(onInterim);
  const lastFinalRef = React.useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const shouldListenRef = React.useRef(false);
  const [supported, setSupported] = React.useState(true);
  const [listening, setListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  React.useEffect(() => {
    onInterimRef.current = onInterim;
  }, [onInterim]);

  React.useEffect(() => {
    const SpeechRecognitionImpl =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionImpl) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result) {
          continue;
        }
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }
      if (interimTranscript && onInterimRef.current) {
        onInterimRef.current(interimTranscript.trim());
      }
      if (finalTranscript) {
        const normalized = finalTranscript
          .toLowerCase()
          .replace(/[\s、。！？!?.,]/g, "")
          .trim();
        const last = lastFinalRef.current;
        if (!last.text || last.text !== normalized || Date.now() - last.at > 1500) {
          lastFinalRef.current = { text: normalized, at: Date.now() };
          onFinalRef.current(finalTranscript.trim());
        }
        if (onInterimRef.current) {
          onInterimRef.current("");
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error || "microphone_error");
    };

    recognition.onend = () => {
      setListening(false);
      if (shouldListenRef.current) {
        try {
          recognition.start();
          setListening(true);
        } catch {
          setListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = React.useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }
    shouldListenRef.current = true;
    try {
      recognition.start();
      setListening(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const stop = React.useCallback(() => {
    const recognition = recognitionRef.current;
    shouldListenRef.current = false;
    if (!recognition) {
      return;
    }
    recognition.stop();
    setListening(false);
  }, []);

  return {
    supported,
    listening,
    error,
    start,
    stop,
  };
};
