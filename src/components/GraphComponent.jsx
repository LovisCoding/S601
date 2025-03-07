import { useState, useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import { Typography, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const GraphComponent = ({ graphData }) => {
    const graphRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [selectedIteration, setSelectedIteration] = useState("");

    useEffect(() => {
        if (!graphData || !graphRef.current) return;

        const filteredEdges = graphData.edges.filter(edge => !(edge.from === 0 && edge.to === 0));

        const nodes = new DataSet(graphData.nodes.map(node => ({
            id: node.id,
            label: node.label,
            font: { 
                color: "#000", 
                size: node.fontSize,
                vadjust: 0
            },
            color: { 
                border: node.color, 
                background: '#FFF',
                highlight: { border: "#000" } 
            },
            shape: "circle",
            size: node.nodeSize,
            heightConstraint: { minimum: node.nodeSize, valign: "middle" },
            widthConstraint: { minimum: node.widthConstraint, maximum: 200 }, 
            vehicle: node.vehicle,
            ask: node.ask,
            clientsTrajet : node.clientsTrajet
        })));

        const edges = new DataSet(filteredEdges.map(edge => ({
            from: edge.from,
            to: edge.to,
            label: edge.label.toString(),
            arrows: 'to',
            font: { align: "middle", color: "#000", size: 14 },
            color: edge.color,
            length: ((edge.edgeSize * 200) / (graphData.maxDistance))
        })));

        const networkData = { nodes, edges };
        const options = {
            edges: { color: "#000000", font: { align: 'middle' } },
            nodes: { shape: "circle" },
            autoResize: true, // Assure que le graphique s'ajuste à l'écran
            interaction: { hover: true },
            physics: { stabilization: true },
            layout: { improvedLayout: true } // Meilleure disposition des nœuds
        };

        const network = new Network(graphRef.current, networkData, options);

        network.on("click", (params) => {
            if (params.nodes.length) {
                const nodeId = params.nodes[0];
                if (nodeId === 0) return;
                const nodeData = nodes.get(nodeId);
                setSelectedNode(nodeData);
                setOpen(true);
            }
        });
    }, [graphData]);

    const handleClose = () => {
        setOpen(false);
        setOpenDetail(false);
    };

    const handleSelectChange = (event) => {
        const iteration = event.target.value;
        setSelectedIteration(iteration);
        const selectedSolution = graphData.previousBestSolutions.find(solution => solution.iteration === iteration);
        if (selectedSolution) {
            setSelectedDetail(selectedSolution);
            setOpenDetail(true);
        }
    };

    return (
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} width="100%" height="96vh" position="relative">
            <Box width={{ xs: "100%", md: "450px" }} display="flex" flexDirection="column">
                <FormControl size="small" sx={{ mb: 4, mx: 1 }}>
                    <InputLabel>Ouvrir une solution précédente</InputLabel>
                    <Select value={selectedIteration} onChange={handleSelectChange} label="Ouvrir une solution précédente">
                        {graphData.previousBestSolutions.map(solution => (
                            <MenuItem key={solution.iteration} value={solution.iteration}>
                                Iteration {solution.iteration}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box display="flex" flexDirection="column" height="75%" overflow="auto" padding={2}>
                    <Typography variant="h6" fontWeight="bold">📋 Résumé de la Solution :</Typography>
                    <Typography component="pre" whiteSpace="pre-wrap" mt={1}>
                        {graphData.textResult}
                    </Typography>
                </Box>
            </Box>

            <Box ref={graphRef} flex={1} height="100%" order={2} minWidth="300px" />

            <Dialog open={openDetail} onClose={handleClose}>
                <DialogTitle>Détail de la solution</DialogTitle>
                <DialogContent>
                    {selectedDetail ? (
                        <>
                            <Typography style={{ whiteSpace: "pre-wrap" }}>
                                {selectedDetail.text}
                            </Typography>
                        </>
                    ) : (
                        <DialogContentText>Aucun détail disponible.</DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Fermer</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Détail du Nœud</DialogTitle>
                <DialogContent>
                    {selectedNode ? (
                        <>
                            <DialogContentText>
                                <strong>🚚 Véhicule :</strong> {selectedNode.vehicle}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>👨🏻‍💼 Nombre de clients desservis par ce véhicule :</strong> {selectedNode.clientsTrajet}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>📦 Demandes :</strong> {selectedNode.ask}
                            </DialogContentText>
                        </>
                    ) : (
                        <DialogContentText>Aucun détail disponible.</DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Fermer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GraphComponent;