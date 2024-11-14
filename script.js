let incomeTotal = 0, expenseTotal = 0, savingsGoal = 0, monthlyIncome = 0;
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

document.addEventListener("DOMContentLoaded", () => {
    loadTransactions();
    updateOverview();
    renderCharts();
});

function setMonthlySetup() {
    monthlyIncome = parseFloat(document.getElementById("income").value);
    savingsGoal = parseFloat(document.getElementById("savingsGoal").value);
    updateOverview();
    saveData();
}

function addIncome() {
    const source = document.getElementById("incomeSource").value;
    const amount = parseFloat(document.getElementById("incomeAmount").value);
    transactions.push({ type: 'income', source, amount, date: new Date().toLocaleDateString() });
    incomeTotal += amount;
    updateOverview();
    saveData();
}

function addExpense() {
    const name = document.getElementById("expenseName").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value;
    transactions.push({ type: 'expense', name, amount, category, date: new Date().toLocaleDateString() });
    expenseTotal += amount;
    updateOverview();
    saveData();
}

function deleteTransaction(index) {
    if (transactions[index].type === 'income') {
        incomeTotal -= transactions[index].amount;
    } else {
        expenseTotal -= transactions[index].amount;
    }
    transactions.splice(index, 1);
    updateOverview();
    saveData();
}

function updateOverview() {
    document.getElementById("totalIncome").innerText = incomeTotal;
    document.getElementById("totalExpenses").innerText = expenseTotal;
    const remainingBudget = monthlyIncome - expenseTotal;
    document.getElementById("remainingBudget").innerText = remainingBudget.toFixed(2);
    document.getElementById("savingsProgress").innerText = ((remainingBudget / savingsGoal) * 100).toFixed(2) + '%';
}

function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactions() {
    transactions.forEach((transaction, index) => {
        if (transaction.type === 'income') {
            incomeTotal += transaction.amount;
        } else {
            expenseTotal += transaction.amount;
        }
    });
    renderTransactionHistory();
}

function renderTransactionHistory() {
    const historyList = document.getElementById("transactionHistory");
    historyList.innerHTML = "";
    transactions.forEach((transaction, index) => {
        const item = document.createElement("li");
        item.classList.add("transaction-item");
        item.innerHTML = `
            ${transaction.date} - ${transaction.type === 'income' ? transaction.source : transaction.name} - ${transaction.amount}
            <button onclick="deleteTransaction(${index})">Delete</button>
        `;
        historyList.appendChild(item);
    });
}

// Charts
function renderCharts() {
    const ctxBar = document.getElementById("barChart").getContext("2d");
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Total Income', 'Total Expenses'],
            datasets: [{
                label: 'Income vs Expenses',
                data: [incomeTotal, expenseTotal],
                backgroundColor: ['#007bff', '#ff073a']
            }]
        }
    });

    const ctxPie = document.getElementById("pieChart").getContext("2d");
    const categories = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});
    new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#f1c40f', '#e67e22', '#2ecc71', '#3498db', '#9b59b6']
            }]
        }
    });

    const ctxLine = document.getElementById("lineChart").getContext("2d");
    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: transactions.map(t => t.date),
            datasets: [{
                label: 'Overall Expenses',
                data: transactions.filter(t => t.type === 'expense').map(t => t.amount),
                borderColor: '#e91212',
                fill: false
            }]
        }
    });
}
