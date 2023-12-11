/** @param {NS} ns **/
export async function main(ns) {
    const args = ns.args;
    if (args.length !== 2) {
        ns.tprint("This script requires 2 inputs: the number of servers and the amount of RAM.");
        displayServerInfo(ns);
        return;
    }

    const numServersToPurchase = parseInt(args[0]);
    const ramPerServer = parseInt(args[1]);
    const serverLimit = ns.getPurchasedServerLimit();
    const currentServers = ns.getPurchasedServers();

    // Validate the number of servers and RAM per server
    if (isNaN(numServersToPurchase) || isNaN(ramPerServer) || numServersToPurchase < 1 || numServersToPurchase > serverLimit) {
        ns.tprint("Invalid input. Please enter a valid number of servers and RAM amount.");
        return;
    }

    // Replace servers if needed
    if (numServersToPurchase === serverLimit) {
        for (const serv of currentServers) {
            ns.killall(serv);
            ns.deleteServer(serv);
        }
    }

    // Purchase servers
    for (let i = 0; i < numServersToPurchase; ++i) {
        const hostname = ns.purchaseServer(`pserv-${i}`, ramPerServer);
        ns.scp("Hack_Template.script", hostname);
        ns.exec("Hack_Template.script", hostname, Math.floor(ramPerServer / 2.40));
    }
}

function displayServerInfo(ns) {
    const availableFunds = ns.getServerMoneyAvailable("home");
    const [maxAffordableRam, nextTierRam, nextTierCost] = calculateMaxAndNextAffordableRam(ns, availableFunds, 25);
    const currentServers = ns.getPurchasedServers();
    const serverLimit = ns.getPurchasedServerLimit();

    ns.tprint(`Currently using ${currentServers.length} out of ${serverLimit} server slots.`);
    ns.tprint(`Max RAM you can afford for 25 servers: ${maxAffordableRam}GB.`);
    ns.tprint(`Next server tier is ${nextTierRam}GB at additional cost of ${formatNumber(nextTierCost - ns.getPurchasedServerCost(maxAffordableRam) * 25)}.`);
		ns.tprint(``);
		ns.tprint(`Copy and paste this to buy: run Buy_Servers.js 25 ${maxAffordableRam}`);
}

function calculateMaxAndNextAffordableRam(ns, availableFunds, numServers) {
    let ram = 8; // Starting RAM amount to check
    while (ns.getPurchasedServerCost(ram) * numServers <= availableFunds && ram <= ns.getPurchasedServerMaxRam()) {
        ram *= 2;
    }
    let maxAffordableRam = ram / 2;
    let nextTierRam = ram <= ns.getPurchasedServerMaxRam() ? ram : null;
    let nextTierCost = nextTierRam ? ns.getPurchasedServerCost(nextTierRam) * numServers : null;

    return [maxAffordableRam, nextTierRam, nextTierCost];
}

function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(3) + ' B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(3) + ' M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(3) + ' K';
    } else {
        return num.toFixed(3);
    }
}
