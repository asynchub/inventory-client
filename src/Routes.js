import React from 'react';
import { Switch, Route } from 'react-router-dom';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import Items from './components/Items';
import ItemForm from './components/ItemForm';
import ItemInfo from './components/ItemInfo';
import ItemTypes from './components/ItemTypes';
import ItemTypeForm from './components/ItemTypeForm';
import ItemTypeInfo from './components/ItemTypeInfo';
import EndUsers from './components/EndUsers';
import EndUserForm from './components/EndUserForm';
import EndUserInfo from './components/EndUserInfo';
import NotFound from './components/NotFound';
import './Routes.css';

export default function Routes() {
  return (
    <div
      className='Routes'
    >
      <Switch>
        <Route exact path='/'>
          <Items />
        </Route>
        <UnauthenticatedRoute exact path="/login">
          <Login />
        </UnauthenticatedRoute>
        <UnauthenticatedRoute exact path="/signup">
          <Signup />
        </UnauthenticatedRoute>
        <Route exact path='/items'>
          <Items />
        </Route>
        <AuthenticatedRoute exact path='/items/new'>
          <ItemForm />
        </AuthenticatedRoute>
        <AuthenticatedRoute exact path='/items/:id'>
          <ItemInfo />
        </AuthenticatedRoute>
        <Route exact path='/itemTypes'>
          <ItemTypes />
        </Route>
        <AuthenticatedRoute exact path='/itemTypes/new'>
          <ItemTypeForm />
        </AuthenticatedRoute>
        <AuthenticatedRoute exact path='/itemTypes/:id'>
          <ItemTypeInfo />
        </AuthenticatedRoute>
        <Route exact path='/endUsers'>
          <EndUsers />
        </Route>
        <AuthenticatedRoute exact path='/endUsers/new'>
          <EndUserForm />
        </AuthenticatedRoute>
        <AuthenticatedRoute exact path='/endUsers/:id'>
          <EndUserInfo />
        </AuthenticatedRoute>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </div>
  )
}