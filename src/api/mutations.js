import gql from 'graphql-tag'
import {
  FRAGMENT_ItemFields,
  FRAGMENT_ItemTypeFields,
  FRAGMENT_EndUserFields,
  FRAGMENT_ActionFields,
  FRAGMENT_ActionTypeFields,
  FRAGMENT_LocationFields
} from './fragments'

export const MUTATION_createItem = gql`
  mutation createItem(
    $item: ItemInput!
  ) {
    createItem(
      item: $item
    ) {
      ...ItemFields
    }
  }
  ${FRAGMENT_ItemFields}
`

export const MUTATION_updateItem = gql`
  mutation updateItem(
    $item: ItemInputUpdate!
  ) {
    updateItem(
      item: $item
    ) {
      ...ItemFields
    }
  }
  ${FRAGMENT_ItemFields}
`

export const MUTATION_deleteItem = gql`
  mutation deleteItem(
    $itemId: String!
  ) {
    deleteItem(
      itemId: $itemId
    )
  }
`


export const MUTATION_createItemType = gql`
  mutation createItemType(
    $itemType: ItemTypeInput!
  ) {
    createItemType(
      itemType: $itemType
    ) {
      ...ItemTypeFields
    }
  }
  ${FRAGMENT_ItemTypeFields}
`

export const MUTATION_updateItemType = gql`
  mutation updateItemType(
    $itemType: ItemTypeInputUpdate!
  ) {
    updateItemType(
      itemType: $itemType
    ) {
      ...ItemTypeFields
    }
  }
  ${FRAGMENT_ItemTypeFields}
`

export const MUTATION_deleteItemType = gql`
  mutation deleteItemType(
    $itemTypeId: String!
  ) {
    deleteItemType(
      itemTypeId: $itemTypeId
    )
  }
`


export const MUTATION_createEndUser = gql`
  mutation createEndUser(
    $endUser: EndUserInput!
  ) {
    createEndUser(
      endUser: $endUser
    ) {
      ...EndUserFields
    }
  }
  ${FRAGMENT_EndUserFields}
`

export const MUTATION_updateEndUser = gql`
  mutation updateEndUser(
    $endUser: EndUserInputUpdate!
  ) {
    updateEndUser(
      endUser: $endUser
    ) {
      ...EndUserFields
    }
  }
  ${FRAGMENT_EndUserFields}
`

export const MUTATION_deleteEndUser = gql`
  mutation deleteEndUser(
    $endUserId: String!
  ) {
    deleteEndUser(
      endUserId: $endUserId
    )
  }
`


export const MUTATION_createAction = gql`
  mutation createAction(
    $action: ActionInput!
  ) {
    createAction(
      action: $action
    ) {
      ...ActionFields
    }
  }
  ${FRAGMENT_ActionFields}
`

export const MUTATION_updateAction = gql`
  mutation updateAction(
    $action: ActionInputUpdate!
  ) {
    updateAction(
      action: $action
    ) {
      ...ActionFields
    }
  }
  ${FRAGMENT_ActionFields}
`

export const MUTATION_deleteAction = gql`
  mutation deleteAction(
    $actionId: String!
  ) {
    deleteAction(
      actionId: $actionId
    )
  }
`


export const MUTATION_createActionType = gql`
  mutation createActionType(
    $actionType: ActionTypeInput!
  ) {
    createActionType(
      actionType: $actionType
    ) {
      ...ActionTypeFields
    }
  }
  ${FRAGMENT_ActionTypeFields}
`

export const MUTATION_updateActionType = gql`
  mutation updateActionType(
    $actionType: ActionTypeInputUpdate!
  ) {
    updateActionType(
      actionType: $actionType
    ) {
      ...ActionTypeFields
    }
  }
  ${FRAGMENT_ActionTypeFields}
`

export const MUTATION_deleteActionType = gql`
  mutation deleteActionType(
    $actionTypeId: String!
  ) {
    deleteActionType(
      actionTypeId: $actionTypeId
    )
  }
`


export const MUTATION_createLocation = gql`
  mutation createLocation(
    $location: LocationInput!
  ) {
    createLocation(
      location: $location
    ) {
      ...LocationFields
    }
  }
  ${FRAGMENT_LocationFields}
`

export const MUTATION_updateLocation = gql`
  mutation updateLocation(
    $location: LocationInputUpdate!
  ) {
    updateLocation(
      location: $location
    ) {
      ...LocationFields
    }
  }
  ${FRAGMENT_LocationFields}
`

export const MUTATION_deleteLocation = gql`
  mutation deleteLocation(
    $locationId: String!
  ) {
    deleteLocation(
      locationId: $locationId
    )
  }
`