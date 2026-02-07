import { challengeRollen } from "@/data/content";
import { Badge } from "@/components/ui/badge";

export function TutorChallengeTeaser() {
  return (
    <div className="bg-gradient-to-r from-primary/5 to-amber-500/5 border border-primary/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎭</span>
        <h3 className="text-lg font-semibold">
          Stakeholder-Challenge
        </h3>
        <Badge className="bg-primary text-primary-foreground text-xs">
          NEU
        </Badge>
      </div>
      
      <p className="text-muted-foreground mb-4">
        Übe schwierige Gespräche mit simulierten Stakeholdern – bevor sie in echt passieren!
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {challengeRollen.map((rolle) => (
          <div 
            key={rolle.id}
            className="bg-background rounded-xl p-3 text-center border border-primary/10"
          >
            <span className="text-2xl">{rolle.emoji}</span>
            <p className="text-xs font-medium mt-1">{rolle.name}</p>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Tippe im Tutor einfach{" "}
        <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
          challenge
        </code>{" "}
        um zu starten.
      </p>
    </div>
  );
}
