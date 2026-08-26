const fs = require('fs');
let content = fs.readFileSync('src/app/admin/database/page.tsx', 'utf8');

const replacement = `  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          if (results.errors.length > 0 && results.errors[0].code !== "UndetectableDelimiter") {
            console.warn("PapaParse errors:", results.errors);
            setErrorMsg("Warning: " + results.errors[0].message);
          }

          if (!results.data || results.data.length === 0) {
            setErrorMsg("File is empty or could not be parsed.");
            return;
          }
          
          const originalHeaders = (results.meta.fields || []).filter((h: string) => h.trim().toUpperCase() !== "NO");
          const newHeaders = ["Group", "Camp", ...originalHeaders];
          
          const newRows = results.data.map((row: any) => {
            const newRow = [selectedGroup, selectedCamp];
            originalHeaders.forEach((col: string) => {
              newRow.push(row[col]);
            });
            return newRow;
          });

          setHeaders(newHeaders);
          setRows(newRows);
        },
        error: (error) => {
          console.error("PapaParse error:", error);
          setErrorMsg("Failed to read the file: " + error.message);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg("An unexpected error occurred: " + err.message);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };`;

content = content.replace(/  const handleFileUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?  \};\n/m, replacement + '\n');
fs.writeFileSync('src/app/admin/database/page.tsx', content);

