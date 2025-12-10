import * as fs from 'fs'
import * as path from 'path'

interface QuestionRow {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  option_e: string
  correct_answer: string
  subtest_utbk: string
  difficulty: string
  hint_text?: string
  solution_steps?: string
  question_image_url?: string
  is_hots?: string
  logic_clues?: string
  distractor_analysis?: string
}

function parseCSV(csvContent: string): QuestionRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  const questions: QuestionRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    
    if (values.length < headers.length) continue
    
    const question: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim().replace(/"/g, '')
      
      if (value && value !== '') {
        if (header === 'is_hots') {
          question[header] = value.toLowerCase() === 'true' || value === '1'
        } else {
          question[header] = value
        }
      }
    })
    
    // Validate required fields
    if (question.question_text && question.option_a && question.correct_answer) {
      questions.push(question)
    }
  }
  
  return questions
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

async function convertCSVToJSON(csvFilePath: string, outputPath?: string) {
  console.log('📄 Converting CSV to JSON...')
  console.log(`📁 Reading: ${csvFilePath}`)
  
  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
    
    // Parse CSV
    const questions = parseCSV(csvContent)
    
    console.log(`📊 Parsed ${questions.length} questions`)
    
    // Validate questions
    const validationErrors: string[] = []
    const validSubtests = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
    const validHotsValues = ['true', 'false', true, false]
    const validAnswers = ['A', 'B', 'C', 'D', 'E']
    
    questions.forEach((question, index) => {
      if (!validAnswers.includes(question.correct_answer)) {
        validationErrors.push(`Row ${index + 2}: Invalid correct_answer '${question.correct_answer}'`)
      }
      if (!validSubtests.includes(question.subtest_utbk)) {
        validationErrors.push(`Row ${index + 2}: Invalid subtest_utbk '${question.subtest_utbk}'`)
      }
      if (!validHotsValues.includes(question.is_hots)) {
        validationErrors.push(`Row ${index + 2}: Invalid is_hots '${question.is_hots}' (must be true or false)`)
      }
    })
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:')
      validationErrors.slice(0, 10).forEach(error => console.error(`  ${error}`))
      if (validationErrors.length > 10) {
        console.error(`  ... and ${validationErrors.length - 10} more errors`)
      }
      return
    }
    
    console.log('✅ All questions passed validation')
    
    // Generate output path
    if (!outputPath) {
      const baseName = path.basename(csvFilePath, path.extname(csvFilePath))
      outputPath = path.join(path.dirname(csvFilePath), `${baseName}.json`)
    }
    
    // Write JSON file
    fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2), 'utf-8')
    
    console.log(`💾 Saved to: ${outputPath}`)
    
    // Show summary
    console.log('\n📊 Summary:')
    console.log(`📚 Total questions: ${questions.length}`)
    
    // Count by subtest
    const subtestCounts = questions.reduce((acc, q) => {
      acc[q.subtest_utbk] = (acc[q.subtest_utbk] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('\n📋 By subtest:')
    Object.entries(subtestCounts).forEach(([subtest, count]) => {
      console.log(`  ${subtest}: ${count} questions`)
    })
    
    // Count by HOTS classification
    const hotsCounts = questions.reduce((acc, q) => {
      const isHots = q.is_hots === 'true' || q.is_hots === true
      const key = isHots ? 'HOTS' : 'Regular'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('\n🧠 By type:')
    Object.entries(hotsCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} questions`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('📄 CSV to JSON Converter')
    console.log('\nUsage:')
    console.log('  npm run convert-csv <input.csv> [output.json]')
    console.log('\nExample:')
    console.log('  npm run convert-csv questions/math-questions.csv')
    console.log('  npm run convert-csv questions/math-questions.csv questions/math-questions.json')
    return
  }
  
  const csvFilePath = args[0]
  const outputPath = args[1]
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ File not found: ${csvFilePath}`)
    return
  }
  
  await convertCSVToJSON(csvFilePath, outputPath)
}

main().catch(console.error)