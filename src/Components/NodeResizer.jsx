import { memo, useCallback, useState } from "react";
import { NodeResizeControl, useReactFlow } from "@xyflow/react";
import { IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./ActionNode.css"
import { createPortal } from "react-dom";

const CustomResizerNode = ({ id, data, selected, type }) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(data?.label || "Group");
  const [description, setDescription] = useState(data?.description || "");
  const [anchorEl, setAnchorEl] = useState(null);
  const isGroup = type === "group";
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow();

  const sortNodes = (nodes) =>
    nodes.sort((a, b) => {
      if (a.type === "group" && b.type !== "group") return -1;
      if (b.type === "group" && a.type !== "group") return 1;
      if (a.id === b.parentId) return -1;
      if (b.id === a.parentId) return 1;
      return 0;
    });

  const handleEdit = () => {
    setLabel(data?.label || "Group");
    setDescription(data?.description || "");
    setOpen(true);
  };

  const handleSave = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label, description } } : n
      )
    );
    setOpen(false);
  };

  const handleCopy = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const nodeToCopy = nodes.find((n) => n.id === id);
    if (!nodeToCopy) return;

    const toCopyIds = new Set();
    const toCopyNodes = [];
    const stack = [nodeToCopy];

    while (stack.length) {
      const curr = stack.pop();
      if (toCopyIds.has(curr.id)) continue;
      toCopyIds.add(curr.id);
      toCopyNodes.push(curr);
      if (curr.type === "group") {
        nodes.forEach((n) => {
          if (n.parentId === curr.id) stack.push(n);
        });
      }
    }

    const oldToNewId = new Map();
    toCopyNodes.forEach((n) => {
      const newId = `${n.type || "node"}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      oldToNewId.set(n.id, newId);
    });

    const offset = 150;
    const newNodes = toCopyNodes.map((n) => ({
      ...n,
      id: oldToNewId.get(n.id),
      parentId: n.parentId ? oldToNewId.get(n.parentId) : n.parentId,
      position: {
        x: n.position.x + (n.parentId ? 0 : offset),
        y: n.position.y + (n.parentId ? 0 : offset),
      },
      data: JSON.parse(JSON.stringify(n.data)),
    }));

    const newEdges = edges
      .filter((e) => toCopyIds.has(e.source) && toCopyIds.has(e.target))
      .map((e) => ({
        ...e,
        id: `e${oldToNewId.get(e.source)}-${oldToNewId.get(e.target)}-${Date.now()}`,
        source: oldToNewId.get(e.source),
        target: oldToNewId.get(e.target),
      }));

    setNodes(sortNodes([...nodes, ...newNodes]));
    setEdges([...edges, ...newEdges]);
    setAnchorEl(null);
  }, [getNodes, getEdges, setNodes, setEdges, id]);

  const handleDelete = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const toDeleteIds = new Set();
    const stack = [id];

    while (stack.length) {
      const curr = stack.pop();
      if (toDeleteIds.has(curr)) continue;
      toDeleteIds.add(curr);
      if (nodes.find((n) => n.id === curr)?.type === "group") {
        nodes.forEach((n) => {
          if (n.parentId === curr) stack.push(n.id);
        });
      }
    }

    setNodes(nodes.filter((n) => !toDeleteIds.has(n.id)));
    setEdges(edges.filter((e) => !toDeleteIds.has(e.source) && !toDeleteIds.has(e.target)));
    setAnchorEl(null);
  }, [id, getNodes, getEdges, setNodes, setEdges]);

  const handleUngroup = () => {
    const nodes = getNodes();
    const group = nodes.find((n) => n.id === id && n.type === "group");
    const children = nodes.filter((n) => n.parentId === group.id);
    const absChildren = children.map((child) => ({
      ...child,
      parentId: undefined,
      extent: undefined,
      position: {
        x: group.position.x + child.position.x,
        y: group.position.y + child.position.y,
      },
    }));

    setNodes([...nodes.filter((n) => n.id !== group.id && n.parentId !== group.id), ...absChildren]);
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: isGroup ? "2px dashed #333" : "1px solid #555",
        borderRadius: 8,
        background: isGroup ? "#fafafa" : "#fff",
        position: "relative",
        padding: isGroup ? 0 : 8,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: isGroup ? "absolute" : "relative",
          top: isGroup ? 8 : 0,
          left: isGroup ? 8 : 0,
          right: isGroup ? 8 : 0,
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: isGroup ? 14 : 12,
            fontWeight: "bold",
            padding: "2px 6px",
            borderRadius: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "left",
          }}
        >
          {data?.label || "Group"}
        </div>
        {data?.description && (
          <Tooltip title={data.description} arrow>
            <div
              style={{
                fontSize: 10,
                color: "#555",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginTop: 2,
                textAlign: "justify",
              }}
            >
              {data.description}
            </div>
          </Tooltip>
        )}
      </div>

      {isGroup && (
        <NodeResizeControl
          isVisible={selected}
          style={{ background: "transparent", border: "none" }}
          minWidth={150}
          minHeight={100}
          position="bottom-right"
        >
          <ResizeIcon />
        </NodeResizeControl>
      )}

      {selected && (
        <div
          style={{
            position: "absolute",
            top: isGroup ? -45 : -35,
            right: 0,
            display: "flex",
            gap: 4,
            background: "#fff",
            padding: "2px 4px",
            borderRadius: 4,
            border: "1px solid #ccc",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          <Tooltip title="Edit">
            <IconButton size="small" onClick={handleEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
            <MenuItem onClick={handleCopy}>Copy</MenuItem>
            {isGroup && <MenuItem onClick={handleUngroup}>UnGroup</MenuItem>}
          </Menu>
        </div>
      )}

      {open && 
      createPortal(
        <>
        <div onClick={() => setOpen(false)} className="form-backdrop">
          <div className="edit-form-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Group</h3>
            <form
              // style={{
              //   display: "flex",
              //   flexDirection: "column",
              //   gap: 16,
              // }}
            >
              <div>
                <label
                  htmlFor="node-label"
                 
                  >
                  Group Name
                </label>
                <input
                  id="node-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  // style={{
                  //   width: "100%",
                  //   padding: "10px",
                  //   fontSize: "0.875rem",
                  //   border: "1px solid #ccc",
                  //   borderRadius: 4,
                  //   outline: "none",
                  //   transition: "border-color 0.2s",
                  // }}
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
        </>, 
        document.body
      )}
    </div>
  );
};

function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#333"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "absolute", right: 5, bottom: 5, cursor: "nwse-resize" }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  );
}

export default memo(CustomResizerNode);

