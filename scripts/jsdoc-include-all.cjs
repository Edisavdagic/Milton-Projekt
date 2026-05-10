const path = require("node:path");

const DOCUMENTED_EXTENSIONS = new Set([".js", ".vue"]);
const RESERVED_WORDS = new Set([
  "catch",
  "do",
  "else",
  "finally",
  "for",
  "if",
  "switch",
  "try",
  "while",
  "with",
]);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function createModuleHeader(filename) {
  const relativePath = toPosixPath(path.relative(process.cwd(), filename));
  const extension = path.extname(relativePath);
  const moduleName = relativePath
    .slice(0, extension ? -extension.length : undefined)
    .replace(/\./g, "-");

  return [
    "/**",
    ` * @module ${moduleName}`,
    " * @description Included in the generated project documentation.",
    " */",
    "",
  ].join("\n");
}

function withoutVueTemplateAndStyles(source) {
  const scriptBlockPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  const blocks = [...source.matchAll(scriptBlockPattern)];

  if (blocks.length === 0) {
    return "export default {};\n";
  }

  return `${blocks.map((block) => block[1].trim()).join("\n\n")}\n`;
}

function normalizeGenericType(typeExpression) {
  const normalized = typeExpression.trim().replace(/\s+/g, " ");

  if (!normalized.includes("|")) {
    return normalized;
  }

  return `(${normalized
    .split("|")
    .map((typeName) => typeName.trim())
    .join("|")})`;
}

function normalizeJsdocTypes(source) {
  return source.replace(
    /import\((['"])[^'"]+\1\)\.([A-Za-z_$][\w$]*)(?:<([^{}]+)>)?/g,
    (_match, _quote, importedName, genericType) => {
      if (!genericType) {
        return importedName;
      }

      return `${importedName}.<${normalizeGenericType(genericType)}>`;
    },
  );
}

function hasJsdocBefore(lines, lineIndex) {
  for (let index = lineIndex - 1; index >= 0; index -= 1) {
    const previousLine = lines[index].trim();

    if (!previousLine) {
      continue;
    }

    return previousLine.endsWith("*/");
  }

  return false;
}

function getDocumentableName(line) {
  const functionMatch = line.match(
    /^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/,
  );

  if (functionMatch) {
    return functionMatch[1];
  }

  const arrowAssignmentMatch = line.match(
    /^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/,
  );

  if (arrowAssignmentMatch) {
    return arrowAssignmentMatch[1];
  }

  const objectMethodMatch = line.match(
    /^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/,
  );

  if (objectMethodMatch && !RESERVED_WORDS.has(objectMethodMatch[1])) {
    return objectMethodMatch[1];
  }

  return null;
}

function createGeneratedJsdoc(line, name, moduleName) {
  const indent = line.match(/^\s*/)[0];

  return [
    `${indent}/**`,
    `${indent} * ${name}`,
    `${indent} * @function ${name}`,
    `${indent} * @memberof module:${moduleName}`,
    `${indent} * @inner`,
    `${indent} */`,
  ];
}

function addFunctionTagsToJsdoc(lines, name, moduleName) {
  let endIndex = lines.length - 1;

  while (endIndex >= 0 && !lines[endIndex].trim()) {
    endIndex -= 1;
  }

  if (endIndex < 0 || !lines[endIndex].trim().endsWith("*/")) {
    return false;
  }

  let startIndex = endIndex;

  while (startIndex >= 0 && !lines[startIndex].trim().startsWith("/**")) {
    startIndex -= 1;
  }

  if (startIndex < 0) {
    return false;
  }

  const block = lines.slice(startIndex, endIndex + 1).join("\n");
  const indent = lines[endIndex].match(/^\s*/)[0];
  const tags = [];

  if (!block.includes("@function")) {
    tags.push(`${indent} * @function ${name}`);
  }

  if (!block.includes("@memberof")) {
    tags.push(`${indent} * @memberof module:${moduleName}`);
  }

  if (!block.includes("@inner")) {
    tags.push(`${indent} * @inner`);
  }

  if (tags.length === 0) {
    return true;
  }

  if (startIndex === endIndex) {
    const singleLineComment = lines[startIndex].trim();
    const description = singleLineComment
      .replace(/^\/\*\*\s*/, "")
      .replace(/\s*\*\/$/, "")
      .trim();
    const replacement = [
      `${indent}/**`,
      ...(description ? [`${indent} * ${description}`] : []),
      ...tags,
      `${indent} */`,
    ];

    lines.splice(startIndex, 1, ...replacement);
    return true;
  }

  lines.splice(endIndex, 0, ...tags);
  return true;
}

function documentNamedFunctions(source, moduleName) {
  const lines = source.split("\n");
  const documentedLines = [];

  lines.forEach((line, index) => {
    const name = getDocumentableName(line);

    if (name) {
      if (hasJsdocBefore(lines, index)) {
        addFunctionTagsToJsdoc(documentedLines, name, moduleName);
      } else {
        documentedLines.push(...createGeneratedJsdoc(line, name, moduleName));
      }
    }

    documentedLines.push(line);
  });

  return documentedLines.join("\n");
}

exports.handlers = {
  beforeParse(event) {
    const extension = path.extname(event.filename);

    if (!DOCUMENTED_EXTENSIONS.has(extension)) {
      return;
    }

    const source =
      extension === ".vue"
        ? withoutVueTemplateAndStyles(event.source)
        : event.source;
    const relativePath = toPosixPath(path.relative(process.cwd(), event.filename));
    const sourceExtension = path.extname(relativePath);
    const moduleName = relativePath
      .slice(0, sourceExtension ? -sourceExtension.length : undefined)
      .replace(/\./g, "-");

    event.source = documentNamedFunctions(
      normalizeJsdocTypes(`${createModuleHeader(event.filename)}${source}`),
      moduleName,
    );
  },
};
