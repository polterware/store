import { spinner } from '@clack/prompts'
import pc from 'picocolors'
import { execInteractive } from '../utils/exec.js'

export async function runCheck() {
  console.log()
  console.log(pc.bold('Code quality'))

  const s = spinner()

  s.start('Running Prettier --write')
  const prettierCode = await execInteractive('pnpm', ['prettier', '--write', '.'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (prettierCode !== 0) {
    s.stop(pc.red('Prettier failed'))
    process.exit(1)
  }
  s.stop(`${pc.green('✓')} Prettier`)

  s.start('Running ESLint --fix')
  const eslintCode = await execInteractive('pnpm', ['eslint', '--fix'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (eslintCode !== 0) {
    s.stop(pc.red('ESLint failed'))
    process.exit(1)
  }
  s.stop(`${pc.green('✓')} ESLint`)

  console.log()
  console.log(pc.green('All checks passed'))
}
