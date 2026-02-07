import { cn } from "@/lib/utils";

type NodeStatus = 'active' | 'visited' | 'available' | 'inactive';

interface TreeVisualizationProps {
  currentNodeId: string;
  visitedNodes: string[];
}

// Mapping welche Nodes unter welchem Branch sind
const maleBranch = ["male", "male-adult", "male-child"];
const femaleBranch = ["female", "female-upper", "female-third"];

function getNodeStatus(
  nodeId: string, 
  currentNodeId: string, 
  visitedNodes: string[]
): NodeStatus {
  if (nodeId === currentNodeId) return 'active';
  if (visitedNodes.includes(nodeId)) return 'visited';
  
  const allVisited = [...visitedNodes, currentNodeId];
  
  if (allVisited.some(v => maleBranch.includes(v)) && femaleBranch.includes(nodeId)) {
    return 'inactive';
  }
  
  if (allVisited.some(v => femaleBranch.includes(v)) && maleBranch.includes(nodeId)) {
    return 'inactive';
  }
  
  return 'available';
}

function getLineColorClass(status: NodeStatus): string {
  if (status === 'inactive') return "bg-muted/30";
  if (status === 'visited' || status === 'active') return "bg-primary/50";
  return "bg-border";
}

function TreeNodeBox({ 
  label, 
  status, 
  small = false 
}: { 
  label: string; 
  status: NodeStatus;
  small?: boolean;
}) {
  const baseClasses = "rounded border text-center transition-all font-medium whitespace-nowrap";
  const sizeClasses = small 
    ? "px-1 py-0.5 text-[9px] md:px-2 md:py-1 md:text-xs" 
    : "px-2 py-1 text-xs md:px-3 md:py-1.5 md:text-sm";
  
  const statusClasses: Record<NodeStatus, string> = {
    active: "bg-primary text-primary-foreground border-primary shadow-md",
    visited: "bg-secondary text-secondary-foreground border-secondary",
    available: "bg-background border-border text-foreground",
    inactive: "bg-muted/30 text-muted-foreground/50 border-muted/50"
  };
  
  return (
    <div className={cn(baseClasses, sizeClasses, statusClasses[status])}>
      {label}
    </div>
  );
}

function ResultBadge({ 
  percent, 
  status,
  survived
}: { 
  percent: number; 
  status: NodeStatus;
  survived: boolean;
}) {
  const baseClasses = "rounded-full px-1.5 py-0.5 text-[9px] md:px-2 md:py-1 md:text-xs font-bold transition-all";
  
  const getStatusClasses = () => {
    if (status === 'inactive') {
      return "bg-muted/30 text-muted-foreground/50 border border-muted/50";
    }
    if (status === 'active' || status === 'visited') {
      return survived 
        ? "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/50"
        : "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/50";
    }
    return "bg-muted/50 text-muted-foreground border border-border";
  };
  
  return (
    <div className={cn(baseClasses, getStatusClasses())}>
      {percent}%
    </div>
  );
}

function ConnectorLine({ status }: { status: NodeStatus }) {
  return <div className={cn("w-px h-2 md:h-3", getLineColorClass(status))} />;
}

// T-förmige Verzweigung: vertikale Linie → horizontale Linie (ohne Kind-Linien)
function TSplitConnector({ status }: { status: NodeStatus }) {
  const colorClass = getLineColorClass(status);
  
  return (
    <div className="flex flex-col items-center w-full">
      {/* Vertikale Linie vom Parent nach unten */}
      <div className={cn("w-px h-2 md:h-3", colorClass)} />
      
      {/* Horizontale Linie über die volle Breite */}
      <div className={cn("h-px w-full", colorClass)} />
    </div>
  );
}

// Spalte für einen Blattknoten (mit oberer Linie für Alignment)
function LeafColumn({ 
  label, 
  percent, 
  survived,
  status 
}: { 
  label: string;
  percent: number;
  survived: boolean;
  status: NodeStatus;
}) {
  return (
    <div className="flex flex-col items-center min-w-[40px] md:min-w-[60px]">
      {/* Vertikale Linie von der horizontalen T-Linie zum Knoten */}
      <ConnectorLine status={status} />
      <TreeNodeBox label={label} status={status} small />
      <ConnectorLine status={status} />
      <ResultBadge percent={percent} status={status} survived={survived} />
    </div>
  );
}

// Branch mit T-Split zu Kindern
function BranchWithSplit({
  branchLabel,
  branchStatus,
  children
}: {
  branchLabel: string;
  branchStatus: NodeStatus;
  children: React.ReactNode;
}) {
  const colorClass = getLineColorClass(branchStatus);
  
  return (
    <div className="flex flex-col items-center">
      <TreeNodeBox label={branchLabel} status={branchStatus} />
      
      {/* Vertikale Linie nach unten */}
      <div className={cn("w-px h-2 md:h-3", colorClass)} />
      
      {/* Container für horizontale Linie + Kinder */}
      <div className="flex flex-col items-stretch">
        {/* Horizontale Linie (Breite = Breite der Kinder) */}
        <div className={cn("h-px", colorClass)} />
        
        {/* Kinder nebeneinander (mit eigenen vertikalen Linien) */}
        <div className="flex">
          {children}
        </div>
      </div>
    </div>
  );
}

export function TreeVisualization({ currentNodeId, visitedNodes }: TreeVisualizationProps) {
  const getStatus = (nodeId: string) => getNodeStatus(nodeId, currentNodeId, visitedNodes);
  
  // Für die Root-Verzweigung: Status basierend auf dem "aktiveren" Branch
  const maleStatus = getStatus("male");
  const femaleStatus = getStatus("female");
  const rootSplitStatus = 
    maleStatus === 'active' || maleStatus === 'visited' ? maleStatus :
    femaleStatus === 'active' || femaleStatus === 'visited' ? femaleStatus :
    'available';
  
  return (
    <div className="py-3 md:py-4 border-y border-border">
      <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3 text-center">
        Deine Position im Entscheidungsbaum:
      </p>
      
      <div className="flex flex-col items-center">
        {/* Level 0: Root */}
        <TreeNodeBox label="Geschlecht?" status={getStatus("start")} />
        
        {/* Vertikale Linie nach unten */}
        <div className={cn("w-px h-2 md:h-3", getLineColorClass(rootSplitStatus))} />
        
        {/* Container: Horizontale Linie + Branches */}
        <div className="flex flex-col items-stretch">
          {/* Horizontale Linie */}
          <div className={cn("h-px", getLineColorClass(rootSplitStatus))} />
          
          {/* Branches mit eigenen oberen Linien */}
          <div className="flex gap-2 md:gap-4">
            {/* Männlich-Branch mit oberer Verbindungslinie */}
            <div className="flex flex-col items-center">
              <ConnectorLine status={maleStatus} />
              <BranchWithSplit branchLabel="Männlich" branchStatus={getStatus("male")}>
                <LeafColumn 
                  label="Erwachsen" 
                  percent={17} 
                  survived={false}
                  status={getStatus("male-adult")} 
                />
                <LeafColumn 
                  label="Kind" 
                  percent={45} 
                  survived={true}
                  status={getStatus("male-child")} 
                />
              </BranchWithSplit>
            </div>
            
            {/* Weiblich-Branch mit oberer Verbindungslinie */}
            <div className="flex flex-col items-center">
              <ConnectorLine status={femaleStatus} />
              <BranchWithSplit branchLabel="Weiblich" branchStatus={getStatus("female")}>
                <LeafColumn 
                  label="1./2. Kl." 
                  percent={93} 
                  survived={true}
                  status={getStatus("female-upper")} 
                />
                <LeafColumn 
                  label="3. Klasse" 
                  percent={50} 
                  survived={true}
                  status={getStatus("female-third")} 
                />
              </BranchWithSplit>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
