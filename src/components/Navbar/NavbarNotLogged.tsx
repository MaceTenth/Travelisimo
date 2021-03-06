import React, { Component, SyntheticEvent } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { NavLink } from "react-router-dom";
//redux
import { store } from "../../redux/store";
import { Action } from "../../redux/action";
import { ActionType } from "../../redux/action-type";
import { UserModel } from "../../models/user-model";

interface NavBarNotLoginState {
  loginInput: any;
  user: UserModel;
  isLogin: boolean;
}
export class NavBarNotLogin extends Component<any, NavBarNotLoginState> {
  public constructor(props: any) {
    super(props);
    this.state = {
      loginInput: {
        userName: "",
        password: "",
      },
      user: store.getState().user,
      isLogin: store.getState().isLogin,
    };
  }

  private userNameChange = (args: SyntheticEvent) => {
    const userName = (args.target as HTMLSelectElement).value;
    const loginInput = { ...this.state.loginInput };
    loginInput.userName = userName;
    this.setState({ loginInput });
  };
  private passwordChange = (args: SyntheticEvent) => {
    const password = (args.target as HTMLSelectElement).value;
    const loginInput = { ...this.state.loginInput };
    loginInput.password = password;
    this.setState({ loginInput });
  };

  // If the user accidentally clicks on a login without details
  // he will receive Message and highlight the field to connect

  private login = () => {
    let input = document.querySelector(".username");
    const loginInput = { ...this.state.loginInput };
    if (loginInput.userName === "") {
      alert("Please enter your username");
      input.classList.remove("login-field");
      input.classList.add("invalid");
      return;
    }
    if (loginInput.password === "") {
      input.classList.remove("invalid");
      input = document.querySelector(".password");

      alert("Please enter your password");
      input.classList.remove("login-field");
      input.classList.add("invalid");
      return;
    }
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        mode: "cors", // no-cors, *cors, same-origin
        credentials: "include", // include, *same-origin, omit
      },
      body: JSON.stringify(this.state.loginInput),
    };

    fetch("https://travelisom-server-heroku.herokuapp.com/api/login", options)
      .then(async (response) => {
        if (!response.ok) {
          alert(response.statusText);
          throw new Error(await response.text());
        }

        return response;
      })
      .then((response) => response.json())
      .then((user) => {
        const actionUser: Action = {
          type: ActionType.getUser,
          payload: user[0],
        };
        store.dispatch(actionUser);

        const actionIsLogin: Action = {
          type: ActionType.updateIsLogin,
          payload: true,
        };
        store.dispatch(actionIsLogin);
        this.sendJWT();
      })
      .catch((err) => console.log(err));
  };

  private sendJWT = () => {
    const optionsJWT = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        mode: "cors", // no-cors, *cors, same-origin
        credentials: "include", // include, *same-origin, omit
      },
      body: JSON.stringify(store.getState().user),
    };
    // save to JWT
    fetch(
      "https://travelisom-server-heroku.herokuapp.com/api/login/login-save",
      optionsJWT
    )
      .then((response) => response.json())
      // save in localstorage for auto login with unique token
      .then((res) => localStorage.setItem("token", res.token))
      .catch((err) => alert(err));
  };

  public render(): JSX.Element {
    return (
      <div className="navbarNotLogin">
        <Grid container spacing={3}>
          <Grid item xs={6} md={4}>
            <TextField
              onChange={this.userNameChange}
              label="User Name"
              variant="filled"
              size="small"
              className="username login-field"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <TextField
              onChange={this.passwordChange}
              label="Password"
              type="password"
              autoComplete="current-password"
              variant="filled"
              size="small"
              className="password login-field"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <Button variant="contained" onClick={this.login}>
              Login
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <NavLink to="/register" exact>
              <Button variant="contained" color="secondary">
                Register
              </Button>
            </NavLink>
          </Grid>
        </Grid>
      </div>
    );
  }
}
