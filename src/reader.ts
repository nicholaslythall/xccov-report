import * as fs from 'fs'
import {
  Report,
  Line,
  Coverage,
  ChangedFile,
  ChangedFilesCoverage,
  ChangedFileWithCoverage,
  ExecutableLine
} from './types.d'

export const parseReport = async (path: string): Promise<Report | null> => {
  const reportJson = await fs.promises.readFile(path.trim(), 'utf-8')
  return JSON.parse(reportJson)
}

export const getCoverageFromLines = (counters: Line[]): Coverage | null => {
  const executableLines = counters.reduce<ExecutableLine[]>((acc, line) => {
    if (line.isExecutable) {
      acc.push(line)
    }
    return acc
  }, [])

  if (executableLines.length === 0) {
    return null
  }

  let missed = 0
  let covered = 0

  for (const line of executableLines) {
    if (line.executionCount > 0) {
      covered += 1
    } else {
      missed += 1
    }
  }

  return {
    missed,
    covered,
    percentage: parseFloat(((covered / (covered + missed)) * 100).toFixed(2))
  }
}

export const getOverallCoverage = (report: Report): Coverage | null => {
  const allLines = Object.entries(report).flatMap(([, lines]) => lines)
  return getCoverageFromLines(allLines)
}

export const getFileCoverage = (
  report: Report,
  files: ChangedFile[]
): ChangedFilesCoverage => {
  const filesWithCoverage = files.reduce<ChangedFileWithCoverage[]>(
    (acc, file) => {
      const sourceLines = Object.entries(report).find(([name]) =>
        name.endsWith(file.filePath)
      )
      if (sourceLines) {
        const coverage = getCoverageFromLines(sourceLines[1])
        if (coverage)
          acc.push({
            ...file,
            ...coverage
          })
      }
      return acc
    },
    []
  )

  return {
    files: filesWithCoverage,
    percentage: getTotalPercentage(filesWithCoverage) ?? 100
  }
}

export const getTotalPercentage = (
  files: ChangedFileWithCoverage[]
): number | null => {
  if (files.length === 0) return null

  const result = files.reduce<{missed: number; covered: number}>(
    (acc, file) => ({
      missed: acc.missed + file.missed,
      covered: acc.covered + file.covered
    }),
    {missed: 0, covered: 0}
  )

  return parseFloat(
    ((result.covered / (result.covered + result.missed)) * 100).toFixed(2)
  )
}
