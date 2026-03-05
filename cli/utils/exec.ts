import { spinner } from '@clack/prompts'
import { execSync, spawn, type SpawnOptions } from 'node:child_process'

export function commandExists(cmd: string): boolean {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export function execCapture(cmd: string): string {
  return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

export async function execWithSpinner(message: string, cmd: string): Promise<string> {
  const s = spinner()
  s.start(message)
  try {
    const result = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
    s.stop(`${message} — done`)
    return result
  } catch (err: any) {
    const stderr = err.stderr?.toString().trim() || err.message
    s.stop(`${message} — failed`)
    throw new Error(stderr)
  }
}

export function execInteractive(cmd: string, args: string[], opts?: SpawnOptions): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts })
    child.on('close', (code) => resolve(code ?? 0))
    child.on('error', reject)
  })
}

export function execStreaming(cmd: string, args: string[]): never {
  const child = spawn(cmd, args, { stdio: 'inherit' })
  child.on('close', (code) => process.exit(code ?? 0))
  child.on('error', (err) => {
    console.error(err.message)
    process.exit(1)
  })
  // Keep the process alive while the child runs
  setInterval(() => {}, 1 << 30)
  throw new Error('unreachable')
}
