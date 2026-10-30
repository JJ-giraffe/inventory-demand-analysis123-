# Power BI 展示指南

当前没有 PBIX；以下为可执行搭建说明。

1. 导入 outputs/inventory_analysis.csv；表命名 Inventory。sku/name/risk 设为文本，数量设整数，金额与覆盖天数设小数。空 coverage_days 保留为空。
2. 添加卡片：库存金额、需补货 SKU 数、建议补货件数。
3. 添加横向条形图：name 为分类，inventory_value 为数值，risk 为图例。
4. 添加明细表：sku、name、coverage_days、lead_days、risk、suggested_order_units；按风险筛选，突出 STOCKOUT 和 URGENT。
5. 添加 risk 切片器；页面标题注明“模拟数据｜快照 2026-10-01”。

DAX 度量值：
```dax
库存金额 = SUM(Inventory[inventory_value])
需补货SKU数 = CALCULATE(DISTINCTCOUNT(Inventory[sku]), Inventory[risk] IN {"STOCKOUT", "URGENT", "REORDER"})
建议补货件数 = SUM(Inventory[suggested_order_units])
```

核对卡片应分别为 10,500、3、216。不要简单平均 SKU 覆盖天数作为总体周转指标。完成后保存 PBIX，并把报表截图放到 docs/，再补进 README。
