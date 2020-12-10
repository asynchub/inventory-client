import gql from 'graphql-tag'
import {
  FRAGMENT_ItemFields,
  FRAGMENT_ItemTypeFields,
  FRAGMENT_EndUserFields,
  FRAGMENT_ActionFields,
  FRAGMENT_ActionTypeFields,
  FRAGMENT_LocationFields
} from './fragments'

export const QUERY_listItems = gql`
  query listItems {
    listItems {
      ...ItemFields
    }
  }
  ${FRAGMENT_ItemFields}
`

export const QUERY_getItemById = gql`
  query getItemById(
    $itemId: String!
  ) {
    getItemById(
      itemId: $itemId
    ) {
      ...ItemFields
    }
  }
  ${FRAGMENT_ItemFields}
`

export const QUERY_getItemBySerialNumber = gql`
  query getItemBySerialNumber(
    $serialNumber: String!
  ) {
    getItemBySerialNumber(
      serialNumber: $serialNumber
    ) {
      ...ItemFields
    }
  }
  ${FRAGMENT_ItemFields}
`


export const QUERY_listItemTypes = gql`
  query listItemTypes {
    listItemTypes {
      ...ItemTypeFields
    }
  }
  ${FRAGMENT_ItemTypeFields}
`

export const QUERY_getItemTypeById = gql`
  query getItemTypeById(
    $itemTypeId: String!
  ) {
    getItemTypeById(
      itemTypeId: $itemTypeId
    ) {
      ...ItemTypeFields
    }
  }
  ${FRAGMENT_ItemTypeFields}
`


export const QUERY_listEndUsers = gql`
  query listEndUsers {
    listEndUsers {
      ...EndUserFields
    }
  }
  ${FRAGMENT_EndUserFields}
`

export const QUERY_getEndUserById = gql`
  query getEndUserById(
    $endUserId: String!
  ) {
    getEndUserById(
      endUserId: $endUserId
    ) {
      ...EndUserFields
    }
  }
  ${FRAGMENT_EndUserFields}
`


export const QUERY_listActions = gql`
  query listActions {
    listActions {
      ...ActionFields
    }
  }
  ${FRAGMENT_ActionFields}
`

export const QUERY_getActionById = gql`
  query getActionById(
    $actionId: String!
  ) {
    getActionById(
      actionId: $actionId
    ) {
      ...ActionFields
    }
  }
  ${FRAGMENT_ActionFields}
`


export const QUERY_listActionTypes = gql`
  query listActionTypes {
    listActionTypes {
      ...ActionTypeFields
    }
  }
  ${FRAGMENT_ActionTypeFields}
`

export const QUERY_getActionTypeById = gql`
  query getActionTypeById(
    $actionTypeId: String!
  ) {
    getActionTypeById(
      actionTypeId: $actionTypeId
    ) {
      ...ActionTypeFields
    }
  }
  ${FRAGMENT_ActionTypeFields}
`


export const QUERY_listLocations = gql`
  query listLocations {
    listLocations {
      ...LocationFields
    }
  }
  ${FRAGMENT_LocationFields}
`

export const QUERY_getLocationById = gql`
  query getLocationById(
    $locationId: String!
  ) {
    getLocationById(
      locationId: $locationId
    ) {
      ...LocationFields
    }
  }
  ${FRAGMENT_LocationFields}
`