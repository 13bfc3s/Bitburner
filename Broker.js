/** @param {NS} ns **/
export async function main(ns) {
    const stockSymbols = ns.stock.getSymbols();
    let ownedStocks = {};
    const maxStocksToManage = 5;

    while (true) {
        for (let symbol of stockSymbols) {
            let forecast = ns.stock.getForecast(symbol);
            let [sharesOwned, avgPrice, , sharesShort] = ns.stock.getPosition(symbol);
            let stockPrice = ns.stock.getPrice(symbol);
            let availableFunds = ns.getServerMoneyAvailable('home');

						// Buy stocks with weakly increasing forecast
						if (forecast > 0.6 && !sharesOwned && !sharesShort && Object.keys(ownedStocks).length < maxStocksToManage) {
							let sharesToBuy = Math.floor((availableFunds * 0.20) / stockPrice);
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

        await ns.sleep(1000); // Check every second
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
