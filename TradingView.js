/** @param {NS} ns **/
export async function main(ns) {
    while (true) {
        const stockSymbols = ns.stock.getSymbols();

				ns.tprint("")
        ns.tprint("Symbol | Shares  | Buy Price   | Current Price  |  % Change |  Profit/Loss");
        ns.tprint("--------------------------------------------------------------------------");

        for (let symbol of stockSymbols) {
            let [sharesOwned, avgCost] = ns.stock.getPosition(symbol);
            if (sharesOwned > 0) {
                let currentPrice = ns.stock.getPrice(symbol);
                let totalCost = avgCost * sharesOwned;
                let currentValue = currentPrice * sharesOwned;
                let change = currentValue - totalCost;
                let percentChange = (change / totalCost) * 100;

                ns.tprint(`${symbol.padEnd(6)} | ${sharesOwned.toString().padEnd(7)} | $${avgCost.toFixed(2).padEnd(10)} | $${currentPrice.toFixed(2).padEnd(13)} | ${percentChange.toFixed(2).padStart(8)}% | ${formatNumber(change).padStart(12)}`);
            }
        }

        await ns.sleep(60000); // Wait for 1 minute before checking again
    }
}

// Function to format numbers into a human-readable format with suffix
function formatNumber(num) {
    let isNegative = num < 0;
    num = Math.abs(num);

    let formattedNumber = '';
    if (num >= 1e9) {
        formattedNumber = (num / 1e9).toFixed(3) + ' B';
    } else if (num >= 1e6) {
        formattedNumber = (num / 1e6).toFixed(3) + ' M';
    } else if (num >= 1e3) {
        formattedNumber = (num / 1e3).toFixed(3) + ' K';
    } else {
        formattedNumber = num.toFixed(3);
    }

    return isNegative ? '-' + formattedNumber : formattedNumber;
}
