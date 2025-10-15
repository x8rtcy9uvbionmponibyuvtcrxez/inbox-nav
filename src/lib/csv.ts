const NEWLINE_REGEX = /\r\n|\n|\r/g

function stripBom(input: string): string {
  return input.startsWith('\uFEFF') ? input.slice(1) : input
}

export function parseCsv(rawText: string): string[][] {
  const text = stripBom(rawText)
  const rows: string[][] = []

  let currentField = ''
  let currentRow: string[] = []
  let inQuotes = false
  let i = 0

  const pushField = () => {
    currentRow.push(currentField)
    currentField = ''
  }

  const pushRow = () => {
    // Ignore rows that are empty (all fields blank)
    if (currentRow.some((field) => field.trim().length > 0)) {
      rows.push(currentRow)
    }
    currentRow = []
  }

  while (i < text.length) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        const nextChar = text[i + 1]
        if (nextChar === '"') {
          currentField += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        pushField()
      } else if (char === '\n') {
        pushField()
        pushRow()
      } else if (char === '\r') {
        const nextChar = text[i + 1]
        if (nextChar === '\n') {
          i += 1
        }
        pushField()
        pushRow()
      } else {
        currentField += char
      }
    }

    i += 1
  }

  // Capture trailing field/row
  pushField()
  if (currentRow.length > 1 || currentRow[0]?.trim().length) {
    rows.push(currentRow)
  }

  return rows
}

export function splitCsvLines(rawText: string): string[] {
  return stripBom(rawText).split(NEWLINE_REGEX)
}
