import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import {
	Alert,
	Dialog,
	DialogContent,
	Grid2,
	Slider,
	Snackbar,
	Stack,
	Tooltip,
	Typography,
	TextField,
	useMediaQuery,
	CircularProgress
} from "@mui/material";
import Button from "@mui/material/Button";
import { HiOutlineUpload } from "react-icons/hi";
import Box from "@mui/material/Box";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import * as React from "react";
import DialogActions from "@mui/material/DialogActions";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import convertDocument from "../js/convertDocument.js";

export default function ModalUploadComponent({ open, setOpen, onLaunch }) {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);
	const [uploadSuccess, setUploadSuccess] = useState(null);
	const [loading, setLoading] = useState(false);
	const [values, setValues] = useState({
		vehicles: 12,
		tempMin: 0.001,
		tempInit: 10000,
		tempFactor: 0.999,
		iterations: 10000
	});

	const handleChange = (key) => (event, newValue) => {
		setValues((prev) => ({ ...prev, [key]: newValue }));
	};

	const handleTextChange = (key) => (event) => {
		const value = parseFloat(event.target.value);
		if (!isNaN(value)) {
			setValues((prev) => ({ ...prev, [key]: value }));
		}
	};

	const handleClose = () => {
		setOpen(false);
	};

	const startAlgo = async () => {
		if (uploadSuccess) {
			setLoading(true);
			const algoData = {
				objectif: data.objectif,
				nbVehicules: values.vehicles,
				nbClients: data.demandesClients.length,
				quantiteMax: data.quantiteMax,
				demandesClients: data.demandesClients,
				matDistanceClient: data.matDistanceClient,
				tempMin: values.tempMin,
				tempInit: values.tempInit,
				tempFactor: values.tempFactor,
				iterations: values.iterations
			};
			try {
				await new Promise((resolve) => {
					setTimeout(async () => {
						await onLaunch(algoData);
						setLoading(false);
						setOpen(false);
						resolve();
					}, 100);
				});
			} catch (error) {
				setLoading(false);
				console.error("Error running algorithm:", error);
			}
			return;
		}
		setUploadSuccess(false);
	};

	const uploadDocument = async (event) => {
		if (event.target.files && event.target.files[0]) {
			setUploadSuccess(true);
			await convertDocument(event.target.files[0]).then((data) => {
				setData(data);
			}).catch(() => {
				setError("Le fichier ne peut pas être formaté");
				setUploadSuccess(false);
			});
			return;
		}
		setUploadSuccess(false);
	};

	return (
		<>
			<Dialog
				fullWidth={true}
				maxWidth={'lg'}
				open={open}
				onClose={handleClose}
				fullScreen={fullScreen}
			>
				<DialogTitle>Utilisation de l'algorithme Recuit Simulé</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Veuillez sélectionner un fichier .txt contenant les données du VRP. 
					</DialogContentText>
					<Stack
						direction="row"
						sx={{
							justifyContent: "center",
							alignItems: "center",
							gap: 2,
							my: 4,
						}}
					>
						<Button
							variant="contained"
							component="label"
							startIcon={<HiOutlineUpload />}
							aria-label="Upload File"
						>
							Ajouter un fichier
							<input
								type="file"
								hidden
								onChange={uploadDocument}
								accept=".txt"
							/>
						</Button>

						<Box
							sx={{
								minWidth: 24,
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							{uploadSuccess === true && (
								<Tooltip title="Upload réussi">
									<FaCheck color="#4CAF50" />
								</Tooltip>
							)}
							{uploadSuccess === false && (
								<Tooltip title="Pas de fichier uploadé">
									<ImCross color="#F44336" />
								</Tooltip>
							)}
						</Box>
					</Stack>
					<Grid2 container spacing={2} sx={{ justifyContent: 'space-evenly' }}>
						<Grid2 xs={6} sm={4}>
							<Typography>Nombre de véhicules</Typography>
							<Slider
								value={values.vehicles}
								onChange={handleChange("vehicles")}
								min={1}
								max={50}
								step={1}
								valueLabelDisplay="auto"
							/>
							<TextField
								value={values.vehicles}
								onChange={handleTextChange("vehicles")}
								fullWidth
								type="number"
								variant="outlined"
								size="small"
							/>
						</Grid2>
						<Grid2 xs={6} sm={4}>
							<Typography>Température minimale</Typography>
							<Slider
								value={values.tempMin}
								onChange={handleChange("tempMin")}
								min={0}
								max={1}
								step={0.0001}
								valueLabelDisplay="auto"
							/>
							<TextField
								value={values.tempMin}
								onChange={handleTextChange("tempMin")}
								fullWidth
								type="number"
								variant="outlined"
								size="small"
								step="any"
							/>
						</Grid2>
						<Grid2 xs={6} sm={4}>
							<Typography>Température initiale</Typography>
							<Slider
								value={values.tempInit}
								onChange={handleChange("tempInit")}
								min={1}
								max={200000}
								step={5000}
								valueLabelDisplay="auto"
							/>
							<TextField
								value={values.tempInit}
								onChange={handleTextChange("tempInit")}
								fullWidth
								type="number"
								variant="outlined"
								size="small"
							/>
						</Grid2>
						<Grid2 xs={6} sm={4}>
							<Typography>Réduction de température</Typography>
							<Slider
								value={values.tempFactor}
								onChange={handleChange("tempFactor")}
								min={0}
								max={1}
								step={0.00001}
								valueLabelDisplay="auto"
							/>
							<TextField
								value={values.tempFactor}
								onChange={handleTextChange("tempFactor")}
								fullWidth
								type="number"
								variant="outlined"
								size="small"
								step="any"
							/>
						</Grid2>
						<Grid2 xs={6} sm={4}>
							<Typography>Nombre d'itérations</Typography>
							<Slider
								value={values.iterations}
								onChange={handleChange("iterations")}
								min={1000}
								max={20000000}
								step={50000}
								valueLabelDisplay="auto"
							/>
							<TextField
								value={values.iterations}
								onChange={handleTextChange("iterations")}
								fullWidth
								type="number"
								variant="outlined"
								size="small"
							/>
						</Grid2>
					</Grid2>
					{loading && (
					<Box
						sx={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: "rgba(0, 0, 0, 0.5)",
							zIndex: 1300,
						}}
					>
						<CircularProgress size={60} color="primary"  disableShrink/>
					</Box>
				)}
				</DialogContent>
				<DialogActions>
					<Button onClick={startAlgo}>Lancer l'Algorithme</Button>
				</DialogActions>
			</Dialog>
			
			<Snackbar
				open={!!error}
				autoHideDuration={5000}
				onClose={() => setError(null)}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Alert onClose={() => setError(null)} severity="error">
					{error}
				</Alert>
			</Snackbar>
		</>
	);
}