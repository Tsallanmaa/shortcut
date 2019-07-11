import * as React from "react";
import * as ReactDOM from "react-dom";
import { Route, Router } from 'react-router-dom';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ApartmentsList } from "./components/ApartmentsList";
import { Apartment } from "./components/Apartment";
import history from "./history";

const routing = (
    <Router history={history}>
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">Shortcut</NavbarBrand>
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink href="https://github.com/Tsallanmaa/shortcut">GitHub</NavLink>
                </NavItem>
            </Nav>
        </Navbar>
        <Route exact path="/" component={ApartmentsList} />
        <Route exact path="/apartments/:id" component={Apartment} />
      </div>
    </Router>
  )

ReactDOM.render(
    routing,
    document.getElementById("root")
);