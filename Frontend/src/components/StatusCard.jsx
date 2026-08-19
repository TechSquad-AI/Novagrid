import React, { useEffect, useState } from "react";

import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box
} from "@mui/material";

import api from "../api/axios";



function StatusCard({scanData}){

    const [status, setStatus] = useState(null);



    const fetchStatus = async () => {

        try {

            const response = await api.get("/status");

            setStatus(response.data);

        }
        catch(error){

            console.log("Status error:", error);

        }

    };



    useEffect(() => {

        fetchStatus();

    }, []);



    if(!status){

        return (

            <Card sx={{minWidth:280}}>

                <CardContent>

                    <Typography>
                        Loading API status...
                    </Typography>

                </CardContent>

            </Card>

        );

    }



    return (

        <Card
            sx={{
                minWidth:280,
                boxShadow:3
            }}
        >

            <CardContent>


                <Typography
                    variant="h6"
                    gutterBottom
                >
                    {status.name}
                </Typography>



                <Chip
                    label={status.status}
                    color="success"
                    size="small"
                />



                <Box sx={{mt:2}}>

                    <Typography>
                        <b>URL:</b>
                    </Typography>

                    <Typography>
                        {status.url}
                    </Typography>

                </Box>



                <Box sx={{mt:2}}>

                    <Typography>
                        <b>Last Scan:</b>
                    </Typography>

                    <Typography>
    {
        scanData
        ? "Just now"
        : status.last_scan
    }
</Typography>

                </Box>



                <Box sx={{mt:2}}>

                    <Typography>
                        <b>Changes:</b>
                    </Typography>

                    <Typography>
    {
        scanData?.changes
        ? (
            scanData.changes.added.length +
            scanData.changes.removed.length
        )
        : status.changes
    } detected
</Typography>

                </Box>



            </CardContent>

        </Card>

    );

}


export default StatusCard;