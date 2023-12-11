/** @param {NS} ns **/
export async function main(ns) {
    const stockSymbols = ns.stock.getSymbols();
    let ownedStocks = {};
    let maxStocksToManage = 5; // Initial value

    while (true) {
        let availableFunds = ns.getServerMoneyAvailable('home');
        let activeInvestments = Object.keys(ownedStocks).length;
        let fundsPerInvestment = availableFunds / (maxStocksToManage - activeInvestments);

        for (let symbol of stockSymbols) {
            let forecast = ns.stock.getForecast(symbol);
            let [sharesOwned, avgPrice, , sharesShort] = ns.stock.getPosition(symbol);
            let stockPrice = ns.stock.getPrice(symbol);
            let maxShares = ns.stock.getMaxShares(symbol);

            // Adjust maxStocksToManage based on funds and stock prices
            if (activeInvestments < maxStocksToManage && forecast > 0.6 && !sharesOwned && !sharesShort) {
                let sharesToBuy = Math.min(Math.floor(fundsPerInvestment / stockPrice), maxShares);
                if (sharesToBuy > 0) {
                    ns.stock.buyStock(symbol, sharesToBuy);
                    ownedStocks[symbol] = { price: stockPrice, shares: sharesToBuy };
                    let totalCost = sharesToBuy * stockPrice;
                    ns.tprint(`Bought ${sharesToBuy} shares of ${symbol} at $${stockPrice.toFixed(2)} for ${formatNumber(totalCost)}`);
                }
            }

            // Sell stocks when 10% gain or loss is reached or forecast drops below 0.5
            if (sharesOwned > 0) {
                let currentProfitLossRatio = (stockPrice - avgPrice) / avgPrice;
                if (currentProfitLossRatio >= 0.1 || currentProfitLossRatio <= -0.1 || forecast < 0.5) {
                    let profitOrLoss = (stockPrice - avgPrice) * sharesOwned;
                    ns.stock.sellStock(symbol, sharesOwned);
                    delete ownedStocks[symbol];
                    let profitOrLossFormatted = formatNumber(profitOrLoss);
                    let resultText = profitOrLoss >= 0 ? "profit" : "loss";
                    ns.tprint(`Sold ${sharesOwned} shares of ${symbol} for a ${(currentProfitLossRatio * 100).toFixed(2)}% change, resulting in a ${resultText} of ${profitOrLossFormatted}`);
                }
            }
        }

        await ns.sleep(10000); // Check every 10 second
    }
}

// Function to format numbers into a human-readable format with suffix
function formatNumber(num) {
    let isNegative = num < 0;
    num = Math.abs(num);

    let formattedNumber = '';
		if (num >= 1e12) {
        formattedNumber = (num / 1e12).toFixed(3) + ' t';
    } else if (num >= 1e9) {
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
