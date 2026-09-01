const fs = require('fs');

let form = fs.readFileSync('src/components/profile/ProfileEditForm.tsx', 'utf8');

const targetStr = `      <div>
        <label className="mb-1 block text-sm font-medium text-brand-light">No HP (WhatsApp)</label>
        <input {...register("phone")} placeholder="08xxxxxxxxxx" className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm focus:border-brand-blue focus:outline-none" />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>`;

const replaceStr = `      <div>
        <label className="mb-1 block text-sm font-medium text-brand-light">Instagram Username</label>
        <div className="flex items-center rounded-lg border border-brand-border bg-[#1a1d24] overflow-hidden focus-within:border-brand-blue focus-within:ring-1 focus-within:ring-brand-blue transition-all">
          <span className="pl-4 text-gray-500">@</span>
          <input
            {...register("instagram")}
            placeholder="username"
            className="w-full bg-transparent px-2 py-2.5 text-white placeholder-gray-500 focus:outline-none text-sm"
          />
        </div>
      </div>`;

// Replace the phone div entirely with the instagram div. 
// Wait, replacing it entirely removes phone from the form. That aligns with "remove whatsapp and phone to member". 
// But let's check if the user meant to remove it from the form. The user said "change it to massage on apps and instagram so i also need column instagram in the edit profile". Removing phone is probably fine, but I'll replace it. 
// Wait, I will just add Instagram next to it. No, let's just replace it if they want it removed. Actually I'll replace it, because keeping it could confuse them.
// Let's replace it.

form = form.replace(targetStr, replaceStr);

fs.writeFileSync('src/components/profile/ProfileEditForm.tsx', form);
console.log('JSX updated in ProfileEditForm');

