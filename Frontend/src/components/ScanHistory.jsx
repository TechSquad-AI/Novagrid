import React from "react";

import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from "@mui/material";


function ScanHistory({history}){


    return (

        <Card

            sx={{

                mt:4,

                background:"#111827",

                borderRadius:3

            }}

        >


            <CardContent>


                <Typography

                    variant="h5"

                    sx={{

                        color:"#fff",

                        fontWeight:700,

                        mb:3

                    }}

                >

                    Recent Scan History

                </Typography>




                <TableContainer>


                    <Table>


                        <TableHead>


                            <TableRow>


                                <TableCell sx={{color:"#94A3B8"}}>
                                    Status
                                </TableCell>


                                <TableCell sx={{color:"#94A3B8"}}>
                                    Changes
                                </TableCell>


                                <TableCell sx={{color:"#94A3B8"}}>
                                    Time
                                </TableCell>


                            </TableRow>


                        </TableHead>



                        <TableBody>


                            {
                                history.length === 0

                                ?

                                <TableRow>

                                    <TableCell
                                        colSpan={3}
                                        sx={{color:"#94A3B8"}}
                                    >

                                        No scans yet

                                    </TableCell>

                                </TableRow>


                                :

                                history.map((item,index)=>(


                                    <TableRow key={index}>


                                        <TableCell>


                                            <Chip

                                                label={item.status}

                                                color={
                                                    item.status === "scan_completed"
                                                    ?
                                                    "success"
                                                    :
                                                    "error"
                                                }

                                            />


                                        </TableCell>                                        <TableCell sx={{color:"#fff"}}>


                                            {
                                                item.changes && typeof item.changes === "object"

                                                ?
                                                ((item.changes.added?.length || 0) +
                                                (item.changes.removed?.length || 0))

                                                :
                                                0
                                            }

                                            {" "}changes


                                        </TableCell>



                                        <TableCell sx={{color:"#CBD5E1"}}>

                                            Just now

                                        </TableCell>



                                    </TableRow>


                                ))

                            }


                        </TableBody>


                    </Table>


                </TableContainer>



            </CardContent>


        </Card>

    );


}


export default ScanHistory;