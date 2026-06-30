const fs = require('fs');

const path = 'prisma/migrations/1_type_modernization/migration.sql';
// Read it considering it might be utf-16
let sqlBuf = fs.readFileSync(path);
let sql = '';
if (sqlBuf[0] === 0xFF && sqlBuf[1] === 0xFE) {
    sql = sqlBuf.toString('utf16le');
} else {
    sql = sqlBuf.toString('utf8');
}

// Replace drops with USING clauses
sql = sql.replace(/DROP COLUMN "([^"]+)",\r?\nADD COLUMN\s+"([^"]+)" ([^\n,;]+)/g, (match, dropCol, addCol, type) => {
    if (dropCol === addCol) {
        return `ALTER COLUMN "${dropCol}" TYPE ${type.trim()} USING "${dropCol}"::${type.trim()}`;
    }
    return match;
});

// Since enums might need special syntax, we need to quote custom enums
sql = sql.replace(/USING "([^"]+)"::([^,;\n ]+)/g, (match, col, type) => {
    if (type.includes('JSONB')) return match;
    return `USING "${col}"::"${type.replace(/"/g, '')}"`;
});

// Write as UTF-8
fs.writeFileSync(path, sql, 'utf8');
console.log('SQL fixed and converted to utf8!');
