import React, { Component } from "react";
import "./Layout.css";
import { Header } from "../Header/Header";
import { Home } from "../Home/Home";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Container } from "@material-ui/core";
import { UserRegister } from "../UserRegister/UserRegister";
import { PageNotFound } from "../PageNotFound/PageNotFound";
import { AdminPanel } from "../AdminPanel/AdminPanel";
import { AddVacation } from "../AddVacation/AddVacation";
import { EditVacation } from "../EditVacation/EditVacation";
import { Reports } from "../Reports/Reports";
import { About } from "../AboutPage/AboutPage";
import Footer from "../Footer/Footer";

export class Layout extends Component {
  public render(): JSX.Element {
    return (
      <div className="layout">
        <BrowserRouter>
          <header>
            <Header />
          </header>
          <main>
            <Container>
              <Switch>
                <Route path="/register" component={UserRegister} exact />
                <Route path="/admin-panel" component={AdminPanel} exact />
                <Route path="/add-vacation" component={AddVacation} exact />
                <Route
                  path="/edit-vacation/:id"
                  component={EditVacation}
                  exact
                />
                <Route path="/chart" component={Reports} exact />
                <Route path="/about" component={About} exact />
                <Route path="/PageNotFound" component={PageNotFound} exact />

                <Route path="/" component={Home} exact />
              </Switch>
            </Container>
          </main>
        </BrowserRouter>
        <footer>
          <Footer />
        </footer>
      </div>
    );
  }
}
