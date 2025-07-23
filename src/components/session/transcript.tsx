import { ScrollArea } from '../ui/scroll-area'
import { Send } from 'lucide-react'
import React, { useCallback, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Textarea } from '../ui/textarea'

const Transcript = () => {
    const [transcripts, setTranscripts] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const transcriptRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcripts]);

    const handleSend = useCallback(async () => {
        setIsLoading(true)
        try {
            const message = textareaRef.current?.value;
            textareaRef.current!.value = "";
            if (!message) return;
            setTranscripts((prev) => [
                ...prev,
                {
                    id: String(prev.length + 1),
                    message,
                    sender: "user",
                    timestamp: new Date(),
                },
            ]);
            setMessage("");
            setTimeout(async () => {
                setTranscripts((prev) => [
                    ...prev,
                    {
                        id: String(prev.length + 1),
                        message: "Thanks for starting the interview",
                        sender: "ai",
                        timestamp: new Date(),
                    },
                ]);
            }, 2000);
            if (!transcriptRef.current) return;
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false)
        }
    }, [textareaRef, transcriptRef.current]);
    return (
        <div className="mr-auto w-full">
            <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-br from-primary to-orange-700 bg-clip-text">
                Transcript
            </h2>
            <Card className="h-max w-full rounded-xl p-4 mt-4">
                <ScrollArea className="h-[40vh]">
                    <div ref={transcriptRef} className="h-60">
                        {transcripts.map((transcript, idx) => (
                            <div
                                key={`transcript-${idx}`}
                                className={`flex items-center gap-2 mt-2 ${transcript.sender === "user" ? "flex-row-reverse" : ""}`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full overflow-hidden ${transcript.sender === "user" ? "order-2" : "order-1"}`}
                                >
                                    <img
                                        src="/images/interviewer.jpg"
                                        alt="user"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div
                                    className={`p-2 rounded-xl ${transcript.sender === "user" ? "order-2 bg-primary/10 rounded-br-none" : "order-1 bg-gray-100 rounded-bl-none"}`}
                                >
                                    <p>{transcript.message}</p>
                                    <p className="text-xs text-gray-500">{transcript.timestamp.toLocaleTimeString()}</p>
                                    {isLoading && idx === transcripts.length - 1 && (
                                        <p className="text-xs text-gray-500">AI is thinking...</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex items-center gap-2">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        className="resize-none"
                        placeholder="Ask a question"
                        ref={textareaRef}
                    />
                    <Button onClick={handleSend} size={"icon"}>
                        <Send />
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default Transcript