import React, { useState, useEffect } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { ParsedLocString } from '@jbrowse/core/util';
import {
  createViewState,
  JBrowseLinearGenomeView,

} from '@jbrowse/react-linear-genome-view'
import makeWorkerInstance from '@jbrowse/react-linear-genome-view/esm/makeWorkerInstance'
// import assembly from './assembly'
import tracks from './tracks'
import defaultSession from './defaultSession'

interface ViewProps {
  config: string;
  location: ParsedLocString;
}


function fetchAssembly(config: string) {
  const data1 = require(`/src/assets/jbrowse-config/${config}.ts`);
  return data1.default;
}


type ViewModel = ReturnType<typeof createViewState>
export const View: React.FC<ViewProps> = ({config, location}) => {
  const [viewState, setViewState] = useState<ViewModel>()
  const [patches, setPatches] = useState('')
  const [stateSnapshot, setStateSnapshot] = useState('')
  const assembly = fetchAssembly(config)

  useEffect(() => {
    const state = createViewState({
      assembly,
      tracks,
      defaultSession,
      configuration: {
        "theme" :{
          "palette": {
            "primary": {
              "main": "#005cbb"
            },
            "secondary": {
              "main": "#005cbb"
            },
            "tertiary": {
              "main": "#d7e3ff"
            },
            "quaternary": {
              "main": "#005cbb"
            }
          }
        },
        rpc: {
          defaultDriver: 'WebWorkerRpcDriver',
        },
      },
      makeWorkerInstance,

      hydrateFn: hydrateRoot,
      createRootFn: createRoot,
    })
    setViewState(state)

  }, [])

  if (!viewState) {
    return null
  }
  if (location) {
    viewState.session.view.navToLocations([location]);
    viewState.session.view.addToHighlights( location as Required<ParsedLocString>);
  }

  return (
    <React.StrictMode>
      <h1>
        JBrowse
      </h1>
      <JBrowseLinearGenomeView viewState={viewState} />
      <p>region: 'green', exon: 'purple', CDS: 'yellow', match: 'gray'</p>

      <h3>Control the view</h3>
      <div>
        <p>
          This is an example of controlling the view from other elements on the
          page. Clicking on a button will navigate the view to the location of
          that gene.
        </p>
        <button
          onClick={() => {
            viewState.session.view.navToLocString('10:94762681..94855547');
            const high: Required<ParsedLocString> = {
              refName: 'chr10', start: 94762681, end: 94855547,
              assemblyName: 'hg38',
              reversed: false
            };
            viewState.session.view.addToHighlights(high);
          }}
        >
          CYP2C19
        </button>
        <button
          onClick={() => {
            viewState.session.view.navToLocString('13:32315086..32400266')
          }}
        >
          BRCA2
        </button>
      </div>
      <h3>See the state</h3>
      <div>
        <p>
          The button below will show you the current session, which includes
          things like what region the view is showing and which tracks are open.
          This session JSON object can be used in the{' '}
          <code>defaultSession</code> of <code>createViewState</code>.
        </p>
        <button
          onClick={() => {
            setStateSnapshot(JSON.stringify(viewState.session, undefined, 2))
          }}
        >
          Show session
        </button>
      </div>
      <textarea value={stateSnapshot} readOnly rows={20} cols={80} />
      <h3>React to the view</h3>
      <p>
        Using <code>onChange</code> in <code>createViewState</code>, you can
        observe what is happening in the view and react to it. The changes in
        the state of the view are emitted as{' '}
        <a href="http://jsonpatch.com/" target="_blank" rel="noreferrer">
          JSON patches
        </a>
        . The patches for the component on this page are shown below.
      </p>
      <textarea value={patches} readOnly rows={5} cols={80} wrap="off" />
    </React.StrictMode>
  )
};

// export default View;
