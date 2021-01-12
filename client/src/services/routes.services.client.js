/*!
 * MLP.Client.Services.API
 * File: api.services.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */
import React from "react";
import Users from "./components/Users";
import Contact from "./components/Contact";
import About from "./components/About";
const routes = {
    "/": () => <Users />,
    "/about": () => <About />,
    "/contact": () => <Contact />
};
export default routes;