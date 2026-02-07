import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/ui/IconBox";
import { getMeetingTypeIcon } from "@/data/icons";
import type { MeetingType } from "@/data/meetingPrepData";

interface MeetingTypeCardProps {
  meeting: MeetingType;
  onClick: () => void;
  isSelected?: boolean;
}

export function MeetingTypeCard({ meeting, onClick, isSelected }: MeetingTypeCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group",
        isSelected && "border-2 border-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <CardHeader>
        <IconBox icon={getMeetingTypeIcon(meeting.id)} size="lg" className="mb-2" />
        <CardTitle className="text-lg">{meeting.name}</CardTitle>
        <CardDescription>{meeting.goal}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-3">
          {meeting.participants.length} Teilnehmer-Rollen
        </div>
        <span className="inline-flex items-center text-primary font-medium text-sm">
          Vorbereiten
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </CardContent>
    </Card>
  );
}
