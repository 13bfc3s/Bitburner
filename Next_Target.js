/** @param {NS} ns **/
export async function main(ns) {
    let depth = ns.args[0] || 10; // Set depth, default is 10 if not provided
    let allServers = scanAndAnalyze(ns, "home", depth);
    let playerHackingSkill = ns.getHackingLevel();
    let serversInfo = [];

    // Iterate through each server to get its information
    for (let server of allServers) {
        if (ns.getServerRequiredHackingLevel(server) <= playerHackingSkill) {
            let currentMoney = ns.getServerMoneyAvailable(server);
            let maxMoney = ns.getServerMaxMoney(server);
            let hackTime = ns.getHackTime(server);
            let growTime = ns.getGrowTime(server);
            let weakenTime = ns.getWeakenTime(server);
            let avgTime = (hackTime + growTime + weakenTime) / 3;
            let hackPerSecond = maxMoney / hackTime;
            if (maxMoney > 0) {
                serversInfo.push({ 
                    name: server, 
                    currentMoney: currentMoney,
                    maxMoney: maxMoney, 
                    hackPerSecond: hackPerSecond,
                    avgTime: avgTime 
                });
            }
        }
    }

    // Sort the array by hack $ per second, from smallest to largest
    serversInfo.sort((a, b) => a.hackPerSecond - b.hackPerSecond);

    // Find the longest server name and max values for formatting
    let maxServerNameLength = serversInfo.reduce((max, srv) => Math.max(max, srv.name.length), 0);
    let maxHackPerSecond = Math.max(...serversInfo.map(srv => srv.hackPerSecond));

    // Print each server's information
    for (let server of serversInfo) {
        let moneyBar = generateMoneyBar(server.currentMoney, server.maxMoney, 10);
        let advantageBar = generateAdvantageBar(server.hackPerSecond, maxHackPerSecond, 10);
        ns.tprint(`${server.name.padStart(maxServerNameLength)} [${moneyBar}] Max Cash: $${server.maxMoney.toFixed(2).padEnd(15)} Hack/s: ${server.hackPerSecond.toFixed(2).padStart(8)} [${advantageBar}] Avg Time: ${formatTime(server.avgTime)}`);
    }
}

function generateMoneyBar(currentMoney, maxMoney, barLength) {
    const ratio = currentMoney / maxMoney;
    const fillLength = Math.round(ratio * barLength);
    return '▓'.repeat(fillLength) + '░'.repeat(barLength - fillLength);
}

function generateAdvantageBar(hackPerSecond, maxHackPerSecond, barLength) {
    const ratio = hackPerSecond / maxHackPerSecond;
    const fillLength = Math.round(ratio * barLength);
    return '▓'.repeat(fillLength) + '░'.repeat(barLength - fillLength);
}

function formatTime(milliseconds) {
    let seconds = milliseconds / 1000;
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    seconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Recursive function to scan and analyze servers
function scanAndAnalyze(ns, startServer, depth, visited = new Set()) {
    if (depth < 0) {
        return [];
    }

    visited.add(startServer);
    let servers = ns.scan(startServer);
    let uniqueServers = servers.filter(s => !visited.has(s));

    let allServers = [...uniqueServers];
    for (let server of uniqueServers) {
        visited.add(server);
        allServers.push(...scanAndAnalyze(ns, server, depth - 1, visited));
    }

    return allServers;
}
