import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ModalUploadComponent from "./components/ModalUploadComponent.jsx";
import GraphComponent from "./components/GraphComponent.jsx";
import { startSimulatedAnnealing } from "./js/recuitSimule.js";



export default function App() {
  const [open, setOpen] = React.useState(false);
  const [graphData, setGraphData] = React.useState(null);


  const handleClickOpen = () => {
    setOpen(true);
  };
  const setOpenModal = (bool) => {
    setOpen(bool)
  }

  const handleRunAlgorithm = () => {
    const result = startSimulatedAnnealing();
    setGraphData(result);
  };



  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open max-width dialog
      </Button>
      <ModalUploadComponent open={open} setOpen={setOpenModal} />

      <Button variant="contained" color="primary" onClick={handleRunAlgorithm}>
        Lancer l'algorithme
      </Button>

      {graphData && <GraphComponent graphData={graphData} />}

    </React.Fragment>
  );
}