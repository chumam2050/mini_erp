#!/usr/bin/env node
import readline from 'readline'
import sequelize from '../config/database.js'
import { User, Product, Sale, SaleItem, AuthToken, Settings } from '../models/index.js'

const ALL_MODELS = {
  User,
  Product,
  Sale,
  SaleItem,
  AuthToken,
  Settings
}

const print = (...args) => console.log(...args)

const parseArgs = () => {
  const args = process.argv.slice(2)
  const flags = {}
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, val] = arg.slice(2).split('=')
      flags[key] = val === undefined ? true : val
    }
  })
  return flags
}

const confirmPrompt = (message) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(message, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

const run = async () => {
  const flags = parseArgs()
  const force = flags.yes || flags.y || flags.force
  const tablesArg = flags.tables || flags.t

  const selected = tablesArg
    ? tablesArg.split(',').map(s => s.trim()).filter(Boolean)
    : Object.keys(ALL_MODELS)

  const invalid = selected.filter(name => !ALL_MODELS[name])
  if (invalid.length) {
    print(`Invalid model names: ${invalid.join(', ')}`)
    print('Valid model names:', Object.keys(ALL_MODELS).join(', '))
    process.exit(1)
  }

  print('This will TRUNCATE the following tables (irreversible):')
  selected.forEach(name => print('- ' + name))

  if (!force) {
    if (!process.stdin.isTTY) {
      print('\nNon-interactive shell detected. Use --yes to confirm.')
      process.exit(1)
    }

    const answer = await confirmPrompt('Are you sure you want to continue? Type YES to confirm: ')
    if (answer !== 'YES') {
      print('Aborted.')
      process.exit(0)
    }
  }

  try {
    print('\nTruncating...')
    await sequelize.transaction(async (t) => {
      // Truncate in safe order: children first
      const order = ['AuthToken', 'SaleItem', 'Sale', 'Product', 'Settings', 'User']
      for (const name of order) {
        if (!selected.includes(name)) continue
        const model = ALL_MODELS[name]
        print(` - Truncating ${name}...`)
        // Use destroy with truncate options where supported
        await model.destroy({ where: {}, truncate: true, restartIdentity: true, cascade: true, transaction: t })
      }
    })

    print('\n✅ Truncate completed successfully')
  } catch (err) {
    console.error('\n❌ Error during truncate:', err)
    process.exitCode = 1
  } finally {
    try { await sequelize.close() } catch (e) {}
  }
}

run()
