import { useEffect, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone";

const GraphComponent = ({ graphData }) => {
    const graphRef = useRef(null);

    useEffect(() => {
        if (!graphData) return;

        // Filtrer les véhicules sans clients (juste dépôt → dépôt)
        const filteredEdges = graphData.edges.filter(edge => !(edge.from === 0 && edge.to === 0));

        const nodes = new DataSet(graphData.nodes.map(node => ({
            id: node.id,
            label: node.label,
            font: { color: "#000", size: 18, vadjust: 0 }, // Centrer le texte
            color: { border: "#000", highlight: { border: "#000" } },
            shape: "circle", // Mettre la bulle bien ronde
            size: 25
        })));

        const edges = new DataSet(filteredEdges.map(edge => ({
            from: edge.from,
            to: edge.to,
            label: edge.label.toString(),
            arrows: 'to',
            font: { align: "middle", color: "#000", size: 14 }, // Libellé centré
            color: "#000"
        })));

        const networkData = { nodes, edges };
        const options = {
            edges: { color: "#000000" },
            nodes: { shape: "circle", size: 20 },
        };

        new Network(graphRef.current, networkData, options);
    }, [graphData]);

	return (
		<div style={{ display: "flex", width: "100%", height: "80vh", position: "relative" }}>
			{/* Légende */}
			<div style={{
						display: "flex",
						flexDirection: "column",
						width: "450px",
						height: "50%", 
						overflowY: "auto",
						borderRadius: "10px",
						padding: "10px",
						fontSize: "10px"
					}}>
						<h3 style={{ marginTop: 0 }}>Résumé de la Solution :</h3>
						<pre style={{ marginTop: "10px", whiteSpace: "pre-wrap" }}>{graphData.textResult}</pre>
					
			</div>

			{/* Graphique */}
			<div ref={graphRef} style={{ flex: 1, height: "100%", order: 2 }} />
		
		
		</div>

	  );};

export default GraphComponent;
