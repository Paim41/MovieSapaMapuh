#!/usr/bin/env python3
"""Verify the untouched pre-redesign baseline; changes require explicit review."""
import hashlib
import json
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
baseline = json.loads((root / 'docs/baseline-files.json').read_text())
changed = []
for entry in baseline['files']:
    path = root / entry['path']
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != entry['sha256']:
        changed.append(entry['path'])
for path in changed:
    print('REVIEW REQUIRED:', path)
print(f"{len(baseline['files']) - len(changed)}/{len(baseline['files'])} baseline files unchanged")
print('This verifies byte preservation, not runtime behavior or future redesigned UI parity.')
sys.exit(bool(changed))
