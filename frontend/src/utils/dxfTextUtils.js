/**
 * Strips DXF TEXT/MTEXT formatting codes to display clean text.
 * DXF uses codes like {\fArial|b0|i0|c0|p34;actualText} - we extract "actualText".
 * Used by DxfViewer and Dashboard's convertDxfToJson.
 */
export function stripDxfTextFormatting(text) {
  if (!text || typeof text !== 'string') return ''
  let result = String(text)

  // 1. Format blocks: {\fFont|b0|i0|c0|p34;actualText} -> actualText
  //    Content after semicolon inside braces is the visible text
  result = result.replace(/\{[^}]*;([^}]*)\}/g, '$1')

  // 2. Remove any remaining format-only blocks (no semicolon): {format}
  result = result.replace(/\{[^}]*\}/g, '')

  // 3. DXF escape sequences
  result = result.replace(/%%d/g, '°')
  result = result.replace(/%%c/g, 'Ø')
  result = result.replace(/%%p/g, '±')
  result = result.replace(/%%u/g, '')  // underline - strip
  result = result.replace(/%%o/g, '')   // overline - strip

  // 4. MTEXT line breaks
  result = result.replace(/\\P/g, '\n')   // new paragraph -> newline
  result = result.replace(/\\N/g, '\n')   // new line
  result = result.replace(/\\n/g, '\n')   // new line (lowercase)

  return result.trim()
}
