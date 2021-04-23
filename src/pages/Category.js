import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import BusinessIcon from '@material-ui/icons/Business';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { AppContext } from 'context/app/provider';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Category = () => {
  const classes = useStyles();
  const [grpNames, setGrpNames] = useState([]);
  const [chsnGrpId, setChsnGrpId] = useState('');

  const {
    state: { data },
    updateAppState,
  } = useContext(AppContext);

  const history = useHistory();

  useEffect(() => {
    if (data && data.length > 0) {
      const groupName = data.map((g) => ({
        id: g.statsid,
        name: g.groupingname,
      }));

      setGrpNames(groupName);
      setChsnGrpId(groupName[0].id);
    }
  }, [data]);

  const handleSelectChange = useCallback((e) => {
    setChsnGrpId(e.target.value);
  }, []);

  const handleNextClicked = useCallback(
    (e) => {
      updateAppState({ chosedSection: chsnGrpId });
      history.push(`/data/${chsnGrpId}`);
    },
    [chsnGrpId, history, updateAppState]
  );

  return (
    <div>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <BusinessIcon />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Select Section
          </Typography>
          <FormControl className={classes.form} noValidate>
            <Select
              labelId='group-selector-label'
              id='group-sector'
              value={chsnGrpId}
              required
              margin='normal'
              fullWidth
              autoFocus
              variant='outlined'
              onChange={handleSelectChange}
            >
              {grpNames.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>

            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              onClick={handleNextClicked}
              className={classes.submit}
            >
              CHOOSE
            </Button>
          </FormControl>
        </div>
      </Container>
    </div>
  );
};

export default Category;
