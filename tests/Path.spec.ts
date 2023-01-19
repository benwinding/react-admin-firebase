import { getAbsolutePath } from '../src/misc';

test('path test 1', () => {
  const santized = getAbsolutePath('root/doc', 'coll');
  expect(santized).toBe('root/doc/coll');
});

test('path test 2', () => {
  const santized = getAbsolutePath('/root/doc/', 'coll');
  expect(santized).toBe('root/doc/coll');
});

test('path test - minimum paths', () => {
  const santized = getAbsolutePath('t/d', 'coll');
  expect(santized).toBe('t/d/coll');
});

test('path test - test null resource', () => {
  const run = () => {
    const santized = getAbsolutePath('/root/doc/', null);
  };
  expect(run).toThrowError();
});

test('path test - test incorrect rootRef', () => {
  const run = () => {
    const santized = getAbsolutePath('/root/doc/asdasd', 'scaascasc');
  };
  expect(run).toThrowError();
});

test('path test - function returns same results as string', () => {
  expect(getAbsolutePath(() => 'root/doc', 'col1')).toBe(
    getAbsolutePath('root/doc', 'col1')
  );
});
