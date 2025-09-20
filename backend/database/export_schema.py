#!/usr/bin/env python3
"""
Export DuckDB schema (tables + indexes) into schema.sql
"""

import duckdb
import os
from pathlib import Path

def export_schema(db_path: str, output_path: str):
    conn = duckdb.connect(db_path)

    # Export tables
    tables = conn.execute("""
        SELECT sql
        FROM duckdb_tables()
        WHERE sql IS NOT NULL
        ORDER BY table_name
    """).fetchall()

    # Export indexes
    indexes = conn.execute("""
        SELECT sql
        FROM duckdb_indexes()
        WHERE sql IS NOT NULL
        ORDER BY index_name
    """).fetchall()

    schema_parts = []

    schema_parts.append("-- =========================")
    schema_parts.append("-- DuckDB Schema Export")
    schema_parts.append("-- =========================\n")

    schema_parts.append("-- Tables\n")
    for row in tables:
        schema_parts.append(row[0] + ";\n")

    schema_parts.append("-- Indexes\n")
    for row in indexes:
        schema_parts.append(row[0] + ";\n")

    schema_text = "\n".join(schema_parts)

    # Save to file
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        f.write(schema_text)

    print(f"✅ Schema exported to {output_path}")
    print(f"   Tables: {len(tables)}, Indexes: {len(indexes)}")

if __name__ == "__main__":
    db_path = os.getenv("DUCKDB_PATH", "backend/data/jupiter_siem.db")
    output_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    export_schema(db_path, output_path)
