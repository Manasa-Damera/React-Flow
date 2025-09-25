import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  getNodesBounds,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ActionNode from "./Action";
import Sidebar from "./Sidebar";
import "./ActionNode.css"
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import GroupNode from "./NodeResizer";

const nodeTypes = { 
  action: ActionNode,
  group : GroupNode,
 };

 const defaultEdgeOptions = {
  type:"straight",
  animated:true,
  deletable:true,
  selectable:true,
  label:"any label",
  style:{stroke:"#4caf50"},
  markerEnd: {
      type: MarkerType.Arrow,
    },
 }
// Group node positions

 const findContainingGroup = (position, groups) => {
  return groups.find((group) => {
    const { x, y } = group.position;
    const w = group.style?.width || 0;
    const h = group.style?.height || 0;

    return (
      position.x > x &&
      position.x < x + w &&
      position.y > y &&
      position.y < y + h
    );
  });
};

const sortNodes = (nodes)=>{
  return [...nodes].sort((a,b)=>{
    if(a.type === "group" && b.type !== "group") return -1;
    if(b.type ==="group" && a.type !== "group") return 1;

    if(a.id === b.parentId) return -1;
    if(b.id === a.parentId) return 1;

    return 0;
  })
}

export default function FlowEditor() {
  const [nodes, _setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editEdge,setEditEdge] = useState(null);
  const [selectedNodes,setSelectedNodes]=useState([]);
  const [flowData,setFlowData]=useState({name:"",description:""});
  const [reactFlowInstance,setReactFlowInstance]=useState(null)
  const { screenToFlowPosition } = useReactFlow();
  const formRef=useRef(null);
  const containerRef=useRef(null);
  const navigate=useNavigate()
  const {id}=useParams()
  const [showSaveForm,setShowSaveForm]=useState(false);

  console.log("nodes",nodes)
  console.log("edges: ",edges)


const setNodes = useCallback(
  (updater) => {
    _setNodes((prev) => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      return sortNodes(updated);
    });
  },
  [_setNodes]
);

// For local storage
useEffect(()=>{
  if(id){
    const flows=JSON.parse(localStorage.getItem("flows")||"[]");
    const selected=flows.find((f)=>f.id===Number(id));
    if(selected){
      setNodes(selected.nodes||[]);
      setEdges(selected.edges||[]);
      setFlowData(selected.data||{name:"",description:""})
    }
  }
},[id]);

// handling clicks
useEffect(()=>{
  const handleClickOutside=(event)=>{
    if(formRef.current && 
      formRef.current&&
      !formRef.current.contains(event.target)
    ){
      setEditEdge(null);
    }
  }
  const container=containerRef.current;
  if(container){
    container.addEventListener("mousedown",handleClickOutside);
  }
  return()=>{
    if(container){
      container.removeEventListener("mousedown",handleClickOutside);
    }
  }
  },[editEdge]);


// --- Drop New Node ---
const onDrop = useCallback(
  (event) => {
    event.preventDefault();   
    const type = event.dataTransfer.getData("application/reactflow");
    if (!type) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y:event.clientY,
    })
    
    const id = `${+new Date()}`;
    let newNode;
    const group = nodes.find((n)=>{
      if(n.type !== "group") return false;

    const {x,y}=n.position;
    const w = n.style.width;
    const h = n.style.height;

    return (
       position.x > x &&
        position.x < x + w &&
        position.y > y &&
        position.y < y + h
    )
    });

    console.log(group,"testing")

      if (group) {
      // dropped inside a group → make it child
      newNode = {
        id,
        type: type === "group" ? "group" : "action",
        position: {
          x: position.x - group.position.x, // relative to group
          y: position.y - group.position.y,
        },
        parentId: group.id,
        extent: "parent",
        data: { label: `${type} node`,
      description:"",
    },
      };
    } else {
      // dropped on canvas (outside group)
      newNode = {
        id,
        type: type === "group" ? "group" : "action",
        position,
        data: { label: `${type} node` ,
       description:"",
            },
        style:
          type === "group"
            ? {
                width: 200,
                height: 150,
                border: "2px dashed #333",
                background: "#fafafa",
              }
            : {},
      };
    }
    setNodes((nds) => nds.concat(newNode));
  },
  [setNodes, screenToFlowPosition, nodes]
);

      const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }, []);

      // for connecting edges
      const onConnect=useCallback(
            (params)=>
            {setEdges((eds)=>
                    addEdge({...params},eds))
            },
            [setEdges]
        )

    // save only when there is node present
  const handleSaveClick=()=>{
    // console.log(id)
    if(nodes.length===0){
      alert("Add at least one node to save the flow.");
      return;
    }
    if(id){
      onSave()
    }
    else{
      setShowSaveForm(true);
    }
  }

  // --- Save Flow ---
  const onSave = useCallback(() => {
    if(!id && !flowData.name.trim()){
      alert("Please provide a name for the flow.");
      return;
    }

    const flow = { 
      id: id ? Number(id) : Date.now(),
      nodes, 
      edges,
      data:flowData,

      // storing in localHost
     };
     
    try {
    const existing=JSON.parse(localStorage.getItem("flows")||"[]");

    const index=existing.findIndex((f)=>f.id===flow.id);

    if (index>-1){
      existing[index]=flow;
    }
    else{
      existing.push(flow);
    }
    
    alert("Flow saved!");
    localStorage.setItem("flows",JSON.stringify(existing));
      navigate("/");
      setShowSaveForm(false);

      if(!id){
        setFlowData({name:"",description:""});
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
  }, [nodes, edges, flowData]);

  // --- Restore Flow ---
  const onRestore = useCallback(() => {
    try {
      const flow = JSON.parse(localStorage.getItem("flows"));
      if (flow) {
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        alert("Flow restored!");
      } else {
        alert("No saved flow found.");
      }
    } catch (err) {
      console.error("Failed to restore:", err);
    }
  }, []);   

  // edges update

 const onEdgeClick = useCallback((event, edge) => {
    setEditEdge({
      id: edge.id,
      type: edge.type || "straight",
      label: edge.label || "",
      animated: edge.animated || false,
      stroke:edge.style?.stroke || '#4caf50',
      markerEnd: edge.markerEnd || defaultEdgeOptions.markerEnd,
    });
  }, []);

   const handleEdgeUpdate = (id, newData) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === id
          ? {
              ...e,
              type: newData.type || "straight",
              label: newData.label || "",
              animated: newData.animated,
              style:{
                ...e.style,
                stroke:newData.stroke,
              },
            }
          : e
      )
    );
    setEditEdge(null);
  };

    const handleNodesChange = useCallback((changes)=>{
      onNodesChange(changes);
    },
    [onNodesChange])



    // handling positions of child
    const onNodeDragStop = useCallback(
  (event, node) => {
    // console.log("node", node);
    // console.log("event ", event);

    setNodes((nds) => {
      const groups = nds.filter((n) => n.type === "group");
      const group = findContainingGroup(node.position, groups);
      
// if position of child is inside of the group
      if (group) {
        return nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                parentId: group.id,
                extent: "parent",
                position:
                  n.parentId === group.id
                    ? n.position
                    : {
                        x: node.position.x - group.position.x,
                        y: node.position.y - group.position.y,
                      },
              }
            : n
        );
      }
      return nds;
    });
  },
  [setNodes]
)

//  console.log("setEditNode",setEditNode)

 const handleEdgeDelete = () => {
    if (!editEdge) return;
    if (window.confirm("Are you sure you want to delete this edge?")) {
      setEdges((eds) => eds.filter((e) => e.id !== editEdge.id));
      setEditEdge(null);
      alert("Edge deleted!");
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
        sx={{ position: "absolute", top: 30, right: 30, zIndex: 1000 }}
      >
        Home
      </Button>
      
      <div ref={containerRef} style={{ height: "100vh", width: "100vw" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultEdgeOptions={defaultEdgeOptions}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        onPaneClick={()=>setEditEdge(null)}
        proOptions={{hideAttribution:true}}
        onEdgeClick={onEdgeClick}
        fitView
        onNodeClick={(evt, node) => console.log('node clicked', node)}
        onSelectionChange={({ nodes, edges }) => {
          console.log('selection changed:', nodes);
        setSelectedNodes(nodes);
        }}
        onInit={setReactFlowInstance}
        onNodeDragStop={onNodeDragStop} 
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <Sidebar onSave={onSave} onRestore={onRestore} handleSaveClick={handleSaveClick} />

      {editEdge && (
          <div className="edit-form-popup" ref={formRef}>
            <h3>Edit Edge</h3>

            <label>Type: </label>
            <select
              value={editEdge.type}
              onChange={(e) =>
                setEditEdge({ ...editEdge, type: e.target.value })
              }
            >
              <option value="straight">Straight</option>
              <option value="bezier">Bezier</option>
              <option value="step">Step</option>
              <option value="smoothstep">Smoothstep</option>
            </select> <br/>

            <label>Label :</label>
            <input
              type="text"
              value={editEdge.label}
              onChange={(e) =>
                setEditEdge({ ...editEdge, label: e.target.value })
              }
              placeholder="Edge Label"
            />
            <label >Animated : </label>
            <select
              value={editEdge.animated.toString()}
              onChange={(e) =>
                setEditEdge({ ...editEdge, animated: e.target.value === "true"})
              }
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select> <br/>
            <label>Edge Color: </label>
    <input
      type="color"
      value={editEdge.stroke || "#4caf50"}
      onChange={(e) => setEditEdge({ ...editEdge, stroke: e.target.value, markerEnd: { ...editEdge.markerEnd, color: e.target.value } })}
    />
    <div className="form-buttons">
      <button
        onClick={() =>
          handleEdgeUpdate(editEdge.id, {
            type: editEdge.type,
            label: editEdge.label,
            animated: editEdge.animated,
            stroke: editEdge.stroke,
          })
                }
              >
                Save
              </button>
              <button onClick={() => setEditEdge(null)}>Cancel</button>
              <button onClick={() => handleEdgeDelete()}>Delete Edge</button>
            </div>
          </div>
        )}

      {showSaveForm && (
        <div className="save-form-popup">
          <h3>Save Flow</h3>
          <input
            type="text"
            placeholder="Flow Name"
            value={flowData.name}
            onChange={(e) => setFlowData({ ...flowData, name: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={flowData.description}
            onChange={(e) => setFlowData({ ...flowData, description: e.target.value })}
          />
          <div className="form-buttons">
            <button onClick={onSave}>Save</button>
            <button onClick={() => setShowSaveForm(false)}>Cancel</button>
          </div>
       </div>
      )}
    </div>
    </>
  );
}

