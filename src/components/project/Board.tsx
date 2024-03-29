"use client";
import { gql, useMutation, useQuery } from "@apollo/client";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  DragDropContext,
  type DraggableLocation,
  type DropResult,
} from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { issues } from "../../apollo/queries";
import { Issue, IssueStatus } from "../../models/issues.interface";
import { Project } from "../../models/projects.interface";
import { IssueList } from "../issues/issue-list";
import { IssueDetailsModal } from "../modals/board-issue-details";
import { useFiltersContext } from "../context/use-filters-context";
import "../styles/split.css";
import {
  insertItemIntoArray,
  isNullish,
  moveItemWithinArray,
} from "../util/helpers";
import { updateIssue } from "../../apollo/mutations";
import toast from "react-hot-toast";

const STATUSES: IssueStatus[] = [
  IssueStatus.TODO,
  IssueStatus.IN_PROGRESS,
  IssueStatus.DONE,
];
const ISSEUS = gql`
  ${issues}
`;

const UPDATE_ISSUE = gql`
  ${updateIssue}
`;

const Board: React.FC<{ project: Project }> = ({ project }) => {
  const renderContainerRef = useRef<HTMLDivElement>(null);
  const [issueList, setIssues] = useState<Issue[]>([]);

  useLayoutEffect(() => {
    if (renderContainerRef.current) {
      const calculatedHeight = renderContainerRef.current.offsetTop + 20;
      renderContainerRef.current.style.height = `calc(100vh - ${calculatedHeight}px)`;
    }
  }, [renderContainerRef.current]);
  const { search, issueTypes, epics } = useFiltersContext();

  const projectId = useParams().projectId;

  const filterIssues = useCallback(
    (issues: Issue[] | undefined, status: IssueStatus) => {
      if (!issues) return [];
      const filteredIssues = issues.filter((issue) => issue.status === status);
      return filteredIssues;
    },
    [search, issueTypes, epics]
  );

  const { data } = useQuery(ISSEUS, {
    variables: { projectId: projectId },
  });
  const issues = data?.issues.data as Issue[];
  useEffect(() => {
    setIssues(issues);
  }, [issues]);
  const [updateIssue, { error: isUpdateFailed }] = useMutation(UPDATE_ISSUE);

  if (!issues || !project || !projectId) {
    return null;
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (isNullish(destination) || isNullish(source)) return;
    const initialIssues = [...issues];
    setIssues((issues) => {
      return issues.map((issue) => {
        if (issue.id === result.draggableId) {
          return {
            ...issue,
            id: result.draggableId,
            status: destination.droppableId as IssueStatus,
            boardPosition: calculateIssueBoardPosition({
              activeIssues: issueList,
              destination,
              source,
              droppedIssueId: result.draggableId,
            }),
          } as Issue;
        } else return issue;
      });
    });

    updateIssue({
      variables: {
        id: result.draggableId,
        status: destination.droppableId as IssueStatus,
        boardPosition: calculateIssueBoardPosition({
          activeIssues: issueList,
          destination,
          source,
          droppedIssueId: result.draggableId,
        }),
      },
      onError(error) {
        setIssues(initialIssues)
        toast(error.message);
      },
    });
  };

  return (
    <Fragment>
      <IssueDetailsModal />
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          ref={renderContainerRef}
          className="inline-flex h-full space-x-3 overflow-hidden"
        >
          {STATUSES.map((status) => (
            <IssueList
              key={status}
              status={status}
              projectId={projectId}
              setIssues={setIssues}
              issues={filterIssues(issueList, status)}
            />
          ))}
        </div>
      </DragDropContext>
    </Fragment>
  );
};

type IssueListPositionProps = {
  activeIssues: Issue[];
  destination: DraggableLocation;
  source: DraggableLocation;
  droppedIssueId: string;
};

function calculateIssueBoardPosition(props: IssueListPositionProps) {
  const { prevIssue, nextIssue } = getAfterDropPrevNextIssue(props);
  let position: number;

  if (isNullish(prevIssue) && isNullish(nextIssue)) {
    position = 1;
  } else if (isNullish(prevIssue) && nextIssue) {
    position = nextIssue.boardPosition! - 1;
  } else if (isNullish(nextIssue) && prevIssue) {
    position = prevIssue.boardPosition! + 1;
  } else if (prevIssue && nextIssue) {
    position =
      prevIssue.boardPosition! +
      (nextIssue.boardPosition! - prevIssue.boardPosition!) / 2;
  } else {
    throw new Error("Invalid position");
  }
  return position;
}

function getAfterDropPrevNextIssue(props: IssueListPositionProps) {
  const { activeIssues, destination, source, droppedIssueId } = props;
  const beforeDropDestinationIssues = getSortedBoardIssues({
    activeIssues,
    status: destination.droppableId as IssueStatus,
  });
  const droppedIssue = activeIssues.find(
    (issue) => issue.id === droppedIssueId
  );

  if (!droppedIssue) {
    throw new Error("dropped issue not found");
  }
  const isSameList = destination.droppableId === source.droppableId;
  const afterDropDestinationIssues = isSameList
    ? moveItemWithinArray(
        beforeDropDestinationIssues,
        droppedIssue,
        destination.index
      )
    : insertItemIntoArray(
        beforeDropDestinationIssues,
        droppedIssue,
        destination.index
      );

  return {
    prevIssue: afterDropDestinationIssues[destination.index - 1],
    nextIssue: afterDropDestinationIssues[destination.index + 1],
  };
}

function getSortedBoardIssues({
  activeIssues,
  status,
}: {
  activeIssues: Issue[];
  status: IssueStatus;
}) {
  return activeIssues
    .filter((issue) => issue.status === status)
    .sort((a, b) => a.boardPosition! - b.boardPosition!);
}
export { Board };
