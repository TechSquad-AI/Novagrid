import React, { useState } from "react";

import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    TextField
} from "@mui/material";


import SearchIcon from "@mui/icons-material/Search";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";


import { registerAPI, checkAPIHealth } from "../api/services";



function ScanPanel({ setScanData, setHistory }) {


    const [result,setResult] = useState(null);

    const [loading,setLoading] = useState(false);


    const [apiName,setApiName] = useState("");

    const [apiUrl,setApiUrl] = useState("");

    const [expectedResponse,setExpectedResponse] = useState("200");




    const checkAPI = async()=>{


        try{


            setLoading(true);            // 1. Register API

            const createResponse = await registerAPI(apiName, apiUrl);



            console.log(
                "Created API:",
                createResponse
            );




            if(!createResponse.api){

                throw new Error(
                    "API creation failed"
                );

            }



            const apiId =
                createResponse.api.id;




            // 2. Health Check

            const healthData = await checkAPIHealth(apiId);



            console.log(
                "Health:",
                healthData
            );



            setResult(
                healthData
            );


            setScanData(
                healthData
            );



            setHistory(prev=>[

                healthData,

                ...prev

            ]);



        }


        catch(error){


            console.log(error);



            const failed = {


                status:"failed",

                error:error.message


            };



            setResult(
                failed
            );


            setHistory(prev=>[

                failed,

                ...prev

            ]);

        }



        finally{


            setLoading(false);

        }


    };





    return (

<Card

sx={{

background:"#111827",

borderRadius:3,

boxShadow:5

}}

>


<CardContent>



<Typography

variant="h5"

sx={{

color:"#fff",

fontWeight:700

}}

>

Real API Health Checker

</Typography>




<Typography

sx={{

color:"#94A3B8",

mt:1

}}

>

Check API availability, response time and status.

</Typography>




<Box sx={{mt:3}}>



<TextField

fullWidth

label="API Name"

value={apiName}

onChange={
e=>setApiName(e.target.value)
}

sx={{

mb:2,

background:"#fff",

borderRadius:1

}}

/>




<TextField

fullWidth

label="API URL"

value={apiUrl}

onChange={
e=>setApiUrl(e.target.value)
}

sx={{

mb:2,

background:"#fff",

borderRadius:1

}}

/>




<TextField

fullWidth

label="Expected Response"

value={expectedResponse}

onChange={
e=>setExpectedResponse(e.target.value)
}

sx={{

mb:2,

background:"#fff",

borderRadius:1

}}

/>



<Button


variant="contained"


startIcon={

loading ?

<CircularProgress

size={20}

color="inherit"

/>

:

<SearchIcon/>

}



onClick={checkAPI}



disabled={loading}



sx={{

background:"#2563EB",

px:4

}}



>



{

loading ?

"Checking..."

:

"Check API"

}



</Button>



</Box>







{

result &&

<Box sx={{mt:4}}>


<Divider

sx={{

borderColor:"#334155"

}}

/>



{

result.status === "success" ?

<Alert

severity="success"

icon={<CheckCircleIcon/>}

sx={{mt:2}}

>

API Check Completed

</Alert>


:

<Alert

severity="error"

icon={<ErrorIcon/>}

sx={{mt:2}}

>

API Check Failed: {result.error}

</Alert>

}




{

result.health &&


<Box sx={{mt:3}}>



<Typography

sx={{

color:"#fff",

fontWeight:700

}}

>

API Status:

</Typography>



<Chip

label={

result.health.status

}

color={

result.health.status==="healthy"

?

"success"

:

"error"

}


/>




<Typography

sx={{

color:"#CBD5E1",

mt:2

}}

>

HTTP Status:

{

result.health.http_status

}

</Typography>




<Typography

sx={{

color:"#CBD5E1"

}}

>

Response Time:

{

result.health.response_time_ms

}

ms

</Typography>




<Typography

sx={{

color:"#CBD5E1"

}}

>

Last Checked:

{

result.health.checked_at

}

</Typography>



</Box>


}



</Box>


}



</CardContent>


</Card>


    );

}



export default ScanPanel;