import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import {Dialog, DialogContent, Stack, TextField, useMediaQuery} from "@mui/material";
import Button from "@mui/material/Button";
import {HiOutlineUpload} from "react-icons/hi";
import Box from "@mui/material/Box";
import {FaCheck} from "react-icons/fa";
import {ImCross} from "react-icons/im";
import * as React from "react";
import DialogActions from "@mui/material/DialogActions";
import {useTheme} from "@mui/material/styles";
import {useState} from "react";

export default function ModalUploadComponent({open, setOpen}) {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [uploadSuccess, setUploadSuccess] = useState(null);

    const handleClose = () => {
        setOpen(false)
    };

    const uploadDocument = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            console.log(file);
            setUploadSuccess(true);
            return;
        }
        setUploadSuccess(false);
    };


    return (
        <Dialog
            fullWidth={true}
            maxWidth={'lg'}
            open={open}
            onClose={handleClose}
            fullScreen={fullScreen}
        >
            <DialogTitle>Upload un document</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Vous pouvez uploader un document pour afficher le graphe de celui-ci
                </DialogContentText>
                <Stack sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    my:4
                }}
                       direction={'row'}>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<HiOutlineUpload />}
                    >
                        Upload File
                        <input
                            type="file"
                            hidden
                            onChange={uploadDocument}
                            accept={'.txt, .data'}
                        />
                    </Button>
                    {uploadSuccess && <Box sx={{color: 'lightgreen'}}><FaCheck /></Box>}
                    {(!uploadSuccess &&  uploadSuccess  !== null) && <Box sx={{color: 'red'}}><ImCross /></Box>}
                </Stack>
                <TextField
                    id="number"
                    label="Nombre de voitures"
                    type="number"
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        },
                        inputProps: {
                            min: 0
                        }
                    }}
                    size={'small'}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}