#!/usr/bin/env bash
# Rebuild the recovered app's exact TDLib revision; never consume a reference APK.
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
root=${MOVIESAPAMAPUH_NATIVE_BUILD_DIR:-"$repo/.native-build"}
: "${ANDROID_HOME:?Set ANDROID_HOME to an SDK containing NDK 23.2.8568313}"
export ANDROID_NDK_ROOT="$ANDROID_HOME/ndk/23.2.8568313"
export ANDROID_NDK_HOME="$ANDROID_NDK_ROOT"
for tool in git cmake ninja gperf make perl php python3; do command -v "$tool" >/dev/null; done
test -x "$ANDROID_NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/bin/clang"
export PATH="$ANDROID_NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/bin:$PATH"
jobs=${MOVIESAPAMAPUH_BUILD_JOBS:-4}
td_commit=e0943d068ce90b5010f1aea946e6901e25b43bf6
ssl_commit=e04bd3433fd84e1861bf258ea37928d9845e6a86
mkdir -p "$root/provenance"
fetch_source() {
  local dest=$1 url=$2 commit=$3
  if [ ! -d "$dest/.git" ]; then
    mkdir -p "$dest"
    git -C "$dest" init -q
    git -C "$dest" fetch --depth=1 "$url" "$commit"
    git -C "$dest" checkout --detach FETCH_HEAD
  fi
  test "$(git -C "$dest" rev-parse HEAD)" = "$commit"
  git -C "$dest" diff --quiet HEAD --
}
fetch_source "$root/tdlib-source" https://github.com/tdlib/td.git "$td_commit"
fetch_source "$root/openssl-source" https://github.com/openssl/openssl.git "$ssl_commit"
python3 - "$repo" <<'PY'
from pathlib import Path
import hashlib,sys
p=Path(sys.argv[1])/'android/pencarimovie-server/app/libs/tdlib.jar'
assert hashlib.sha256(p.read_bytes()).hexdigest()=='ea351c3ad339c51c6a8c015d2198f1a09d3da4bd23da0347f48d015cfc17ba83', 'Recovered TDLib Java API changed; review compatibility before building'
PY
# Follow the pinned upstream Android recipe, limiting output to the two app ABIs.
# OpenSSL 1.1.1w is the reference dependency, not a recommendation for new projects.
cd "$root/openssl-source"
for abi in arm64-v8a armeabi-v7a; do
  case "$abi" in
    arm64-v8a) target=android-arm64; api=21 ;;
    armeabi-v7a) target=android-arm; api=16 ;;
  esac
  LDFLAGS=-Wl,-z,max-page-size=16384 ./Configure "$target" no-shared -U__ANDROID_API__ -D__ANDROID_API__="$api" -D__ARM_MAX_ARCH__=8 > "$root/provenance/openssl-$abi.log" 2>&1
  sed -i.bak 's/-O3/-O3 -ffunction-sections -fdata-sections/g' Makefile
  make depend -s >> "$root/provenance/openssl-$abi.log" 2>&1
  make -j"$jobs" -s >> "$root/provenance/openssl-$abi.log" 2>&1
  mkdir -p "$root/openssl-built/$abi/lib"
  cp libcrypto.a libssl.a "$root/openssl-built/$abi/lib/"
  cp -r include "$root/openssl-built/$abi/"
  make distclean >> "$root/provenance/openssl-$abi.log" 2>&1
  echo "OpenSSL $abi complete"
done
cmake -S "$root/tdlib-source/example/android" -B "$root/tdlib-source/example/android/build-native-Java" -DTD_GENERATE_SOURCE_FILES=ON
cmake --build "$root/tdlib-source/example/android/build-native-Java" --parallel "$jobs"
cmake --build "$root/tdlib-source/example/android/build-native-Java" --target tl_generate_java --parallel "$jobs"
for abi in arm64-v8a armeabi-v7a; do
  cmake -S "$root/tdlib-source/example/android" -B "$root/tdlib-build-$abi" -GNinja \
    -DCMAKE_TOOLCHAIN_FILE="$ANDROID_NDK_ROOT/build/cmake/android.toolchain.cmake" \
    -DOPENSSL_ROOT_DIR="$root/openssl-built/$abi" -DCMAKE_BUILD_TYPE=RelWithDebInfo \
    -DANDROID_ABI="$abi" -DANDROID_STL=c++_static -DANDROID_PLATFORM=android-21
  cmake --build "$root/tdlib-build-$abi" --target tdjni --parallel "$jobs"
  dest="$repo/android/pencarimovie-server/app/src/main/jniLibs/$abi"
  mkdir -p "$dest"
  cp "$root/tdlib-build-$abi/libtdjni.so" "$dest/"
done
python3 - "$repo" "$td_commit" "$ssl_commit" <<'PY'
from pathlib import Path
import json,hashlib,sys
root=Path(sys.argv[1]);rows=[]
for abi in ('arm64-v8a','armeabi-v7a'):
 p=root/'android/pencarimovie-server/app/src/main/jniLibs'/abi/'libtdjni.so'
 rows.append({'abi':abi,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size})
p=root/'android/pencarimovie-server/app/build/native-provenance.json';p.parent.mkdir(parents=True,exist_ok=True)
p.write_text(json.dumps({'tdlib_commit':sys.argv[2],'openssl_commit':sys.argv[3],'ndk':'23.2.8568313','android_api':21,'libraries':rows},indent=2)+'\n')
print(p)
PY
