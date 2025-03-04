import * as React from 'react';
import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ModalUploadComponent from "./components/ModalUploadComponent.jsx";
import Icon from './assets/img/RouteSolver.png';
import { Network } from 'vis-network/standalone';

export default function App() {
	const [open, setOpen] = React.useState(false);
	const graphRef = useRef(null);

	useEffect(() => {
		if (graphRef.current) {
			const nodes = [
				{ id: 0, label: 'Dépôt', color: { background: '#ff0000' } }, // Dépôt
				{ id: 1, label: 'Client 1' },
				{ id: 2, label: 'Client 2' },
				{ id: 3, label: 'Client 3' },
				{ id: 4, label: 'Client 4' },
			];

			const edges = [
				{ from: 0, to: 1 },
				{ from: 1, to: 2 },
				{ from: 2, to: 3 },
				{ from: 3, to: 4 },
				{ from: 4, to: 0 },
			];

			new Network(graphRef.current, { nodes, edges }, {});
		}
	}, []);

	return (
	<Box sx={{ height: '200vh', backgroundColor: '#f5f5f5' }}>
		<Box sx={{ position: 'fixed', top: 0, left: 0, padding: 2 }}>
			<img src={Icon} alt="Icon" style={{ width: 130, height: 75 }} />
		</Box>
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', position: 'relative' }}>
			<Typography variant="h3" fontWeight="bold" sx={{ position: 'absolute', top: '40%', zIndex: 10 }}>
				ROUTESOLVER
			</Typography>
			<Box ref={graphRef} sx={{ width: '600px', height: '400px', marginTop: 2, filter: 'blur(2px)' }} />
		</Box>
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
			<Button variant="contained" color="primary" onClick={() => setOpen(true)}>
				Importer des données
			</Button>
		</Box>
		
		<ModalUploadComponent open={open} setOpen={setOpen} />
	</Box>
	);
}