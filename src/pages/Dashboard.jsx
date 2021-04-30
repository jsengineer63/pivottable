import React from 'react';
import tips from 'service/tips';
import TableRenderers from 'react-pivottable/TableRenderers';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import { sortAs } from 'react-pivottable/Utilities';
import 'react-pivottable/pivottable.css';

class PivotTableUISmartWrapper extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { pivotState: props };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ pivotState: nextProps });
  }

  render() {
    return (
      <PivotTableUI
        renderers={Object.assign({}, TableRenderers)}
        {...this.state.pivotState}
        onChange={(s) => this.setState({ pivotState: s })}
        unusedOrientationCutoff={Infinity}
      />
    );
  }
}

export default class Dashboard extends React.Component {
  componentWillMount() {
    this.setState({
      mode: 'demo',
      filename: 'Sample Dataset: Tips',
      pivotState: {
        data: tips,
        rows: ['Payer Gender'],
        cols: ['Party Size'],
        aggregatorName: 'Sum over Sum',
        vals: ['Tip', 'Total Bill'],
        rendererName: 'Grouped Column Chart',
        sorters: {
          Meal: sortAs(['Lunch', 'Dinner']),
          'Day of Week': sortAs(['Thursday', 'Friday', 'Saturday', 'Sunday']),
        },
        plotlyOptions: { width: 900, height: 500 },
        plotlyConfig: {},
        tableOptions: {
          clickCallback: function (e, value, filters, pivotData) {
            var names = [];
            pivotData.forEachMatchingRecord(filters, function (record) {
              names.push(record.Meal);
            });
            alert(names.join('\n'));
          },
        },
      },
    });
  }

  render() {
    return (
      <div>
        <div className='row text-center'>
          <p>
            <em>Note: the data never leaves your browser!</em>
          </p>
          <br />
        </div>
        <div className='row'>
          <h2 className='text-center'>{this.state.filename}</h2>
          <br />

          <PivotTableUISmartWrapper {...this.state.pivotState} />
        </div>
      </div>
    );
  }
}
