import React, { Component } from "react";
import "./Reports.css";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel,
} from "victory";
import { UserModel } from "../../models/user-model";
import { store } from "../../redux/store";
import { Unsubscribe } from "redux";
import { PageNotFound } from "../PageNotFound/PageNotFound";

interface ChartState {
  vacations: any[];
  tickValueArr: any[];
  tickFormatArr: any[];
  toolTipsArr: any[];
  user: UserModel;
}

export class Reports extends Component<any, ChartState> {
  private unsubscribeStore: Unsubscribe;

  public constructor(props: any) {
    super(props);
    this.state = {
      user: store.getState().user,
      vacations: [],
      tickValueArr: [],
      tickFormatArr: [],
      toolTipsArr: [],
    };

    this.unsubscribeStore = store.subscribe(() => {
      this.setState({ user: store.getState().user });
    });
  }

  public componentWillUnmount = () => {
    this.unsubscribeStore();
  };
  public componentDidMount = () => {
    const options = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    };

    fetch(
      "https://travelisom-server-heroku.herokuapp.com/api/vacations/followed/get-all",
      options
    )
      .then((res) => res.json())
      .then((vacations) => this.arrangeVacations(vacations))
      .catch((err) => alert(err));

    setTimeout(() => {
      this.arrangeTicksValueForChart();
      this.arrayForToolTips();
      this.arrangeTicksFormatForChart();
    }, 1000);
  };

  private arrangeVacations = (vacations: any) => {
    const stateVacations = [...this.state.vacations];

    vacations.forEach((v: any) => {
      let obj = {
        vacationID: +v.vacationID,
        followers: 1,
        desc: v.description,
      };
      const vacation = stateVacations.find(
        (f) => f.vacationID === v.vacationID
      );
      if (vacation) {
        vacation.followers += 1;
        return;
      }
      stateVacations.push(obj);
    });
    stateVacations.sort((a, b) => {
      return a.vacationID - b.vacationID;
    });

    this.setState({ vacations: stateVacations });
  };

  private arrangeTicksValueForChart = () => {
    const vacations = [...this.state.vacations];
    const tickValueArr = [...this.state.tickValueArr];
    vacations.map((v) => tickValueArr.push(v.vacationID));
    this.setState({ tickValueArr });
  };

  private arrangeTicksFormatForChart = () => {
    const vacations = [...this.state.vacations];

    const tickFormatArr = [...this.state.tickFormatArr];
    vacations.map((v) => tickFormatArr.push(`${v.desc}`));
    this.setState({ tickFormatArr });
  };

  private arrayForToolTips = () => {
    const vacations = [...this.state.vacations];

    const toolTipsArr = [...this.state.toolTipsArr];
    vacations.map((v) => toolTipsArr.push({ y: v.followers }));
    this.setState({ toolTipsArr });
  };

  public render(): JSX.Element {
    return (
      <div className="chart">
        {this.state.user.isAdmin ? (
          <React.Fragment>
            <h1>Vacactions followed</h1>
            <VictoryChart
              theme={VictoryTheme.material}
              width={1200}
              domainPadding={80}
              maxDomain={{ y: 6 }}
            >
              <VictoryAxis
                tickValues={this.state.tickValueArr}
                tickFormat={this.state.tickFormatArr}
              />

              <VictoryAxis dependentAxis tickFormat={(x) => `${x}`} />
              <VictoryBar
                animate={{ duration: 2000, easing: "bounce" }}
                style={{
                  data: { fill: "#f34c40" },
                  labels: { fill: "white", fontSize: 18 },
                }}
                events={[
                  {
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            target: "data",
                            mutation: (props) => {
                              const fill = props.style && props.style.fill;
                              return fill === "blue"
                                ? null
                                : { style: { fill: "blue" } };
                            },
                          },
                        ];
                      },
                    },
                  },
                ]}
                data={this.state.vacations}
                labels={({ datum }) => datum.followers}
                labelComponent={<VictoryLabel dy={30} />}
                x="desc"
                y="followers"
              />
            </VictoryChart>
          </React.Fragment>
        ) : (
          <PageNotFound />
        )}
      </div>
    );
  }
}
