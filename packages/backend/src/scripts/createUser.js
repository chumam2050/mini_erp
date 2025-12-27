#!/usr/bin/env node
import readline from 'readline'
import sequelize from '../config/database.js'
import User from '../models/User.js'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (q) => new Promise((resolve) => rl.question(q, (ans) => resolve(ans.trim())))

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const roles = ['Administrator', 'Manager', 'Staff']

const runInteractive = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connected')

    // Allow using environment variables for non-interactive scripting
    let name = process.env.NAME || ''
    let email = process.env.EMAIL || ''
    let password = process.env.PASSWORD || ''
    let role = process.env.ROLE || ''

    if (!name) name = await question('Full name: ')
    if (!email) email = await question('Email: ')
    if (!password) password = await question('Password (min 6 chars) [visible]: ')
    if (!role) role = (await question('Role (Administrator|Manager|Staff) [Staff]: ')) || 'Staff'

    // Basic validation
    if (!name) throw new Error('Name is required')
    if (!email || !emailRegex.test(email)) throw new Error('A valid email is required')
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters')
    role = roles.includes(role) ? role : 'Staff'

    const existing = await User.findOne({ where: { email } })
    if (existing) {
      console.error(`❌ User with email ${email} already exists (id: ${existing.id})`)
      process.exit(1)
    }

    const user = await User.create({ name, email, password, role })
    console.log('🎉 User created successfully:')
    console.log(user.toJSON())
    process.exit(0)
  } catch (err) {
    console.error('❌ Failed to create user:', err.message || err)
    process.exit(1)
  } finally {
    rl.close()
  }
}

runInteractive()
