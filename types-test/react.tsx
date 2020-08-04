import * as React from 'react';
import { observer } from '../src/react';

const App: React.FC = props => {
  return null;
};

const AppWithProps: React.FC<{
  a: string;
}> = props => {
  return null;
};

const OApp = observer(App);
const OAppWithProps = observer(AppWithProps);

<OApp />;
<OAppWithProps a="123" />;
