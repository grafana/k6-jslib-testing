export function normalizePath(path: string): string {
  // Super-naive normalization. I wish we had a module for these kinds of things.
  return path.replaceAll(/\\/g, "/");
}

export function dirname(path: string): string {
  const normalized = normalizePath(path);
  const lastSlash = normalized.lastIndexOf("/");

  if (lastSlash === -1) {
    return ".";
  }

  if (lastSlash === 0) {
    return "/";
  }

  return normalized.substring(0, lastSlash);
}

export function makeRelativePath(root: string, path: string): string {
  const normalizedRoot = normalizePath(root);
  const normalizedPath = normalizePath(path);

  if (normalizedPath.startsWith(normalizedRoot)) {
    const relativePath = normalizedPath.substring(normalizedRoot.length);

    if (relativePath.startsWith("/")) {
      return relativePath.substring(1);
    }

    return relativePath;
  }

  const rootParts = normalizedRoot.split("/");
  const pathParts = normalizedPath.split("/");

  let i = 0;

  while (rootParts[i] === pathParts[i]) {
    i++;
  }

  const upLevels = rootParts.length - i;
  const downLevels = pathParts.slice(i);

  const relativeParts = [];

  for (let j = 0; j < upLevels; j++) {
    relativeParts.push("..");
  }

  relativeParts.push(...downLevels);

  return relativeParts.join("/");
}
