#!/usr/bin/env python3
"""Check actual APK contents against the recovered source and locally built JNI."""
from pathlib import Path
import hashlib
import sys
import zipfile

repo = Path(__file__).resolve().parents[1]
project = repo / 'android/pencarimovie-server/app/src/main'
apk = Path(sys.argv[1])
with zipfile.ZipFile(apk) as archive:
    for abi, elf_class, machine in [('arm64-v8a', 2, 183), ('armeabi-v7a', 1, 40)]:
        data = archive.read(f'lib/{abi}/libtdjni.so')
        expected = (project / 'jniLibs' / abi / 'libtdjni.so').read_bytes()
        assert data == expected, f'JNI bytes differ: {abi}'
        assert data[:4] == b'\x7fELF' and data[4] == elf_class
        assert int.from_bytes(data[18:20], 'little') == machine
        assert b'e0943d068ce90b5010f1aea946e6901e25b43bf6' in data
    files = sorted(p for p in (project / 'assets').rglob('*') if p.is_file())
    for path in files:
        name = 'assets/' + path.relative_to(project / 'assets').as_posix()
        assert archive.read(name) == path.read_bytes(), f'Asset differs: {name}'
    print(f'PASS: two pinned JNI libraries and {len(files)} bundled assets match build inputs')
print('APK SHA-256:', hashlib.sha256(apk.read_bytes()).hexdigest())
print('This is a packaging check, not device, streaming, text/UI, or functional parity validation.')
