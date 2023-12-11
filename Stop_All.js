/** @param {NS} ns **/
export async function main(ns) {
    let allServers = getAllServers(ns, "home", []);

    // Iterate through each server and kill all running scripts on it
    for (let server of allServers) {
        ns.killall(server);
    }

    ns.tprint("All scripts have been killed on all servers.");
}

// Recursive function to scan and analyze servers
function getAllServers(ns, startServer, visited) {
    if (!visited.includes(startServer)) {
        visited.push(startServer);
        let connectedServers = ns.scan(startServer);

        for (let s of connectedServers) {
            if (!visited.includes(s)) {
                getAllServers(ns, s, visited);
            }
        }
    }
    return visited;
}
