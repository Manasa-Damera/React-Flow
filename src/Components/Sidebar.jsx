import Button from '@mui/material/Button';
import './ActionNode.css';
import { IconButton } from '@mui/material';
import { useState } from 'react';
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
// import GroupButton from './GroupButton';

const Sidebar=({handleSaveClick,onRestore,onGroup})=>{
    const [isOpen,setIsOpen]=useState(false);

    const onDragStart=(event,nodeType)=>{
        event.dataTransfer.setData('application/reactflow',nodeType);
        event.dataTransfer.effectAllowed='move'
    }

    return (
        <aside className={`sidebar ${isOpen?'open':'closed'}`}>
            <div className='sidebar-toggle'>
                <IconButton onClick={()=>setIsOpen(!isOpen)} size='small'>
                    {isOpen ? <CloseIcon/>:<MenuIcon/>}
                </IconButton>
            </div>
            <h2>Nodes</h2>
            <div className="node-list">
                <div className="sidebar-node" onDragStart={(e)=>onDragStart(e,'input')} draggable >
                    <Button variant="outlined" fullWidth>Input </Button>
                </div>
                <div className="sidebar-node" onDragStart={(e)=>onDragStart(e,'default')} draggable >
                    <Button variant="outlined" fullWidth>Default</Button>
                </div>
                <div className="sidebar-node" onDragStart={(e)=>onDragStart(e,'output')} draggable >
                    <Button variant="outlined" fullWidth>Output</Button>
                </div>
                <div className="sidebar-node" onDragStart={(e)=>onDragStart(e,'text')} draggable >
                    <Button variant="outlined" fullWidth>Text</Button>
                </div>
                {/* <div className="sidebar-node">
                    <Button variant="outlined" onClick={onGroup} fullWidth>Group Selected</Button>
                </div> */}
                <div className="sidebar-node" onDragStart={(e)=>onDragStart(e,"group")} draggable>
                    <Button variant="outlined" fullWidth>Group</Button>
                </div>
            </div>

            <div className="sidebar-actions">
                    <Button variant="contained" color="success" onClick={handleSaveClick} draggable>
                        Save
                    </Button>

                    {/* <Button variant="contained" onClick={onRestore} draggable>
                        Restore
                    </Button> */}
            </div>
            {/* <GroupButton/> */}
            
        </aside>
    )
}

export default Sidebar;