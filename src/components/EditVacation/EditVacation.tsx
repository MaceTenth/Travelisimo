import React, { SyntheticEvent } from "react";
import "./EditVacation.css";
import { VacationModel } from "../../models/vacation-model";
import { UserModel } from "../../models/user-model";
import { Component } from "react";
import { store } from "../../redux/store";
import { Action } from "../../redux/action";
import { ActionType } from "../../redux/action-type";
import { Unsubscribe } from "redux";
import { PageNotFound } from "../PageNotFound/PageNotFound";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import io from "socket.io-client";

interface AddVacationState {
  vacation: VacationModel;
  user: UserModel;
  imgToDisplay: string;
  newImage: any;
}
export class EditVacation extends Component<any, AddVacationState> {
  private unsubscribeStore: Unsubscribe;
  private socket = io.connect(
    "https://travelisom-server-heroku.herokuapp.com/"
  );
  public constructor(props: any) {
    super(props);
    this.state = {
      imgToDisplay: "",
      user: store.getState().user,
      vacation: new VacationModel(),
      newImage: "",
    };

    this.unsubscribeStore = store.subscribe(() => {
      this.setState({ user: store.getState().user });
    });
  }

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };

  public componentDidMount = () => {
    const id = this.props.match.params.id;
    fetch(`https://travelisom-server-heroku.herokuapp.com/api/vacations/${id}`)
      .then((res) => res.json())
      .then((vacation) => {
        vacation.fromDate = new Date(vacation.fromDate);
        vacation.toDate = new Date(vacation.toDate);

        this.setState({ vacation });
        this.setState({ imgToDisplay: vacation.image });
      })
      .catch((err) => alert(err));
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
  private updateDepartingDate = (date: Date) => {
    const vacation = { ...this.state.vacation };
    if (date === null || date.toString() === "Invalid Date") {
      vacation.fromDate = null;

      this.setState({ vacation });
      return;
    }

    vacation.fromDate = date;

    this.setState({ vacation });
  };
  private updateReturningDate = (date: Date) => {
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
    this.setState({ newImage: image });
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

    formData.append("image", this.state.newImage);
    formData.append("vacation", JSON.stringify(vacation));

    const options = {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    };

    fetch(
      "https://travelisom-server-heroku.herokuapp.com/api/vacations/update-vacation",
      options
    )
      .then((res) => res.json())
      .then((vacation) => {
        const action: Action = {
          type: ActionType.updateVacation,
          payload: vacation,
        };
        store.dispatch(action);

        alert("Vacation has been updated !");
        this.props.history.push("/admin-panel");
        this.socket.emit("get-all-vacations");
      })
      .catch((err) => alert(err));
  };
  public render(): JSX.Element {
    return (
      <div className="editVacation">
        {this.state.user.isAdmin ? (
          <form>
            <table>
              <tbody>
                <tr>
                  <td>
                    <p>Destination: </p>
                  </td>
                  <td>
                    <TextField
                      value={this.state.vacation.destination}
                      variant="filled"
                      onChange={this.updateDestination}
                      helperText="Minimun of 3 characters"
                    />
                  </td>
                  <td>
                    <p>Description : </p>
                  </td>
                  <td>
                    <TextField
                      value={this.state.vacation.description || ""}
                      multiline
                      helperText="Maximum length of 300 character"
                      onChange={this.updateDescription}
                    />
                  </td>
                </tr>

                <tr>
                  <td>
                    <p>Departing : </p>
                  </td>
                  <td>
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
                  <td>
                    <p>Returning : </p>
                  </td>
                  <td>
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
                <tr>
                  <td>
                    <p>Price : </p>
                  </td>
                  <td>
                    <TextField
                      label="Price"
                      value={this.state.vacation.price || ""}
                      variant="filled"
                      helperText="Vacation cost"
                      onChange={this.updatePrice}
                    />
                  </td>
                  <td>
                    <p>Image : </p>
                  </td>
                  <td>
                    <img
                      src={`/assets/images/vacations/${this.state.imgToDisplay}`}
                      alt="old"
                    />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
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
                        Upload new image
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
              Update Vacation
            </Button>
          </form>
        ) : (
          <PageNotFound />
        )}
      </div>
    );
  }
}
