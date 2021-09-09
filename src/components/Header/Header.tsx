import React, { Component } from "react";
import "./Header.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { NavBarNotLogin } from "../Navbar/NavbarNotLogged";
import Grid from "@material-ui/core/Grid";
import { NavLink } from "react-router-dom";
import { UserModel } from "../../models/user-model";
import { NavBarLogin } from "../Navbar/NavbarLogin";
//redux
import { store } from "../../redux/store";
import { Action } from "../../redux/action";
import { ActionType } from "../../redux/action-type";
import { Unsubscribe } from "redux";

interface HeaderState {
  user: UserModel;
  isLogin: boolean;
}

export class Header extends Component<any, HeaderState> {
  private unsubscribeStore: Unsubscribe;

  public constructor(props: any) {
    super(props);
    this.state = {
      user: store.getState().user,
      isLogin: store.getState().isLogin,
    };
    this.unsubscribeStore = store.subscribe(() => {
      this.setState({ user: store.getState().user });
      this.setState({ isLogin: store.getState().isLogin });
    });
  }

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };

  componentDidMount = () => {
    if (store.getState().user.userID === undefined) {
      this.checkLogIn();
    }
  };
  private checkLogIn = () => {
    const options = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        mode: "cors", // no-cors, *cors, same-origin
        credentials: "include", // include, *same-origin, omit
      },
    };
    // checking JWT token
    fetch(
      "https://travelisom-server-heroku.herokuapp.com/api/login/login-check",
      options
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.name === "JsonWebTokenError") {
          const actionIsLogin: Action = {
            type: ActionType.updateIsLogin,
            payload: false,
          };
          store.dispatch(actionIsLogin);
          return;
        }
        const actionUser: Action = {
          type: ActionType.getUser,
          payload: res.user,
        };
        store.dispatch(actionUser);

        const actionIsLogin: Action = {
          type: ActionType.updateIsLogin,
          payload: true,
        };
        store.dispatch(actionIsLogin);
      })
      .catch((err) => alert(err));
  };

  public render(): JSX.Element {
    return (
      <div className="header">
        <div className="navbar">
          <AppBar position="fixed">
            <Toolbar>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <div className="navlinks">
                    <NavLink to="/" exact>
                      Home
                    </NavLink>
                    <NavLink to="/about" exact>
                      About
                    </NavLink>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  {this.state.isLogin === false ? (
                    <NavBarNotLogin />
                  ) : (
                    <NavBarLogin />
                  )}
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
          <Toolbar />
        </div>

        <Typography className="logoText" variant="h1">
          Welcome to TRAVELISIMO
        </Typography>
      </div>
    );
  }
}
