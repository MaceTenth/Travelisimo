import React, { Component } from "react";
import "./AboutPage.css";

export class About extends Component {
  public render(): JSX.Element {
    return (
      <div className="about">
        <h1>About</h1>

        <p>
          Travelisimo connects millions of travelers to unforgettable
          experiences, a variety of transportation options and amazing
          accommodations - homes, apartments, hotels, B & Bs and more. You can
          see accommodations all over the world reach a global audience and grow
          their business. So no matter where you want to go and what you plan to
          do with Travelisimo it will just be easier!
        </p>

        <h1>System capabilities</h1>

        <p>
          You can add, manage and edit vacations at any given time. There is an
          option for smart reports where you can view the most requested
          vacations. Users can sign up for the system and keep track of vacation
          dates, prices and any new update will be updated immediately on the
          user screen.
        </p>

        <h1>Technologies</h1>

        <p>
          Frontend: React.js with MaterialUI
          <br />
          Backend: Node.js with Express, Socket.io, jwtWebToken, bcrypt, uuid
          <br />
          Database: MySQL database
        </p>
      </div>
    );
  }
}
