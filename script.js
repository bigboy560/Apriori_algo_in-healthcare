let transactions = [];

function processData() {
    const dataInput = document.getElementById('dataInput').value.trim();
    
    if (!dataInput) {
        alert('Please enter some data.');
        return;
    }

    transactions = parseCSV(dataInput);

    if (transactions.some(transaction => transaction.length === 0)) {
        alert('Some transactions are empty or incorrectly formatted.');
        return;
    }

    console.log(transactions);
}

function parseCSV(data) {
    const lines = data.split('\n');
    const result = lines.map(line => line.trim().split(',').map(item => item.trim()));
    return result;
}

function runApriori() {
    const minSupport = parseFloat(document.getElementById('minSupport').value);
    const minConfidence = parseFloat(document.getElementById('minConfidence').value);

    const { frequentItemsets, associationRules } = apriori(transactions, minSupport, minConfidence);

    const resultsSection = document.getElementById('results');
    resultsSection.innerHTML = `<h3>Frequent Itemsets:</h3>${formatFrequentItemsets(frequentItemsets)}
                                <h3>Association Rules:</h3>${formatAssociationRules(associationRules)}
                                <h3>Conclusion:</h3>${generateConclusion(frequentItemsets, associationRules)}`;
}

function apriori(transactions, minSupport, minConfidence) {
    const itemsetCounts = {};
    const numTransactions = transactions.length;

    // Count individual items
    transactions.forEach(transaction => {
        transaction.forEach(item => {
            if (!itemsetCounts[item]) itemsetCounts[item] = 0;
            itemsetCounts[item]++;
        });
    });

    // Filter out itemsets below min support
    const frequentItemsets = [];
    for (let itemset in itemsetCounts) {
        if (itemsetCounts[itemset] / numTransactions >= minSupport) {
            frequentItemsets.push([itemset]);
        }
    }

    // Generate association rules
    const associationRules = [];
    frequentItemsets.forEach(itemset => {
        const antecedents = [itemset];
        const consequents = transactions.flat().filter(item => !itemset.includes(item));
        
        consequents.forEach(item => {
            const rule = {
                antecedent: itemset,
                consequent: [item],
                confidence: computeConfidence(itemset, [item], transactions)
            };
            
            // Avoid adding duplicate rules
            if (rule.confidence >= minConfidence && !associationRules.some(existingRule =>
                JSON.stringify(existingRule.antecedent) === JSON.stringify(rule.antecedent) &&
                JSON.stringify(existingRule.consequent) === JSON.stringify(rule.consequent)
            )) {
                associationRules.push(rule);
            }
        });
    });

    return { frequentItemsets, associationRules };
}

function computeConfidence(antecedent, consequent, transactions) {
    const antecedentCount = transactions.filter(transaction => 
        antecedent.every(item => transaction.includes(item))
    ).length;

    if (antecedentCount === 0) return 0; // Avoid division by zero

    const bothCount = transactions.filter(transaction => 
        antecedent.every(item => transaction.includes(item)) && 
        consequent.every(item => transaction.includes(item))
    ).length;

    return bothCount / antecedentCount;
}

function formatFrequentItemsets(frequentItemsets) {
    return `<ul>${frequentItemsets.map(itemset => `<li>${itemset.join(', ')}</li>`).join('')}</ul>`;
}

function formatAssociationRules(associationRules) {
    return `<ul>${associationRules.map(rule => `<li>${rule.antecedent.join(', ')} => ${rule.consequent.join(', ')} (Confidence: ${rule.confidence.toFixed(2)})</li>`).join('')}</ul>`;
}

function generateConclusion(frequentItemsets, associationRules) {
    // Update this section based on actual results after running the algorithm
    return `
            <p>These insights help to understand the common treatment patterns and their relationships, which can be valuable for optimizing patient care and treatment planning.</p>`;
}
