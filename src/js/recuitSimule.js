import { clone } from "chart.js/helpers";

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
	if (data != null) {
		nbVehicules = data.nbVehicules;
		nbClients = data.nbClients;
		capaciteVehicule = data.quantiteMax;
		demandesClients = data.demandesClients;
		matDistanceClient = data.matDistanceClient;
	}


	// Initialisation de la solution initiale (aléatoire)
	
	let solution = initializeSolution();
	
	let T = 100000; // Température initiale réduite
	let alpha = 0.99999; // Augmentation du facteur alpha pour réduire plus rapidement la température

	let TMin = 0.0000001; // Température minimale
	let maxIterations = 10000; // Nombre d'itérations réduit pour tester des petites instances
	let minImprovement = 0.001; // Amélioration minimale de la solution avant d'arrêter
	let bestObjective = Infinity;
	let noImprovementCounter = 0;
	
	// Dans la boucle du recuit simulé
	for (let iter = 0; iter < maxIterations; iter++) {
		if (T < TMin) break;
	
		let newSolution = perturbSolution(solution);

        let newObjective = evaluateSolution(newSolution).totalDistance;
	
		if (newObjective < bestObjective) {
            bestObjective = newObjective;
			solution = clone(newSolution);
			noImprovementCounter = 0;
		} 
	
		// Si aucune amélioration importante n'est détectée, on arrête plus tôt
		if (Math.abs(bestObjective - newObjective) < minImprovement) {
			noImprovementCounter++;
			if (noImprovementCounter > maxIterations/100) {
                console.log("stagne")
                break;
            } // Arrêter après 1000 itérations sans amélioration significative
		}
	
		T *= alpha; // Réduction de la température

		if (iter % 10000 == 0) console.log("iter : " + iter)
	}

	console.log("T : " + T)
	

	var textResult = "Solution optimale avec objectif " + bestObjective.toFixed(2) + " kilomètres";
	for (let v = 0; v < nbVehicules; v++) {
		textResult += "\n\n 🚚 Véhicule " + (v+1) + " : ";
		var distanceTotale = 0;
		var currentClient = 0;
        var poidsUtilise = 0;
		if (solution[v].length > 0) {
			textResult += "\n • 🏡 Dépôt "
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

    console.log(evaluateSolution(solution, false).totalDistance)

	let graphData = generateGraphData(solution);
	graphData.textResult = textResult;
	return { ...graphData};
}


// Fonction pour évaluer la solution courante
function evaluateSolution(solution, log = false) {
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
                if (log)
                    console.log(matDistanceClient[currentClient][nextClient+1])
                distanceTotale += matDistanceClient[currentClient][nextClient+1];
                currentLoad += demandesClients[nextClient];

                if (currentLoad > capaciteVehicule) {
                    capacityExceeded = true; // Si on dépasse la capacité, on marque cette contrainte
                    break;
                }

                currentClient = nextClient+1;
            }

            distanceTotale += matDistanceClient[currentClient][0];

            if (log)
                console.log("v" + v + " : " + distanceTotale);
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
        let minLoadVehicle = -1;
        let minLoad = Number.MAX_VALUE;
        // Trouver le véhicule avec la charge la plus faible et qui respecte la capacité
        for (let v = 0; v < nbVehicules; v++) {
            let currentLoad = solution[v].reduce((sum, c) => sum + demandesClients[c], 0);
            if (currentLoad + demandesClients[client] <= capaciteVehicule && currentLoad < minLoad) {
                minLoadVehicle = v;
                minLoad = currentLoad;
            }
        }

        // Ajouter le client au véhicule avec la charge la plus faible
        if (minLoadVehicle !== -1) {
            solution[minLoadVehicle].push(client);
        }
    });

    return solution;
}

// Fonction de mélange aléatoire pour la randomisation
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


function perturbSolution(solution) {
    for (let voisin = 0; voisin < nbClients; voisin++) {
        let newSolution = clone(solution)

        let v1 = Math.floor(Math.random() * nbVehicules);
        let v2 = Math.floor(Math.random() * nbVehicules);
    
        if (v1 !== v2 && newSolution[v1].length > 0) {
            let clientIndex = Math.floor(Math.random() * newSolution[v1].length);
            let client = newSolution[v1][clientIndex];

            if (countPoids(newSolution[v2], client)) {
                let randClientIndex = Math.floor(Math.random() * newSolution[v2].length);
                newSolution[v2].splice(randClientIndex, 0, client)
                newSolution[v1].splice(clientIndex, 1);
            }

            let newObjective;

            for (let voisin = 0; voisin < nbClients; voisin++) {
                let newSolution2 = clone(newSolution)

                let vehiculeIndex = Math.floor(Math.random() * newSolution.length);
                newSolution2[vehiculeIndex] = shuffleArray(newSolution2[vehiculeIndex])

                let newTotalDistance = evaluateSolution(newSolution).totalDistance;
                let newTotalDistance2 = evaluateSolution(newSolution2).totalDistance;

                if (newTotalDistance2 < newTotalDistance) {
                    newSolution = newSolution2;
                    newObjective = newTotalDistance2
                }
            }

            let objective = evaluateSolution(solution).totalDistance;
            newObjective = evaluateSolution(newSolution).totalDistance;

            if (newObjective < objective) {
                solution = newSolution;
            }
        }
    
    }

    return solution;
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
