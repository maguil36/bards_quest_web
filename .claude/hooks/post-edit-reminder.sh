#!/bin/sh
# Reads file_path from hook stdin JSON; if it's a .js/.ts/.astro/.css file,
# injects a reminder to update the relevant doc in docs/.
FILE=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
if echo "$FILE" | grep -qE '\.(js|ts|astro|css)$'; then
  printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"Reminder: you just edited a source file. If it belongs to a documented subsystem, check docs/ and update the relevant doc to reflect your changes."}}'
fi
