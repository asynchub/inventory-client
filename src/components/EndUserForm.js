import React, { useState } from 'react'
import { useHistory } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { v1 as uuidv1 } from 'uuid';
import { useMutation } from '@apollo/client'
import { MUTATION_createEndUser } from '../api/mutations'
import { QUERY_listEndUsers } from '../api/queries';
import LoadingButton from './LoadingButton';
import { onError } from '../libs/errorLib';
import './EndUserForm.css';

function EndUserForm() {
  const history = useHistory();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createEndUser] = useMutation(MUTATION_createEndUser, {
    refetchQueries: [{ query: QUERY_listEndUsers }]
  });

  function validateForm(fields={}) {
    if(Object.values(fields).includes('')) {
      return false
    } else {
      return true
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const id = 'enduser:' + uuidv1();
    const dateCreatedAt = new Date();
    setIsLoading(true);
    // console.log(
    //   'id', id,
    //   'dateCreatedAt', dateCreatedAt
    // )
    try {
      const endUserCreated = await createEndUser({
        variables: {
          endUser: {
            id,
            name,
            dateCreatedAt,
            email,
            phone
          }
        }
      })
      if (endUserCreated) {
        setIsLoading(false);
        setName('');
        setEmail('');
        setPhone('');
        history.push('/endUsers');
      }
    } catch (error) {
      onError(error);
      setIsLoading(false);
    }
  };
  // console.log(files);
  return(
    <div
      className='EndUserForm'
    >
      <Form>
        <Form.Group>
          <Form.Label>
            Name
          </Form.Label>
          <Form.Control
            type='text'
            placeholder='Name'
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>
            Email
          </Form.Label>
          <Form.Control
            type='text'
            placeholder='Email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>
            Phone
          </Form.Label>
          <Form.Control
            type='text'
            placeholder='Phone'
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </Form.Group>
        <LoadingButton
          block
          disabled={!validateForm({
            name
          })}
          type='submit'
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          Submit
        </LoadingButton>
      </Form>
    </div>
  )
}

export default EndUserForm