import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GitBranch, Search, Network, AlertTriangle, 
  ArrowRight, Wallet, Activity, Zap
} from "lucide-react";

interface TransactionGraphExplorerProps {
  onLog?: (msg: string) => void;
}

interface GraphNode {
  id: string;
  type: 'address' | 'transaction';
  label: string;
  x: number;
  y: number;
  cluster?: number;
  balance?: number;
  risk?: 'high' | 'medium' | 'low';
}

interface GraphEdge {
  from: string;
  to: string;
  value: number;
  timestamp?: number;
}

const TransactionGraphExplorer = ({ onLog }: TransactionGraphExplorerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [address, setAddress] = useState("");
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [clusters, setClusters] = useState<Map<number, string[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  
  const log = useCallback((msg: string) => {
    onLog?.(`[TX-GRAPH] ${msg}`);
  }, [onLog]);
  
  // Generate demo graph
  const generateDemoGraph = useCallback(() => {
    setIsLoading(true);
    log("Generiere Demo-Transaktionsgraph...");
    
    const demoNodes: GraphNode[] = [];
    const demoEdges: GraphEdge[] = [];
    
    // Central address
    const centerX = 300;
    const centerY = 200;
    
    demoNodes.push({
      id: 'addr_0',
      type: 'address',
      label: '1A1zP1...NQFxR',
      x: centerX,
      y: centerY,
      cluster: 0,
      balance: 50.5,
      risk: 'low'
    });
    
    // Connected addresses in clusters
    for (let cluster = 0; cluster < 3; cluster++) {
      const clusterAngle = (cluster * 2 * Math.PI / 3) + Math.PI / 6;
      const clusterRadius = 150;
      
      for (let i = 0; i < 4; i++) {
        const angle = clusterAngle + (i - 1.5) * 0.3;
        const radius = clusterRadius + Math.random() * 50;
        
        const nodeId = `addr_${cluster}_${i}`;
        demoNodes.push({
          id: nodeId,
          type: 'address',
          label: `1${['B', 'C', 'D'][cluster]}${i}...${Math.random().toString(36).substr(2, 4)}`,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          cluster: cluster + 1,
          balance: Math.random() * 10,
          risk: cluster === 0 ? 'high' : cluster === 1 ? 'medium' : 'low'
        });
        
        demoEdges.push({
          from: 'addr_0',
          to: nodeId,
          value: Math.random() * 5,
          timestamp: Date.now() - Math.random() * 86400000 * 30
        });
        
        // Internal cluster connections
        if (i > 0) {
          demoEdges.push({
            from: `addr_${cluster}_${i-1}`,
            to: nodeId,
            value: Math.random() * 2,
            timestamp: Date.now() - Math.random() * 86400000 * 30
          });
        }
      }
    }
    
    setNodes(demoNodes);
    setEdges(demoEdges);
    
    // Build cluster map
    const clusterMap = new Map<number, string[]>();
    demoNodes.forEach(node => {
      if (node.cluster !== undefined) {
        const current = clusterMap.get(node.cluster) || [];
        current.push(node.id);
        clusterMap.set(node.cluster, current);
      }
    });
    setClusters(clusterMap);
    
    log(`Graph generiert: ${demoNodes.length} Adressen, ${demoEdges.length} Transaktionen`);
    log(`${clusterMap.size} Cluster identifiziert (Common-Input-Ownership Heuristik)`);
    setIsLoading(false);
  }, [log]);
  
  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    // Draw edges
    edges.forEach(edge => {
      const from = nodes.find(n => n.id === edge.from);
      const to = nodes.find(n => n.id === edge.to);
      
      if (from && to) {
        ctx.strokeStyle = '#333355';
        ctx.lineWidth = Math.max(1, Math.min(edge.value, 4));
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        
        // Arrow
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowX = to.x - Math.cos(angle) * 15;
        const arrowY = to.y - Math.sin(angle) * 15;
        
        ctx.fillStyle = '#333355';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 8 * Math.cos(angle - 0.3), arrowY - 8 * Math.sin(angle - 0.3));
        ctx.lineTo(arrowX - 8 * Math.cos(angle + 0.3), arrowY - 8 * Math.sin(angle + 0.3));
        ctx.fill();
      }
    });
    
    // Draw cluster backgrounds
    const clusterColors = ['rgba(255,0,100,0.1)', 'rgba(255,165,0,0.1)', 'rgba(0,255,100,0.1)', 'rgba(0,100,255,0.1)'];
    
    clusters.forEach((nodeIds, clusterId) => {
      const clusterNodes = nodes.filter(n => nodeIds.includes(n.id));
      if (clusterNodes.length < 2) return;
      
      const minX = Math.min(...clusterNodes.map(n => n.x)) - 30;
      const maxX = Math.max(...clusterNodes.map(n => n.x)) + 30;
      const minY = Math.min(...clusterNodes.map(n => n.y)) - 30;
      const maxY = Math.max(...clusterNodes.map(n => n.y)) + 30;
      
      ctx.fillStyle = clusterColors[clusterId % clusterColors.length];
      ctx.strokeStyle = clusterColors[clusterId % clusterColors.length].replace('0.1', '0.5');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 10);
      ctx.fill();
      ctx.stroke();
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      const radius = isSelected ? 14 : 10;
      
      // Node color based on risk
      const colors = {
        high: '#ff3366',
        medium: '#ffaa00',
        low: '#00ff88'
      };
      
      ctx.fillStyle = colors[node.risk || 'low'];
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + radius + 12);
    });
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Transaction Flow Graph', 10, 20);
    
  }, [nodes, edges, selectedNode, clusters]);
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const clickedNode = nodes.find(n => 
      Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < 15
    );
    
    setSelectedNode(clickedNode || null);
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-mono font-bold flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            Transaction Graph Explorer
          </h3>
          <p className="text-xs text-muted-foreground">
            Address Clustering und Transaktionsfluss-Analyse
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          {nodes.length} Nodes | {edges.length} Edges
        </Badge>
      </div>
      
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 font-mono text-xs"
            placeholder="Bitcoin Address eingeben..."
          />
          <Button size="sm" disabled title="Erfordert Blockstream API-Erweiterung — in Planung">
            <Search className="w-4 h-4 mr-1" />
            Analyze (API geplant)
          </Button>
          <Button size="sm" variant="secondary" onClick={generateDemoGraph} disabled={isLoading}>
            <Network className="w-4 h-4 mr-1" />
            Demo Graph
          </Button>
        </div>
      </Card>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph Canvas */}
        <Card className="lg:col-span-2 p-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full rounded-lg cursor-pointer"
            onClick={handleCanvasClick}
          />
          
          {/* Legend */}
          <div className="flex gap-4 mt-3 pt-3 border-t border-border text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ff3366]" />
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ffaa00]" />
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#00ff88]" />
              <span>Low Risk</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-3 rounded bg-[rgba(255,0,100,0.3)]" />
              <span>Cluster</span>
            </div>
          </div>
        </Card>
        
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Node */}
          {selectedNode ? (
            <Card className="p-4">
              <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Address Details
              </h4>
              
              <div className="space-y-2 text-xs">
                <div className="font-mono bg-muted/30 p-2 rounded break-all">
                  {selectedNode.label}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="text-primary">{selectedNode.balance?.toFixed(4)} BTC</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cluster:</span>
                  <Badge variant="outline">{selectedNode.cluster}</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk:</span>
                  <Badge 
                    variant={selectedNode.risk === 'high' ? 'destructive' : 'secondary'}
                    className={selectedNode.risk === 'medium' ? 'bg-orange-500' : ''}
                  >
                    {selectedNode.risk?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="text-center text-muted-foreground text-sm py-8">
                Klicke auf einen Knoten
              </div>
            </Card>
          )}
          
          {/* Clusters */}
          <Card className="p-4">
            <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              Identified Clusters
            </h4>
            
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {Array.from(clusters.entries()).map(([id, nodeIds]) => (
                  <div key={id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                    <span>Cluster {id}</span>
                    <Badge variant="outline">{nodeIds.length} addresses</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
          
          {/* Heuristics */}
          <Card className="p-4">
            <h4 className="text-sm font-mono font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Clustering Heuristics
            </h4>
            
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-primary" />
                <span>Common-Input-Ownership</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-primary" />
                <span>Change Address Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-primary" />
                <span>Taint Analysis</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransactionGraphExplorer;
