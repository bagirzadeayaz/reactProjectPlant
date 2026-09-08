import { AppRouter } from './app/router';

/**
 * The root component.
 *
 * Everything it used to hold — the route table, the page chrome, the landing
 * page sections — moved into `src/app` in prompt 7. It stays as the default
 * export `src/main.tsx` expects.
 */
function App() {
  return <AppRouter />;
}

export default App;
