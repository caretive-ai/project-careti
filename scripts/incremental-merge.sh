#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${BASE_REF:-v3.35.0}"
CLINE_REF="${CLINE_REF:-v3.38.1}"
CARET_REF="${CARET_REF:-careti-main}"
RUN_TSC="${RUN_TSC:-yes}"
APPLY="no"
FILES=()

usage() {
  cat <<EOF
Usage: incremental-merge.sh [--apply] [--no-tsc] [--batch-file <path>] <file...>

3-way diff3로 소규모 배치(5~10 파일)를 병합하는 도우미.
환경변수:
  BASE_REF   (${BASE_REF})
  CLINE_REF  (${CLINE_REF})
  CARET_REF  (${CARET_REF})
  RUN_TSC    (${RUN_TSC}) --apply 시 npm run tsc -- --noEmit 실행 여부
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      APPLY="yes"
      shift
      ;;
    --no-tsc)
      RUN_TSC="no"
      shift
      ;;
    --batch-file)
      [[ $# -lt 2 ]] && { echo "--batch-file requires a path" >&2; exit 1; }
      mapfile -t batch < "$2"
      FILES+=("${batch[@]}")
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      FILES+=("$1")
      shift
      ;;
  esac
done

if [[ ${#FILES[@]} -eq 0 ]]; then
  usage
  exit 1
fi

TMPDIR="$(mktemp -d)"
MERGED_DIR="${TMPDIR}/merged"
mkdir -p "${MERGED_DIR}"

echo "[incremental-merge] base=${BASE_REF} cline=${CLINE_REF} caret=${CARET_REF}"
echo "[incremental-merge] files: ${#FILES[@]}"

merge_file() {
  local file="$1"
  local base_file="${TMPDIR}/${file}.base"
  local cline_file="${TMPDIR}/${file}.cline"
  local caret_file="${TMPDIR}/${file}.caret"
  local merged_file="${MERGED_DIR}/${file}"

  mkdir -p "$(dirname "${base_file}")" "$(dirname "${merged_file}")"

  if ! git show "${BASE_REF}:${file}" > "${base_file}" 2>/dev/null; then
    echo "[skip] ${file}: base(${BASE_REF}) 없음" >&2
    return
  fi
  if ! git show "${CLINE_REF}:${file}" > "${cline_file}" 2>/dev/null; then
    echo "[skip] ${file}: cline(${CLINE_REF}) 없음" >&2
    return
  fi
  if ! git show "${CARET_REF}:${file}" > "${caret_file}" 2>/dev/null; then
    echo "[skip] ${file}: caret(${CARET_REF}) 없음" >&2
    return
  fi

  if ! diff3 -m "${base_file}" "${cline_file}" "${caret_file}" > "${merged_file}"; then
    echo "[warn] ${file}: diff3 conflict markers present" >&2
  fi

  if [[ "${APPLY}" == "yes" ]]; then
    mkdir -p "$(dirname "${file}")"
    if [[ -f "${file}" ]]; then
      cp "${file}" "${file}.bak-$(date +%s)"
    fi
    mv "${merged_file}" "${file}"
    echo "[apply] ${file}"
  else
    echo "[dry-run] merged output at ${merged_file}"
  fi
}

for f in "${FILES[@]}"; do
  merge_file "${f}"
done

if [[ "${APPLY}" == "yes" && "${RUN_TSC}" == "yes" ]]; then
  echo "[tsc] npm run tsc -- --noEmit"
  npm run tsc -- --noEmit
fi

echo "[incremental-merge] done. merged artifacts: ${MERGED_DIR}"
