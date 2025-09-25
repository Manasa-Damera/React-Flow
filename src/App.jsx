import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import FlowEditor from "./Components/Editor";
import Home from "./Components/Saved";
import Welcome from "./Components/Welcome";
import { ReactFlowProvider } from "@xyflow/react";

export default function App(){
  return(
    <ReactFlowProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Welcome/>}/>
        <Route path="/flows" element={<Home/>}/>
        <Route path="/editor/:id" element={<FlowEditor/>}/>
        <Route path="/create" element={<FlowEditor/>}/>
        <Route path="*" element={<div>404 Not Found</div>}/>
      </Routes>
    </Router>
    </ReactFlowProvider>
  )
}