import React from 'react';
import ReactDOM from 'react-dom';

import WebSynth from './WebSynth';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<WebSynth />, document.getElementById('root'));
registerServiceWorker();
