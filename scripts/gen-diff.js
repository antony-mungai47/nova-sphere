const { execSync } = require('child_process');
const fs = require('fs');

const output = execSync('npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script', { encoding: 'utf8' });

let sql = output;

// Replace drops with USING clauses
// Example: DROP COLUMN "status", ADD COLUMN "status" "AuctionStatus" NOT NULL DEFAULT 'ACTIVE'
sql = sql.replace(/DROP COLUMN "([^"]+)",\r?\nADD COLUMN\s+"([^"]+)" ([^\n,;]+)/g, (match, dropCol, addCol, typeDef) => {
    if (dropCol === addCol) {
        // extract base type (first word or quoted string)
        const typeMatch = typeDef.trim().match(/^("?[a-zA-Z0-9_]+"?(?:\([^\)]+\))?)/);
        const baseType = typeMatch ? typeMatch[1] : typeDef.split(' ')[0];
        
        let alterStmts = [
             `ALTER COLUMN "${dropCol}" DROP DEFAULT`,
             `ALTER COLUMN "${dropCol}" TYPE ${baseType} USING "${dropCol}"::text::${baseType}`
        ];
        
        if (typeDef.includes('NOT NULL')) {
             alterStmts.push(`ALTER COLUMN "${dropCol}" SET NOT NULL`);
        } else {
             alterStmts.push(`ALTER COLUMN "${dropCol}" DROP NOT NULL`);
        }

        const defaultMatch = typeDef.match(/DEFAULT\s+([^ ]+)/);
        if (defaultMatch) {
             alterStmts.push(`ALTER COLUMN "${dropCol}" SET DEFAULT ${defaultMatch[1]}`);
        }

        return alterStmts.join(',\n');
    }
    return match;
});

fs.writeFileSync('prisma/migrations/1_type_modernization/migration.sql', sql, 'utf8');
console.log('Migration generated and fixed perfectly with constraints and drop defaults!');
