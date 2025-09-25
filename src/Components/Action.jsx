import { addEdge, Handle, MarkerType, useReactFlow } from "@xyflow/react";
import { useState, useEffect, useCallback } from "react";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./ActionNode.css";

const ActionNode = ({ id, data, parentId }) => {
  console.log("A8", id, data, parentId);
  const { label, description } = data;
  const [showToolbar, setShowToolbar] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [localLabel, setLocalLabel] = useState(label || "Unnamed");
  const [localDescription, setLocalDescription] = useState(description || "");
  const isChild = !!parentId;

  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow();

  // Sync local state with data props
  useEffect(() => {
    setLocalLabel(label || "Unnamed");
    setLocalDescription(description || "");
  }, [label, description]);

  // Toolbar open and close
  const handleNodeClick = (e) => {
    e.stopPropagation();
    setShowToolbar((prev) => !prev);
    if (showToolbar) setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    event.stopPropagation();
    console.log("Menu clicked:", id, "isChild:", isChild);
    setAnchorEl(event.currentTarget);
  };

  const handleEdit = () => {
    setOpen(true);
  };

  const handleSave = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                label: localLabel,
                description: localDescription,
              },
            }
          : n
      )
    );
    setOpen(false);
  };

  const handleCopy = useCallback(() => {
    const currentNodes = getNodes();
    const nodeToCopy = currentNodes.find((n) => n.id === id);
    if (!nodeToCopy) return;

    const newId = `${nodeToCopy.type || "node"}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const offset = 100;

    const newPosition = {
      x: nodeToCopy.position.x + (nodeToCopy.parentId ? 0 : offset),
      y: nodeToCopy.position.y + (nodeToCopy.parentId ? 0 : offset),
    };

    let newNode = {
      ...nodeToCopy,
      id: newId,
      position: newPosition,
      data: { ...nodeToCopy.data },
    };

    // If node is inside a group
    if (nodeToCopy.parentId) {
      const parentGroup = currentNodes.find((n) => n.id === nodeToCopy.parentId);
      if (parentGroup) {
        const groupW = parentGroup.style?.width || 0;
        const groupH = parentGroup.style?.height || 0;

        if (
          newPosition.x >= 0 &&
          newPosition.x + (nodeToCopy.style?.width || 0) <= groupW &&
          newPosition.y >= 0 &&
          newPosition.y + (nodeToCopy.style?.height || 0) <= groupH
        ) {
          newNode.parentId = nodeToCopy.parentId;
          newNode.extent = "parent";
        } else {
          newNode.position = {
            x: parentGroup.position.x + newPosition.x,
            y: parentGroup.position.y + newPosition.y,
          };
          delete newNode.parentId;
          delete newNode.extent;
        }
      }
    }

    setNodes((nds) => sortNodes([...nds, newNode]));
    setAnchorEl(null);
    setShowToolbar(false);
  }, [id, getNodes, setNodes]);

  const handleDelete = useCallback(() => {
    console.log(id, "id of a deleting node");
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const toDeleteIds = new Set();
    const stack = [id];

    while (stack.length) {
      const curr = stack.pop();
      if (toDeleteIds.has(curr)) continue;

      toDeleteIds.add(curr);

      currentNodes.forEach((n) => {
        if (n.parentId === curr) {
          stack.push(n.id);
        }
      });
    }

    let newEdges = [...currentEdges];
    toDeleteIds.forEach((deleteId) => {
      const deleteNode = currentNodes.find((n) => n.id === deleteId);
      if (deleteNode && deleteNode.type !== "group") {
        const incomingEdges = newEdges.filter((e) => e.target === deleteId);
        const outgoingEdges = newEdges.filter((e) => e.source === deleteId);

        const uniqueSources = [...new Set(incomingEdges.map((e) => e.source))];
        const uniqueTargets = [...new Set(outgoingEdges.map((e) => e.target))];

        uniqueSources.forEach((source) => {
          uniqueTargets.forEach((target) => {
            const newEdge = {
              ...defaultEdgeOptions,
              id: `e${source}-${target}-${Date.now()}`,
              source,
              target,
            };
            newEdges = addEdge(newEdge, newEdges);
          });
        });
      }
    });

    newEdges = newEdges.filter(
      (e) => !toDeleteIds.has(e.source) && !toDeleteIds.has(e.target)
    );

    setNodes((nds) => nds.filter((n) => !toDeleteIds.has(n.id)));
    setEdges(newEdges);
    setAnchorEl(null);
    setShowToolbar(false);
  }, [id, getNodes, getEdges, setNodes, setEdges]);

  const handleDetach = () => {
    console.log("Detach started for node:", id, "parentId:", parentId);
    const nodes = getNodes();
    const parentGroup = nodes.find((n) => n.id === parentId && n.type === "group");
    console.log("Parent group:", parentGroup);

    let baseX = 100;
    let baseY = 100;
    // Calculate base position outside top-left of group
    baseX = (parentGroup.position.x || 0) - 60; // Slightly left of group
    baseY = (parentGroup.position.y || 0) - 60; // Slightly above group

    // Count existing detached nodes at this position to avoid overlap
    const detachedNodes = nodes.filter(
      (n) =>
        n.parentId === undefined &&
        n.position.x >= baseX &&
        n.position.x < baseX + 1000 && // Approximate range for side-by-side
        n.position.y === baseY &&
        n.id !== id
    );
    console.log("detachedNodes.length", detachedNodes.length);
    const offsetX = detachedNodes.length * 170;

    setNodes((nds) => {
      const updated = nds.map((node) =>
        node.id === id
          ? {
              ...node,
              parentId: undefined,
              extent: undefined,
              position: { x: baseX + offsetX, y: baseY },
            }
          : node
      );
      console.log("Nodes after detach:", updated);
      console.log("Detached node:", id, "at position:", { x: baseX + offsetX, y: baseY });
      return updated;
    });
    setAnchorEl(null);
    setShowToolbar(false);
  };

  const sortNodes = (nodes) => {
    return [...nodes].sort((a, b) => {
      if (a.type === "group" && b.type !== "group") return -1;
      if (b.type === "group" && a.type !== "group") return 1;
      if (a.id === b.parentId) return -1;
      if (b.id === a.parentId) return 1;
      return 0;
    });
  };

  const defaultEdgeOptions = {
    type: "straight",
    animated: true,
    deletable: true,
    selectable: true,
    label: "any label",
    style: { stroke: "#4caf50" },
    markerEnd: {
      type: MarkerType.Arrow,
    },
  };

  return (
    <div
      className={`action-node ${showToolbar ? "open" : ""}`}
      id={`node-${id}`}
      onClick={handleNodeClick}
    >
      <Handle type="target" position="left" className="custom-handle target" />
      <Handle type="source" position="right" className="custom-handle source" />
      {showToolbar && (
        <div className="action-toolbar">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={handleEdit}>
              {/* <EditIcon fontSize="small" /> */}
              ✏️
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {isChild && <MenuItem onClick={handleDetach}>Detach</MenuItem>}
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
            <MenuItem onClick={handleCopy}>Copy</MenuItem>
          </Menu>
        </div>
      )}
      <div>
        <strong>{label || "Unnamed"}</strong>
      </div>
      <div className="description">{description || ""}</div>

      {/* Plain HTML Edit Form */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setOpen(false)}
        >
          <div className="edit-form-popup "
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              Edit Node
            </h3>
            <form>
              <div>
                <label
                  htmlFor="node-label"
                >
                  Node Name
                </label>
                <input
                  id="node-label"
                  type="text"
                  value={localLabel}
                  onChange={(e) => setLocalLabel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "0.875rem",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#007bff")}
                  onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                />
              </div>
              <div>
                <label
                  htmlFor="node-description"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#555",
                  }}
                >
                  Description
                </label>
                <input
                  id="node-description"
                  type="text"
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "0.875rem",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#007bff")}
                  onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    background: "#f5f5f5",
                    color: "#333",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#e0e0e0")}
                  onMouseOut={(e) => (e.target.style.background = "#f5f5f5")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.875rem",
                    border: "none",
                    borderRadius: 4,
                    background: "#007bff",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#0056b3")}
                  onMouseOut={(e) => (e.target.style.background = "#007bff")}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionNode;