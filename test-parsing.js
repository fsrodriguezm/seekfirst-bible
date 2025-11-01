// Quick test to verify the parsing function works with the ** format

const parseExplanationSections = (text) => {
  const sections = []
  const lines = text.split('\n')
  let currentTitle = ''
  let currentContent = ''

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Look for lines that start with ** and end with ** (like **1. Context – ...**)
    if (trimmedLine.match(/^\*\*\d+\.\s+.*\*\*$/)) {
      // Save previous section if exists
      if (currentTitle && currentContent) {
        sections.push({
          title: currentTitle,
          content: currentContent.trim()
        })
      }
      
      // Extract title by removing the ** markers
      currentTitle = trimmedLine.replace(/^\*\*|\*\*$/g, '').trim()
      currentContent = ''
    } else if (trimmedLine && currentTitle) {
      // Add content to current section
      if (currentContent) currentContent += '\n'
      currentContent += trimmedLine
    } else if (trimmedLine && !currentTitle) {
      // Handle content before any section headers
      if (currentContent) currentContent += '\n'
      currentContent += trimmedLine
    }
  }

  // Add the last section
  if (currentTitle && currentContent) {
    sections.push({
      title: currentTitle,
      content: currentContent.trim()
    })
  }

  // If no sections were found but there's content, create a single section
  if (sections.length === 0 && text.trim()) {
    sections.push({
      title: 'Explanation',
      content: text.trim()
    })
  }

  return sections
}

const testText = `**1. Context – Historical and narrative background of the chapter.**

The book of Esther takes place in the Persian Empire during the reign of King Ahasuerus (also known as Xerxes I), who ruled from 486 to 465 BCE.

**2. Original Language – Provide key original Greek or Hebrew insights and important terms from the chapter.**

The book of Esther is written in Hebrew. Key terms and insights from Esther 1 include:

- The Hebrew word for "feast" (מִשְׁתֶּה, mishteh) is used frequently in this chapter.

**3. Word Study – Define key terms using Strong's Concordance, and show where else those words appear in Scripture.**

- **מִשְׁתֶּה (mishteh)**, Strong's H3899, meaning "feast" or "banquet," appears 16 times in the Hebrew Bible.`

const sections = parseExplanationSections(testText)
console.info('Parsed sections:')
sections.forEach((section, index) => {
  console.info(`\n${index + 1}. Title: "${section.title}"`)
  console.info(`   Content: "${section.content.substring(0, 100)}${section.content.length > 100 ? '...' : ''}"`)
})
