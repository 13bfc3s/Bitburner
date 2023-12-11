/** @param {NS} ns **/
export async function main(ns) {
    let serverConnections = {};
    getAllServers(ns, "home", [], serverConnections);
    let serversToBackdoor = getServersToBackdoor(ns, serverConnections);

    ns.tprint("Commands to manually connect to servers and install backdoors:");
    for (let server of serversToBackdoor) {
        let connectionPath = getConnectionPath(server, serverConnections);
        ns.tprint(connectionPath + `; backdoor`);
    }
}

function getServersToBackdoor(ns, serverConnections) {
    let allServers = Object.keys(serverConnections);
    let playerHackingSkill = ns.getHackingLevel();

    return allServers.filter(server => 
        !ns.getServer(server).backdoorInstalled && 
        ns.hasRootAccess(server) && 
        ns.getServerRequiredHackingLevel(server) <= playerHackingSkill && 
        server !== "home" &&
        !server.startsWith("pserv-") // Exclude servers starting with "pserv-"
    );
}

// Recursive function to get all servers and their connections
function getAllServers(ns, server, visited, serverConnections) {
    if (!visited.includes(server)) {
        visited.push(server);
        let connectedServers = ns.scan(server);

        for (let s of connectedServers) {
            if (!visited.includes(s)) {
                serverConnections[s] = server; // Store the server that this server is connected from
                getAllServers(ns, s, visited, serverConnections);
            }
        }
    }
}

// Function to build the connection path to a server
function getConnectionPath(server, serverConnections) {
    let path = [`connect ${server}`];
    while (server !== "home") {
        server = serverConnections[server];
        path.unshift(`connect ${server}`);
    }
    return path.join('; ');
}
