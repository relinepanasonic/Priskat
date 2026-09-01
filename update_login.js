const fs = require('fs');

let file = fs.readFileSync('src/app/(auth)/login/page.tsx', 'utf8');

const targetStr = `        <div>
          <label className="mb-1 block text-sm font-medium text-brand-light">
            Password
          </label>`;

const replacementStr = `        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-brand-light">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-brand-gold hover:underline">
              Forgot password?
            </Link>
          </div>`;

if (file.includes(targetStr)) {
  file = file.replace(targetStr, replacementStr);
  fs.writeFileSync('src/app/(auth)/login/page.tsx', file);
  console.log('Updated login/page.tsx with Forgot password link');
} else {
  console.log('Could not find target string in login/page.tsx');
}

