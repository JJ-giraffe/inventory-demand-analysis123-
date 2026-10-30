const fs=require('fs'),path=require('path');
const {DatabaseSync}=require('node:sqlite');
const base=path.resolve(__dirname,'..');
const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');
db.exec(fs.readFileSync(path.join(base,'sql/01_schema.sql'),'utf8'));
for(const [file,table]of [['products','products'],['sales','sales']]){
 const lines=fs.readFileSync(path.join(base,'data',file+'.csv'),'utf8').trim().split(/\r?\n/);
 const fields=lines.shift().split(',');const stmt=db.prepare('INSERT INTO '+table+' VALUES ('+fields.map(()=>'?').join(',')+')');
 for(const line of lines)stmt.run(...line.split(',').map(v=>/^\d+(\.\d+)?$/.test(v)?Number(v):v));
}
db.exec(fs.readFileSync(path.join(base,'sql/02_analysis.sql'),'utf8'));
const rows=db.prepare('SELECT * FROM inventory_analysis ORDER BY sku').all();
const expected={A:['REORDER',40],B:['URGENT',116],C:['OVERSTOCK',0],D:['NO_DEMAND',0],E:['STOCKOUT',60],F:['HEALTHY',0]};
for(const r of rows){const e=expected[r.sku];if(r.risk!==e[0]||r.suggested_order_units!==e[1])throw Error('Unexpected result '+r.sku);}
if(rows.length!==6||rows.reduce((n,r)=>n+r.inventory_value,0)!==10500)throw Error('Summary mismatch');
fs.mkdirSync(path.join(base,'outputs'),{recursive:true});
fs.writeFileSync(path.join(base,'outputs/inventory_analysis.csv'),Object.keys(rows[0]).join(',')+'\n'+rows.map(r=>Object.values(r).map(v=>v??'').join(',')).join('\n')+'\n');
console.table(rows.map(({sku,coverage_days,risk,suggested_order_units})=>({sku,coverage_days,risk,suggested_order_units})));
console.log('Verified 6 SKUs; inventory value 10500; output: outputs/inventory_analysis.csv');
