"use client";

import {
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from "react";

function getPreferredRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const mimeTypes = [
    "audio/webm;codecs=opus",
    "audio/mp4",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];

  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? "";
}

function getExtensionForMimeType(mimeType: string) {
  if (mimeType.includes("mp4")) {
    return "m4a";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  return "webm";
}

function MicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 2.75a2.75 2.75 0 0 1 2.75 2.75v4.5a2.75 2.75 0 1 1-5.5 0V5.5A2.75 2.75 0 0 1 10 2.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M5.75 9.75a4.25 4.25 0 1 0 8.5 0M10 14v3.25M7.5 17.25h5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function StopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <rect
        x="5.25"
        y="5.25"
        width="9.5"
        height="9.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 12.75V4.75M10 4.75l-3 3M10 4.75l3 3M4.75 13.25v1A1.75 1.75 0 0 0 6.5 16h7a1.75 1.75 0 0 0 1.75-1.75v-1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ClearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="m6 6 8 8M14 6l-8 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function AudioActionButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`button-secondary inline-flex items-center gap-2 !px-4 !py-3 disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function AudioUploadField({
  inputClassName = "field file-field",
  label,
  name,
}: {
  inputClassName?: string;
  label: string;
  name: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [previewUrl]);

  function attachFile(file: File, nextMessage?: string) {
    const transfer = new DataTransfer();
    transfer.items.add(file);

    if (inputRef.current) {
      inputRef.current.files = transfer.files;
    }

    setSelectedFileName(file.name);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return URL.createObjectURL(file);
    });

    if (nextMessage) {
      setMessage(nextMessage);
    }
  }

  async function startRecording() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMessage("Recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getPreferredRecordingMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener("stop", () => {
        const nextMimeType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: nextMimeType });
        const extension = getExtensionForMimeType(nextMimeType);
        const file = new File([blob], `recording-${Date.now()}.${extension}`, {
          type: nextMimeType,
        });

        attachFile(file, "Recorded audio attached to this form.");
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        chunksRef.current = [];
      });

      mediaRecorder.start();
      setIsRecording(true);
      setMessage("Recording… press Stop when finished.");
    } catch {
      setMessage("Microphone access was blocked or unavailable.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  function clearAudio() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedFileName(null);
    setMessage("Attached recording cleared.");
    setIsRecording(false);
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    chunksRef.current = [];

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFileName(null);
      setPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        return null;
      });
      return;
    }

    attachFile(file, "Audio file attached to this form.");
  }

  const hasAttachedAudio = Boolean(selectedFileName);

  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="audio/*"
        capture="user"
        className="sr-only"
        onChange={handleFileChange}
      />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <button
          type="button"
          className={`${inputClassName} flex items-center justify-between gap-4 text-left hover:border-[rgba(27,48,62,0.2)]`}
          onClick={() => inputRef.current?.click()}
        >
          <span className="inline-flex min-w-0 items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#eef3f7] text-muted">
              <UploadIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">Upload Audio File</span>
              <span className="block truncate text-sm font-normal text-muted">
                {selectedFileName ?? "Choose an audio clip from this device"}
              </span>
            </span>
          </span>
        </button>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          {!isRecording && !hasAttachedAudio ? (
            <AudioActionButton type="button" onClick={startRecording}>
              <MicIcon className="h-4 w-4" />
              Record in Browser
            </AudioActionButton>
          ) : (
            isRecording ? (
              <AudioActionButton type="button" onClick={stopRecording}>
                <StopIcon className="h-4 w-4" />
                Stop Recording
              </AudioActionButton>
            ) : null
          )}

          {hasAttachedAudio ? (
            <AudioActionButton type="button" onClick={clearAudio}>
              <ClearIcon className="h-4 w-4" />
              Clear
            </AudioActionButton>
          ) : null}
        </div>
      </div>
      {message ? <p className="text-sm font-normal text-muted">{message}</p> : null}
      {previewUrl ? (
        <audio controls className="w-full">
          <source src={previewUrl} />
        </audio>
      ) : null}
    </label>
  );
}
