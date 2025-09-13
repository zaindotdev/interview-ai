import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SessionCardProps {
  avatar: ReactNode
  role: string
  name: string
  isSpeaking: boolean
}

const SessionCard = ({ avatar, role, name, isSpeaking }: SessionCardProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border p-4 transition-all duration-200",
        isSpeaking
          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
          : "border-border bg-card hover:bg-muted/50",
      )}
    >
      <div className="relative">
        {avatar}
        {isSpeaking && <div className="absolute -inset-1 rounded-full border-2 border-primary animate-pulse" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground truncate">{name}</h4>
        <p className="text-xs text-muted-foreground capitalize">{role}</p>
        {isSpeaking && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <span className="text-xs text-primary font-medium ml-1">Speaking...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionCard
