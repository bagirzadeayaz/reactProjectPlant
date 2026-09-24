import { Outlet } from 'react-router-dom';
import { LanguageQuerySync } from './language-query-sync';

/** Pathless root: the language/URL sync needs router context, so it lives here. */
export const RootRoute = () => (
  <>
    <LanguageQuerySync />
    <Outlet />
  </>
);
