import gzip
import re
import json
import os

backup_file = '/Users/manas/edupapers/db_cluster-19-08-2025_08-14-22.backup.gz'
output_dir = '/Users/manas/edupapers/database/convex_imports'
os.makedirs(output_dir, exist_ok=True)

targets = ['public.papers', 'public.profiles', 'public.questions']

def unescape_pg(val):
    if val == r'\N':
        return None
    # Unescape Postgres COPY escapes
    val = val.replace(r'\t', '\t')
    val = val.replace(r'\n', '\n')
    val = val.replace(r'\r', '\r')
    val = val.replace(r'\\', '\\')
    return val

def parse_line(line, columns):
    parts = line.strip('\n').split('\t')
    row = {}
    for i, col in enumerate(columns):
        if i < len(parts):
            val = unescape_pg(parts[i])
            if col in ['year', 'questions_count']:
                try:
                    row[col] = int(val) if val is not None else None
                except ValueError:
                    row[col] = val
            elif col in ['questions_data']:
                try:
                    row[col] = json.loads(val) if val is not None else None
                except Exception:
                    row[col] = val
            else:
                row[col] = val
        else:
            row[col] = None
    return row

print(f"Reading backup from {backup_file}...")

current_table = None
columns = []
table_mapping = {
    'public.papers': 'papers',
    'public.profiles': 'profiles',
    'public.questions': 'questions'
}

parsed_data = {t: [] for t in table_mapping.values()}

with gzip.open(backup_file, 'rt', encoding='utf-8', errors='ignore') as f:
    for line in f:
        # Check for COPY start
        if line.startswith('COPY '):
            match = re.match(r'COPY ([a-zA-Z0-9_\.]+)\s*\((.*?)\)\s*FROM stdin;', line)
            if match:
                table_name = match.group(1)
                if table_name in targets:
                    current_table = table_mapping[table_name]
                    columns = [c.strip() for c in match.group(2).split(',')]
                    print(f"Parsing table {current_table} with columns: {columns}")
                    continue
        
        # Check for COPY end
        if current_table and line.strip() == '\\.':
            print(f"Finished parsing table {current_table}. Total rows: {len(parsed_data[current_table])}")
            current_table = None
            columns = []
            continue
            
        # Parse data row
        if current_table:
            row = parse_line(line, columns)
            # Remove id column because Convex uses its own internal _id field, 
            # but preserve it if needed or rename it (e.g. pg_id) to avoid collision.
            if 'id' in row:
                row['pg_id'] = row.pop('id')
            parsed_data[current_table].append(row)

# Write to JSONL
for table, rows in parsed_data.items():
    output_file = os.path.join(output_dir, f"{table}.jsonl")
    print(f"Writing {len(rows)} rows to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as out:
        for r in rows:
            out.write(json.dumps(r, ensure_ascii=False) + '\n')

print("Migration generation complete! Files ready in database/convex_imports/")
