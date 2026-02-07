import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, CheckCircle2, MessageSquare, ClipboardCheck } from "lucide-react";
import type { MeetingType, CheckItem, QuestionGroup } from "@/data/meetingPrepData";

interface MeetingDetailProps {
  meeting: MeetingType;
}

export function MeetingDetail({ meeting }: MeetingDetailProps) {
  // Local state for checkboxes (not persisted)
  const [beforeChecks, setBeforeChecks] = useState<Record<string, boolean>>({});
  const [afterChecks, setAfterChecks] = useState<Record<string, boolean>>({});

  const toggleBefore = (id: string) => {
    setBeforeChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAfter = (id: string) => {
    setAfterChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const beforeProgress = Object.values(beforeChecks).filter(Boolean).length;
  const afterProgress = Object.values(afterChecks).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <div className="text-4xl mb-3">{meeting.emoji}</div>
        <h1 className="text-2xl font-bold mb-2">{meeting.name}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{meeting.description}</p>
      </div>

      {/* Goal & Participants */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Ziel des Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{meeting.goal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Typische Teilnehmer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {meeting.participants.map((p, i) => (
                <li key={i} className="text-sm text-muted-foreground">• {p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Before Meeting Checklist */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Vor dem Meeting
          <Badge variant="secondary" className="ml-2">
            {beforeProgress}/{meeting.beforeMeeting.length}
          </Badge>
        </h2>
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {meeting.beforeMeeting.map((item: CheckItem) => (
                <div key={item.id} className="flex items-start gap-3">
                  <Checkbox 
                    id={item.id}
                    checked={beforeChecks[item.id] || false}
                    onCheckedChange={() => toggleBefore(item.id)}
                    className="mt-0.5"
                  />
                  <label 
                    htmlFor={item.id}
                    className="text-sm cursor-pointer"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Questions by Category */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Fragen für das Meeting
        </h2>
        <div className="space-y-4">
          {meeting.questions.map((group: QuestionGroup, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{group.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {group.items.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary shrink-0">→</span>
                      <span className="text-muted-foreground">{q}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Red Flags */}
      {meeting.redFlags.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Red Flags – Worauf achten?
          </h2>
          <div className="space-y-3">
            {meeting.redFlags.map((flag, index) => (
              <div 
                key={index}
                className="bg-destructive/5 border-l-4 border-destructive p-4 rounded-r-lg"
              >
                <p className="text-sm">{flag}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* After Meeting Checklist */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Nach dem Meeting
          <Badge variant="secondary" className="ml-2">
            {afterProgress}/{meeting.afterMeeting.length}
          </Badge>
        </h2>
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {meeting.afterMeeting.map((item: CheckItem) => (
                <div key={item.id} className="flex items-start gap-3">
                  <Checkbox 
                    id={item.id}
                    checked={afterChecks[item.id] || false}
                    onCheckedChange={() => toggleAfter(item.id)}
                    className="mt-0.5"
                  />
                  <label 
                    htmlFor={item.id}
                    className="text-sm cursor-pointer"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
