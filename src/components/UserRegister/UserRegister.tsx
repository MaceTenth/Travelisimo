import React, { Component, SyntheticEvent } from "react";
import "./UserRegister.css";
import { TextField, Button } from "@material-ui/core";
import { UserModel } from "../../models/user-model";
import { store } from "../../redux/store";
import { Action } from "../../redux/action";
import { ActionType } from "../../redux/action-type";
import { Unsubscribe } from "redux";
import { PageNotFound } from "../PageNotFound/PageNotFound";

interface RegisterState {
  user: UserModel;
  isLogin: boolean;
}

export class UserRegister extends Component<any, RegisterState> {
  private unsubscribeStore: Unsubscribe;

  public constructor(props: any) {
    super(props);
    this.state = {
      user: new UserModel(),
      isLogin: store.getState().isLogin,
    };
    this.unsubscribeStore = store.subscribe(() => {
      this.setState({ isLogin: store.getState().isLogin });
    });
  }

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };
  private updateFirstName = (args: SyntheticEvent) => {
    const input = args.target as HTMLSelectElement;
    const firstName = input.value;
    const user = { ...this.state.user };
    if (firstName.length < 2 || firstName.length > 30) {
      input.classList.add("invalid");
      user.firstName = undefined;
      this.setState({ user });
      return;
    }

    input.classList.remove("invalid");
    user.firstName = firstName;
    this.setState({ user });
  };

  private updateLastName = (args: SyntheticEvent) => {
    const input = args.target as HTMLSelectElement;
    const lastName = input.value;
    const user = { ...this.state.user };
    if (lastName.length < 2 || lastName.length > 30) {
      input.classList.add("invalid");

      user.lastName = undefined;
      this.setState({ user });
      return;
    }

    input.classList.remove("invalid");
    user.lastName = lastName;
    this.setState({ user });
  };
  private updateUserName = (args: SyntheticEvent) => {
    const input = args.target as HTMLSelectElement;
    const userName = input.value;
    const user = { ...this.state.user };
    if (userName.length < 2 || userName.length > 30) {
      input.classList.add("invalid");
      user.userName = undefined;
      this.setState({ user });
      return;
    }
    input.classList.remove("invalid");
    user.userName = userName;
    this.setState({ user });
  };

  private updatePassword = (args: SyntheticEvent) => {
    const input = args.target as HTMLSelectElement;
    const password = input.value;
    const user = { ...this.state.user };
    if (password.length < 6 || password.length > 30) {
      input.classList.add("invalid");
      user.password = undefined;
      this.setState({ user });

      return;
    }
    input.classList.remove("invalid");
    user.password = password;
    this.setState({ user });
  };

  private sendForm = (args: SyntheticEvent) => {
    const user = { ...this.state.user };

    for (const [key, value] of Object.entries(user)) {
      if (value === undefined && key !== "userID" && key !== "isAdmin") {
        alert(`Plese check and complete the ${key.toUpperCase()} field`);
        return;
      }
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(this.state.user),
    };

    fetch(
      "https://travelisom-server-heroku.herokuapp.com/api/register",
      options
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());

        return response;
      })
      .then((response) => response.json())
      .then((user) => {
        this.props.history.push("/");

        const actionUser: Action = {
          type: ActionType.getUser,
          payload: user,
        };
        store.dispatch(actionUser);

        const actionIsLogin: Action = {
          type: ActionType.updateIsLogin,
          payload: true,
        };
        store.dispatch(actionIsLogin);
        this.sendJWT();
      })
      .catch((err) => {
        alert(err);
      });
  };

  private sendJWT = () => {
    const optionsJWT = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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
      <div className="registerion-page">
        {this.state.isLogin === false ? (
          <form>
            <label htmlFor="first-name">
              Fisrt Name:
              <TextField
                onChange={this.updateFirstName}
                id="first-name"
                label="First Name"
                variant="filled"
                size="small"
                helperText="Must be at least 2 characters long"
              />
            </label>
            <label htmlFor="last-name">
              Last Name:
              <TextField
                onChange={this.updateLastName}
                id="last-name"
                label="Last Name"
                variant="filled"
                size="small"
                helperText="Must be at least 2 characters long"
              />
            </label>
            <label htmlFor="user-name">
              User Name:
              <TextField
                onChange={this.updateUserName}
                id="user-name"
                label="User Name"
                variant="filled"
                size="small"
                helperText="Must be at least 2 characters long"
              />
            </label>
            <label htmlFor="password">
              Password:
              <TextField
                onChange={this.updatePassword}
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                variant="filled"
                size="small"
                helperText="Must be at least 6 characters long"
              />
            </label>

            <Button
              variant="contained"
              color="secondary"
              onClick={this.sendForm}
            >
              Book your next vacation!
            </Button>
          </form>
        ) : (
          <PageNotFound />
        )}
      </div>
    );
  }
}
