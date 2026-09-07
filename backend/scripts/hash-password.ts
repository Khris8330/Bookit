/**
 * Helper script to generate a bcrypt hash for ORGANIZER_PASSWORD_HASH.
 * Usage: npm run hash-password
 * Then paste the output into your .env file.
 */
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the organizer password to hash: ', async (password) => {
  if (!password || password.length < 8) {
    console.error('Password should be at least 8 characters.');
    rl.close();
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log('\nAdd this to your .env file:\n');
  console.log(`ORGANIZER_PASSWORD_HASH=${hash}`);
  console.log('');
  rl.close();
});
