import React, { Component } from "react";
import "./Home.css";
import { VacationCard } from "../VacationCard/VacationCard";
import { VacationModel } from "../../models/vacation-model";
import Grid from "@material-ui/core/Grid";
import { UserModel } from "../../models/user-model";
//redux
import { store } from "../../redux/store";
import { Action } from "../../redux/action";
import { ActionType } from "../../redux/action-type";
import { Unsubscribe } from "redux";
import io from "socket.io-client";

interface HomeState {
  vacations: VacationModel[];
  user: UserModel;
  isLogin: boolean;
  followedVacations: VacationModel[];
  msg: string;
}

export class Home extends Component<any, HomeState> {
  private unsubscribeStore: Unsubscribe;
  private socket = io.connect(
    "https://travelisom-server-heroku.herokuapp.com/"
  );
  public constructor(props: any) {
    super(props);
    this.state = {
      vacations: store.getState().vacations,
      user: store.getState().user,
      isLogin: store.getState().isLogin,
      followedVacations: store.getState().followedVacations,
      msg: "",
    };

    this.unsubscribeStore = store.subscribe(() => {
      this.setState({ user: store.getState().user });
      this.setState({ vacations: store.getState().vacations });
      this.setState({ isLogin: store.getState().isLogin });
      this.setState({ followedVacations: store.getState().followedVacations });
    });
  }

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };
  public componentDidMount = () => {
    if (store.getState().vacations.length === 0) {
      fetch("https://travelisom-server-heroku.herokuapp.com/api/vacations")
        .then((res) => res.json())
        .then((vacations) => {
          const action: Action = {
            type: ActionType.getAllVacations,
            payload: vacations,
          };
          store.dispatch(action);
        })
        .catch((err) => alert(err));
    }
    this.socket.on("get-all-vacations", (vacations: VacationModel[]) => {
      const action: Action = {
        type: ActionType.getAllVacations,
        payload: vacations,
      };
      store.dispatch(action);
    });
    // state in ComponentDidMount return undefind so i set Timeout
    setTimeout(() => {
      this.checkFollowedVacations();
      this.arrangeVacations();
    }, 1000);
  };
  componentDidUpdate = (prevProps: any, prevState: any) => {
    //if user logout update component
    if (prevState.isLogin !== this.state.isLogin) {
      this.componentDidMount();
      // if user log in update component
      if (this.state.isLogin === true) {
        this.arrangeVacations();
      }
    }
  };

  private checkFollowedVacations = () => {
    if (
      this.state.isLogin === true &&
      this.state.followedVacations.length <= 0
    ) {
      fetch(
        `https://travelisom-server-heroku.herokuapp.com/api/vacations/get-followed-vacations/${this.state.user.userID}`
      )
        .then((res) => res.json())
        .then((followedVacations) => {
          const action: Action = {
            type: ActionType.getFollowedVacations,
            payload: followedVacations,
          };
          store.dispatch(action);
          this.arrangeVacations();
        })
        .catch((err) => alert(err));
    }
  };
  private arrangeVacations = () => {
    const allVacations = [...this.state.vacations];
    const followedVacations = [...this.state.followedVacations];
    //  all vacations follow state to false if the user is not logged
    if (this.state.isLogin === false) {
      allVacations.map((v) => (v.follow = false));
    }
    if (followedVacations.length !== 0) {
      for (let i = 0; i < this.state.followedVacations.length; i++) {
        const index = allVacations.findIndex(
          (v) => v.vacationID === followedVacations[i].vacationID
        );
        const vacation = allVacations[index];
        vacation.follow = true;
        allVacations.splice(index, 1);
        allVacations.unshift(vacation);
      }
    }
    this.setState({ vacations: allVacations });
  };

  //Date format from SQL data base is not user friendly
  //this function in converting from yyyy-dd-mm format to
  // local dd/mm/yyyy format

  private fixDateFromMySQL = (str: any) => {
    const FormatDate = str.slice(0, 10);
    const newFormatDate =
      FormatDate.slice(8, 10) +
      "/" +
      FormatDate.slice(5, 7) +
      "/" +
      FormatDate.slice(0, 4);
    return newFormatDate;
  };
  public render(): JSX.Element {
    return (
      <div className="home">
        {!this.state.isLogin && <h1>Please login to view our vacations</h1>}
        {this.state.isLogin && (
          <Grid container spacing={3}>
            {this.state.vacations.map((v) => (
              <Grid item xs={12} md={4} key={v.vacationID}>
                <VacationCard
                  id={v.vacationID}
                  image={v.image}
                  header={v.destination}
                  content={v.description}
                  fromDate={this.fixDateFromMySQL(v.fromDate)}
                  toDate={this.fixDateFromMySQL(v.toDate)}
                  price={v.price}
                  follow={v.follow}
                  update={this.arrangeVacations}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    );
  }
}
