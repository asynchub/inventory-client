import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useParams, useHistory } from "react-router-dom";
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  QUERY_getProjectById,
  // QUERY_listProjectTypes,
  QUERY_listProjects
} from '../api/queries';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
// import Select from 'react-select';
import DatePicker, { registerLocale } from 'react-datepicker';
import ImageGrid from './ImageGrid';
import ProjectLayout from "./ProjectLayout";
import { ImSpinner2 } from 'react-icons/im';
import { FcApproval } from 'react-icons/fc';
import { useAuthContext } from "../libs/contextLib";
import LoadingButton from './LoadingButton';
import { MdError } from 'react-icons/md';
import './ProjectInfo.css'
import { s3Delete } from '../libs/awsLib';
import { MUTATION_deleteProject, MUTATION_updateProject } from "../api/mutations";
import { onError } from "../libs/errorLib";
import enGb from 'date-fns/locale/en-GB';
// import ProjectActions from "./ProjectActions";
registerLocale('en-gb', enGb);

function ProjectInfo() {
  const { isAuthenticated } = useAuthContext();
  const { id } = useParams();
  const history = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [project, setProject] = useState({
    id,
    // modelNumber: '',
    serialNumber: '',
    // inventoryNumber: '',
    dateEstimStart: new Date(),
    dateEstimEnd: new Date(),
    attachments: '[]',
    // projectTypeId: null
  });
  const [projectUpdate, setProjectUpdate] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [getProjectById, { data, loading }] = useLazyQuery(QUERY_getProjectById);
  const [updateProject] = useMutation(MUTATION_updateProject);
  const [deleteProject] = useMutation(MUTATION_deleteProject, {
    refetchQueries: [{ query: QUERY_listProjects }]
  });
  // const [projectTypeOption, setProjectTypeOption] = useState(null);
  // const [projectTypeOptions, setProjectTypeOptions] = useState([]);
  // const [listProjectTypes, {
  //   data: dataProjectTypeOptions,
  // }] = useLazyQuery(QUERY_listProjectTypes, {
  //   fetchPolicy: 'cache-first'
  // });
  
  useEffect(() => {
    if (!isAuthenticated) {
      return null;
    }
    function onLoad() {
      setIsLoading(true);
      try {
        getProjectById({
          variables: { projectId: id }
        });
        const projectById = data && data.getProjectById;
        // console.log(data);
        if (projectById) {
          const {
            id,
            // modelNumber,
            serialNumber,
            // inventoryNumber,
            dateEstimStart,
            dateEstimEnd,
            attachments,
            // projectType
          } = projectById;
          // const projectTypeId = projectById.projectType && projectById.projectType.id;
          // const projectTypeIdWithoutPrefix = (((typeof projectTypeId) === 'string') && projectTypeId.startsWith('project:')) ? projectTypeId.slice(projectTypeId.indexOf('projecttype:')) : projectTypeId
          setProject(projectById);
          setProjectUpdate({
            id,
            // modelNumber,
            serialNumber,
            // inventoryNumber,
            dateEstimStart,
            dateEstimEnd,
            attachments,
            // projectTypeId: projectTypeIdWithoutPrefix
          });
          // projectType && setProjectTypeOption({ value: projectTypeIdWithoutPrefix, label: projectType.name });
        }
      } catch (error) {
        onError(error);
      }
      // try {
      //   listProjectTypes();
      //   const data = dataProjectTypeOptions && dataProjectTypeOptions.listProjectTypes;
      //   if (data) {
      //     const options = data.map(({ id, name }) => ({ value: id, label: name }));
      //     setProjectTypeOptions(options);
      //   }
      // } catch (error) {
      //   onError(error);
      // }
      setIsLoading(false);
    }
    onLoad();
  },[isAuthenticated, getProjectById, id, data]);

  async function handleSubmit({
    id,
    // modelNumber,
    serialNumber,
    // inventoryNumber,
    dateEstimStart,
    dateEstimEnd,
    // projectTypeId
  }) {
    setIsUpdating(true);
    try {
      const data = await updateProject({
        variables: {
          project: {
            id,
            // modelNumber,
            serialNumber,
            // inventoryNumber,
            dateEstimStart,
            dateEstimEnd,
            // projectTypeId: projectTypeId && ('project:' + projectTypeId)
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

  async function handleDelete(project) {
    const confirmed = window.confirm(`Do you want to delete project ${project.modelNumber}, SN: ${project.serialNumber}?`);
    if (confirmed) {
      setIsDeleting(true);
      try {
        if (project.attachments) {
          const filenames = JSON.parse(project.attachments).map(({ key }) => key);
          await Promise.all(filenames.map(async (filename) => {
            await s3Delete(filename);
          }));
        }
        await deleteProject({ variables: { projectId: id } });
        history.push('/projects');
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
  // const project = data.getProjectById;

  // function formatFilename(str) {
  //   return str.replace(/^\w+-/, '');
  // };
  // console.log(project);
  const isWarrantyValid = project.dateEstimEnd ? new Date().valueOf() <= new Date(project.dateEstimEnd).valueOf() : true;
  return(
    <div
      className='ProjectInfo'
    >
      <Container
        fluid
      >
        <Row>
          <Col lg='2'
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
                    Edit project
                  </LoadingButton>
                ) : (
                  <>
                    <LoadingButton
                      className='LoadingButton'
                      size='sm'
                      color='red'
                      variant='outline-danger'
                      disabled={isDeleting || (project.actions && project.actions.length > 0)}
                      type='submit'
                      isLoading={isDeleting}
                      onClick={() => handleDelete(project)}
                    >
                      Delete project
                    </LoadingButton>
                    <LoadingButton
                      className='LoadingButton'
                      size='sm'
                      variant='outline-primary'
                      disabled={isUpdating}
                      type='submit'
                      isLoading={isUpdating}
                      onClick={() => handleSubmit(projectUpdate)}
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
            {/* <Form.Group as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Project type
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={project.projectType ? project.projectType.name : ''}
                  />
                ) : (
                  <Select
                    isClearable={true}
                    value={projectTypeOption}
                    options={projectTypeOptions}
                    onChange={(option) => {
                      setProjectTypeOption(option);
                      setProjectUpdate({ ...projectUpdate, projectTypeId: option ? option.value : '' });
                    }}
                  />
                )}
              </Col>
            </Form.Group> */}
            {/* <Form.Group as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Model
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={project.modelNumber}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='Model'
                    value={projectUpdate.modelNumber}
                    onChange={(event) => setProjectUpdate({ ...projectUpdate, modelNumber: event.target.value })}
                  />
                )}
              </Col>
            </Form.Group> */}
            <Form.Group as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Project nr.
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={project.serialNumber}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='Serial nr'
                    value={projectUpdate.serialNumber}
                    onChange={(event) => setProjectUpdate({ ...projectUpdate, serialNumber: event.target.value})}
                  />
                )}
              </Col>
            </Form.Group>
            {/* <Form.Group as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Inventory nr
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={project.inventoryNumber || ''}
                  />
                ) : (
                  <Form.Control
                    type='text'
                    placeholder='Inventory nr'
                    value={projectUpdate.inventoryNumber || ''}
                    onChange={(event) => setProjectUpdate({ ...projectUpdate, inventoryNumber: event.target.value})}
                  />
                )}
              </Col>
            </Form.Group> */}
            <hr/>
            <Form.Group as={Row}>
              <Form.Label column='sm=4' className='font-weight-bold'>
                Start
              </Form.Label>
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={new Date(project.dateEstimStart).toLocaleDateString('de-DE')}
                  />
                ) : (
                  <Form.Control as={DatePicker}
                    className="date-picker"
                    withPortal={true}
                    dateFormat='dd.MM.yyyy'
                    placeholderText='Select date'
                    locale='en-gb'
                    // todayButton='Today'
                    selected={new Date(projectUpdate.dateEstimStart)}
                    onSelect={(date) => {
                      if (!date) {
                        setProjectUpdate({ ...projectUpdate, dateEstimStart: ''});
                        return null;
                      } else {
                        setProjectUpdate({ ...projectUpdate, dateEstimStart: date});
                      }
                    }}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="scroll"
                  />
                )}
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              {isWarrantyValid ? (
                <Form.Label column='sm=4' className='font-weight-bold'>
                  <FcApproval />
                  {' End'}
                </Form.Label>
              ) : (
                <Form.Label column='sm=4' className='font-weight-bold'>
                  <MdError
                    color={'red'}
                  />
                  {' Delayed'}
                </Form.Label>
              )}
              <Col sm='8'>
                {!isEditing ? (
                  <Form.Control
                    plaintext
                    readOnly
                    value={new Date(project.dateEstimEnd).toLocaleDateString('de-DE')}
                  />
                ) : (
                  <Form.Control as={DatePicker}
                    className='date-picker'
                    withPortal={true}
                    dateFormat='dd.MM.yyyy'
                    placeholderText='Select date'
                    locale='en-gb'
                    // todayButton='Today'
                    selected={new Date(projectUpdate.dateEstimEnd)}
                    onSelect={(date) => {
                      if (!date) {
                        setProjectUpdate({ ...projectUpdate, dateEstimEnd: ''});
                        return null;
                      } else {
                        setProjectUpdate({ ...projectUpdate, dateEstimEnd: date});
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
            {/* <ProjectActions
              actions={project.actions}
              projectId={id}
            /> */}
            {(project && project.attachments && !isDeleting) &&
              <ImageGrid
                attachments={project.attachments}
                entityId={id}
                entityType={'Project'}
              />
            }
          </Col>
          <Col lg='10'>
            <div
              className="App"
            >
              <DndProvider
                backend={HTML5Backend}
              >
                <ProjectLayout
                  project={project}
                />
              </DndProvider>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default ProjectInfo