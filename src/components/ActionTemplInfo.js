import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  QUERY_getActionById,
  QUERY_listActions
} from '../api/queries';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { ImSpinner2 } from 'react-icons/im';
import { useAuthContext } from "../libs/contextLib";
import LoadingButton from './LoadingButton';
import './ActionTemplInfo.css'
import { MUTATION_deleteAction, MUTATION_updateAction } from "../api/mutations";
import { onError } from "../libs/errorLib";

function ActionTemplInfo() {
  const { isAuthenticated } = useAuthContext();
  const { id } = useParams();
  const history = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [actionTempl, setActionTempl] = useState({
    id,
    name: '',
    description: '',
    valueUnitsA: '',
    valueUnitsB: ''
  });
  const [actionTemplUpdate, setActionTemplUpdate] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [getActionById, { data, loading }] = useLazyQuery(QUERY_getActionById);
  const [updateAction] = useMutation(MUTATION_updateAction);
  const [deleteAction] = useMutation(MUTATION_deleteAction, {
    refetchQueries: [{ query: QUERY_listActions }]
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      return null;
    }
    function onLoad() {
      setIsLoading(true);
      try {
        getActionById({
          variables: { actionId: id }
        });
        const actionTemplById = data && data.getActionById;
        // console.log(data);
        if (actionTemplById) {
          const {
            id,
            name,
            description,
            valueUnitsA,
            valueUnitsB
          } = actionTemplById;
          setActionTempl(actionTemplById);
          setActionTemplUpdate({
            id,
            name,
            description,
            valueUnitsA,
            valueUnitsB
          });
        }
      } catch (error) {
        onError(error);
      }
      setIsLoading(false);
    }
    onLoad();
  },[isAuthenticated, getActionById, id, data]);

  async function handleSubmit({
    id,
    name,
    description,
    valueUnitsA,
    valueUnitsB
  }) {
    setIsUpdating(true);
    try {
      const data = await updateAction({
        variables: {
          action: {
            id,
            name,
            description,
            valueUnitsA,
            valueUnitsB
          }
        }
      });
      // console.log('data', data);
      if (data) {
        setIsUpdating(false);
        setIsEditing(false);
      }
    } catch (error) {
      onError(error);
    }
  }

  async function handleDelete(actionTempl) {
    const confirmed = window.confirm(`Do you want to delete action template ${actionTempl.name}, SN: ${actionTempl.description}?`);
    if (confirmed) {
      setIsDeleting(true);
      try {
        await deleteAction({ variables: { actionId: id } });
        history.goBack();
      } catch (error) {
        onError(error);
      }
      setIsDeleting(false);
    } else {
      return null;
    }
  };

  if (loading || isLoading) {
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
  // const actionTempl = data.getActionById;
  // console.log(actionTempl);

  return(
    <div
      className='ActionTemplInfo'
    >
      <Container
        // fluid
      >
        <Row>
          <Col
            // lg='4'
            // breakpoints={['md', 'sm', 'xs']}
          >
            <Row className='justify-content-end'>
              {!isEditing ?
                (
                  <LoadingButton
                    className='LoadingButton'
                    size='sm'
                    color='orange'
                    variant='outline-warning'
                    disabled={false}
                    type='submit'
                    isLoading={false}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </LoadingButton>
                ) : (
                  <>
                    <LoadingButton
                      className='LoadingButton'
                      size='sm'
                      color='red'
                      variant='outline-danger'
                      disabled={isDeleting}
                      type='submit'
                      isLoading={isDeleting}
                      onClick={() => handleDelete(actionTempl)}
                    >
                      Delete
                    </LoadingButton>
                    <LoadingButton
                      className='LoadingButton'
                      size='sm'
                      variant='outline-primary'
                      disabled={isUpdating}
                      type='submit'
                      isLoading={isUpdating}
                      onClick={() => handleSubmit(actionTemplUpdate)}
                    >
                      Save
                    </LoadingButton>
                    <LoadingButton
                      className='LoadingButton'
                      size='sm'
                      variant='outline-secondary'
                      disabled={false}
                      type='submit'
                      isLoading={false}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </LoadingButton>
                  </>
                )
              }
            </Row>
            <hr/>
            <Form.Group as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Name
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={actionTempl.name}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='Name'
                    value={actionTemplUpdate.name}
                    onChange={(event) => setActionTemplUpdate({ ...actionTemplUpdate, name: event.target.value })}
                  />
                )}
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Description
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={actionTempl.description}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='Description'
                    value={actionTemplUpdate.description}
                    onChange={(event) => setActionTemplUpdate({ ...actionTemplUpdate, description: event.target.value})}
                  />
                )}
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Measure units A
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={actionTempl.valueUnitsA || ''}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='ValueUnitsA'
                    value={actionTemplUpdate.valueUnitsA || ''}
                    onChange={(event) => setActionTemplUpdate({ ...actionTemplUpdate, valueUnitsA: event.target.value})}
                  />
                )}
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Measure units B
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={actionTempl.valueUnitsB || ''}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='ValueUnitsB'
                    value={actionTemplUpdate.valueUnitsB || ''}
                    onChange={(event) => setActionTemplUpdate({ ...actionTemplUpdate, valueUnitsB: event.target.value})}
                  />
                )}
              </Col>
            </Form.Group>
            <hr style={{ marginBottom: 30 }}/>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ActionTemplInfo