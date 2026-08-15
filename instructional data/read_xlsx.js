const XLSX = require('xlsx');

const file = process.argv[2];
const workbook = XLSX.readFile(file);
for (const sheetName of workbook.SheetNames) {
    console.log(`\n\n=== Sheet: ${sheetName} ===\n`);
    const sheet = workbook.Sheets[sheetName];
    // Convert to JSON and then format nicely, or to CSV
    console.log(XLSX.utils.sheet_to_csv(sheet));
}
