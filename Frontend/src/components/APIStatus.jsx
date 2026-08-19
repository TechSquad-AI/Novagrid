import React, {useEffect, useState} from "react";
import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

import api from "../api/axios";


export default function APIStatus(){

    const [status,setStatus] = useState("Checking...");
    

    useEffect(()=>{

        api.get("/")
        .then(()=>{
            setStatus("Online");
        })
        .catch(()=>{
            setStatus("Offline");
        });

    },[]);


    return (

        <Card>

            <CardContent>

                <Typography variant="h6">
                    NovaGrid API Status
                </Typography>


                <Typography variant="h4">
                    {status}
                </Typography>

            </CardContent>

        </Card>

    );
}