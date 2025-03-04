export default function convertDocument(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const lines = event.target.result.split('\n').map(line => line.trim()).filter(line => line);
                let [numCustomers] = lines[0].split(" ").map(Number);
                let vehicleCapacity = parseInt(lines[1]);
                let customers = [];

                for (let i = 0; i < numCustomers; i++) {
                    let [id, x, y, demand] = lines[i + 3].split(/\s+/).map(Number);
                    customers.push({ id, x, y, demand });
                }

                let dist = Array(numCustomers).fill().map(() => Array(numCustomers).fill(0));
                for (let i = 0; i < numCustomers; i++) {
                    for (let j = 0; j < numCustomers; j++) {
                        let x1 = customers[i].x;
                        let y1 = customers[i].y;
                        let x2 = customers[j].x;
                        let y2 = customers[j].y;
                        dist[i][j] = parseFloat(Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2).toFixed(1));
                    }
                }

                const jsonData = {
                    quantiteMax: vehicleCapacity,
                    nbVehicules: 4,
                    nbClients: numCustomers + 1,
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
