// Script to find and update all ExpectConfig objects in test files to include the softMode property
// This script is meant to be run with Deno

import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

// Find all test files in the current directory
const testFiles = [];
for await (const entry of fs.walk(".")) {
  if (entry.isFile && entry.name.endsWith(".test.ts")) {
    testFiles.push(entry.path);
  }
}

console.log("Found test files:", testFiles);

// Pattern to identify ExpectConfig object declarations missing softMode
const pattern =
  /const\s+config\s*:\s*ExpectConfig\s*=\s*\{[^}]*assertFn\s*:[^}]*soft\s*:\s*false\s*,[^}]*colorize\s*:[^}]*display\s*:[^}]*\}/g;

// Replacement to include softMode
const replacement = (match) => {
  return match.replace("soft: false,", 'soft: false, softMode: "throw",');
};

// Update each file
for (const file of testFiles) {
  try {
    // Skip our newly created files
    if (
      file === "./assert.softMode.test.ts" || file === "./fix_test_config.ts"
    ) {
      continue;
    }

    const content = await Deno.readTextFile(file);

    // First make sure we import SoftMode if using ExpectConfig
    let newContent = content;
    if (content.includes("ExpectConfig") && !content.includes("SoftMode")) {
      if (content.includes("import type { ExpectConfig }")) {
        newContent = content.replace(
          "import type { ExpectConfig }",
          'import type { ExpectConfig } from "./config.ts";\nimport type { SoftMode } from "./assert.ts"',
        );
      } else if (content.includes("import { ")) {
        // Add import after the first import statement
        newContent = content.replace(
          /import \{[^}]*\} from [^;]*;/,
          (match) => `${match}\nimport type { SoftMode } from "./assert.ts";`,
        );
      }
    }

    // Replace ExpectConfig objects
    newContent = newContent.replace(pattern, replacement);

    // Write back if changed
    if (newContent !== content) {
      await Deno.writeTextFile(file, newContent);
      console.log(`Updated ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
}
