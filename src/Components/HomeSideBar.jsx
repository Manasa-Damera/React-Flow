import { Box, Drawer, IconButton, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useState } from "react"
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";



export default function HomeSideBar(){
    const[open,setOpen]=useState(false);
    const navigate=useNavigate()

    const toggleDrawer=(state)=>()=>{
        setOpen(state);
    }

    const menuItems=[
        {text:"Home",path:"/"},
        {text:"Create Flow",path:"/create"},
        {text:"Saved Flows",path:"/flows"},

    ]

    return(
    <div>
        <IconButton onClick={toggleDrawer(true)} sx={{position:"absolute",top:10,left:10,zIndex:1000}}>
            <MenuIcon/>
        </IconButton>

        <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
            <Box sx={{width:250,p:2}} role="presentation">
                <Typography variant="h5" gutterBottom>
                    My Dashboard
                </Typography>
                <List>
                    {menuItems.map((item,index)=>(
                        <ListItemButton key={index} 
                            onClick={()=>{
                                navigate(item.path)
                                setOpen(false);}}>
                            <ListItemText primary={item.text}/>
                        </ListItemButton>
                    ))}
                </List>
            </Box>
        </Drawer>
    </div>
    )
}