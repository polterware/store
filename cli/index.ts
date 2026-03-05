import { intro, outro, select, isCancel } from '@clack/prompts'
import pc from 'picocolors'

const args = process.argv.slice(2)
const command = args[0]
const subcommand = args[1]
const flags = new Set(args.filter((a) => a.startsWith('--')))

function printHelp() {
  console.log(`
  ${pc.bold('URU CLI')} — development toolkit

  ${pc.dim('Usage:')}  pnpm uru [command]

  ${pc.dim('Commands:')}
    ${pc.bold('setup')}          First-time setup wizard
    ${pc.bold('dev')}            Start development server (web or desktop)
    ${pc.bold('db')}             Database operations
    ${pc.bold('db push')}        Push migrations (non-destructive)
    ${pc.bold('db lint')}        Lint migrations
    ${pc.bold('db reset')}       Reset linked remote DB ${pc.yellow('(destructive)')}
    ${pc.bold('db local-reset')} Reset local Docker stack
    ${pc.bold('check')}          Run Prettier + ESLint fix

  ${pc.dim('Flags:')}
    ${pc.bold('--relink')}       Force supabase link (db commands)
    ${pc.bold('--help')}         Show this help message

  ${pc.dim('Examples:')}
    pnpm uru              Interactive menu
    pnpm uru setup        Run setup wizard
    pnpm uru dev          Start dev server
    pnpm uru db push      Push migrations
`)
}

async function main() {
  if (flags.has('--help') || command === 'help') {
    printHelp()
    return
  }

  const resolved =
    command ??
    (await (async () => {
      intro(pc.bold('URU'))

      const choice = await select({
        message: 'What do you want to do?',
        options: [
          { value: 'dev', label: 'Start development', hint: 'web or desktop' },
          { value: 'setup', label: 'First-time setup', hint: 'wizard' },
          { value: 'db', label: 'Database operations', hint: 'push, lint, reset' },
          { value: 'check', label: 'Code quality', hint: 'prettier + eslint' },
        ],
      })

      if (isCancel(choice)) {
        outro(pc.dim('Cancelled'))
        process.exit(0)
      }

      return choice as string
    })())

  const forceRelink = flags.has('--relink')

  switch (resolved) {
    case 'setup': {
      const { runSetup } = await import('./commands/setup.js')
      return runSetup()
    }
    case 'dev': {
      const { runDev } = await import('./commands/dev.js')
      return runDev()
    }
    case 'db': {
      const { runDb } = await import('./commands/db.js')
      return runDb(subcommand, forceRelink)
    }
    case 'check': {
      const { runCheck } = await import('./commands/check.js')
      return runCheck()
    }
    default:
      console.log(pc.red(`  Unknown command: ${resolved}`))
      printHelp()
      process.exit(1)
  }
}

main().catch((err) => {
  console.error(pc.red(err.message))
  process.exit(1)
})
