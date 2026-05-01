/**
 * Removes trailing delimiter characters and normalizes CSV content
 * Handles cases where CSV has trailing semicolons or commas after the last value
 */
export function sanitizeCsvContent(csvText: string): string {
  // Split by newlines
  const lines = csvText.split('\n')
  
  // Process each line to remove trailing delimiters
  const sanitizedLines = lines.map((line) => {
    if (!line.trim()) return line
    
    // Remove trailing semicolons and whitespace
    // This handles cases like "managerEmail;;;;;;;;;" at the end of a value
    let sanitized = line.replace(/[;,]*\s*$/, '')
    
    // clean up any remaining extra delimiters within the line
    // but only if they appear to be at the end of fields
    while (sanitized.endsWith(';') || sanitized.endsWith(',')) {
      sanitized = sanitized.slice(0, -1).trim()
    }

    // Accept lines fully quoted as one CSV value but containing comma-separated fields
    const trimmed = sanitized.trim()
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const inner = trimmed.slice(1, -1).replace(/""/g, '"')
      sanitized = inner
    }

    return sanitized
  })
  
  return sanitizedLines.join('\n')
}

/**
 * Normalizes header names by trimming and removing special characters
 */
export function normalizeHeaderName(header: string): string {
  return header
    .trim()
    .replace(/[;,]+/g, '') // Remove semicolons and commas
    .toLowerCase()
}

/**
 * Normalizes all data values by trimming and removing trailing delimiters
 */
export function normalizeDataValue(value: string | undefined | null): string {
  if (!value) return ''
  
  return String(value)
    .trim()
    .replace(/[;,]+$/, '') // Remove trailing delimiters
    .trim()
}
