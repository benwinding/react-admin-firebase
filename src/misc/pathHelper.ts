import * as path from 'path-browserify';

export function getAbsolutePath(rootRef: string, relativePath: string): string {
  if (!rootRef) {
    return relativePath;
  }
  if (!relativePath) {
    throw new Error('Resource name must be a string of length greater than 0 characters');
  }
  const withSlashes = path.join('/', rootRef, '/', relativePath, '/');
  const slashCount = withSlashes.split("/").length - 1
  if (slashCount % 2) {
    throw new Error(`The rootRef path must point to a "document" not a "collection"
e.g. /collection/document/ or /collection/document/collection/document/`);
  }
  const withOutSlashes = withSlashes.slice(1, -1);
  return withOutSlashes;
}
