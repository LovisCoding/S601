import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ModalUploadComponent from "./components/ModalUploadComponent.jsx";
import GraphComponent from "./components/GraphComponent.jsx";
import { startSimulatedAnnealing } from "./js/recuitSimule.js";
import GraphImage from './assets/img/DefaultGraph.png';
import Icon from './assets/img/RouteSolver.png';


 



export default function App() {
	const [open, setOpen] = React.useState(false);
	const [page, setPage] = React.useState(0);
	const [graphData, setGraphData] = React.useState(null);
	const totalPages = 2;

	React.useEffect(() => {
		const handleScroll = (event) => {
			event.preventDefault();
			setPage((prevPage) => {
				let newPage = event.deltaY > 0 ? prevPage + 1 : prevPage - 1;
				return Math.max(0, Math.min(totalPages - 1, newPage));
			});
		};
		// handleRunAlgorithm(null);

		window.addEventListener('wheel', handleScroll, { passive: false });

		return () => {
			window.removeEventListener('wheel', handleScroll);
		};
	}, []);

  const handleRunAlgorithm = (data) => {
    const result = startSimulatedAnnealing(data);
    setGraphData(result);
  };

	const nextPage = () => {
		setPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
	};

	const firstPage = () => {
		setPage(0);
	}

	const pageVariants = {
		initial: { opacity: 0, y: 50 },
		animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } },
		exit: { opacity: 0, y: -50, transition: { duration: 0.6, ease: "easeInOut" } }
	};


	return (
		<Box sx={{ height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: '#f5f5f5' }}>
			<Box sx={{ position: 'fixed', top: 0, left: 0, padding: 2, zIndex: 10, cursor: 'pointer' }}>
				<img src={Icon} alt="Icon" style={{ width: 130, height: 75 }} onClick={firstPage} />
			</Box>


			<AnimatePresence mode="wait">
				{page === 0 && (
					<motion.div key="page1" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ position: 'absolute', width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
						<Typography variant="h3" fontWeight="bold" sx={{ position: 'absolute', top: '30%', zIndex: 10, marginTop: 10 }}>
							ROUTESOLVER
						</Typography>
						<img src={GraphImage} alt="Graph Representation" style={{ width: 1200, height: 600, filter: 'blur(5px)' }} />

						<Box sx={{ position: 'absolute', bottom: 20, display: 'flex', justifyContent: 'center', width: '100%', cursor: 'pointer' }} onClick={nextPage}>
							<motion.svg
								xmlns="http://www.w3.org/2000/svg"
								width="30"
								height="30"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								initial={{ y: 0, opacity: 0.7 }}
								animate={{ y: 10, opacity: 1 }}
								transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", repeatType: "reverse" }}
								whileTap={{ scale: 0.9 }}
							>
								<path d="M12 19l-7-7h14l-7 7z" />
							</motion.svg>
						</Box>
					</motion.div>
				)}

				{page === 1 && (
					<motion.div key="page2" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ position: 'absolute', width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<Button variant="contained" color="primary" onClick={() => setOpen(true)}>
							Importer des données
						</Button>
					</motion.div>
				)}
			</AnimatePresence>

			<ModalUploadComponent open={open} setOpen={setOpen} onLaunch={handleRunAlgorithm}/>
			{graphData && <GraphComponent graphData={graphData} />}
		</Box>
	);
}