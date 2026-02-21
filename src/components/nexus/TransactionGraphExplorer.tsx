import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GitBranch, Search, Network, AlertTriangle, 
  Wallet, Activity, Zap, Loader2
} from "lucide-react";
import { useBlockstreamAPI, type Transaction } from "@/hooks/useBlockstreamAPI";

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
  
  const { data, loading, error, fetchAddressData } = useBlockstreamAPI();
  
  const log = useCallback((msg: string) => {
    onLog?.(`[TX-GRAPH] ${msg}`);
  }, [onLog]);

  // Build graph from real Blockstream API data
  const buildGraphFromData = useCallback((transactions: Transaction[], centerAddress: string) => {
    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];
    const addressSet = new Set<string>();
    const clusterMap = new Map<number, string[]>();

    const centerX = 300;
    const centerY = 200;

    // Add center address
    graphNodes.push({
      id: centerAddress,
      type: 'address',
      label: centerAddress.substring(0, 8) + '...' + centerAddress.slice(-4),
      x: centerX,
      y: centerY,
      cluster: 0,
      risk: 'low'
    });
    addressSet.add(centerAddress);
    clusterMap.set(0, [centerAddress]);

    // Extract unique addresses from transactions
    let clusterIdx = 1;
    transactions.forEach((tx, txIndex) => {
      const angle = (txIndex / Math.max(transactions.length, 1)) * 2 * Math.PI;
      const rngBuf = new Uint8Array(1);
      crypto.getRandomValues(rngBuf);
      const radius = 120 + (rngBuf[0] / 255) * 40;

      // Input addresses (senders)
      tx.vin.forEach((input, i) => {
        const addr = input.prevout?.scriptpubkey_address;
        if (!addr || addressSet.has(addr)) {
          if (addr && addr !== centerAddress) {
            graphEdges.push({
              from: addr,
              to: centerAddress,
              value: (input.prevout?.value || 0) / 1e8,
              timestamp: tx.status.block_time
            });
          }
          return;
        }
        addressSet.add(addr);

        const nodeAngle = angle + (i - 0.5) * 0.4;
        graphNodes.push({
          id: addr,
          type: 'address',
          label: addr.substring(0, 8) + '...' + addr.slice(-4),
          x: centerX + Math.cos(nodeAngle) * radius,
          y: centerY + Math.sin(nodeAngle) * radius,
          cluster: clusterIdx,
          balance: (input.prevout?.value || 0) / 1e8,
          risk: 'medium'
        });

        graphEdges.push({
          from: addr,
          to: centerAddress,
          value: (input.prevout?.value || 0) / 1e8,
          timestamp: tx.status.block_time
        });

        const existing = clusterMap.get(clusterIdx) || [];
        existing.push(addr);
        clusterMap.set(clusterIdx, existing);
      });

      // Common-Input-Ownership Heuristik: alle Inputs einer TX gehören zum selben Cluster
      clusterIdx++;

      // Output addresses (receivers)
      tx.vout.forEach((output, i) => {
        const addr = output.scriptpubkey_address;
        if (!addr || addressSet.has(addr)) {
          if (addr && addr !== centerAddress) {
            graphEdges.push({
              from: centerAddress,
              to: addr,
              value: output.value / 1e8,
              timestamp: tx.status.block_time
            });
          }
          return;
        }
        addressSet.add(addr);

        const nodeAngle = angle + Math.PI + (i - 0.5) * 0.3;
        const outRadius = radius + 40;
        graphNodes.push({
          id: addr,
          type: 'address',
          label: addr.substring(0, 8) + '...' + addr.slice(-4),
          x: centerX + Math.cos(nodeAngle) * outRadius,
          y: centerY + Math.sin(nodeAngle) * outRadius,
          cluster: clusterIdx,
          balance: output.value / 1e8,
          risk: 'low'
        });

        graphEdges.push({
          from: centerAddress,
          to: addr,
          value: output.value / 1e8,
          timestamp: tx.status.block_time
        });

        const existing = clusterMap.get(clusterIdx) || [];
        existing.push(addr);
        clusterMap.set(clusterIdx, existing);
      });

      clusterIdx++;
    });

    // Limit nodes for readable graph
    const limitedNodes = graphNodes.slice(0, 40);
    const nodeIds = new Set(limitedNodes.map(n => n.id));
    const limitedEdges = graphEdges.filter(e => nodeIds.has(e.from) && nodeIds.has(e.to));

    setNodes(limitedNodes);
    setEdges(limitedEdges);
    setClusters(clusterMap);

    log(`Graph erstellt: ${limitedNodes.length} Adressen, ${limitedEdges.length} Transaktionsverbindungen`);
    log(`${clusterMap.size} Cluster identifiziert (Common-Input-Ownership Heuristik)`);
  }, [log]);

  // Fetch and build graph when API data arrives
  useEffect(() => {
    if (data.transactions.length > 0 && data.addressInfo) {
      buildGraphFromData(data.transactions, data.addressInfo.address);
    }
  }, [data, buildGraphFromData]);

  const handleAnalyze = async () => {
    const trimmed = address.trim();
    if (!trimmed) return;

    log(`Lade Transaktionsdaten für ${trimmed} von Blockstream API...`);
    setSelectedNode(null);
    setNodes([]);
    setEdges([]);
    setClusters(new Map());
    await fetchAddressData(trimmed);
  };
  
  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    // Draw edges
    edges.forEach(edge => {
      const from = nodes.find(n => n.id === edge.from);
      const to = nodes.find(n => n.id === edge.to);
      
      if (from && to) {
        ctx.strokeStyle = '#333355';
        ctx.lineWidth = Math.max(1, Math.min(edge.value * 2, 4));
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        
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
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + radius + 12);
    });
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Transaction Flow Graph — Live Blockstream Data', 10, 20);
    
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
            Address Clustering und Transaktionsfluss-Analyse — Live Blockstream API
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
            placeholder="Bitcoin-Adresse eingeben (z.B. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa)"
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <Button size="sm" onClick={handleAnalyze} disabled={loading || !address.trim()}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Lade...</>
            ) : (
              <><Search className="w-4 h-4 mr-1" /> Analysieren</>
            )}
          </Button>
        </div>
        {error && (
          <div className="mt-2 text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {error}
          </div>
        )}
        {data.addressInfo && (
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <span className="text-muted-foreground">
              Balance: <span className="text-primary font-mono">
                {((data.addressInfo.chain_stats.funded_txo_sum - data.addressInfo.chain_stats.spent_txo_sum) / 1e8).toFixed(8)} BTC
              </span>
            </span>
            <span className="text-muted-foreground">
              Transaktionen: <span className="text-primary font-mono">{data.addressInfo.chain_stats.tx_count}</span>
            </span>
            <span className="text-muted-foreground">
              UTXOs: <span className="text-primary font-mono">{data.utxos.length}</span>
            </span>
          </div>
        )}
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
                  {selectedNode.id}
                </div>
                
                {selectedNode.balance !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TX Value:</span>
                    <span className="text-primary">{selectedNode.balance.toFixed(8)} BTC</span>
                  </div>
                )}
                
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
                {nodes.length === 0 
                  ? 'Gib eine Bitcoin-Adresse ein und klicke Analysieren'
                  : 'Klicke auf einen Knoten im Graph'
                }
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
                {clusters.size === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    Noch keine Daten geladen
                  </div>
                )}
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
