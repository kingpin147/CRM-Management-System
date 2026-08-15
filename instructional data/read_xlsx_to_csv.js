const XLSX = require('xlsx');
const fs = require('fs');

const file = process.argv[2];
const workbook = XLSX.readFile(file);
for (const sheetName of workbook.SheetNames) {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    fs.writeFileSync(`${sheetName.replace(/\W+/g, '_')}.csv`, csv);
    console.log(`Saved ${sheetName} to csv`);
}
