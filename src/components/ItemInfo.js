import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation } from '@apollo/client';
import { QUERY_getItemById, QUERY_listItemTypes, QUERY_listItems } from '../api/queries';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import ImageGrid from './ImageGrid';
import { ImSpinner2 } from 'react-icons/im';
import { FcApproval } from 'react-icons/fc';
import { useAuthContext } from "../libs/contextLib";
import LoadingButton from './LoadingButton';
import { MdError } from 'react-icons/md';
import './ItemInfo.css'
import { s3Delete } from '../libs/awsLib';
import { MUTATION_deleteItem, MUTATION_updateItem } from "../api/mutations";
import { onError } from "../libs/errorLib";
import enGb from 'date-fns/locale/en-GB';
import ItemActions from "./ItemActions";
registerLocale('en-gb', enGb);

function ItemInfo() {
  const { isAuthenticated } = useAuthContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [item, setItem] = useState({
    id,
    modelNumber: '',
    serialNumber: '',
    inventoryNumber: '',
    dateWarrantyBegins: new Date(),
    dateWarrantyExpires: new Date(),
    attachments: '[]',
    itemTypeId: null
  });
  const [itemUpdate, setItemUpdate] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [getItemById, { data, loading }] = useLazyQuery(QUERY_getItemById);
  const [updateItem] = useMutation(MUTATION_updateItem);
  const [deleteItem] = useMutation(MUTATION_deleteItem, {
    refetchQueries: [{ query: QUERY_listItems }]
  });
  const [itemTypeOption, setItemTypeOption] = useState(null);
  const [itemTypeOptions, setItemTypeOptions] = useState([]);
  const [listItemTypes, {
    data: dataItemTypeOptions,
  }] = useLazyQuery(QUERY_listItemTypes, {
    fetchPolicy: 'cache-first'
  });
  
  useEffect(() => {
    function onLoad() {
      if (!isAuthenticated) {
        return null;
      }
      setIsLoading(true);
      try {
        getItemById({
          variables: { itemId: id }
        });
        const itemById = data && data.getItemById;
        if (itemById) {
          const {
            id,
            modelNumber,
            serialNumber,
            inventoryNumber,
            dateWarrantyBegins,
            dateWarrantyExpires,
            attachments,
            itemType
          } = itemById;
          const itemTypeId = itemById.itemType && itemById.itemType.id;
          const itemTypeIdWithoutPrefix = (((typeof itemTypeId) === 'string') && itemTypeId.startsWith('item:')) ? itemTypeId.slice(itemTypeId.indexOf('itemtype:')) : itemTypeId
          setItem(itemById);
          setItemUpdate({
            id,
            modelNumber,
            serialNumber,
            inventoryNumber,
            dateWarrantyBegins,
            dateWarrantyExpires,
            attachments,
            itemTypeId: itemTypeIdWithoutPrefix
          });
          itemType && setItemTypeOption({ value: itemTypeIdWithoutPrefix, label: itemType.name });
        }
      } catch (error) {
        onError(error);
      }
      try {
        listItemTypes();
        const data = dataItemTypeOptions && dataItemTypeOptions.listItemTypes;
        if (data) {
          const options = data.map(({ id, name }) => ({ value: id, label: name }));
          setItemTypeOptions(options);
        }
      } catch (error) {
        onError(error);
      }
      setIsLoading(false);
    }
    onLoad();
  },[isAuthenticated, getItemById, id, data, listItemTypes, dataItemTypeOptions]);

  async function handleSubmit({
    id,
    modelNumber,
    serialNumber,
    inventoryNumber,
    dateWarrantyBegins,
    dateWarrantyExpires,
    itemTypeId
  }) {
    setIsUpdating(true);
    try {
      const data = await updateItem({
        variables: {
          item: {
            id,
            modelNumber,
            serialNumber,
            inventoryNumber,
            dateWarrantyBegins,
            dateWarrantyExpires,
            itemTypeId: itemTypeId && ('item:' + itemTypeId)
          }
        }
      });
      if (data) {
        setIsUpdating(false);
        setIsEditing(false);
      }
    } catch (error) {
      onError(error);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Do you want to delete item ${item.modelNumber}, SN: ${item.serialNumber}?`);
    if (confirmed) {
      setIsDeleting(true);
      try {
        if (item.attachments) {
          const filenames = JSON.parse(item.attachments).map(({ key }) => key);
          await Promise.all(filenames.map(async (filename) => {
            await s3Delete(filename);
          }));
        }
        await deleteItem({ variables: { itemId: id } });
        navigate('/items');
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
  // const item = data.getItemById;

  // function formatFilename(str) {
  //   return str.replace(/^\w+-/, '');
  // };
  const isWarrantyValid = item.dateWarrantyExpires ? new Date().valueOf() <= new Date(item.dateWarrantyExpires).valueOf() : true;
  return(
    <div
      className='ItemInfo'
    >
      <Container
        // fluid
      >
        <Row>
          <Col>
            <div className="d-flex justify-content-end">
              {!isEditing ?
                (
                  <LoadingButton
                    size='sm'
                    color='orange'
                    variant='outline-warning'
                    disabled={false}
                    type='submit'
                    isLoading={false}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit machine
                    {/* Edit item */}
                  </LoadingButton>
                ) : (
                  <>
                    <LoadingButton
                      size='sm'
                      color='red'
                      variant='outline-danger'
                      disabled={isDeleting || (item.actions && item.actions.length > 0)}
                      type='submit'
                      isLoading={isDeleting}
                      onClick={() => handleDelete(item)}
                    >
                      Delete machine
                      {/* Delete item */}
                    </LoadingButton>
                    <LoadingButton
                      // className='LoadingButton'
                      size='sm'
                      variant='outline-primary'
                      disabled={isUpdating}
                      type='submit'
                      isLoading={isUpdating}
                      onClick={() => handleSubmit(itemUpdate)}
                    >
                      Save
                    </LoadingButton>
                    <LoadingButton
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
            </div>
            <hr/>
            <Form.Group className='mb-3' as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Machine type
                {/* Item type */}
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={item.itemType ? item.itemType.name : ''}
                  />
                ) : (
                  <Select
                    isClearable={true}
                    value={itemTypeOption}
                    options={itemTypeOptions}
                    onChange={(option) => {
                      setItemTypeOption(option);
                      setItemUpdate({ ...itemUpdate, itemTypeId: option ? option.value : '' });
                    }}
                  />
                )}
              </Col>
            </Form.Group>
            <Form.Group className='mb-3' as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Model
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={item.modelNumber}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='Model'
                    value={itemUpdate.modelNumber}
                    onChange={(event) => setItemUpdate({ ...itemUpdate, modelNumber: event.target.value })}
                  />
                )}
              </Col>
            </Form.Group>
            <Form.Group className='mb-3' as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Reg nr
                {/* Serial nr */}
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={item.serialNumber}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='Serial nr'
                    value={itemUpdate.serialNumber}
                    onChange={(event) => setItemUpdate({ ...itemUpdate, serialNumber: event.target.value})}
                  />
                )}
              </Col>
            </Form.Group>
            <Form.Group className='mb-3' as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Inventory nr
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={item.inventoryNumber || ''}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='Inventory nr'
                    value={itemUpdate.inventoryNumber || ''}
                    onChange={(event) => setItemUpdate({ ...itemUpdate, inventoryNumber: event.target.value})}
                  />
                )}
              </Col>
            </Form.Group>
            <hr/>
            <Form.Group className='mb-3' as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Warranty begins
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={new Date(item.dateWarrantyBegins).toLocaleDateString('de-DE')}
                  />
                ) : (
                  <Form.Control as={DatePicker}
                    className="date-picker"
                    withPortal={true}
                    dateFormat='dd.MM.yyyy'
                    placeholderText='Select date'
                    locale='en-gb'
                    // todayButton='Today'
                    selected={new Date(itemUpdate.dateWarrantyBegins)}
                    onSelect={(date) => {
                      if (!date) {
                        setItemUpdate({ ...itemUpdate, dateWarrantyBegins: ''});
                        return null;
                      } else {
                        setItemUpdate({ ...itemUpdate, dateWarrantyBegins: date});
                      }
                    }}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="scroll"
                  />
                )}
              </Col>
            </Form.Group>
            <Form.Group className='mb-3' as={Row}>
              {isWarrantyValid ? (
                <Form.Label column='sm=4' className='font-weight-bold'>
                  <FcApproval />
                  {' expires'}
                </Form.Label>
              ) : (
                <Form.Label column='sm=4' className='font-weight-bold'>
                  <MdError
                    color={'red'}
                  />
                  {' expired'}
                </Form.Label>
              )}
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={new Date(item.dateWarrantyExpires).toLocaleDateString('de-DE')}
                  />
                ) : (
                  <Form.Control as={DatePicker}
                    className='date-picker'
                    withPortal={true}
                    dateFormat='dd.MM.yyyy'
                    placeholderText='Select date'
                    locale='en-gb'
                    // todayButton='Today'
                    selected={new Date(itemUpdate.dateWarrantyExpires)}
                    onSelect={(date) => {
                      if (!date) {
                        setItemUpdate({ ...itemUpdate, dateWarrantyExpires: ''});
                        return null;
                      } else {
                        setItemUpdate({ ...itemUpdate, dateWarrantyExpires: date});
                      }
                    }}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="scroll"
                  />
                )}
              </Col>
            </Form.Group>
            <hr style={{ marginBottom: 30 }}/>
            <ItemActions
              actions={item.actions}
              itemId={id}
            />
          </Col>
          <Col lg='7'>
            {(item && item.attachments && !isDeleting) &&
              <ImageGrid
                attachments={item.attachments}
                entityId={id}
                entityType={'Item'}
              />
            }
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ItemInfo