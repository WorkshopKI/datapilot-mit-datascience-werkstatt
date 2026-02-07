import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

interface TutorCTAProps {
  className?: string;
}

export function TutorCTA({ className }: TutorCTAProps) {
  return (
    <div className={className}>
      <div className="rounded-lg bg-muted/50 p-6 border border-border/50">
        <p className="text-muted-foreground mb-4">
          Wende das Gelernte praktisch an!
        </p>
        <Button asChild variant="secondary" className="gap-2">
          <Link to="/ki-assistenten/tutor">
            <Bot className="h-4 w-4" />
            Im KI Tutor ausprobieren
          </Link>
        </Button>
      </div>
    </div>
  );
}
