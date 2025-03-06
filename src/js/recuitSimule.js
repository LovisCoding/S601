import { clone } from "chart.js/helpers";

// Données par défaut pour simuler l'algorithme

let objectif = 31.3; // Objectif minimal trouvée
let nbVehicules = 4; // Nombre de véhicules
let nbClients = 10;  // Nombre de clients
let capaciteVehicule = 100; // Capacité maximale de chaque véhicule (en termes de poids ou de colis)
let demandesClients = [60, 18, 26, 15, 44, 32, 20, 10, 27, 11];
let matDistanceClient = [
	[0, 2.7, 4.6, 2.8, 3, 3.3, 3.1, 2.7, 5.1, 3.9, 4.7],
	[2.7, 0, 3.1, 0.8, 1.8, 2.5, 4.2, 1.4, 3.6, 2.5, 3],
	[4.6, 3.1, 0, 3.3, 4.4, 1.7, 6.8, 4.1, 1.3, 1.7, 1.4],
	[2.8, 0.8, 3.3, 0, 1.9, 2, 4, 1.5, 3.8, 2.8, 3.2],
	[3, 1.8, 4.4, 1.9, 0, 3.4, 2.6, 0.5, 4.7, 4.7, 4.1],
	[3.3, 2.5, 1.7, 2, 3.4, 0, 5.8, 3, 1.8, 0.5, 2.6],
	[3.1, 4.2, 6.8, 4, 2.6, 5.8, 0, 3, 7.4, 6.1, 7.6],
	[2.7, 1.4, 4.1, 1.5, 0.5, 3, 3, 0, 4.6, 3.7, 4.3],
	[5.1, 3.6, 1.3, 3.8, 4.7, 1.8, 7.4, 4.6, 0, 1.4, 2.8],
	[3.9, 2.5, 1.7, 2.8, 4.7, 0.5, 6.1, 3.7, 1.4, 0, 2.8],
	[4.7, 3, 1.4, 3.2, 4.1, 2.6, 7.6, 4.3, 2.8, 2.8, 0]
];

// Implémentation du recuit simulé

export function startSimulatedAnnealing(data) {

	// Récupération des données
	if (data != null) {
		objectif = data.objectif || 0;
		nbVehicules = data.nbVehicules;
		nbClients = data.nbClients;
		capaciteVehicule = data.quantiteMax;
		demandesClients = data.demandesClients;
		matDistanceClient = data.matDistanceClient;
	}

	// Initialisation des variables
	let timeStart = Date.now();
	let solution = initializeSolution();
	let T = data.tempInit || 10000;
	let alpha = data.tempFactor || 0.999;
	let TMin = data.tempMin || 0.001;
	let maxIterations = data.iterations || 10000;
	let minImprovement = 0.001;
	let totalDemande = 0
	let graphData = {};

	graphData.edges = [];
	graphData.nodes = [];
	graphData.maxDistance = 0;

	// Vérification des contraintes
	for (let iDemande = 0; iDemande < demandesClients.length; iDemande++) {
		totalDemande += demandesClients[iDemande];

		if (demandesClients[iDemande] > capaciteVehicule) {
			graphData.textResult = "La demande d'un client dépasse la quantité maximum des véhicules";
			return {...graphData};
		}
	}
	
	if (totalDemande > nbVehicules * capaciteVehicule){
		graphData.textResult = "Les demandes des clients sont trop grandes pour le nombre de véhicules";
		return {...graphData};
	}

	let bestObjective = Infinity;
	let noImprovementCounter = 0;
	let iterUtilisee = maxIterations;
	let raisonFin = " maximum d'itérations utilisées";

	// Logique principale
	for (let iter = 0; iter < maxIterations; iter++) {
		// Arrêt si la température minimale est atteinte
		if (T < TMin) {
			iterUtilisee = iter;
			raisonFin = " température minimale atteinte"
			break;
		}
	
		let newSolution = perturbSolution(solution, T);

		let newObjective = evaluateSolution(newSolution).totalDistance;
	
		// Si la nouvelle solution est meilleure, on la garde
		if (newObjective < bestObjective) {
			bestObjective = newObjective;
			solution = clone(newSolution);
			noImprovementCounter = 0;
		} 
	
		// Si aucune amélioration importante n'est détectée, on arrête plus tôt
		if (Math.abs(bestObjective - newObjective) < minImprovement) {
			noImprovementCounter++;
			if (noImprovementCounter > maxIterations/100) {
				iterUtilisee = iter;
				raisonFin = " Pas de changements sur les " + maxIterations/100 + " dernières itérations";
				break;
			} 
		}
	
		T *= alpha; // Réduction de la température

	}

	// Génération des données pour le graphique
	let textResult = "Solution trouvée : " + bestObjective.toFixed(2) + " kilomètres";
	if (objectif != 0) {
		let diffObjectif = (bestObjective - objectif);
		textResult = "Solution trouvée : " + bestObjective.toFixed(2) + " / " + objectif.toFixed(2) + " kilomètres";
		if (diffObjectif >= 0.01) {
			textResult += " ( +" +  ((diffObjectif/bestObjective)*100).toFixed(2) + "% )";
		}
	}

	textResult += "\n\n📊 Statistiques : "

	let execTime = (Date.now() - timeStart)/1000
	textResult += "\n\n • ⏳ Temps utilisé : " + execTime.toFixed(3) + " seconde";
	if (execTime >= 2)
		textResult += "s";

	if (objectif != 0) {
		let diffObjectif = (bestObjective - objectif);
		if (diffObjectif >= 0.01) {
			textResult += "\n • 📉 Différences avec la solution optimale : " + diffObjectif.toFixed(2) + " kilomètre";
			if (diffObjectif >= 2)
				textResult += "s"
		}
	}
	textResult += "\n • 🛑 Raison de l'arrêt : " + raisonFin;
	textResult += "\n • 🔄 Itérations utilisées : " + iterUtilisee;
	textResult += "\n\n 🗺️ Trajets : ";

	for (let v = 0; v < nbVehicules; v++) {
		textResult += "\n\n 🚚 Véhicule " + (v+1) + " : ";
		let distanceTotale = 0;
		let currentClient = 0;
		let poidsUtilise = 0;
		if (solution[v].length > 0) {
			textResult += "\n • 🏭 Dépôt "
			for (let i = 0; i < solution[v].length; i++) {
				let nextClient = solution[v][i];
				textResult += " → C" + (nextClient+1);
				distanceTotale += matDistanceClient[currentClient][nextClient+1];
				poidsUtilise += demandesClients[nextClient];
				currentClient = nextClient+1;
			}

			distanceTotale += matDistanceClient[currentClient][0];
			textResult += " → Dépôt";
			textResult += "\n • 🌍 Distance parcourue : " + distanceTotale.toFixed(2) + " kilomètre";
			if (distanceTotale > 1)
				textResult += "s"
			textResult += "\n • 🎯 Poids utilisée : " + poidsUtilise.toFixed(2);
		}
		else 
			textResult += " ❌";
	}

	graphData = generateGraphData(solution);
	graphData.textResult = textResult;
	return { ...graphData};
}


// Fonction pour évaluer la solution courante
function evaluateSolution(solution) {
	let totalDistance = 0;
	let capacityExceeded = false;

	// On parcourt chaque véhicule et son parcours
	for (let v = 0; v < nbVehicules; v++) {
		let distanceTotale = 0;
		let currentClient = 0; // Le véhicule commence au dépôt
		let currentLoad = 0; // Charge actuelle du véhicule

		// Si le véhicule a des clients assignés, on calcule la distance
		if (solution[v] != null && solution[v].length > 0) {
			for (let i = 0; i < solution[v].length; i++) {
				let nextClient = solution[v][i];

				distanceTotale += matDistanceClient[currentClient][nextClient+1];
				currentLoad += demandesClients[nextClient];

				if (currentLoad > capaciteVehicule) {
					capacityExceeded = true; // Si on dépasse la capacité, on marque cette contrainte
					break;
				}

				currentClient = nextClient+1;
			}

			distanceTotale += matDistanceClient[currentClient][0];
		}

		totalDistance += distanceTotale;
	}

	return { totalDistance, capacityExceeded };
}


// Initialisation avec une méthode gloutonne randomisée
function initializeSolution() {
	let solution = [];
	let clients = Array.from({ length: nbClients }, (_, index) => index); // Liste des clients (0 à nbClients-1)

	// Distribution des clients parmi les véhicules de manière gloutonne mais randomisée
	for (let v = 0; v < nbVehicules; v++) {
		solution[v] = [];
	}

	// Mélanger les clients pour introduire de la randomisation avant la distribution
	clients = shuffleArray(clients);

	clients.forEach(client => {
		// Attribuer les clients aux premiers véhicules non remplis
		for (let v = 0; v < nbVehicules; v++) {
			if (countPoids(solution[v], client)) {
				solution[v].push(client);
				break;
			}
		}
	});

	return solution;
}

// Fonction de mélange aléatoire
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

// Fonction pour vérifier si la capacité du véhicule est dépassée
function countPoids(vehicule, client) {
	let total = 0;
	// Calcul de la charge actuelle du véhicule
	for(let s = 0; s < vehicule.length; s++) {
		total += demandesClients[vehicule[s]];
	}

	// Ajout du poids du client courant
	if (client != null)
		total += demandesClients[client];
	return total <= capaciteVehicule; // Retourne true si la capacité est respectée
}

function perturbSolution(solution, temperature) {
	let bestSolution = clone(solution);
	let bestObjective = evaluateSolution(bestSolution).totalDistance;

	for (let i = 0; i < nbClients; i++) {
		let newSolution = clone(bestSolution);

		// Sélectionner deux véhicules aléatoires
		let v1 = Math.floor(Math.random() * nbVehicules);
		let v2 = Math.floor(Math.random() * nbVehicules);

		if (v1 !== v2 && newSolution[v1].length > 0) {
			let clientIndex = Math.floor(Math.random() * newSolution[v1].length);

			let client = newSolution[v1][clientIndex];

			// Vérifier si le véhicule v2 peut accueillir ce client
			if (countPoids(newSolution[v2], client)) {
				let randClientIndex = Math.floor(Math.random() * (newSolution[v2].length + 1));
				newSolution[v2].splice(randClientIndex, 0, client);
				newSolution[v1].splice(clientIndex, 1);
			}

			let newObjective = evaluateSolution(newSolution).totalDistance;


			let newSolutionShuffle = clone(newSolution)
			// Ajouter une légère perturbation (shuffle d'un véhicule)
			let vehiculeIndex = Math.floor(Math.random() * nbVehicules);
			newSolutionShuffle[vehiculeIndex] = shuffleArray(newSolutionShuffle[vehiculeIndex]);

			let newShuffleObjective = evaluateSolution(newSolutionShuffle).totalDistance;

			if (newShuffleObjective < newObjective) {
				newSolution = newSolutionShuffle;
				newObjective = newShuffleObjective;
			}
				
			// Évaluation
			let delta = newObjective - bestObjective;

			// 🌡️ **Règle d'acceptation du recuit simulé**
			if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
				bestSolution = newSolution;
				bestObjective = newObjective;
			}
		}
	}
	

	return bestSolution;
}

// Générer les données pour le graphique

function generateGraphData(solution) {
	let nodes = [{ id: 0, label: "🏭", color: "red", fontSize: 35, nodeSize: 100, widthConstraint:100 }];
	let edges = [];
	let maxDistance = 0;

	solution.forEach(route => {
		let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
		let prevNode = 0; // Dépôt

		route.forEach(client => {
			let nodeId = client+1;

			if (!nodes.find(n => n.id === nodeId)) {
				nodes.push({ id: nodeId, label: `👨🏻‍💼${nodeId}`, color: color, fontSize: 18, nodeSize: 25, widthConstraint:50 });
			}

			if (prevNode < matDistanceClient.length && nodeId < matDistanceClient[prevNode].length) {
				
				edges.push({
					from: prevNode,
					to: nodeId,
					label: `${matDistanceClient[prevNode][nodeId].toFixed(1)} km`,
					color: color,
					edgeSize: matDistanceClient[prevNode][nodeId]
				});
				if (matDistanceClient[prevNode][nodeId] > maxDistance) {
					maxDistance = matDistanceClient[prevNode][nodeId];
				}
			} else {
				console.warn(`Index out of bounds: prevNode=${prevNode}, nodeId=${nodeId}`);
			}

			prevNode = nodeId;
		});

		// Retour au dépôt
		if (prevNode < matDistanceClient.length && 0 < matDistanceClient[prevNode].length) {
			edges.push({
				from: prevNode,
				to: 0,
				label: `${matDistanceClient[prevNode][0].toFixed(1)} km`,
				edgeSize: matDistanceClient[prevNode][0],
				color: color
			});
		}
	});

	return { nodes, edges, maxDistance };
}