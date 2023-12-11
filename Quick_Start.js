/** @param {NS} ns **/
export async function main(ns) {
    // Scanning and categorizing servers
    var serversByPort = [[], [], [], [], [], []]; // Arrays for 0 to 5 port servers
    var allServers = getAllServers(ns, "home", []);

    for (let server of allServers) {
        let portsRequired = ns.getServerNumPortsRequired(server);
        if (portsRequired <= 5) {
            serversByPort[portsRequired].push(server);
        }
    }

    // Executing operations on categorized servers
    for (let i = 0; i < serversByPort.length; ++i) {
        for (let server of serversByPort[i]) {
            // Wait for necessary hacking tools for servers requiring more than 0 ports
            if (i > 0 && !hasRequiredPrograms(ns, i)) {
                await waitForPrograms(ns, i);
                continue;
            }

            // Gain root access if necessary
            if (!ns.hasRootAccess(server)) {
                if (i >= 1 && ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(server);
                if (i >= 2 && ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(server);
                if (i >= 3 && ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(server);
                if (i >= 4 && ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(server);
                if (i >= 5 && ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(server);
                ns.nuke(server);
            }

            // Execute Hack_Template.script if we have root access
            if (ns.hasRootAccess(server)) {
                let maxRam = ns.getServerMaxRam(server);
                let threads = Math.floor(maxRam / 2.40); // Hack_Template RAM usage is 2.40 GB
                if (threads > 0) {
                    ns.scp("Hack_Template.script", server);
                    ns.exec("Hack_Template.script", server, threads);
										await ns.sleep(1000); // Wait for 1 second
                }
            }
        }
    }
}

// Recursive function to get all servers
function getAllServers(ns, server, visited) {
    visited.push(server);
    let connectedServers = ns.scan(server);
    for (let s of connectedServers) {
        if (!visited.includes(s)) {
            getAllServers(ns, s, visited);
        }
    }
    return visited;
}

// Check if the necessary programs are available
function hasRequiredPrograms(ns, ports) {
    if (ports >= 1 && !ns.fileExists("BruteSSH.exe", "home")) return false;
    if (ports >= 2 && !ns.fileExists("FTPCrack.exe", "home")) return false;
    if (ports >= 3 && !ns.fileExists("relaySMTP.exe", "home")) return false;
    if (ports >= 4 && !ns.fileExists("HTTPWorm.exe", "home")) return false;
    if (ports >= 5 && !ns.fileExists("SQLInject.exe", "home")) return false;
    return true;
}

// Wait for necessary programs to be available
async function waitForPrograms(ns, ports) {
    while (!hasRequiredPrograms(ns, ports)) {
        await ns.sleep(60000); // Wait for 1 minute
    }
}
