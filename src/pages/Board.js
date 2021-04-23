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
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import PivotTableUI from 'react-pivottable/PivotTableUI';
import { aggregatorTemplates } from 'react-pivottable/Utilities';

import { AppContext } from 'context/app/provider';
import { getNameByUnique } from 'service/utils';

import 'react-pivottable/pivottable.css';

const ALL_DATA_MARK = '####';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  title: {
    flexGrow: 1,
  },

  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  filters: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
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

  const [stats2D, setStats2D] = useState([]);
  const [appInfo, setAppInfo] = useState({});
  const [pivotData, setPivotData] = useState({
    cols: ['name2'],
    rows: ['name1'],
    aggregatorName: 'Percentage',
    hiddenAttributes: ['percentage'],
    hiddenFromDragDrop: ['percentage'],
    aggregators: {
      Percentage: function () {
        return aggregatorTemplates.average()(['percentage']);
      },
    },
  });
  console.log(aggregatorTemplates);

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
  console.log(pivotData);

  // app data & category 1
  useEffect(() => {
    if (data) {
      const appDt = data.find((d) => d.statsid === chosedSection);
      if (appDt) {
        setAppInfo({
          calcfrom: appDt.calcfrom,
          calcto: appDt.calcto,
          description: appDt.description,
          groupingname: appDt.groupingname,
          latestupdate: appDt.latestupdate,
        });
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
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position='absolute' className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography
            component='h1'
            variant='h6'
            color='inherit'
            noWrap
            className={classes.title}
          >
            {appInfo && `Selected Group - ${appInfo.groupingname} `}
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth='lg' className={classes.container}>
          <Grid container spacing={3}>
            <Grid item md={12}>
              <Paper className={classes.filters}>
                {/* category 1 */}
                <FormControl className={classes.formControl}>
                  <InputLabel id='demo-simple-select-label'>
                    Category 1
                  </InputLabel>
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
                          checked={
                            filterData.category1.choosed.indexOf(name) > -1
                          }
                        />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* category 2 */}
                <FormControl className={classes.formControl}>
                  <InputLabel id='demo-simple-select-label'>
                    Category 2
                  </InputLabel>
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
                          checked={
                            filterData.category2.choosed.indexOf(name) > -1
                          }
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
                  <InputLabel id='demo-simple-select-label'>
                    Break out
                  </InputLabel>
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
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper className={classes.paper}>
                {stats2D && (
                  <PivotTableUI
                    data={getFilteredData()}
                    onChange={(s) => setPivotData(s)}
                    {...pivotData}
                  />
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
};

export default Board;
