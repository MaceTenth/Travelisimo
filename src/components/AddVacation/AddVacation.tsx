import React, { SyntheticEvent } from "react";
import "./AddVacation.css";
import { VacationModel } from "../../models/vacation-model";
import { UserModel } from "../../models/user-model";
import { Component } from "react";
import { store } from "../../redux/store";
import { Action } from "../../redux/action";
import { ActionType } from "../../redux/action-type";
import { Unsubscribe } from "redux";
import { PageNotFound } from "../PageNotFound/PageNotFound";
import { TextField, Button, Grid } from "@material-ui/core";

import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

interface AddVacationState {
  vacation: VacationModel;
  user: UserModel;
}
export class AddVacation extends Component<any, AddVacationState> {
  private unsubscribeStore: Unsubscribe;

  public constructor(props: any) {
    super(props);
    this.state = {
      user: store.getState().user,
      vacation: new VacationModel(),
    };

    this.unsubscribeStore = store.subscribe(() => {
      this.setState({ user: store.getState().user });
    });
  }

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };

  public componentDidMount = () => {
    const vacation = { ...this.state.vacation };
    const date = new Date();
    date.setHours(0, 0, 0);
    vacation.fromDate = date;
    vacation.toDate = date;

    this.setState({ vacation });
  };

  private updateDestination = (args: SyntheticEvent) => {
    const input = args.target as HTMLSelectElement;
    const destination = input.value;
    const vacation = { ...this.state.vacation };
    if (destination.length < 3 || destination.length > 50) {
      input.classList.add("invalid");

      vacation.destination = undefined;
      this.setState({ vacation });
      return;
    }
    input.classList.remove("invalid");
    vacation.destination = destination;
    this.setState({ vacation });
  };
  private updateDescription = (args: SyntheticEvent) => {
    const input = args.target as HTMLSelectElement;
    const description = input.value;
    const vacation = { ...this.state.vacation };
    if (description.length < 4 || description.length > 300) {
      input.classList.add("invalid");
      vacation.description = undefined;
      this.setState({ vacation });
      return;
    }
    input.classList.remove("invalid");

    vacation.description = description;
    this.setState({ vacation });
  };
  private updateDepartingDate = (date: Date, e: any) => {
    const vacation = { ...this.state.vacation };
    if (date === null || date.toString() === "Invalid Date") {
      vacation.fromDate = null;
      this.setState({ vacation });
      return;
    }
    vacation.fromDate = date;

    this.setState({ vacation });
  };
  private updateReturningDate = (date: Date, e: any) => {
    const vacation = { ...this.state.vacation };
    if (date === null || date.toString() === "Invalid Date") {
      vacation.toDate = null;
      this.setState({ vacation });
      return;
    }
    vacation.toDate = date;
    this.setState({ vacation });
  };
  private updatePrice = (args: SyntheticEvent) => {
    const input = args.target as HTMLSelectElement;
    const price = input.value;
    const vacation = { ...this.state.vacation };
    if (price.length < 1 || price.length > 6 || isNaN(+price)) {
      input.classList.add("invalid");
      vacation.price = undefined;
      this.setState({ vacation });
      return;
    }
    input.classList.remove("invalid");
    vacation.price = +price;
    this.setState({ vacation });
  };
  private checkImage = (event: any) => {
    const image = event.target.files[0];
    const vacation = { ...this.state.vacation };
    vacation.image = image;
    this.setState({ vacation });
  };

  private checkForm = async () => {
    const vacation = { ...this.state.vacation };
    // validation
    if (vacation.fromDate > vacation.toDate) {
      alert("Cannot travel to the past... Choose a date in the future");
      return;
    }
    if (vacation.fromDate === vacation.toDate) {
      alert("That is a short vacation... It should be longer than a day");
      return;
    }
    if (!vacation.image) {
      alert("Please upload an image");
      return;
    }

    for (const [key, value] of Object.entries(vacation)) {
      if (value === undefined && key !== "vacationID" && key !== "follow") {
        alert(`Plese check and complete the ${key.toUpperCase()} field`);
        return;
      }
    }

    this.sendForm();
  };

  private sendForm = () => {
    const vacation = { ...this.state.vacation };
    const formData = new FormData();

    formData.append("image", vacation.image);
    formData.append("vacation", JSON.stringify(vacation));

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    };

    fetch(
      "https://travelisom-server-heroku.herokuapp.com/api/vacations/new-vacation",
      options
    )
      .then((res) => res.json())
      .then((vacation) => {
        const action: Action = {
          type: ActionType.addNewVacation,
          payload: vacation,
        };
        store.dispatch(action);

        alert("Vacation added successfully!");
        this.props.history.push("/admin-panel");
      })
      .catch((err) => alert(err));
  };

  public render(): JSX.Element {
    return (
      <div className="addVacation">
        {this.state.user.isAdmin ? (
          <form>
            <table className="table-vacation">
              <tbody className="table-vacation">
                <tr className="table-vacation">
                  <td className="table-vacation">
                    <p>Destination:</p>
                  </td>
                  <td className="table-vacation">
                    <TextField
                      variant="filled"
                      onChange={this.updateDestination}
                      helperText="Minimun of 3 characters"
                    />
                  </td>
                  <td className="table-vacation">
                    <p>Description: </p>
                  </td>
                  <td className="table-vacation">
                    <TextField
                      id="filled-textarea"
                      multiline
                      variant="filled"
                      helperText="Maximum length of 300 character"
                      onChange={this.updateDescription}
                    />
                  </td>
                </tr>
                <tr className="table-vacation">
                  <td className="table-vacation">
                    <p>Vacation start at: </p>
                  </td>
                  <td className="table-vacation">
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <Grid container justifyContent="space-around">
                        <KeyboardDatePicker
                          margin="normal"
                          format="dd/MM/yyyy"
                          value={this.state.vacation.fromDate}
                          onChange={this.updateDepartingDate}
                          KeyboardButtonProps={{
                            "aria-label": "change date",
                          }}
                        />
                      </Grid>
                    </MuiPickersUtilsProvider>
                  </td>
                  <td className="table-vacation">
                    <p>Returning: </p>
                  </td>
                  <td className="table-vacation">
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <Grid container justifyContent="space-around">
                        <KeyboardDatePicker
                          margin="normal"
                          format="dd/MM/yyyy"
                          value={this.state.vacation.toDate}
                          onChange={this.updateReturningDate}
                          KeyboardButtonProps={{
                            "aria-label": "change date",
                          }}
                        />
                      </Grid>
                    </MuiPickersUtilsProvider>
                  </td>
                </tr>
                <tr className="table-vacation">
                  <td className="table-vacation">
                    <p>Price : </p>
                  </td>
                  <td className="table-vacation">
                    <TextField
                      label="Vacation cost"
                      variant="filled"
                      helperText="Type between 1-6 characters"
                      onChange={this.updatePrice}
                    />
                  </td>
                  <td className="table-vacation">
                    <p>Upload image</p>
                  </td>
                  <td className="table-vacation">
                    <input
                      accept="image/*"
                      className="imageUplode"
                      id="outlined-button-file"
                      multiple
                      type="file"
                      name="imageToUplode"
                      onChange={this.checkImage}
                    />
                    <label htmlFor="outlined-button-file">
                      <Button variant="outlined" component="span">
                        Upload
                      </Button>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
            <hr />
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.props.history.push("/admin-panel")}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.checkForm}
            >
              Add Vacation
            </Button>
          </form>
        ) : (
          <PageNotFound />
        )}
      </div>
    );
  }
}
