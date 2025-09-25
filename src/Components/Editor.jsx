// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ReactFlow,
//   addEdge,
//   Background,
//   Controls,
//   MiniMap,
//   useNodesState,
//   useEdgesState,
//   useReactFlow,
//   getNodesBounds,
//   MarkerType,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";
// import ActionNode from "./Action";
// import Sidebar from "./Sidebar";
// import "./ActionNode.css"
// import { useNavigate, useParams } from "react-router-dom";
// import { Button } from "@mui/material";
// import GroupNode from "./NodeResizer";

// const nodeTypes = { 
//   action: ActionNode,
//   group : GroupNode,
//  };

//  const defaultEdgeOptions = {
//   type:"straight",
//   animated:true,
//   deletable:true,
//   selectable:true,
//   label:"any label",
//   style:{stroke:"#4caf50"},
//   markerEnd: {
//       type: MarkerType.Arrow,
//     },
//  }

//  const findContainingGroup = (position, groups) => {
//   return groups.find((group) => {
//     const { x, y } = group.position;
//     const w = group.style?.width || 0;
//     const h = group.style?.height || 0;

//     return (
//       position.x > x &&
//       position.x < x + w &&
//       position.y > y &&
//       position.y < y + h
//     );
//   });
// };

// const sortNodes = (nodes)=>{
//   return [...nodes].sort((a,b)=>{
//     if(a.type === "group" && b.type !== "group") return -1;
//     if(b.type ==="group" && a.type !== "group") return 1;

//     if(a.id === b.parentId) return -1;
//     if(b.id === a.parentId) return 1;

//     return 0;
//   })
// }

// export default function FlowEditor() {
//   const [nodes, _setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [editNode, setEditNode] = useState(null);
//   const [showSaveForm,setShowSaveForm]=useState(false);
//   const [editEdge,setEditEdge] = useState(null);
//   const [selectedNodes,setSelectedNodes]=useState([]);
//   const [flowData,setFlowData]=useState({name:"",description:""});
//   const [reactFlowInstance,setReactFlowInstance]=useState(null)
//   const { screenToFlowPosition } = useReactFlow();
//   const formRef=useRef(null);
//   const containerRef=useRef(null);
//   const navigate=useNavigate()
//   const {id}=useParams()

//   console.log("nodes",nodes)
//   console.log("edges: ",edges)
//   console.log("editNode",editNode)


// const setNodes = useCallback(
//   (updater) => {
//     _setNodes((prev) => {
//       const updated = typeof updater === "function" ? updater(prev) : updater;
//       return sortNodes(updated);
//     });
//   },
//   [_setNodes]
// );

// useEffect(()=>{
//   if(id){
//     const flows=JSON.parse(localStorage.getItem("flows")||"[]");
//     const selected=flows.find((f)=>f.id===Number(id));
//     if(selected){
//       setNodes(
//         (selected.nodes||[]).map((node)=>({
//           ...node,
//           data:{
//             ...node.data,
//             onUpdate:(data)=>handleUpdate(node.id,data),
//             onDelete:()=>handleDelete(node.id),
//             onCopy:()=>handleCopy(node.id),
//             onEdit:()=>setEditNode({
//               id:node.id,
//               label:node.data?.label||"",
//               description:node.data?.description||"",
//             }),
         
//           }
//         })
//       ));
//       setEdges(selected.edges||[]);
//       setFlowData(selected.data||{name:"",description:""})
//     }
//   }
// },[id]);


// useEffect(()=>{
//   const handleClickOutside=(event)=>{
//     if(formRef.current && 
//       formRef.current&&
//       !formRef.current.contains(event.target)
//     ){
//       setEditNode(null);
//       setEditEdge(null);
//     }
//   }
//   const container=containerRef.current;
//   if(container){
//     container.addEventListener("mousedown",handleClickOutside);
//   }
//   return()=>{
//     if(container){
//       container.removeEventListener("mousedown",handleClickOutside);
//     }
//   }
//   },[editNode,editEdge]);


//   const handleDelete = (id)=>{
//     console.log(id,"id of a deleting node")
//     setNodes((prevNodes)=>{
//       const toDelete= new Set();
//       const stack=[id];

//       while(stack.length){
//         const current=stack.pop();
//         if(toDelete.has(current)) continue;
//         toDelete.add(current);

//         prevNodes.forEach((n)=>{
//           if(n.parentId === current){
//               stack.push(n.id);
//             }
//         });
//       }
//       // Attaching edges to the nodes if middle node is deleted

//       setEdges((prevEdges)=>{
//         let newEdges = [...prevEdges];
//         toDelete.forEach((deleteId)=>{
//           const deleteNode = prevNodes.find(n=>n.id === deleteId);
//           if(deleteNode && deleteNode.type !=="group"){
//             const incomingEdges = newEdges.filter(e => e.target === deleteId);
//             const outGoingEdges = newEdges.filter(e => e.source === deleteId);

//             const uniqueSources = [...new Set(incomingEdges.map(e=>e.source))];
//             const uniqueTargets = [...new Set(outGoingEdges.map(e=>e.target))];

//             uniqueSources.forEach((source)=>{
//               uniqueTargets.forEach((target)=>{
//                 const newEdge ={
//                   ...defaultEdgeOptions,
//                   id:`e${source}-${target}-${Date.now()}`,
//                   source,
//                   target,
//                 }
//                 newEdges = addEdge(newEdge,newEdges);
//               })
//             })
//             // if(incomingEdges.length === 1 && outGoingEdges.length === 1){
//             //   const newEdge ={
//             //     ...defaultEdgeOptions,
//             //     id:`e${incomingEdges[0].source}-${outGoingEdges[0].target}`,
//             //     source:incomingEdges[0].source,
//             //     target:outGoingEdges[0].target,
//             //   };
//             //   newEdges = addEdge(newEdge,newEdges)
//             // }
//           }
//         });
//         newEdges = newEdges.filter((e)=>!toDelete.has(e.source) && !toDelete.has(e.target)
//       );
//       return newEdges;
//       })
//       return prevNodes.filter((n)=>!toDelete.has(n.id));
//     });
//   }

// // --- Update Node ---

// const handleUpdate = (id, newData) => {
//   // console.log("newData: ",newData)
//   setNodes((nds) =>
//     nds.map((n) =>
//       n.id === id
//         ? {
//             ...n,
//             data: {
//               ...n.data,
//               ...newData,
//               onEdit: () =>
//                 {
//                   console.log("onEdit",id)
//                 setEditNode({
//                   id,
//                   label: newData.label,
//                   description: newData.description,
//                 })
//                 },
//               onUpdate: (data) => handleUpdate(id, data),
//               onDelete: () => handleDelete(id),
//               onCopy:()=>handleCopy(id),
//             },
//           }
//         : n
//     )
//   );
//   setEditNode(null); // close after saving
//   setEditEdge(null);
// };

// // Copy of a node
// const handleCopy = useCallback((id) => {
//   setNodes((prevNodes) => {
//     const nodeToCopy = prevNodes.find((n) => n.id === id);
//     if (!nodeToCopy) return prevNodes;

//     const newId = `copy-${Date.now()}`;
//     const offset = 80;

//     const newPosition = {
//       x: nodeToCopy.position.x + offset,
//       y: nodeToCopy.position.y + offset,
//     };

//     const newNode = {
//       ...nodeToCopy,
//       id: newId,
//       position: newPosition,
//       data: {
//         ...nodeToCopy.data,
//         onEdit: () =>
//           setEditNode({
//             id: newId,
//             label: nodeToCopy.data.label,
//             description: nodeToCopy.data.description || "",
//           }),
//         onUpdate: (data) => handleUpdate(newId, data),
//         onDelete: () => handleDelete(newId),
//         onCopy: () => handleCopy(newId),
//       },
//     };

//     // if inside a group
//     if (nodeToCopy.parentId) {
//       const parentGroup = prevNodes.find((n) => n.id === nodeToCopy.parentId);
//       if (parentGroup) {
//         const groupW = parentGroup.style?.width || 0;
//         const groupH = parentGroup.style?.height || 0;

//         if (
//           newPosition.x >= 0 &&
//           newPosition.x <= groupW &&
//           newPosition.y >= 0 &&
//           newPosition.y <= groupH
//         ) {
//           newNode.parentId = nodeToCopy.parentId;
//           newNode.extent = "parent";
//         } else {
//           newNode.position = {
//             x: parentGroup.position.x + newPosition.x,
//             y: parentGroup.position.y + newPosition.y,
//           };
//           delete newNode.parentId;
//           delete newNode.extent;
//         }
//       }
//     }

//     return sortNodes([...prevNodes, newNode]);
//   });
// }, [setNodes, handleDelete, handleUpdate, setEditNode]);


// // const handleCopy=useCallback((id)=>{
// //   setNodes((prevNodes)=>{
// //     const nodeToCopy = prevNodes.find(n => n.id === id);
// //     console.log("nodeToCopy",nodeToCopy)
// //     if(!nodeToCopy) return prevNodes;

// //     const newId = `copy ${+new Date()}`;
// //     const offset = 80;

// //     const newPosition = {
// //       x: nodeToCopy.position.x + offset,
// //       y: nodeToCopy.position.y + offset,
// //     };

// //     let newNode ={
// //       ...nodeToCopy,
// //       id:newId,
// //       position:newPosition,
// //       data:{
// //         ...nodeToCopy.data,
// //         onEdit: () => setEditNode({
// //                   id:newId,
// //                   label: nodeToCopy.data.label,
// //                   description: nodeToCopy.description,
// //                 }),
// //         onUpdate: (data) => handleUpdate(newId, data),
// //         onDelete: () => handleDelete(newId),
       
// //         onCopy:()=>handleCopy(newId),        
// //       }
// //     };
// //     console.log("newNode: ", newNode.id)

// //     // if node is inside of the group

// //     if (nodeToCopy.parentId){
// //       const parentGroup = prevNodes.find(n => n.id === nodeToCopy.parentId);
// //       if(parentGroup){
// //         const groupX = parentGroup.position.x;
// //         const groupY =parentGroup.position.y;
// //         const groupW = parentGroup.style?.width || 0;
// //         const groupH = parentGroup.style?.height || 0;

// //         if(
// //           newPosition.x >= 0 && newPosition.x <= groupW &&
// //           newPosition.y >= 0 && newPosition.y <= groupH
// //         ){
// //          newNode.parentId = nodeToCopy.parentId;
// //          newNode.extent = "parent";
// //         }else{
// //             newNode.position = {
// //             x: groupX + newPosition.x,
// //             y: groupY + newPosition.y, 
// //             };
// //             delete newNode.parentId;
// //             delete newNode.extent;
// //         }
// //         }
// //       }
// //       return sortNodes([...prevNodes,newNode]);
// //   })
// // },[setNodes,handleDelete,handleUpdate,setEditNode,setEditEdge,defaultEdgeOptions])

// // --- Drop New Node ---
// const onDrop = useCallback(
//   (event) => {
//     event.preventDefault();   
//     const type = event.dataTransfer.getData("application/reactflow");
//     if (!type) return;

//     const position = screenToFlowPosition({
//       x: event.clientX,
//       y:event.clientY,
//     })
    
//     const id = `${+new Date()}`;
//     let newNode;
//     const group = nodes.find((n)=>{
//       if(n.type !== "group") return false;

//     const {x,y}=n.position;
//     const w = n.style.width;
//     const h = n.style.height;

//     return (
//        position.x > x &&
//         position.x < x + w &&
//         position.y > y &&
//         position.y < y + h
//     )
//     });

//     console.log(group,"testing")

//       if (group) {
//       // dropped inside a group → make it child
//       newNode = {
//         id,
//         type: type === "group" ? "group" : "action",
//         position: {
//           x: position.x - group.position.x, // relative to group
//           y: position.y - group.position.y,
//         },
//         parentId: group.id,
//         extent: "parent",
//         data: { label: `${type} node`,
//       description:"",
//      onEdit: () =>
//   setEditNode({
//     id: newId,
//     label: nodeToCopy.data.label,
//     description: nodeToCopy.data.description || "",
//   }),
//       onUpdate: (data) => handleUpdate(id, data),
//       onDelete: () => handleDelete(id),
//       onCopy: () => handleCopy(id),
//     },
//       };
//     } else {
//       // dropped on canvas (outside group)
//       newNode = {
//         id,
//         type: type === "group" ? "group" : "action",
//         position,
//         data: { label: `${type} node` ,
//        description:"",
//             onEdit: () =>
//               setEditNode({ id, label: `${type} node`, description: "" }),
//               onUpdate: (data) => handleUpdate(id, data),
//               onDelete: () => handleDelete(id),
//               onCopy: ()=> handleCopy(id)
//             },
//         style:
//           type === "group"
//             ? {
//                 width: 200,
//                 height: 150,
//                 border: "2px dashed #333",
//                 background: "#fafafa",
//               }
//             : {},
//       };
//     }
//     setNodes((nds) => nds.concat(newNode));
//   },
//   [setNodes, screenToFlowPosition, nodes]
// );

//       const onDragOver = useCallback((event) => {
//         event.preventDefault();
//         event.dataTransfer.dropEffect = "move";
//       }, []);

//       const onConnect=useCallback(
//             (params)=>
//             {setEdges((eds)=>
//                     addEdge({...params},eds))
//             },
//             [setEdges]
//         )

//     // save only when there is node present
//   const handleSaveClick=()=>{
//     // console.log(id)
//     if(nodes.length===0){
//       alert("Add at least one node to save the flow.");
//       return;
//     }
//     if(id){
//       onSave()
//     }
//     else{
//       setShowSaveForm(true);
//     }
//   }

//   // --- Save Flow ---
//   const onSave = useCallback(() => {
//     if(!id && !flowData.name.trim()){
//       alert("Please provide a name for the flow.");
//       return;
//     }

//     const flow = { 
//       id: id ? Number(id) : Date.now(),
//       nodes, 
//       edges,
//       data:flowData,
//      };
     
//     try {
//     const existing=JSON.parse(localStorage.getItem("flows")||"[]");

//     const index=existing.findIndex((f)=>f.id===flow.id);

//     if (index>-1){
//       existing[index]=flow;
//     }
//     else{
//       existing.push(flow);
//     }
    
//     alert("Flow saved!");
//     localStorage.setItem("flows",JSON.stringify(existing));
//       navigate("/");
//       setShowSaveForm(false);

//       if(!id){
//         setFlowData({name:"",description:""});
//       }
//     } catch (err) {
//       console.error("Failed to save:", err);
//     }
//   }, [nodes, edges, flowData]);

//   // --- Restore Flow ---
//   const onRestore = useCallback(() => {
//     try {
//       const flow = JSON.parse(localStorage.getItem("flows"));
//       if (flow) {
//         // Reattach handlers (onUpdate, onDelete) after restore
//         const rehydratedNodes = (flow.nodes || []).map((node) => ({
//           ...node,
//           data: {
//             ...node.data,
//             onUpdate: (data) => handleUpdate(node.id, data),
//             onDelete: () => handleDelete(node.id),
//              onEdit: () =>
//              setEditNode({
//                     id: node.id,
//                     label: node.data?.label ?? "",
//                     description: node.data?.description ?? "",
//                 }),
//           },
//         }));

//         setNodes(rehydratedNodes);
//         setEdges(flow.edges || []);
//         alert("Flow restored!");
//       } else {
//         alert("No saved flow found.");
//       }
//     } catch (err) {
//       console.error("Failed to restore:", err);
//     }
//   }, []);   

//   // Grouping 

// //   const groupSelected=useCallback(()=>{
// //     if (!Array.isArray(selectedNodes) || selectedNodes.length < 2) {
// //     alert("Select at least 2 nodes to group");
// //     return;
// //   }
// //     const bounds=getNodesBounds(selectedNodes);
// //     const padding= 20;
// //     const groupId=`group-${Date.now()}`;

// //     const groupNode={
// //       id:groupId,
// //       type:"group",
// //       draggable:true,
// //       position:{x: bounds.x - padding, y: bounds.y - padding},
// //       data:{
// //         label:`Group-${Date.now()}`,
// //         description: "",
// //         onEdit: () =>
// //         setEditNode({ id: groupId, label: `Group-${Date.now()}`, description: "" }),
// //         onUpdate: (data) => handleUpdate(groupId, data),
// //   },
// //   style:{
// //     width:bounds.width + padding * 2,
// //     height:bounds.height + padding * 2,
// //     border:"2px dashed #333",
// //     background:"#fafafa",
// //     borderRadius:"8px",
// //     zIndex:0
// //   }
// // }
// // console.log("groupnode:" ,groupNode)
// //     // console.log(groupNode)

// //     const updatedChildren=selectedNodes.map((n)=>({
// //       ...n,
// //       parentId:groupId,
// //       extent:"parent",
// //       position:{
// //         x: n.position.x - (bounds.x - padding),
// //         y: n.position.y - (bounds.y - padding)
// //       }
// //     }));
// //     // console.log(updatedChildren)
// //     setNodes((prev)=>[
// //       ...prev.filter((n)=>!selectedNodes.some(sn=>sn.id === n.id)),
// //       groupNode,
// //       ...updatedChildren,
// //     ])
// //   },[selectedNodes,setNodes])
// // console.log(groupSelected)


// // edges update

//  const onEdgeClick = useCallback((event, edge) => {
//     setEditEdge({
//       id: edge.id,
//       type: edge.type || "straight",
//       label: edge.label || "",
//       animated: edge.animated || false,
//       stroke:edge.style?.stroke || '#4caf50',
//       markerEnd: edge.markerEnd || defaultEdgeOptions.markerEnd,
//     });
//   }, []);

//    const handleEdgeUpdate = (id, newData) => {
//     setEdges((eds) =>
//       eds.map((e) =>
//         e.id === id
//           ? {
//               ...e,
//               type: newData.type || "straight",
//               label: newData.label || "",
//               animated: newData.animated,
//               style:{
//                 ...e.style,
//                 stroke:newData.stroke,
//               },
//             }
//           : e
//       )
//     );
//     setEditEdge(null);
//   };

//     const handleNodesChange = useCallback((changes)=>{
//       onNodesChange(changes);
//     },
//     [onNodesChange])

//     const onNodeDragStop = useCallback(
//   (event, node) => {
//     // console.log("node", node);
//     // console.log("event ", event);

//     setNodes((nds) => {
//       const groups = nds.filter((n) => n.type === "group");
//       const group = findContainingGroup(node.position, groups);

//       if (group) {
//         return nds.map((n) =>
//           n.id === node.id
//             ? {
//                 ...n,
//                 parentId: group.id,
//                 extent: "parent",
//                 position:
//                   n.parentId === group.id
//                     ? n.position
//                     : {
//                         x: node.position.x - group.position.x,
//                         y: node.position.y - group.position.y,
//                       },
//               }
//             : n
//         );
//       }
//       return nds;
//     });
//   },
//   [setNodes]
// )

// //  console.log("setEditNode",setEditNode)

//   return (
//     <>
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={() => navigate("/")}
//         sx={{ position: "absolute", top: 30, right: 30, zIndex: 1000 }}
//       >
//         Home
//       </Button>
      
//       <div ref={containerRef} style={{ height: "100vh", width: "100vw" }}>
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={handleNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         defaultEdgeOptions={defaultEdgeOptions}
//         onDrop={onDrop}
//         onDragOver={onDragOver}
//         nodeTypes={nodeTypes}
//         onPaneClick={()=>setEditNode(null)}
//         proOptions={{hideAttribution:true}}
//         onEdgeClick={onEdgeClick}
//         fitView
//         onNodeClick={(evt, node) => console.log('node clicked', node)}
//         onSelectionChange={({ nodes, edges }) => {
//           console.log('selection changed:', nodes);
//         setSelectedNodes(nodes);
//         }}
//         onInit={setReactFlowInstance}
//         onNodeDragStop={onNodeDragStop} 
//       >
//         <Background />
//         <Controls />
//         <MiniMap />
//       </ReactFlow>
//       <Sidebar onSave={onSave} onRestore={onRestore} handleSaveClick={handleSaveClick} />

//     {/* form */}
//       {editNode && (
//         <div className="edit-form-popup" ref={formRef}>
//           <h3>Edit Node</h3>
//           <input
//             type="text"
//             value={editNode.label}
//             onChange={(e) =>
//               setEditNode({ ...editNode, label: e.target.value })
//             }
//             />
//           <textarea
//             value={editNode.description}
//             onChange={(e) =>
//               setEditNode({ ...editNode, description: e.target.value })
//             }
//             />
//           <div className="form-buttons">
//             <button
//               onClick={() =>
//                 handleUpdate(editNode.id, {
//                   label: editNode.label,
//                   description: editNode.description,
//                 })
//               }
//               >
//               Save
//             </button>
//             <button onClick={() => setEditNode(null)}>Cancel</button>
//           </div>
//         </div>
//       )}

//       {editEdge && (
//           <div className="edit-form-popup" ref={formRef}>
//             <h3>Edit Edge</h3>

//             <label>Type: </label>
//             <select
//               value={editEdge.type}
//               onChange={(e) =>
//                 setEditEdge({ ...editEdge, type: e.target.value })
//               }
//             >
//               <option value="straight">Straight</option>
//               <option value="bezier">Bezier</option>
//               <option value="step">Step</option>
//               <option value="smoothstep">Smoothstep</option>
//             </select> <br/>

//             <label>Label :</label>
//             <input
//               type="text"
//               value={editEdge.label}
//               onChange={(e) =>
//                 setEditEdge({ ...editEdge, label: e.target.value })
//               }
//               placeholder="Edge Label"
//             />
//             <label >Animated : </label>
//             <select
//               value={editEdge.animated.toString()}
//               onChange={(e) =>
//                 setEditEdge({ ...editEdge, animated: e.target.value === "true"})
//               }
//             >
//               <option value="true">True</option>
//               <option value="false">False</option>
//             </select> <br/>
//             <label>Edge Color: </label>
//     <input
//       type="color"
//       value={editEdge.stroke || "#4caf50"}
//       onChange={(e) => setEditEdge({ ...editEdge, stroke: e.target.value, markerEnd: { ...editEdge.markerEnd, color: e.target.value } })}
//     />
//     <div className="form-buttons">
//       <button
//         onClick={() =>
//           handleEdgeUpdate(editEdge.id, {
//             type: editEdge.type,
//             label: editEdge.label,
//             animated: editEdge.animated,
//             stroke: editEdge.stroke,
//           })
//                 }
//               >
//                 Save
//               </button>
//               <button onClick={() => setEditEdge(null)}>Cancel</button>
//             </div>
//           </div>
//         )}

//       {showSaveForm && (
//         <div className="save-form-popup">
//           <h3>Save Flow</h3>
//           <input
//             type="text"
//             placeholder="Flow Name"
//             value={flowData.name}
//             onChange={(e) => setFlowData({ ...flowData, name: e.target.value })}
//           />
//           <textarea
//             placeholder="Description"
//             value={flowData.description}
//             onChange={(e) => setFlowData({ ...flowData, description: e.target.value })}
//           />
//           <div className="form-buttons">
//             <button onClick={onSave}>Save</button>
//             <button onClick={() => setShowSaveForm(false)}>Cancel</button>
//           </div>
//        </div>
//       )}
//     </div>
//     </>
//   );
// }


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

