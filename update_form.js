const fs = require('fs');

let form = fs.readFileSync('src/components/profile/ProfileEditForm.tsx', 'utf8');

// 1. Add instagram to schema
form = form.replace(
  'phone: z.string().regex(/^08[0-9]+$/, "Phone must start with 08").optional().or(z.literal("")),',
  'phone: z.string().regex(/^08[0-9]+$/, "Phone must start with 08").optional().or(z.literal("")),' + '\n  instagram: z.string().optional(),'
);

// 2. Add instagram to defaultValues
form = form.replace(
  'phone: profile.phone ?? "",',
  'phone: profile.phone ?? "",' + '\n        instagram: profile.instagram ?? "",'
);

// 3. Add instagram to update data
form = form.replace(
  'phone: data.phone ?? "",',
  'phone: data.phone ?? "",' + '\n          instagram: data.instagram ?? "",'
);

// 4. Add the input field in JSX
const inputJSX = `
        {/* Phone */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-light">Phone (08...)</label>
          <input
            {...register("phone")}
            placeholder="0812345678"
            className="w-full rounded-xl border border-[#333] bg-[#1a1d24] px-4 py-3 text-white placeholder-gray-500 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        {/* Instagram */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-light">Instagram Username</label>
          <div className="flex items-center rounded-xl border border-[#333] bg-[#1a1d24] overflow-hidden focus-within:border-brand-gold focus-within:ring-1 focus-within:ring-brand-gold transition-all">
            <span className="pl-4 text-gray-500">@</span>
            <input
              {...register("instagram")}
              placeholder="username"
              className="w-full bg-transparent px-2 py-3 text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>
`;

form = form.replace(
  /\{\/\* Phone \*\/\}\s*<div.*?(?=\{\/\* Bio)/s,
  inputJSX + '\n        '
);

fs.writeFileSync('src/components/profile/ProfileEditForm.tsx', form);
console.log('ProfileEditForm updated');

