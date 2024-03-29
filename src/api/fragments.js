import gql from 'graphql-tag'

export const FRAGMENT_TenantFields = gql`
  fragment TenantFields on Tenant {
    id
    dateCreatedAt
    name
    dateTenantLogIn
    dateTenantLogOut
    state
  }
`

export const FRAGMENT_TenantUserFields = gql`
  fragment TenantUserFields on TenantUser {
    id
    dateCreatedAt
    name
    nameTwo
    emailVerified
    inviteInfo
    dateTenantLogIn
    dateTenantLogOut
    state
    access
  }
`

export const FRAGMENT_OrgFields = gql`
  fragment OrgFields on Org {
    id
    dateCreatedAt
    name
    regNr
    email
    phone
    webPage
    city
    country
    address
  }
`

export const FRAGMENT_ItemFields = gql`
  fragment ItemFields on Item {
    id
    dateCreatedAt
    modelNumber
    serialNumber
    inventoryNumber
    dateWarrantyBegins
    dateWarrantyExpires
    attachments
    itemType {
      id
      dateCreatedAt
      name
    }
    actions {
      id
      dateCreatedAt
      endUser {
        id
        name
      }
      location {
        id
        name
      }
      actionType {
        id
        name
        dateCreatedAt
        isVisibleLatest
        isVisibleNext
      }
      dateActionStart
      dateActionEnd
      attachments
    }
  }
`

// export const FRAGMENT_ItemInputFields = gql`
//   fragment ItemInputFields on ItemInput {
//     id
//     dateCreatedAt
//     modelNumber
//     serialNumber
//     dateWarrantyBegins
//     dateWarrantyExpires
//   }
// `

// export const FRAGMENT_ItemInputUpdateFields = gql`
//   fragment ItemInputUpdateFields on ItemInputUpdate {
//     id
//     modelNumber
//     serialNumber
//     dateWarrantyBegins
//     dateWarrantyExpires
//   }
// `

export const FRAGMENT_ItemTypeFields = gql`
  fragment ItemTypeFields on ItemType {
    id
    dateCreatedAt
    name
  }
`

export const FRAGMENT_EndUserFields = gql`
  fragment EndUserFields on EndUser {
    id
    dateCreatedAt
    name
    email
    emailVerified
    phone
    isClientSendEmail
  }
`

export const FRAGMENT_EndUserInfoFields = gql`
  fragment EndUserInfoFields on EndUserInfo {
    id
    dateCreatedAt
    endUser {
      id
      name
      email
      phone
    }
    group {
      id
      name
    }
    invitedBy
    dateInvitedAt
    inviteInfo
    confirmedBy
    dateConfirmedAt
  }
`

export const FRAGMENT_GroupFields = gql`
  fragment GroupFields on Group {
    id
    dateCreatedAt
    name
    regNr
    email
    phone
    webPage
    endUserInfos {
      id
      dateCreatedAt
      endUser {
        id
        name
        email
        phone
      }
      dateConfirmedAt
    }
  }
`

export const FRAGMENT_ActionFields = gql`
  fragment ActionFields on Action {
    id
    dateCreatedAt
    name
    description
    item {
      id
    }
    endUser {
      id
      name
    }
    location {
      id
      name
    }
    actionType {
      id
      name
      dateCreatedAt
      isVisibleLatest
      isVisibleNext
    }
    valueUnitsA
    valueEstimA
    valueActualA
    valueUnitsB
    valueEstimB
    valueActualB
    dateEstimStart
    dateEstimEnd
    dateActionStart
    dateActionEnd
    attachments
  }
`

export const FRAGMENT_ActionTypeFields = gql`
  fragment ActionTypeFields on ActionType {
    id
    dateCreatedAt
    name
    isVisibleLatest
    isVisibleNext
  }
`

export const FRAGMENT_ActionGangFields = gql`
  fragment ActionGangFields on ActionGang {
    id
    name
    description
    dateCreatedAt
    valueUnitsA
    valueEstimA
    valueUnitsB
    valueEstimB
    dateEstimStart
    dateEstimEnd
    dateActionStart
    dateActionEnd
    index
    attachments
    children
  }
`

export const FRAGMENT_ProjectFields = gql`
  fragment ProjectFields on Project {
    id
    name
    serialNumber
    description
    dateCreatedAt
    valueUnitsA
    valueEstimA
    valueUnitsB
    valueEstimB
    dateEstimStart
    dateEstimEnd
    dateActionStart
    dateActionEnd
    index
    attachments
    children
    children2
  }
`

export const FRAGMENT_LocationFields = gql`
  fragment LocationFields on Location {
    id
    dateCreatedAt
    name
    dateCreatedAt
    email
    phone
    webPage
    city
    country
  }
`