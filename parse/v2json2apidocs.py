#!/usr/bin/env python3
import json
import argparse
from pathlib import Path

def pretty_dict(obj, indent=0):
    indent_str = "  " * indent
    lines = [indent_str + "{"]
    items = list(obj.items())
    for idx, (k, v) in enumerate(items):
        is_last = (idx == len(items) - 1)
        comma = "" if is_last else ","
        key_str = indent_str + "  " + json.dumps(k) + ": "

        if isinstance(v, list):
            lines.append(key_str + "[")
            if v:
                first = v[0]
                if isinstance(first, dict):
                    lines.extend(pretty_dict(first, indent + 2))
                else:
                    lines.append("  " * (indent + 2) + json.dumps(first))
            lines.append("  " * (indent + 2) + "//more")
            lines.append(indent_str + "  " + "]" + comma)
        else:
            lines.append(key_str + json.dumps(v) + comma)
    lines.append(indent_str + "}")
    return lines

def format_array_lines(arr):
    """Helper to collapse a top‐level array into first‐item + //more."""
    fake = {"": arr}
    block = pretty_dict(fake, indent=0)
    # strip off fake wrapper lines
    stripped = []
    for line in block[1:-1]:
        stripped.append(line.replace('  ""', '').rstrip())
    return stripped

def format_body(raw):
    """Turn a raw body (None, 'null', JSON, primitive) into lines."""
    # catch Python None or literal "null"
    if raw is None or (isinstance(raw, str) and raw.strip().lower() == "null"):
        return ["  None"]
    # try JSON
    try:
        parsed = json.loads(raw) if isinstance(raw, str) else raw
    except Exception:
        return ["  " + str(raw)]
    # now handle types
    if isinstance(parsed, dict):
        return pretty_dict(parsed, indent=0)
    if isinstance(parsed, list):
        return format_array_lines(parsed)
    # primitive
    return ["  " + json.dumps(parsed)]

def format_entry(entry, idx):
    out = []
    out.append(f"### Request {idx}")
    out.append(f"Method: {entry.get('method','')}")
    out.append(f"URL: {entry.get('url','')}")
    out.append("Headers:")
    out.append("  Content-Type: application/json")
    out.append("")

    out.append("Payload:")
    out.extend(format_body(entry.get("requestBody")))
    out.append("")

    out.append("Response:")
    out.extend(format_body(entry.get("responseBody")))
    out.append("")  # blank line
    return "\n".join(out)

def main():
    parser = argparse.ArgumentParser(
        description="Convert API-log JSON into plain-text API docs.")
    parser.add_argument("input",  type=Path, help="path to api_logs.json")
    parser.add_argument("output", type=Path, help="path to api_docs.txt")
    args = parser.parse_args()

    data = json.load(args.input.open())
    with args.output.open("w") as f:
        for i, entry in enumerate(data, start=1):
            f.write(format_entry(entry, i))

    print(f"Wrote {len(data)} entries to {args.output}")

if __name__ == "__main__":
    main()
