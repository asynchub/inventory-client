import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { ImSpinner2 } from 'react-icons/im';
import { useLazyQuery } from "@apollo/client";
import { useAuthContext } from "../libs/contextLib";
import LoadingButton from "./LoadingButton";
import DropZone from "./ProjectDropZone";
import TrashDropZone from "./ProjectTrashDropZone";
import SideBarItem from "./ProjectSideBarItem";
import SideBarItemActionGang from "./ProjectSideBarItemActionGang";
import SideBarItemPerson from "./ProjectSideBarItemPerson";
// import SideBarItemProject from "./ProjectSideBarItemProject";
import ProjectRow from "./ProjectRow";
import ProjectRowResource from "./ProjectRowResource";
import {
  handleMoveWithinParent,
  handleMoveToDifferentParent,
  handleMoveSidebarItemIntoParent,
  handleRemoveItemFromLayout
} from "../libs/fnsDndLib";
import {
  QUERY_listEndUsers,
  QUERY_listActionGangs,
  QUERY_listActions
} from '../api/queries';
import {
  SIDEBAR_ITEM_PROJECT,
  // SIDEBAR_ITEMS_PROJECTS,
  SIDEBAR_ITEM_ACTIONGANG,
  SIDEBAR_ITEM_ACTION,
  ACTION,
  ACTIONGANG, 
  PROJECT,
  SIDEBAR_ITEM_RESOURCE,
  PROJECT_RESOURCE,
  RESOURCE,
} from "../mock/projectConstants";
import { v1 as uuidv1 } from 'uuid';
import { onError } from "../libs/errorLib";
import "./ProjectStyles.css";

const Container = ({
  prefix,
  project,
  layout,
  setLayout,
  components,
  setComponents
}) => {
  const { isAuthenticated } = useAuthContext();
  // useEffect onLoad ActionGang ACTION
  const navigate = useNavigate();
  const [listEndUsers, { data: dataEndUsers, loading: loadingEndUsers }] = useLazyQuery(QUERY_listEndUsers);
  const [listActionGangs, { data: dataActionGangs, loading: loadingActionGangs }] = useLazyQuery(QUERY_listActionGangs, {
    variables: { prefix: 'templ:' }
  });
  const [listActions, { data: dataActionTempls, loading: loadingActionTempls }] = useLazyQuery(QUERY_listActions, {
    variables: { prefix: 'templ:' }
  });
  const [endUsers, setEndUsers] = useState([]);
  const [actionGangs, setActionGangs] = useState([]);
  const [actionTempls, setActionTempls] = useState([]);

  useEffect(() => {
    function onLoad() {
      if (!isAuthenticated) {
        return null;
      }
      try {
        listEndUsers();
        if (dataEndUsers) {
          const listLayout = dataEndUsers.listEndUsers.map((endUser) => ({
            id: endUser.id,
            type: SIDEBAR_ITEM_RESOURCE,
            component: {
              type: RESOURCE,
              id: endUser.id,
              content: endUser
            }
          }));
          setEndUsers(listLayout);
        }
      } catch (error) {
        onError(error);
      }
      try {
        listActionGangs();
        if (dataActionGangs) {
          const listLayout = dataActionGangs.listActionGangs.map(({ id, name, children }, index) => ({
            id,
            type: SIDEBAR_ITEM_ACTIONGANG,
            column: {
              type: ACTIONGANG,
              id,
              content: name,
              children: children ? JSON.parse(children).map(item => ({
                type: ACTION,
                id: item.id,
                content: item
              })) : []
            }
          }));
          setActionGangs(listLayout);
        }
      } catch (error) {
        onError(error);
      }
      try {
        listActions();
        if (dataActionTempls) {
          const listLayout = dataActionTempls.listActions.map((item, index) => ({
            id: item.id,
            type: SIDEBAR_ITEM_ACTION,
            component: {
              type: ACTION,
              id: item.id,
              content: item,
              children: []
            }
          }));
          setActionTempls(listLayout);
        }
      } catch (error) {
        onError(error);
      }
    }
    onLoad();
  },[
    isAuthenticated,
    listEndUsers,
    listActionGangs,
    listActions,
    dataEndUsers,
    dataActionGangs,
    dataActionTempls
  ]);

  const handleDropToTrashBin = useCallback(
    (dropZone, item) => {
      const splitItemPath = item.path.split("-");
      setLayout(handleRemoveItemFromLayout(layout, splitItemPath));
    },
    [layout, setLayout]
  );

  const handleDrop = useCallback(
    (dropZone, item) => {
      const splitDropZonePath = dropZone.path.split("-");
      const pathToDropZone = splitDropZonePath.slice(0, -1).join("-");

      const newItem = {
        id: item.id,
        type: item.type,
        content: item.content
      };
      if (item.type === ACTIONGANG) {
        newItem.children = item.children;
      }

      // _. Move sidebar item row into page (copy Project into Project dropZone)
      if ((item.type === SIDEBAR_ITEM_PROJECT) && (splitDropZonePath.length === 1)) {
        const newComponent = {
          id: uuidv1(),
          ...item.row
        };
        const newItem = {
          id: newComponent.id,
          ...item.row,
          type: PROJECT
        };
        setComponents({
          ...components,
          [newComponent.id]: newComponent
        });
        setLayout(
          handleMoveSidebarItemIntoParent(
            layout,
            splitDropZonePath,
            newItem
          )
        );
        return;
      }

      // 0. Move sidebar item column into row (ActionGang into Project)
      if ((item.type === SIDEBAR_ITEM_ACTIONGANG) && (splitDropZonePath.length === 2) && (splitDropZonePath[0] === '0')) {
        const newComponent = {
          id: uuidv1(),
          ...item.column
        };
        const newItem = {
          id: newComponent.id,
          ...item.column,
          type: ACTIONGANG
        };
        setComponents({
          ...components,
          [newComponent.id]: newComponent
        });
        setLayout(
          handleMoveSidebarItemIntoParent(
            layout,
            splitDropZonePath,
            newItem
          )
        );
        return;
      }

      // 1. Move sidebar item component into column (ACTION into ActionGang)
      if ((item.type === SIDEBAR_ITEM_ACTION) && (splitDropZonePath.length === 3) && (splitDropZonePath[0] === '0')) {
        const newComponent = {
          id: uuidv1(),
          ...item.component
        };
        const newItem = {
          ...item.component,
          type: ACTION
        };
        setComponents({
          ...components,
          [newComponent.id]: newComponent
        });
        setLayout(
          handleMoveSidebarItemIntoParent(
            layout,
            splitDropZonePath,
            newItem
          )
        );
        return;
      }

      // 1. Move sidebar item component into column (RESOURCE into ActionGang)
      if ((item.type === SIDEBAR_ITEM_RESOURCE) && (splitDropZonePath.length === 3) && (splitDropZonePath[0] === '1')) {
        console.log('splitDropZonePath', splitDropZonePath);
        const newComponent = {
          id: uuidv1(),
          ...item.component
        };
        const newItem = {
          ...item.component,
          type: RESOURCE
        };
        setComponents({
          ...components,
          [newComponent.id]: newComponent
        });
        setLayout(
          handleMoveSidebarItemIntoParent(
            layout,
            splitDropZonePath,
            newItem
          )
        );
        return;
      }

      // move down here since sidebar items dont have path
      if (item.path) {
        const splitItemPath = item.path.split("-");
        const pathToItem = splitItemPath.slice(0, -1).join("-");
  
        // 2. Pure move (no create)
        if (splitItemPath.length === splitDropZonePath.length) {
          // 2.a. move within parent
          if (pathToItem === pathToDropZone) {
            setLayout(
              handleMoveWithinParent(layout, splitDropZonePath, splitItemPath)
            );
            return;
          }
  
          // 2.b. OR move different parent
          // FIX columns. item includes children
          setLayout(
            handleMoveToDifferentParent(
              layout,
              splitDropZonePath,
              splitItemPath,
              newItem
            )
          );
          return;
        }
      }

      // 3. Move + Create (not used)
      // setLayout(
      //   handleMoveToDifferentParent(
      //     layout,
      //     splitDropZonePath,
      //     splitItemPath,
      //     newItem
      //   )
      // );
    },
    [layout, setLayout, components, setComponents]
  );

  const renderProjectRow = (row, currentPath) => {
    return (
      <ProjectRow
        key={row.id}
        data={row}
        handleDrop={handleDrop}
        components={components}
        path={currentPath}
      />
    );
  };

  const renderProjectRowResource = (row, currentPath) => {
    return (
      <ProjectRowResource
        key={row.id}
        data={row}
        handleDrop={handleDrop}
        components={components}
        path={currentPath}
      />
    );
  };

  function renderLoading() {
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

  console.log('layout', layout);

  return (
    <div
      className="body"
    >
      <div
        className="pageContainer"
      >
        <div
          className="page"
        >
          {layout.map((row, index) => {
            const currentPath = `${index}`;

            return (
              <React.Fragment key={row.id}>
                <DropZone
                  data={{
                    path: currentPath,
                    childrenCount: layout.length
                  }}
                  onDrop={handleDrop}
                  path={currentPath}
                />
                {(row.type === PROJECT) &&
                  renderProjectRow(row, currentPath)
                }
                {(row.type === PROJECT_RESOURCE) &&
                  renderProjectRowResource(row, currentPath)
                }
              </React.Fragment>
            );
          })}
          <DropZone
            data={{
              path: `${layout.length}`,
              childrenCount: layout.length
            }}
            onDrop={handleDrop}
            isLast
          />
        </div>
      </div>
      <div>
        <Tabs defaultActiveKey="2" transition={false} className="horizontal-tabs">
          <Tab eventKey="1" className="headings" title="Persons">
            {loadingEndUsers ? (
              renderLoading()
            ) : (
              <div className="sideBar">
                {Object.values(endUsers).map((sideBarItem, index) => (
                  <SideBarItemPerson
                    key={sideBarItem.id}
                    data={sideBarItem}
                  />
                ))}
                <div className='d-grid gap-2 AddItemButton'>
                  <LoadingButton
                    size='sm'
                    variant='primary'
                    disabled={false}
                    type='submit'
                    isLoading={false}
                    onClick={() => navigate(`/endUsers/new`)}
                  >
                    Add person
                  </LoadingButton>
                </div>
              </div>
            )}
          </Tab>
          <Tab eventKey="2" className="headings" title="Stages">
            {loadingActionGangs ? (
              renderLoading()
            ) : (
              <div className="sideBar">
                {Object.values(actionGangs).map((sideBarItem, index) => (
                  <SideBarItemActionGang
                    key={sideBarItem.id}
                    data={sideBarItem}
                  />
                ))}
                <div className='d-grid gap-2 AddItemButton'>
                  <LoadingButton
                    size='sm'
                    variant='primary'
                    disabled={false}
                    type='submit'
                    isLoading={false}
                    onClick={() => navigate(`/actionGangs/new`)}
                  >
                    Add action template
                  </LoadingButton>
                </div>
              </div>
            )}
          </Tab>
          <Tab eventKey="3" className="headings" title="Works">
            {loadingActionTempls ? (
              renderLoading()
            ) : (
              <div className="sideBar">
                {Object.values(actionTempls).map((sideBarItem, index) => (
                  <SideBarItem
                    key={sideBarItem.id}
                    data={sideBarItem}
                  />
                ))}
                <div className='d-grid gap-2 AddItemButton'>
                  <LoadingButton
                    size='sm'
                    variant='primary'
                    disabled={false}
                    type='submit'
                    isLoading={false}
                    onClick={() => navigate(`/actionTempls/new`)}
                  >
                    Add action template
                  </LoadingButton>
                </div>
              </div>
            )}
          </Tab>
        </Tabs>
        <TrashDropZone
          data={{
            layout
          }}
          onDrop={handleDropToTrashBin}
        />
      </div>
    </div>
  );
};
export default Container;
