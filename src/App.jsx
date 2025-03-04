import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ModalUploadComponent from "./components/ModalUploadComponent.jsx";



export default function App() {
  const [open, setOpen] = React.useState(false);



  const handleClickOpen = () => {
    setOpen(true);
  };
  const setOpenModal = (bool) => {
    setOpen(bool)
  }



  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open max-width dialog
      </Button>
      <ModalUploadComponent open={open} setOpen={setOpenModal} />
    </React.Fragment>
  );
}