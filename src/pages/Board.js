import React, { useState, useContext, useCallback, useEffect } from 'react';

import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';

import PivotTableUI from 'react-pivottable/PivotTableUI';

import { AppContext } from 'context/app/provider';
import { getNameByUnique } from 'service/utils';

import 'react-pivottable/pivottable.css';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const Board = () => {
  const classes = useStyles();

  const [pivotData, setPivotData] = useState({});
  const [stats2D, setStats2D] = useState([]);
  const ALL_DATA_MARK = '####';

  const [filterData, setFilterData] = useState({
    category1: {
      choosed: [],
    },
    category2: {
      choosed: [],
    },
    types: {
      choosed: ALL_DATA_MARK,
    },
    breakout: {
      choosed: ALL_DATA_MARK,
    },
  });
  const { sid: chosedSection } = useParams();

  const { state } = useContext(AppContext);
  const { data } = state;
  //   {
  //     "category1": "direction",
  //     "category2": "hourofday",
  //     "name1": "1",
  //     "name2": "9",
  //     "total": 11,
  //     "correct": 9,
  //     "percentage": 81.8181818181818,
  //     "stddev_percentage": 40.4519917477945,
  //     "type": "chart pattern",
  //     "breakout": true
  // }

  // app data & category 1
  useEffect(() => {
    if (data) {
      const appDt = data.find((d) => d.statsid === chosedSection);
      if (appDt) {
        const { stats2d } = appDt;
        setStats2D(stats2d);

        const categs1 = getNameByUnique(stats2d, 'category1');
        setFilterData((c) => ({
          ...c,
          category1: { names: categs1, choosed: categs1.map((c) => c.name) },
        }));
      }
    }
  }, [data, chosedSection]);

  // category 2
  useEffect(() => {
    const categs1Choosed = filterData.category1.choosed;
    const filteredCategs1 = stats2D.filter(
      (stat) => categs1Choosed.indexOf(stat.category1) > -1
    );
    const categs2 = getNameByUnique(filteredCategs1, 'category2');
    setFilterData((c) => ({
      ...c,
      category2: { names: categs2, choosed: categs2.map((c) => c.name) },
    }));
  }, [stats2D, filterData.category1]);

  // type and break out
  useEffect(() => {
    const categs1Choosed = filterData.category1.choosed;
    const categs2Choosed = filterData.category2.choosed;
    const filteredCategs = stats2D.filter(
      (stat) =>
        categs1Choosed.indexOf(stat.category1) > -1 &&
        categs2Choosed.indexOf(stat.category2) > -1
    );
    const types = getNameByUnique(filteredCategs, 'type');
    const breakout = getNameByUnique(filteredCategs, 'breakout');
    setFilterData((c) => ({
      ...c,
      types: { names: types, choosed: ALL_DATA_MARK },
      breakout: { names: breakout, choosed: ALL_DATA_MARK },
    }));
  }, [stats2D, filterData.category1, filterData.category2]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilterData((c) => ({
      ...c,
      [name]: {
        ...c[name],
        choosed: value,
      },
    }));
  }, []);

  const getCategroyName = useCallback((choosed, names) => {
    if (choosed?.length && names?.length) {
      if (choosed.length === names.length) return '(All)';
      else if (choosed.length > 1) return '(Multiple Items)';
      else if (choosed.length === 1) return choosed[0];
    }
    return '';
  }, []);

  const getFilteredData = useCallback(() => {
    const categs1Choosed = filterData.category1.choosed;
    const categs2Choosed = filterData.category2.choosed;
    const typesChoosed = filterData.types.choosed;
    const breakoutChoosed = filterData.breakout.choosed;

    const filteredCategs = stats2D
      .filter(
        (stat) =>
          categs1Choosed.indexOf(stat.category1) > -1 &&
          categs2Choosed.indexOf(stat.category2) > -1
      )
      .filter(
        (stat) => typesChoosed === ALL_DATA_MARK || typesChoosed === stat.types
      )
      .filter(
        (stat) =>
          breakoutChoosed === ALL_DATA_MARK || breakoutChoosed === stat.breakout
      )
      .map((item) => ({
        // correct: item.correct,
        name1: item.name1,
        name2: item.name2,
        percentage: item.percentage,
        // stddev_percentage: item.stddev_percentage,
        // total: item.total,
      }));
    return filteredCategs;
  }, [stats2D, filterData]);

  return (
    <div className='App'>
      {stats2D && (
        <div>
          <div>
            {/* category 1 */}
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label'>Category 1</InputLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                value={filterData.category1.choosed}
                name='category1'
                onChange={handleChange}
                renderValue={(selected) =>
                  getCategroyName(selected, filterData.category1.names)
                }
                input={<Input />}
                multiple
              >
                {filterData?.category1?.names?.map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    <Checkbox
                      checked={filterData.category1.choosed.indexOf(name) > -1}
                    />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* category 2 */}
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label'>Category 2</InputLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                value={filterData.category2.choosed}
                name='category2'
                onChange={handleChange}
                renderValue={(selected) =>
                  getCategroyName(selected, filterData.category2.names)
                }
                input={<Input />}
                multiple
              >
                {filterData?.category2?.names?.map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    <Checkbox
                      checked={filterData.category2.choosed.indexOf(name) > -1}
                    />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* types */}
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label'>Types</InputLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                value={filterData.types.choosed}
                name='types'
                onChange={handleChange}
              >
                <MenuItem value={ALL_DATA_MARK}>(All)</MenuItem>
                {filterData?.types?.names?.map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* break out */}
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-label'>Break out</InputLabel>
              <Select
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                value={filterData.breakout.choosed}
                name='breakout'
                onChange={handleChange}
              >
                <MenuItem value={ALL_DATA_MARK}>(All)</MenuItem>
                {filterData?.breakout?.names?.map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div>
            <PivotTableUI
              data={getFilteredData()}
              onChange={(s) => setPivotData(s)}
              {...pivotData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;

// import React from 'react';
// import clsx from 'clsx';
// import { makeStyles, useTheme } from '@material-ui/core/styles';
// import Input from '@material-ui/core/Input';
// import InputLabel from '@material-ui/core/InputLabel';
// import MenuItem from '@material-ui/core/MenuItem';
// import FormControl from '@material-ui/core/FormControl';
// import ListItemText from '@material-ui/core/ListItemText';
// import Select from '@material-ui/core/Select';
// import Checkbox from '@material-ui/core/Checkbox';
// import Chip from '@material-ui/core/Chip';

// const useStyles = makeStyles((theme) => ({
//   formControl: {
//     margin: theme.spacing(1),
//     minWidth: 120,
//     maxWidth: 300,
//   },
//   chips: {
//     display: 'flex',
//     flexWrap: 'wrap',
//   },
//   chip: {
//     margin: 2,
//   },
//   noLabel: {
//     marginTop: theme.spacing(3),
//   },
// }));

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };

// const names = [
//   'Oliver Hansen',
//   'Van Henry',
//   'April Tucker',
//   'Ralph Hubbard',
//   'Omar Alexander',
//   'Carlos Abbott',
//   'Miriam Wagner',
//   'Bradley Wilkerson',
//   'Virginia Andrews',
//   'Kelly Snyder',
// ];

// function getStyles(name, personName, theme) {
//   return {
//     fontWeight:
//       personName.indexOf(name) === -1
//         ? theme.typography.fontWeightRegular
//         : theme.typography.fontWeightMedium,
//   };
// }

// export default function MultipleSelect() {
//   const classes = useStyles();
//   const theme = useTheme();
//   const [personName, setPersonName] = React.useState([]);

//   const handleChange = (event) => {
//     setPersonName(event.target.value);
//   };

//   const handleChangeMultiple = (event) => {
//     const { options } = event.target;
//     const value = [];
//     for (let i = 0, l = options.length; i < l; i += 1) {
//       if (options[i].selected) {
//         value.push(options[i].value);
//       }
//     }
//     setPersonName(value);
//   };

//   return (
//     <div>
//       <FormControl className={classes.formControl}>
//         <InputLabel id='demo-mutiple-checkbox-label'>Tag</InputLabel>
//         <Select
//           labelId='demo-mutiple-checkbox-label'
//           id='demo-mutiple-checkbox'
//           multiple
//           value={personName}
//           onChange={handleChange}
//           input={<Input />}
//           renderValue={(selected) => selected.join(', ')}
//           MenuProps={MenuProps}
//         >
//           {names.map((name) => (
//             <MenuItem key={name} value={name}>
//               <Checkbox checked={personName.indexOf(name) > -1} />
//               <ListItemText primary={name} />
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//     </div>
//   );
// }
