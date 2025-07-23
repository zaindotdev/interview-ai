import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorX,
  MonitorUp,
  PhoneOff,
} from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface ActionButtonsProps {
  mediaState: {
    video: boolean;
    audio: boolean;
    screenShare: boolean;
  };
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => void;
  endSession: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  mediaState,
  toggleVideo,
  toggleAudio,
  toggleScreenShare,
  endSession,
}) => {
  const actionButtons = [
    {
      icon: mediaState.video ? Video : VideoOff,
      label: "Toggle Video",
      action: toggleVideo,
      active: mediaState.video,
    },
    {
      icon: mediaState.audio ? Mic : MicOff,
      label: "Toggle Audio",
      action: toggleAudio,
      active: mediaState.audio,
    },
    {
      icon: mediaState.screenShare ? MonitorX : MonitorUp,
      label: "Screen Share",
      action: toggleScreenShare,
      active: mediaState.screenShare,
    },
    {
      icon: PhoneOff,
      label: "End Session",
      action: endSession,
      active: false,
      variant: "destructive" as const,
    },
  ];
  return (
    <div className="w-full ml-auto">
      <div className="action-buttons ">
        <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-br from-primary to-orange-700 bg-clip-text">
          Actions
        </h2>
        <div className="bg-primary-30 p-8 rounded-xl w-full flex items-center justify-center">
          <div className="flex items-center justify-around gap-2 p-4 rounded-xl shadow-lg bg-primary/10 md:w-2/3 w-full">
            {actionButtons.map((action, idx) => {
              return (
                <Tooltip key={`action-tooltip-${idx}`}>
                  <TooltipTrigger asChild>
                    <Button
                      className="cursor-pointer"
                      size={"lg"}
                      variant={idx < 3 ? "ghost" : "default"}
                      onClick={action.action}
                    >
                      <action.icon size={24} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
