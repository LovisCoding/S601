export default function convertDocument(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const lines = event.target.result.split('\n').map(line => line.trim()).filter(line => line);
                let [numCustomers] = lines[0].split(" ").map(Number);
                let objectif = 0;
                if (lines[0].split(" ").length >= 2)
                    objectif = lines[0].split(" ").map(Number)[1]
                let vehicleCapacity = parseInt(lines[1]);
                let customers = [];

                for (let i = 0; i < numCustomers; i++) {
                    let [id, x, y, demand] = lines[i + 3].split(/\s+/).map(Number);
                    customers.push({ id, x, y, demand });
                }

                let dist = Array(numCustomers + 1).fill().map(() => Array(numCustomers + 1).fill(0));

                // Calculer les distances entre le point (0, 0) et chaque client
                for (let i = 0; i < numCustomers; i++) {
                    let x1 = 0; // Le point (0, 0)
                    let y1 = 0;
                    let x2 = customers[i].x;
                    let y2 = customers[i].y;
                    dist[0][i + 1] = parseFloat(Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2).toFixed(1)); // Distance entre (0,0) et le client i
                    dist[i + 1][0] = dist[0][i + 1]; // Remplir la colonne symÃ©trique
                }

                // Calculer les distances entre les clients
                for (let i = 0; i < numCustomers; i++) {
                    for (let j = 0; j < numCustomers; j++) {
                        let x1 = customers[i].x;
                        let y1 = customers[i].y;
                        let x2 = customers[j].x;
                        let y2 = customers[j].y;
                        dist[i + 1][j + 1] = parseFloat(Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2).toFixed(1)); // Distance entre client i et client j
                    }
                }

                const jsonData = {
                    objectif: objectif,
                    quantiteMax: vehicleCapacity,
                    nbVehicules: 15,
                    nbClients: numCustomers,
                    demandesClients: customers.map(c => c.demand),
                    matDistanceClient: dist
                };

                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsText(file);
    });
}