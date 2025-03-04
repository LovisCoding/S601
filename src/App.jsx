import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { IconButton, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function App() {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };




  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open max-width dialog
      </Button>
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
          <IconButton
            variant="contained"
            component="label"
          >
            Upload File
            <input
              type="file"
              hidden
            />
          </Button>


        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}