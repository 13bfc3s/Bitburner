/** @param {NS} ns **/
export async function main(ns) {
    const stockSymbols = ns.stock.getSymbols();

    // Iterate through each stock and sell if owned
    for (let symbol of stockSymbols) {
        let [sharesOwned] = ns.stock.getPosition(symbol);
        if (sharesOwned > 0) {
            ns.stock.sellStock(symbol, sharesOwned);
            ns.tprint(`Sold all shares of ${symbol}`);
        }
    }

    ns.tprint("All stocks have been sold.");
}
