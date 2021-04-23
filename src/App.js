import { useEffect, useState } from 'react';
import { Api } from 'service/fetchApi';

import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
const data = [
  ['attribute', 'attribute2'],
  ['value1', 'value2'],
];
function App() {
  const [appData, setAppData] = useState(null);
  const [pivotData, setPivotData] = useState({});

  const fetchData = async (url) => {
    const data = await Api.get(url).then((res) => res.data);
    setAppData(data);
  };
  useEffect(() => {
    fetchData(`/assets/data.json`);
  }, []);
  console.log(appData);

  return (
    <div className='App'>
      {appData && (
        <div>
          <div></div>
          <div>
            <PivotTableUI
              data={appData}
              onChange={(s) => setPivotData(s)}
              {...pivotData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
