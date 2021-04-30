import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import { aggregatorTemplates } from 'react-pivottable/Utilities';

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
import Button from '@material-ui/core/Button';

import { AppContext } from 'context/app/provider';
import { getNameByUnique, getNameByIdFromNames } from 'service/utils';

import 'react-pivottable/pivottable.css';

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
  sectionControl: {
    color: 'white',
  },
  button: {
    display: 'inline-block',
  },
  buttonlabel: {
    color: 'white',
    fontSize: '20px',
  },
}));

const Board = () => {
  const classes = useStyles();

  const [stats2D, setStats2D] = useState([]);
  const [appInfo, setAppInfo] = useState({});
  const [groupInfo, setGroupInfo] = useState([]);
  const [pivotData, setPivotData] = useState({
    cols: ['filter columns'],
    rows: ['filter rows'],
    aggregatorName: 'Percentage',
    hiddenAttributes: ['percentage'],
    hiddenFromDragDrop: ['percentage'],
    aggregators: {
      Percentage: function () {
        return aggregatorTemplates.average()(['percentage']);
      },
    },
    onRefresh: function () {
      console.log('onRefresh');
    },
  });

  const [open, setOpen] = React.useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const history = useHistory();

  const [filterData, setFilterData] = useState({
    category1: {
      choosed: '',
    },
    category2: {
      choosed: '',
    },
    types: {
      choosed: [],
    },
    breakout: {
      choosed: [],
    },
  });
  const { sid: chosedSection } = useParams();

  const { state } = useContext(AppContext);
  const { data } = state;

  useEffect(() => {
    if (chosedSection === 'all' && data) {
      console.log(data);
      const item = data.find((item) => item.groupingname === '[All]');
      console.log(item);
      if (item) {
        history.push(`/data/${item.statsid}`);
      }
    }
  }, [data, chosedSection, history]);

  // app data & category 1
  useEffect(() => {
    if (data) {
      const appDt = data.find((d) => d.statsid === chosedSection);
      setGroupInfo(
        data.map((item) => ({ id: item.statsid, name: item.groupingname }))
      );
      if (appDt) {
        setAppInfo({
          calcfrom: appDt.calcfrom,
          calcto: appDt.calcto,
          description: appDt.description,
          groupingname: appDt.groupingname,
          latestupdate: appDt.latestupdate,
        });
        const { stats2d } = appDt;
        setStats2D(
          stats2d.map((item) => ({ ...item, breakout: '' + item.breakout }))
        );

        const categs1 = getNameByUnique(stats2d, 'category1');
        setFilterData((c) => ({
          ...c,
          category1: { names: categs1, choosed: 'overall' },
        }));
      }
    }
  }, [data, chosedSection]);

  // category 2
  useEffect(() => {
    if (filterData.category1?.names) {
      const { names, choosed } = filterData.category1;

      const cat1Name = names.find((c) => c.id === choosed)?.name || '';

      const filteredCategs1 = stats2D.filter(
        (stat) => stat.category1 === cat1Name
      );
      const categs2 = getNameByUnique(filteredCategs1, 'category2');
      setFilterData((c) => ({
        ...c,
        category2: { names: categs2, choosed: 'overall' },
      }));
    }
  }, [stats2D, filterData.category1]);

  // type and break out
  useEffect(() => {
    const categs1ChoosedName = getNameByIdFromNames(
      filterData.category1.names,
      filterData.category1.choosed
    );
    const categs2ChoosedName = getNameByIdFromNames(
      filterData.category2.names,
      filterData.category2.choosed
    );

    const filteredCategs = stats2D.filter(
      (stat) =>
        stat.category1 === categs1ChoosedName &&
        stat.category2 === categs2ChoosedName
    );
    const types = getNameByUnique(filteredCategs, 'type');
    const breakout = getNameByUnique(filteredCategs, 'breakout');
    setFilterData((c) => ({
      ...c,
      types: { names: types, choosed: types.map((t) => t.name) },
      breakout: { names: breakout, choosed: breakout.map((t) => t.name) },
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
    const categs1ChoosedName = getNameByIdFromNames(
      filterData.category1.names,
      filterData.category1.choosed
    );

    const categs2ChoosedName = getNameByIdFromNames(
      filterData.category2.names,
      filterData.category2.choosed
    );

    const typesChoosed = filterData.types.choosed;
    const breakoutChoosed = filterData.breakout.choosed;

    const filteredCategs = stats2D
      .filter(
        (stat) =>
          typesChoosed.indexOf(stat.type) > -1 &&
          breakoutChoosed.indexOf(stat.breakout) > -1
      )
      .filter((stat) => stat.category1 === categs1ChoosedName)
      .filter((stat) => stat.category2 === categs2ChoosedName)
      .map((item) => ({
        // correct: item.correct,
        'filter rows': item.name1,
        'filter columns': item.name2,
        percentage: item.percentage,
        // stddev_percentage: item.stddev_percentage,
        // total: item.total,
      }));
    return filteredCategs;
  }, [stats2D, filterData]);

  const greenColorScaleGenerator = useCallback((values) => {
    const MAX_COLOR_VAL = 200;
    const min = Math.min.apply(Math, values);
    const max = Math.max.apply(Math, values);
    return (x) => {
      // eslint-disable-next-line no-magic-numbers
      const nonRed =
        MAX_COLOR_VAL - Math.round((MAX_COLOR_VAL * (x - min)) / (max - min));
      return { backgroundColor: `rgb(${nonRed},${MAX_COLOR_VAL},${nonRed})` };
    };
  }, []);

  const handleSectionChange = useCallback(
    (e) => {
      const { value } = e.target;
      history.push(`/data/${value}`);
    },
    [history]
  );
  const removeValuesFromFilter = useCallback((attribute, values) => {
    console.log(attribute, values);
  }, []);

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
            Selected Group -
            <Button
              className={classes.button}
              onClick={handleOpen}
              id='select-menu'
            >
              <span className={classes.buttonlabel}>
                {appInfo.groupingname}
              </span>
            </Button>
            <FormControl className={classes.formControl}>
              <Select
                open={open}
                onClose={handleClose}
                onOpen={handleOpen}
                value={chosedSection}
                onChange={handleSectionChange}
                style={{ display: 'none' }}
                MenuProps={{
                  anchorEl: document.getElementById('select-menu'),
                  style: { marginLeft: 20, marginTop: 10 },
                }}
              >
                {groupInfo?.map(({ id, name }) => (
                  <MenuItem key={id} value={id}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                    Row Heading
                  </InputLabel>

                  <Select
                    labelId='demo-simple-select-label'
                    id='demo-simple-select'
                    value={filterData.category1.choosed}
                    name='category1'
                    onChange={handleChange}
                  >
                    {filterData?.category1?.names?.map(({ id, name }) => (
                      <MenuItem key={id} value={id}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* category 2 */}
                <FormControl className={classes.formControl}>
                  <InputLabel id='category-2-select-label'>
                    Column Heading
                  </InputLabel>
                  <Select
                    id='category-2-select'
                    labelId='category-2-select-label'
                    value={filterData.category2.choosed}
                    name='category2'
                    onChange={handleChange}
                  >
                    {filterData?.category2?.names?.map(({ id, name }) => (
                      <MenuItem key={id} value={id}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* types */}
                <FormControl className={classes.formControl}>
                  <InputLabel id='types-label'>Types</InputLabel>
                  <Select
                    id='types'
                    labelId='types-label'
                    value={filterData.types.choosed}
                    name='types'
                    onChange={handleChange}
                    renderValue={(selected) =>
                      getCategroyName(selected, filterData.types.names)
                    }
                    input={<Input />}
                    multiple
                  >
                    {filterData?.types?.names?.map(({ id, name }) => (
                      <MenuItem key={id} value={id}>
                        <Checkbox
                          checked={filterData.types.choosed.indexOf(name) > -1}
                        />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* break out */}
                <FormControl className={classes.formControl}>
                  <InputLabel id='breakout-labael'>Break out</InputLabel>
                  <Select
                    labelId='breakout-labael'
                    id='demo-simple-select'
                    value={filterData.breakout.choosed}
                    name='breakout'
                    onChange={handleChange}
                    renderValue={(selected) =>
                      getCategroyName(selected, filterData.breakout.names)
                    }
                    input={<Input />}
                    multiple
                  >
                    {filterData?.breakout?.names?.map(({ id, name }) => (
                      <MenuItem key={id} value={id}>
                        <Checkbox
                          checked={
                            filterData.breakout.choosed.indexOf(name) > -1
                          }
                        />
                        <ListItemText primary={name} />
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
                    tableColorScaleGenerator={greenColorScaleGenerator}
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
