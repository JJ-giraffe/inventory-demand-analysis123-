-- Snapshot: 2026-10-01; previous 30 calendar days, including zero-sale days.
CREATE VIEW inventory_analysis AS
WITH demand AS (
 SELECT p.*, COALESCE(SUM(s.units),0) AS units_30d
 FROM products p LEFT JOIN sales s ON p.sku=s.sku
 AND s.date >= '2026-09-01' AND s.date < '2026-10-01'
 GROUP BY p.sku
), metrics AS (
 SELECT *, units_30d/30.0 AS avg_daily_demand,
 ROUND(stock / NULLIF(units_30d/30.0,0),2) AS coverage_days,
 stock*unit_cost AS inventory_value,
 lead_days+7 AS target_days
 FROM demand
)
SELECT *, CASE
 WHEN units_30d=0 THEN 'NO_DEMAND'
 WHEN stock=0 THEN 'STOCKOUT'
 WHEN coverage_days < lead_days THEN 'URGENT'
 WHEN coverage_days < target_days THEN 'REORDER'
 WHEN coverage_days > 60 THEN 'OVERSTOCK'
 ELSE 'HEALTHY' END AS risk,
 CASE WHEN units_30d=0 THEN 0
 ELSE MAX(0, CAST(CEIL(avg_daily_demand*target_days-stock) AS INTEGER)) END AS suggested_order_units
FROM metrics;
