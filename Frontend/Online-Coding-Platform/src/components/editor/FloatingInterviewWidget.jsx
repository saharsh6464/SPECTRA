import { useState, useRef, useEffect } from "react";
import {
    Bot,
    Mic,
    MicOff,
    PhoneOff,
    Minimize2,
    Play,
} from "lucide-react";

export default function FloatingInterviewWidget({ clientSecret }) {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState("ready");
    const [micEnabled, setMicEnabled] = useState(true);

    const pc = useRef(null);
    const audioEl = useRef(null);
    const streamRef = useRef(null);
    const dataChannel = useRef(null);

    const statusText = {
        ready: "Ready to start",
        connecting: "Connecting...",
        connected: "Connected",
        speaking: "AI is speaking...",
        listening: "Listening...",
        ended: "Interview Ended"
    };

    // Keep microphone state in sync with local stream track
    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = micEnabled;
            });
        }
    }, [micEnabled]);

    const startInterview = async () => {
        if (!clientSecret) {
            console.error("No client secret provided");
            return;
        }

        try {
            setStatus("connecting");

            // 1. Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // 2. Create RTCPeerConnection
            pc.current = new RTCPeerConnection();

            // 3. Add audio element for playing AI response
            audioEl.current = document.createElement("audio");
            audioEl.current.autoplay = true;

            // 4. Handle incoming tracks
            pc.current.ontrack = e => {
                audioEl.current.srcObject = e.streams[0];
            };

            // 5. Add local microphone track
            stream.getTracks().forEach(track => {
                track.enabled = micEnabled; // Ensure current mute state is respected
                pc.current.addTrack(track, stream);
            });

            // 6. Data channel for events
            const dc = pc.current.createDataChannel("oai-events");
            dataChannel.current = dc;
            dc.addEventListener("message", (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    // Minimal handling of AI conversation state
                    if (msg.type === "response.audio.delta" || msg.type === "response.audio.started") {
                        setStatus("speaking");
                    } else if (msg.type === "input_audio_buffer.speech_started") {
                        setStatus("listening");
                    } else if (msg.type === "response.done" || msg.type === "response.audio.done") {
                        setStatus("listening");
                    }
                } catch (err) {
                    console.error("Failed to parse event", err);
                }
            });

            // 7. Create offer and set local description
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);

            // 8. Connect to OpenAI Realtime WebRTC endpoint (GA)
            const sdpResponse = await fetch(
                "https://api.openai.com/v1/realtime/calls",
                {
                    method: "POST",
                    body: offer.sdp,
                    headers: {
                        Authorization: `Bearer ${clientSecret}`,
                        "Content-Type": "application/sdp",
                    },
                }
            );

            if (!sdpResponse.ok) {
                const errorText = await sdpResponse.text();

                console.error("OpenAI error:", errorText);

                throw new Error(
                    `Failed to connect to OpenAI: ${errorText}`
                );
            }

            const answer = {
                type: "answer",
                sdp: await sdpResponse.text(),
            };

            await pc.current.setRemoteDescription(answer);

            setStatus("listening"); // By default start listening
        } catch (error) {
            console.error("Failed to start interview", error);
            setStatus("ready");
            stopInterview();
        }
    };

    const stopInterview = () => {
        setStatus("ended");

        // Clean up tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }

        // Clean up peer connection
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }

        // Clean up audio element
        if (audioEl.current) {
            audioEl.current.pause();
            audioEl.current.srcObject = null;
            audioEl.current = null;
        }

        setTimeout(() => setIsOpen(false), 2000); // Close visually after a short delay
    };

    // Ensure cleanup if component unmounts
    useEffect(() => {
        return () => {
            stopInterview();
        };
    }, []);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white shadow-2xl transition hover:scale-105"
            >
                <Bot size={24} />
                <span className="font-semibold">AI Interview</span>
                {status !== "ready" && status !== "ended" && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse border-2 border-slate-900" />
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl animate-in fade-in slide-in-from-bottom-5">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700 p-4">
                <div className="flex items-center gap-2 text-white">
                    <Bot className="text-violet-400" />
                    <span className="font-semibold text-sm">AI Interview</span>
                </div>

                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <Minimize2 size={18} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center p-6">

                {/* AI Avatar */}
                <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 shadow-lg">
                    <Bot size={45} className="text-white" />
                    {(status === "connecting" || status === "listening" || status === "speaking") && (
                        <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${status === "speaking" ? "bg-indigo-400 animate-pulse" : "bg-emerald-400"
                            }`} />
                    )}
                </div>

                <h3 className="text-lg font-semibold text-white">
                    Interviewer
                </h3>

                <p className={`mt-2 text-sm font-medium ${status === "speaking" ? "text-indigo-400" :
                    status === "listening" ? "text-emerald-400" :
                        status === "ended" ? "text-rose-400" :
                            "text-slate-400"
                    }`}>
                    {statusText[status]}
                </p>

                {/* Voice Visualizer (Simple CSS representation) */}
                <div className="mt-4 flex items-center gap-1 h-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`w-1 rounded-full bg-current transition-all duration-150 ${status === "speaking" ? "h-full animate-bounce text-indigo-400" :
                                status === "listening" ? "h-2 text-emerald-400" :
                                    "h-1 text-slate-700"
                                }`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>

                {/* Controls */}
                <div className="mt-6 flex gap-4">
                    {status === "ready" || status === "ended" ? (
                        <button
                            onClick={startInterview}
                            className="flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            <Play size={16} />
                            Start Interview
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setMicEnabled(!micEnabled)}
                                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${micEnabled
                                    ? "bg-slate-800 text-white hover:bg-slate-700"
                                    : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                                    }`}
                            >
                                {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>

                            <button
                                onClick={stopInterview}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20"
                            >
                                <PhoneOff size={20} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
