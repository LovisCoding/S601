let nbVehicules = 4;   // Nombre de véhicules
let nbClients = 10;     // Nombre de clients
let capaciteVehicule = 100; // Capacité maximale de chaque véhicule (en termes de poids ou de colis)

let demandesClients = [60, 18, 26, 15, 44, 32, 20, 10, 27, 11]; // Demande des clients
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


// Recuit simulé
export function startSimulatedAnnealing(data) {
	nbVehicules = data.nbVehicules;
	nbClients = data.nbClients;
	capaciteVehicule = data.quantiteMax;
	demandesClients = data.demandesClients;
	matDistanceClient = data.matDistanceClient;

	// Initialisation de la solution initiale (aléatoire)
	
	let solution = initializeSolution();
	console.log('je penetre')
	let bestSolution = solution;
	let bestObjective = evaluateSolution(solution).totalDistance;
	let bestCapacityExceeded = false;
	
	let T = 10000000; // Température initiale
	let TMin = 0.0000001; // Température minimale
	let alpha = 0.99999995; // Facteur de réduction de température
	let maxIterations = 500000; // Nombre d'itérations

	// Recuit simulé
	for (let iter = 0; iter < maxIterations; iter++) {
		if (iter % 1000000 === 0) console.log(`Iteration ${iter} - Température: ${T.toFixed(5)}`);
		if (T < TMin) break;

		let newSolution = perturbSolution(solution);
		let currentObjective = evaluateSolution(solution).totalDistance;
		let newObjective = evaluateSolution(newSolution).totalDistance;
		// let currentCapacityExceeded = evaluateSolution(solution).capacityExceeded;
		let newCapacityExceeded = evaluateSolution(newSolution).capacityExceeded;

		// On accepte la nouvelle solution si elle est meilleure ou si la condition de température est remplie
		if ((newObjective < currentObjective && !newCapacityExceeded) || Math.random() < Math.exp((currentObjective - newObjective) / T)) {
			solution = newSolution;
		}

		if (newObjective < bestObjective && !newCapacityExceeded) {
			bestSolution = newSolution;
			bestObjective = newObjective;
			bestCapacityExceeded = newCapacityExceeded;
		}

		T *= alpha; // Réduction de la température
	}

	var textResult = "Solution optimale avec objectif " + bestObjective.toFixed(2) + " kilomètres";
	for (let v = 0; v < nbVehicules; v++) {
		textResult += "\n\n 🚚 Véhicule " + (v+1) + " : ";
		var distanceTotale = 0;
		var currentClient = 0;
		if (bestSolution[v].length > 0) {
			textResult += "\n • 🏡 Dépôt "
			for (let i = 0; i < bestSolution[v].length; i++) {
				let nextClient = bestSolution[v][i];
				textResult += " → C" + (nextClient+1);
				distanceTotale += matDistanceClient[currentClient][nextClient+1];
				currentClient = nextClient+1;
			}

			distanceTotale += matDistanceClient[currentClient][0];
			textResult += " → Dépôt";
			textResult += "\n • 🌍 Distance parcourue : " + distanceTotale.toFixed(2) + " kilomètre";
			if (distanceTotale > 1)
				textResult += "s"
		}
		else 
			textResult += " ❌";
	}

	let graphData = generateGraphData(bestSolution);
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
		if (solution[v].length > 0) {
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

			// Retour au dépôt après avoir livré tous les clients
			if (!capacityExceeded) {
				distanceTotale += matDistanceClient[currentClient][0]; // Retour au dépôt
			}
		}

		totalDistance += distanceTotale;
	}

	return { totalDistance, capacityExceeded };
}


// Initialisation aléatoire d'une solution
function initializeSolution() {
	let solution = [];
	let clients = Array.from({ length: nbClients }, (_, index) => index); // Liste des clients (0 à nbClients-1)
	// Distribution aléatoire des clients parmi les véhicules
	for (let v = 0; v < nbVehicules; v++) {
		solution[v] = [];
	}

	// Distribution des clients parmi les véhicules de façon aléatoire
	while (clients.length > 0) {
		let randomClientIndex = Math.floor(Math.random() * clients.length);
		let client = clients[randomClientIndex];
		let randomVehicle = Math.floor(Math.random() * nbVehicules);
		console.log("nb clients : " + clients.length)
		console.log(client)
		// Vérification de la capacité du véhicule avant d'ajouter un client
		if (countPoids(solution[randomVehicle], client)) {
			
			solution[randomVehicle].push(client);
			clients.splice(randomClientIndex, 1);
		}
	}

	return solution;
}

// Fonction pour vérifier si la capacité du véhicule est dépassée
function countPoids(solution, client) {
	let total = 0;
	// Calcul de la charge actuelle du véhicule
	for(let s = 0; s < solution.length; s++) {
		total += demandesClients[solution[s]];
	}

	// Ajout du poids du client courant
	total += demandesClients[client];
	return total <= capaciteVehicule; // Retourne true si la capacité est respectée
}

// Perturbation de la solution (échange aléatoire de clients entre deux véhicules)
function perturbSolution(solution) {
	let newSolution = JSON.parse(JSON.stringify(solution));
	let v1 = Math.floor(Math.random() * nbVehicules);
	let v2 = Math.floor(Math.random() * nbVehicules);

	if (v1 !== v2 && newSolution[v1].length > 0) {
		let clientIndex = Math.floor(Math.random() * newSolution[v1].length);
		let client = newSolution[v1].splice(clientIndex, 1)[0];
		newSolution[v2].push(client);
	}

	return newSolution;
}

function generateGraphData(solution) {
    let nodes = [{ id: 0, label: "Dépôt", color: "red" }];
    let edges = [];

    solution.forEach(route => {
        let prevNode = 0; // Dépôt

        route.forEach(client => {
            let nodeId = client+1; // Le client est déjà indexé correctement

            if (!nodes.find(n => n.id === nodeId)) {
                nodes.push({ id: nodeId, label: `C${nodeId}` });
            }

            if (prevNode < matDistanceClient.length && nodeId < matDistanceClient[prevNode].length) {
                edges.push({
                    from: prevNode,
                    to: nodeId,
                    label: `${matDistanceClient[prevNode][nodeId].toFixed(1)} km`
                });
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
                label: `${matDistanceClient[prevNode][0].toFixed(1)} km`
            });
        }
    });

    return { nodes, edges };
}
