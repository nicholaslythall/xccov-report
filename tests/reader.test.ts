import {describe, test, expect} from '@jest/globals'
import {
  parseReport,
  getCoverageFromLines,
  getOverallCoverage,
  getTotalPercentage,
  getFileCoverage
} from '../src/reader'
import {Report, ChangedFileWithCoverage, ChangedFile} from '../src/types'

describe('Reader functions', () => {
  const sampleReport: Report = {
    '/users/current/project/main.swift': [
      {isExecutable: false, line: 1},
      {isExecutable: true, line: 2, executionCount: 0},
      {isExecutable: true, line: 3, executionCount: 4},
      {isExecutable: true, line: 4, executionCount: 1},
      {isExecutable: true, line: 5, executionCount: 0},
      {isExecutable: false, line: 6}
    ],
    '/users/current/project/module/Foo.swift': [
      {isExecutable: false, line: 1},
      {isExecutable: true, line: 2, executionCount: 0},
      {isExecutable: true, line: 3, executionCount: 2},
      {isExecutable: true, line: 4, executionCount: 0}
    ]
  }

  test('parse xccov report from json file', async () => {
    const report = await parseReport('./tests/examples/report.json')
    expect(report).toMatchObject(sampleReport as Record<string, any>)
  })

  test('get coverage from counters', () => {
    const coverage = getCoverageFromLines(
      sampleReport['/users/current/project/main.swift']
    )
    expect(coverage).toMatchObject({
      missed: 2,
      covered: 2,
      percentage: 50.0
    })
  })

  test('get coverage from counters returns null if no line counters', () => {
    const coverage = getCoverageFromLines([
      {line: 1, isExecutable: false},
      {line: 2, isExecutable: false},
      {line: 3, isExecutable: false},
      {line: 4, isExecutable: false},
      {line: 5, isExecutable: false}
    ])
    expect(coverage).toBeNull()
  })

  test('get overall coverage from report', () => {
    const coverage = getOverallCoverage(sampleReport)
    expect(coverage).toMatchObject({
      missed: 4,
      covered: 3,
      percentage: 42.86
    })
  })

  test('get overall coverage from report returns null if no counters', () => {
    const coverage = getOverallCoverage({
      '': []
    })
    expect(coverage).toBeNull()
  })

  test('get total percentage from changed files', () => {
    const files: ChangedFileWithCoverage[] = [
      {
        filePath: 'Details.kt',
        url: 'file-url-detail',
        missed: 250,
        covered: 1000,
        percentage: 80.0
      },
      {
        filePath: 'Util.kt',
        url: 'file-url-url',
        missed: 1000,
        covered: 1000,
        percentage: 50.0
      }
    ]
    const percentage = getTotalPercentage(files)
    expect(percentage).toBe(61.54)
  })

  test('get total percentage from empty changed files', () => {
    const percentage = getTotalPercentage([])
    expect(percentage).toBeNull()
  })

  test('get changed files coverage', () => {
    const changedFiles: ChangedFile[] = [
      {
        filePath: 'main.swift',
        url: 'file-url-main'
      },
      {
        filePath: 'some/nested/folder/baz.swift',
        url: 'file-url-baz'
      }
    ]

    const report: Report = {
      ...sampleReport,
      '/users/current/project/some/nested/folder/baz.swift': [
        {line: 1, isExecutable: false},
        {line: 2, isExecutable: true, executionCount: 0},
        {line: 3, isExecutable: true, executionCount: 4},
        {line: 4, isExecutable: true, executionCount: 1},
        {line: 5, isExecutable: true, executionCount: 0},
        {line: 6, isExecutable: false},
        {line: 7, isExecutable: true, executionCount: 10},
        {line: 8, isExecutable: true, executionCount: 0},
        {line: 9, isExecutable: false},
        {line: 10, isExecutable: true, executionCount: 3},
        {line: 11, isExecutable: true, executionCount: 1},
        {line: 12, isExecutable: true, executionCount: 5},
        {line: 13, isExecutable: true, executionCount: 10}
      ]
    }

    const coverage = getFileCoverage(report, changedFiles)
    expect(coverage).toMatchObject({
      files: [
        {
          filePath: 'main.swift',
          url: 'file-url-main',
          missed: 2,
          covered: 2,
          percentage: 50.0
        },
        {
          filePath: 'some/nested/folder/baz.swift',
          url: 'file-url-baz',
          missed: 3,
          covered: 7,
          percentage: 70.0
        }
      ],
      percentage: 64.29
    })
  })

  test('get changed files coverage on no matching changes', () => {
    const changedFiles: ChangedFile[] = [
      {
        filePath: 'module/Bar.swift',
        url: 'file-url-bar'
      },
      {
        filePath: 'common.swift',
        url: 'file-url-common'
      }
    ]
    const coverage = getFileCoverage(sampleReport, changedFiles)
    expect(coverage).toMatchObject({files: [], percentage: 100.0})
  })
})
