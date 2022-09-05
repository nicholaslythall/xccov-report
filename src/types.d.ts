type UnexecutableLine = {
  isExecutable: false
  line: number
}

type ExecutableLine = {
  isExecutable: true
  line: number
  executionCount: number
  subranges?: Subrange[]
}

type Subrange = {
  column: number
  executionCount: number
  length: number
}

export type Line = ExecutableLine | UnexecutableLine

export type Report = {
  [sourcePath: string]: Line[]
}

export type Coverage = {
  missed: number
  covered: number
  percentage: number
}

export type ChangedFileWithCoverage = Coverage & ChangedFile

export type ChangedFilesCoverage = {
  percentage: number
  files: ChangedFileWithCoverage[]
}

export type ChangedFile = {
  filePath: string
  url: string
}
