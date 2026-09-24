import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const slash = (value) => value.split(sep).join('/');
const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : /\.(?:[cm]?js|tsx?)$/.test(path) ? [path] : [];
  });
const files = [...walk(resolve(root, 'backend/src')), ...walk(resolve(root, 'frontend/src'))];
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
const backendDependencies = {
  domain: ['domain'],
  application: ['application', 'domain'],
  infrastructure: ['infrastructure', 'domain'],
  http: ['http', 'domain'],
};
const problems = [];
for (const file of files) {
  if (/\.test\.[^.]+$/.test(file)) continue;
  const from = slash(relative(root, file));
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const check = (specifier) => {
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) {
      if (/^(?:vitest|msw|@testing-library)(?:\/|$)/.test(specifier))
        problems.push(`${from}: production imports test library ${specifier}`);
      if (from.startsWith('frontend/') && /^(?:node:|firebase-admin(?:\/|$))/.test(specifier))
        problems.push(`${from}: browser code imports server dependency ${specifier}`);
      const layer = from.split('/')[2];
      if (
        from.startsWith('backend/') &&
        ['domain', 'application'].includes(layer) &&
        !['zod', 'node:crypto'].includes(specifier)
      )
        problems.push(`${from}: inner layer imports infrastructure dependency ${specifier}`);
      return;
    }
    const destination = specifier.startsWith('@/')
      ? resolve(root, 'frontend/src', specifier.slice(2))
      : resolve(dirname(file), specifier);
    const to = slash(relative(root, destination));
    const candidates = [
      destination,
      ...['.ts', '.tsx', '.js', '.json', '/index.ts', '/index.tsx', '/index.js'].map(
        (suffix) => destination + suffix,
      ),
    ];
    if (!candidates.some((candidate) => existsSync(candidate) && extname(candidate)))
      problems.push(`${from}: unresolved import ${specifier}`);
    if (/(?:^|\/)(?:test|testing|mocks)(?:\/|$)|\.test\./.test(to))
      problems.push(`${from}: production imports test code ${to}`);
    if (from.startsWith('frontend/src/')) {
      if (!to.startsWith('frontend/src/'))
        problems.push(`${from}: frontend imports outside its source tree: ${to}`);
      const [, , fromLayer, fromSlice] = from.split('/');
      const [, , toLayer, toSlice] = to.split('/');
      if (layers.includes(fromLayer) && layers.includes(toLayer)) {
        if (layers.indexOf(toLayer) < layers.indexOf(fromLayer))
          problems.push(`${from}: upward dependency on ${to}`);
        if (
          fromLayer === toLayer &&
          !['app', 'shared'].includes(fromLayer) &&
          fromSlice !== toSlice
        )
          problems.push(`${from}: cross-slice dependency on ${to}`);
      }
    } else {
      const fromLayer = from.split('/')[2];
      const toLayer = to.split('/')[2];
      if (!to.startsWith('backend/src/'))
        problems.push(`${from}: backend imports outside its source tree: ${to}`);
      if (backendDependencies[fromLayer] && !backendDependencies[fromLayer].includes(toLayer))
        problems.push(`${from}: ${fromLayer} cannot import ${to}`);
    }
  };
  const visit = (node) => {
    if (
      from.startsWith('backend/src/') &&
      ['domain', 'application'].includes(from.split('/')[2]) &&
      ts.isPropertyAccessExpression(node) &&
      node.getText(source) === 'process.env'
    )
      problems.push(`${from}: inner layer reads process.env`);
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      check(node.moduleSpecifier.text);
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      check(node.arguments[0].text);
    ts.forEachChild(node, visit);
  };
  visit(source);
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else console.log('Architecture boundaries passed');
