const fs = require('fs');

let file = fs.readFileSync('src/components/profile/ProfileEditForm.tsx', 'utf8');

// 1. Remove the old success message at the top
const oldSuccessTop = `      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Profile updated successfully!
        </div>
      )}`;

file = file.replace(oldSuccessTop, '');

// 2. Modify the save button area
const oldSubmitArea = `      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>{success && !isDirty ? "Saved" : "Save Profile"}</Button>
      </div>`;

const newSubmitArea = `      <div className="flex justify-end items-center gap-4">
        {success && !isDirty && (
          <span className="text-brand-gold text-sm font-medium">Profile updated successfully!</span>
        )}
        <Button type="submit" loading={isSubmitting}>{success && !isDirty ? "Saved" : "Save Profile"}</Button>
      </div>`;

file = file.replace(oldSubmitArea, newSubmitArea);

fs.writeFileSync('src/components/profile/ProfileEditForm.tsx', file);
console.log('ProfileEditForm success message moved');

