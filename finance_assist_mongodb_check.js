const { MongoClient } = require('mongodb');
const fs = require('fs');

async function main() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('finance_assist');

        // Check users
        const users = await db.collection('users').find({}).toArray();
        let out = 'Users:\n';
        users.forEach(u => out += `- ${u.name} (ID: ${u._id})\n`);

        // Check transactions
        const txs = await db.collection('transactions').find({}).toArray();
        out += `\nTotal Transactions: ${txs.length}\n`;
        if (txs.length > 0) {
            out += 'Sample Transaction:\n';
            out += JSON.stringify(txs[0], null, 2) + '\n';

            const userIds = [...new Set(txs.map(t => String(t.userId)))];
            out += `\nUser IDs in transactions: ${userIds.join(', ')}\n`;

            // Dates
            const minDate = new Date(Math.min(...txs.map(t => new Date(t.date))));
            const maxDate = new Date(Math.max(...txs.map(t => new Date(t.date))));
            out += `Date Range: ${minDate.toISOString()} to ${maxDate.toISOString()}\n`;
        }

        fs.writeFileSync('db_output.txt', out, 'utf-8');
    } finally {
        await client.close();
    }
}

main().catch(console.error);
