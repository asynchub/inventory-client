import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import {
  useLazyQuery,
  useMutation
} from '@apollo/client';
import { Auth } from 'aws-amplify';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { registerLocale } from 'react-datepicker';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { ImSpinner2 } from 'react-icons/im';
import { VscOrganization } from 'react-icons/vsc';
import LoadingButton from './LoadingButton';
import './Tenants.css'
import { useUserContext, useAuthContext, useTenantContext } from "../libs/contextLib";
import { QUERY_listTenantsNotOwn } from "../api/queries";
import {
  MUTATION_updateTenantUser,
  // MUTATION_deleteTenant,
} from "../api/mutations";
import { sliceStringAfter } from "../libs/fnsLib";
import { onError } from "../libs/errorLib";
import enGb from 'date-fns/locale/en-GB';
registerLocale('en-gb', enGb);

function TenantsNotOwn() {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [tenantsNotOwn, setTenantsNotOwn] = useState([]);
  // console.log('tenantsNotOwn', tenantsNotOwn);
  const { isAuthenticated } = useAuthContext();
  const { setIsAuthenticated } = useAuthContext();
  const { currentUserName } = useUserContext();
  const refId = currentUserName && ('user:' + sliceStringAfter(currentUserName, ':'));
  const { currentTenantId, setCurrentTenantId } = useTenantContext();
  const [listTenantsNotOwn, { loading, data, client }] = useLazyQuery(QUERY_listTenantsNotOwn, {
    variables: { prefix: null, refId }
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateTenantUser] = useMutation(MUTATION_updateTenantUser);
  // const [tenantsNotOwnLimit] = useState(3);
  
  useEffect(() => {
    if (!isAuthenticated) {
      return null;
    }
    function onLoad() {
      setIsLoading(true);
      try {
        listTenantsNotOwn();
        setTenantsNotOwn(data ? data.listTenantsNotOwn : []);
      } catch (error) {
        onError(error);
      }
      setIsLoading(false);
    }
    onLoad();
  },[
    isAuthenticated,
    listTenantsNotOwn, data
  ]);

  async function refreshToken() {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const currentSession = cognitoUser.signInUserSession;
      cognitoUser.refreshSession(currentSession.refreshToken, (err, session) => {
        const tenantIds = session.idToken.payload['cognito:groups'] || [];
        // console.log(
        //   'tenantIds', tenantIds,
        //   '\n cognitoUser', cognitoUser,
        // );
        setCurrentTenantId(tenantIds[0]);
        client.cache.reset();
        setIsAuthenticated(true);
        setIsUpdating(false);
        history.push('/');
      });
    } catch (error) {
      if (error !== 'No current user') {
        onError(error);
      }
    }
  };

  async function handleSubmitUpdateTenant(tenantUser) {
    setIsUpdating(true);
    const dateTenantLogIn = new Date();
    const tenantUserInputUpdate = {
      id: tenantUser.id,
      emailVerified: tenantUser.emailVerified,
      dateTenantLogIn,
      state: JSON.stringify({
        someStateKey: 'someStateValueUpdated_7'
      })
    };
    try {
      const data = await updateTenantUser({
        variables: {
          tenantUser: tenantUserInputUpdate
        }
      });
      if (data) {
        // setIsUpdating(false);
      }
    } catch (error) {
      onError(error);
    }
  };


  if (isLoading || loading) {
    return(
      <div
        className='Loading'
      >
        <ImSpinner2
          className='spinning'
        />
      </div>
    )
  }

  return(
    <div>
      {((tenantsNotOwn && tenantsNotOwn.length) > 0) &&
        <div>
          <h6>
            Organisations
          </h6>
          <hr/>
        </div>
      }
      {((tenantsNotOwn && tenantsNotOwn.length) > 0) &&
        tenantsNotOwn.map((tenant, index) => (
        <div key={tenant.id}>
            <Card
              bsPrefix={(currentTenantId === ('tenant:' + sliceStringAfter(tenant.id, 'tenant:'))) ?
                'shadow p-3 bg-white rounded' :
                'shadow p-3 bg-white rounded'
              }
            >
              <Card.Body>
                <Card.Title>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'end',
                      minWidth: 240
                    }}
                  >
                    {(currentTenantId !== ('tenant:' + sliceStringAfter(tenant.id, 'tenant:'))) ?
                      (
                        <LoadingButton
                          style={{
                            margin: 4
                          }}
                          className='LoadingButton'
                          size='sm'
                          // color='green'
                          // variant='outline-warning'
                          disabled={false}
                          type='submit'
                          isLoading={isUpdating}
                          onClick={async () => {
                            await handleSubmitUpdateTenant(tenant);
                            await refreshToken();
                          }}
                        >
                          Select
                        </LoadingButton>
                      ) : (
                        <Badge pill variant="success">
                          {'Active'}
                        </Badge>
                      )
                    }
                  </div>
                </Card.Title>
                <Form.Group as={Row}>
                  <Form.Label column='sm=4' className='font-weight-bold'>
                    <VscOrganization/>
                  </Form.Label>
                  <Col sm='8'>
                    <Form.Control
                      plaintext
                      readOnly
                      value={tenant ? tenant.name : ''}
                    />
                  </Col>
                </Form.Group>
              </Card.Body>
            </Card>
          <div
            style={{ margin: 20 }}
          />
        </div>
      ))}
      {((tenantsNotOwn && tenantsNotOwn.length) > 0) &&
        <hr/>
      }
    </div>
  )
};

export default TenantsNotOwn;