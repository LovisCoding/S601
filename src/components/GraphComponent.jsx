import { useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";
import { Typography, Box } from "@mui/material";

const GraphComponent = ({ graphData }) => {
    const graphRef = useRef(null);


    console.log(graphData.nodes);

    useEffect(() => {
        if (!graphData) return;

        const filteredEdges = graphData.edges.filter(edge => !(edge.from === 0 && edge.to === 0));

        const nodes = new DataSet(graphData.nodes.map(node => ({
            id: node.id,
            label: node.label,
            font: { 
                color: "#000", 
                size: node.fontSize ,// Taille du texte augmentée
                vadjust: 0 // Légère correction pour un meilleur centrage
            },
            color: { 
                border: node.color, 
                background: '#FFF', // Couleur différente pour le dépôt (facultatif)
                highlight: { border: "#000" } 
            },
            shape: "circle",
            size: node.nodeSize, // Taille du dépôt plus grande (100 plutôt que 200 pour éviter trop de vide)
            heightConstraint: { minimum: node.nodeSize, valign: "middle" }, //  Ajustement de la hauteur pour forcer le centrage
            widthConstraint: { minimum: node.widthConstraint, maximum: 200 }, 
        })));
        
        console.log(((filteredEdges[0].edgeSize *100 )/ (graphData.maxDistance)));
        
        console.log(filteredEdges[0], graphData.maxDistance, typeof graphData.maxDistance, filteredEdges[0].edgeSize/ graphData.maxDistance);
        
        const edges = new DataSet(filteredEdges.map(edge => {
            console.log(graphData.maxDistance, edge.edgeSize, );
            
            return ({
            from: edge.from,
            to: edge.to,
            label: edge.label.toString(),
            arrows: 'to',
            font: { align: "middle", color: "#000", size: 14 },
            color: edge.color,
            length: ((edge.edgeSize *200 ) / (graphData.maxDistance))
            
        })}));
    
        

        const networkData = { nodes, edges };
        const options = {
            edges: { color: "#000000", font: {align: 'middle'} },
            nodes: { shape: "circle" },
            autoResize: false,
        };

        new Network(graphRef.current, networkData, options);
    }, [graphData]);

    return (
        <Box display="flex" width="100%" height="80vh" position="relative">
            <Box display="flex" flexDirection="column" width="450px" height="80%" overflow="auto" padding={2}>
                <Typography variant="h6" fontWeight="bold">📋 Résumé de la Solution :</Typography>
                <Typography component="pre" whiteSpace="pre-wrap" mt={1}>{graphData.textResult}</Typography>
            </Box>
            <Box ref={graphRef} flex={1} height="100%" order={2} />
        </Box>
    );
};

export default GraphComponent;