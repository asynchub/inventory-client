import React, {
  useState,
  useEffect,
  useCallback
} from "react";
import { useNavigate } from 'react-router-dom';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { ImSpinner2 } from 'react-icons/im';
import { useLazyQuery } from "@apollo/client";
import { useAuthContext } from "../libs/contextLib";
import DropZone from "./ProjectDropZone";
import TrashDropZone from "./ProjectTrashDropZone";
import SideBarItem from "./ProjectSideBarItem";
import ProjectRow from "./ProjectRow";
import LoadingButton from './LoadingButton';
import {
  handleMoveWithinParent,
  handleMoveToDifferentParent,
  handleMoveSidebarItemIntoParent,
  handleRemoveItemFromLayout
} from "../libs/fnsDndLib";
import {
  QUERY_listActions
} from '../api/queries';
import {
  SIDEBAR_ITEM_ACTION,
  ACTION,
  ACTIONGANG
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
  const navigate = useNavigate();
  const [listActions, { data, loading }] = useLazyQuery(QUERY_listActions, {
    variables: { prefix: 'templ:' }
  });
  const [actionTempls, setActionTempls] = useState([]);

  useEffect(() => {
    function onLoad() {
      if (!isAuthenticated) {
        return null;
      }
      try {
        listActions();
        if (data) {
          const listLayout = data.listActions.map((item, index) => ({
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
  },[isAuthenticated, listActions, data]);

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

      const newItem = { id: item.id, type: item.type, content: item.content };
      if (item.type === ACTIONGANG) {
        newItem.children = item.children;
      }

      // 1. Move sidebar item component into column (ACTION into ActionGang)
      if ((item.type === SIDEBAR_ITEM_ACTION) && (splitDropZonePath.length === 3)) {
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
                {renderProjectRow(row, currentPath)}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div>
        <Tabs defaultActiveKey="3" transition={false} className="horizontal-tabs">
          <Tab eventKey="3" className="headings" title="Works">
            {loading ? (
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
