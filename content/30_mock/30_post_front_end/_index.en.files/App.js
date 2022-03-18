import React from 'react';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import {
  HashRouter,
  Routes,
  Route,
} from 'react-router-dom';

import AllPosts from './containers/AllPosts';
import PostsBySpecifiedUser from './containers/PostsBySpecifiedUser';

Amplify.configure(awsconfig);

const drawerWidth = 240;

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#1EA1F2',
      contrastText: "#fff",
    },
    background: {
      default: '#15202B',
      paper: '#15202B',
    },
    divider: '#37444C',
  },
  overrides: {
    MuiButton: {
      color: 'white',
    },
  },
  typography: {
    fontFamily: [
      'Arial', 
    ].join(','),
  },
  status: {
    danger: 'orange',
  },
});

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    width: 800,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  appBar: {
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

const App = () => {
  const classes = useStyles();
  return(
    <Authenticator>
      {() => (
        <div className={classes.root} >
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <HashRouter>
              <Routes>
                <Route path='/'>
                  <Route index element={<AllPosts/>}/>
                  <Route path=':userId' element={<PostsBySpecifiedUser/>}/>
                  <Route path='global-timeline' element={<AllPosts/>}/>
                </Route>
              </Routes>
            </HashRouter>
          </ThemeProvider>
        </div>
      )}
    </Authenticator>
  );
}

export default App;