import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Saved.css";
import HomeSideBar from "./HomeSideBar";

function Home() {
  const [flows, setFlows] = useState([]);
  const [editingFlow, setEditingFlow] = useState(null);
  const [deleteTarget,setDeleteTarget]=useState(null)
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("flows") || "[]");
    setFlows(stored);
  }, []);

  const handleEditSave = () => {
    if (!editingFlow) return;

    const updated = flows.map((flow) =>
      flow.id === editingFlow.id ? editingFlow : flow
    );
    setFlows(updated);
    localStorage.setItem("flows", JSON.stringify(updated));
    setEditingFlow(null);
  };

  const handleDelete = (id) => {
    const updated = flows.filter((flow) => flow.id !== id);
    setFlows(updated);
    localStorage.setItem("flows", JSON.stringify(updated));
  };

  const handleConfirmDelete = ()=>{
    if(deleteTarget){
      handleDelete(deleteTarget.id);
      setDeleteTarget(null);

    }
    }

  return (
    < >
      {/* <HomeSideBar /> */}
      {/* Gradient wrapper */}
      <Box
        className="dashboard"
        sx={{
          minHeight: "100vh",
          padding: 4,
          background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/create")}
          sx={{ position: "absolute", top: 30, right: 30 }}
        >
          Create
        </Button>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ marginBottom: 4, marginTop: 2, fontWeight: "bold" }}
        >
          Saved Flows
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          {flows.length === 0 ? (
            <Typography>No flows saved yet.</Typography>
          ) : (
            flows.map((flow) => (
              <Grid item xs={12} sm={6} md={4} key={flow.id}>
  <Card
    sx={{
      width: 280, // ✅ fixed width for card
      height:130,
      borderRadius: 3,
      boxShadow: 5,
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" },
      display: "flex",
      flexDirection: "column",
    }}
    className="flow-card"
  >
    <CardContent
      sx={{
        overflowWrap: "break-word",
        flexGrow: 1, // ensures content pushes height
      }}
    >
      <Typography variant="h6">{flow.data.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {flow.data.description}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small" onClick={() => navigate(`/editor/${flow.id}`)}>
        Edit
      </Button>
      {/* <Button size="small" onClick={() => setEditingFlow(flow)}>
        Edit
      </Button> */}
      <Button size="small" color="error" onClick={() => setDeleteTarget(flow)}>
        Delete
      </Button>
    </CardActions>
  </Card>
  </Grid>

            ))
          )}
        </Grid>

        {/* Editing flow dialog */}
        <Dialog
          open={Boolean(editingFlow)}
          onClose={() => setEditingFlow(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Edit Flow</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="dense"
              label="Flow Name"
              value={editingFlow?.data?.name || ""}
              onChange={(e) =>
                setEditingFlow((prev) =>
                  prev
                    ? { ...prev, data: { ...prev.data, name: e.target.value } }
                    : prev
                )
              }
            />
            <TextField
              fullWidth
              margin="dense"
              label="Description"
              multiline
              rows={3}
              value={editingFlow?.data?.description || ""}
              onChange={(e) =>
                setEditingFlow((prev) =>
                  prev
                    ? {
                        ...prev,
                        data: { ...prev.data, description: e.target.value },
                      }
                    : prev
                )
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingFlow(null)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
        open={Boolean(deleteTarget)}
          onClose={()=>setDeleteTarget(null)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {" "}
              <b>{deleteTarget?.data?.name}</b>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setDeleteTarget(null)}>Cancel</Button>
            <Button color = "error" onClick={handleConfirmDelete}>Yes, Delete</Button>
          </DialogActions>

        </Dialog>
      </Box>

    </>
  );
}

export default Home;
