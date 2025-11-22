import { useState, useCallback } from 'react'
import bibleApiService from '../utils/bibleApiService'

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

const BibleApiTester = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (result: TestResult) => {
    setTestResults((prev) => [result, ...prev])
  }

  const testGetBibles = useCallback(async () => {
    setLoading(true)
    try {
      const bibles = await bibleApiService.getBibles()
      addResult({
        success: true,
        message: `Found ${bibles.length} bibles`,
        data: bibles.slice(0, 3), // Show first 3
      })
    } catch (error) {
      addResult({
        success: false,
        message: 'Failed to get bibles',
        error: String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const testGetProverbsRVR = useCallback(async () => {
    setLoading(true)
    try {
      // RVR09 = Reina Valera 1909
      const bibleId = '592420522e16049f-01'
      const chapterVerses = await bibleApiService.getChapterVerses(bibleId, 'PRO.3')
      
      addResult({
        success: true,
        message: `Got Proverbs 3 from RVR09. Verses 5-6:`,
        data: {
          verse5: chapterVerses['5'],
          verse6: chapterVerses['6'],
        },
      })
    } catch (error) {
      addResult({
        success: false,
        message: 'Failed to get Proverbs 3 from RVR09',
        error: String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const testGetProverbsEnglish = useCallback(async () => {
    setLoading(true)
    try {
      // WEB = World English Bible
      const bibleId = '9879dbb7cfe39e4d-01'
      const chapterVerses = await bibleApiService.getChapterVerses(bibleId, 'PRO.3')
      
      addResult({
        success: true,
        message: `Got Proverbs 3 from WEB. Verses 5-6:`,
        data: {
          verse5: chapterVerses['5'],
          verse6: chapterVerses['6'],
        },
      })
    } catch (error) {
      addResult({
        success: false,
        message: 'Failed to get Proverbs 3 from WEB',
        error: String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setTestResults([])
  }, [])

  return (
    <div style={styles.container}>
      <h2>Bible API Tester</h2>
      <p style={styles.warning}>
        Make sure you have set <code>NEXT_PUBLIC_BIBLE_API_KEY</code> in your .env.local file
      </p>
      
      <div style={styles.buttonGroup}>
        <button
          onClick={testGetBibles}
          disabled={loading}
          style={styles.button}
        >
          Test: Get All Bibles
        </button>
        <button
          onClick={testGetProverbsRVR}
          disabled={loading}
          style={styles.button}
        >
          Test: Proverbs 3:5-6 (Spanish RVR09)
        </button>
        <button
          onClick={testGetProverbsEnglish}
          disabled={loading}
          style={styles.button}
        >
          Test: Proverbs 3:5-6 (English WEB)
        </button>
        <button
          onClick={clearResults}
          style={{ ...styles.button, backgroundColor: '#999' }}
        >
          Clear Results
        </button>
      </div>

      <div style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <div
            key={index}
            style={{
              ...styles.result,
              borderLeftColor: result.success ? '#4caf50' : '#f44336',
              backgroundColor: result.success ? '#f1f8f5' : '#fef1f1',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', color: result.success ? '#2e7d32' : '#c62828' }}>
              {result.success ? '✓' : '✗'} {result.message}
            </h4>
            {result.data && (
              <pre style={styles.pre}>{JSON.stringify(result.data, null, 2)}</pre>
            )}
            {result.error && (
              <pre style={{ ...styles.pre, color: '#c62828' }}>{result.error}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  } as const,
  warning: {
    backgroundColor: '#fff3cd',
    padding: '10px',
    borderRadius: '4px',
    color: '#856404',
    fontSize: '14px',
  } as const,
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  } as const,
  button: {
    padding: '10px 15px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  } as const,
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  result: {
    padding: '12px',
    borderLeft: '4px solid',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
  } as const,
  pre: {
    margin: '0',
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '12px',
  } as const,
}

export default BibleApiTester
