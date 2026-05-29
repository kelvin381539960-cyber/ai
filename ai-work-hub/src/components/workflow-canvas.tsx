"use client";

import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { WorkflowDefinition } from "@/lib/types";

export function WorkflowCanvas({ definition }: { definition: WorkflowDefinition }) {
  const nodes: Node[] = definition.nodes.map((node) => ({
    id: node.id,
    position: { x: node.x, y: node.y },
    data: {
      label: (
        <div className="w-48">
          <div className="text-sm font-semibold text-slate-950">{node.title}</div>
          <div className="mt-1 text-xs text-slate-500">{node.type}</div>
          <div className="mt-2 text-xs leading-5 text-slate-600">{node.description}</div>
        </div>
      ),
    },
    style: {
      border: "1px solid #cbd5e1",
      borderRadius: 8,
      padding: 12,
      width: 220,
      background: "#fff",
    },
  }));

  const edges: Edge[] = definition.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#475569", strokeWidth: 1.5 },
  }));

  return (
    <div className="h-[520px] overflow-hidden rounded-md border border-slate-200 bg-white">
      <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
