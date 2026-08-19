import React from "react";

import {
    Card,
    CardContent,
    Typography,
    Box
} from "@mui/material";


function StatCard({title,value,icon,color}){

    return (

        <Card

            sx={{

                background:"#1E293B",

                borderRadius:3,

                height:150,

                transition:"0.3s",

                "&:hover":{

                    transform:"translateY(-5px)",

                    boxShadow:"0 10px 30px rgba(0,0,0,0.4)"

                }

            }}

        >

            <CardContent>


                <Box

                    sx={{

                        display:"flex",

                        justifyContent:"space-between"

                    }}

                >

                    <Box>

                        <Typography
                            color="#94A3B8"
                        >
                            {title}
                        </Typography>


                        <Typography

                            variant="h3"

                            sx={{

                                mt:2,

                                fontWeight:700,

                                color:"#fff"

                            }}

                        >

                            {value}

                        </Typography>


                    </Box>


                    <Box

                        sx={{

                            color:color,

                            fontSize:40

                        }}

                    >

                        {icon}

                    </Box>


                </Box>


            </CardContent>


        </Card>

    );

}


export default StatCard;